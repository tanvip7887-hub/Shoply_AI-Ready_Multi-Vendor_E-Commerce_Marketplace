import prisma from "../../config/prisma.js";

/**
 * Every cart operation needs the user's cart to exist first.
 * Rather than requiring a separate "create cart" step, the cart is
 * created lazily on first use — the customer never has to know it
 * exists as a distinct entity.
 */
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
};

const assertProductPurchasable = async (productId, requestedQuantity) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true, seller: true },
  });

  if (!product || !product.isActive || product.isDeleted || product.approvalStatus !== "APPROVED") {
    const err = new Error("Product is not available for purchase");
    err.statusCode = 404;
    throw err;
  }

  if (product.seller && product.seller.status !== "VERIFIED") {
    const err = new Error("This product cannot be purchased because the seller's account is suspended.");
    err.statusCode = 403;
    throw err;
  }

  if (!product.inventory) {
    const err = new Error("This product is not yet available for purchase");
    err.statusCode = 409;
    throw err;
  }

  const available = product.inventory.stock - product.inventory.reservedStock;
  if (requestedQuantity > available) {
    const err = new Error(`Only ${available} unit(s) available for this product`);
    err.statusCode = 409;
    throw err;
  }

  return product;
};

export const addItemToCart = async (userId, { productId, quantity }) => {
  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  // Validate against the COMBINED quantity (existing + new), not just
  // the new amount — otherwise someone could add 5, then add 5 more
  // to a product with only 6 in stock, bypassing the real limit.
  const totalQuantity = (existingItem?.quantity || 0) + quantity;
  await assertProductPurchasable(productId, totalQuantity);

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: totalQuantity },
      include: { product: { include: { images: true } } },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity },
    include: { product: { include: { images: true } } },
  });
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const rawItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { 
      product: { 
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountPrice: true,
          isActive: true,
          isDeleted: true,
          approvalStatus: true,
          brand: { select: { name: true } },
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          inventory: { select: { availableStock: true, status: true } },
          seller: { select: { status: true, displayName: true, businessName: true } }
        }
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  let cartSubtotal = 0;
  let totalQuantity = 0;

  const items = rawItems.map(item => {
    const p = item.product;
    const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);
    const price = hasDiscount ? Number(p.discountPrice) : Number(p.price);
    const available = p.inventory?.availableStock || 0;
    
    // Check if the product is still valid to be purchased
    const isPurchasable = p.isActive && !p.isDeleted && p.approvalStatus === "APPROVED" && p.seller?.status === "VERIFIED";
    const isAvailable = isPurchasable && available >= item.quantity;
    
    const itemSubtotal = price * item.quantity;
    
    if (isAvailable) {
      cartSubtotal += itemSubtotal;
      totalQuantity += item.quantity;
    }

    return {
      id: item.id,
      quantity: item.quantity,
      itemSubtotal,
      isAvailable,
      availableStock: available,
      product: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand?.name || null,
        originalPrice: Number(p.price),
        price,
        primaryImage: p.images[0]?.url || null,
        inventoryStatus: p.inventory?.status || "OUT_OF_STOCK",
      }
    };
  });

  return { 
    cartId: cart.id, 
    items, 
    totalItems: items.length, 
    totalQuantity,
    cartSubtotal 
  };
};

const assertItemOwnership = async (userId, itemId) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== userId) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }
  return item;
};

export const updateCartItem = async (userId, itemId, quantity) => {
  const item = await assertItemOwnership(userId, itemId);
  await assertProductPurchasable(item.productId, quantity);

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: { include: { images: true } } },
  });
};

export const removeCartItem = async (userId, itemId) => {
  await assertItemOwnership(userId, itemId);
  await prisma.cartItem.delete({ where: { id: itemId } });
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};