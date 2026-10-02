import prisma from "../../config/prisma.js";

// Helper to calculate computed fields
const computeInventoryFields = (stock, reservedStock, lowStockThreshold) => {
  const availableStock = stock - reservedStock;
  let status = "IN_STOCK";
  if (availableStock <= 0) {
    status = "OUT_OF_STOCK";
  } else if (availableStock <= lowStockThreshold) {
    status = "LOW_STOCK";
  }
  return { availableStock, status };
};

const getSellerProfileOrThrow = async (userId) => {
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) {
    const err = new Error("You must be a registered seller to perform this action");
    err.statusCode = 403;
    throw err;
  }
  return seller;
};

const assertOwnershipOrAdmin = async (productId, user) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  if (user.role === "ADMIN") return product;

  const seller = await getSellerProfileOrThrow(user.id);
  if (product.sellerId !== seller.id) {
    const err = new Error("You do not have permission to access this inventory");
    err.statusCode = 403;
    throw err;
  }
  return product;
};

export const getSellerInventory = async (userId, query) => {
  const seller = await getSellerProfileOrThrow(userId);
  const { search, status, sortBy, page = 1, limit = 20 } = query;

  const where = {
    product: {
      sellerId: seller.id,
      isDeleted: false,
    }
  };

  if (status) where.status = status;
  if (search) {
    where.product.OR = [
      { name: { contains: search } },
      { sku: { contains: search } }
    ];
  }

  const orderBy = {};
  if (sortBy === "stock_asc") orderBy.stock = "asc";
  else if (sortBy === "stock_desc") orderBy.stock = "desc";
  else orderBy.updatedAt = "desc"; // updatedAt_desc default

  const skip = (Number(page) - 1) * Number(limit);

  const [inventories, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } }
      },
      orderBy,
      skip,
      take: Number(limit),
    }),
    prisma.inventory.count({ where }),
  ]);

  return {
    inventories,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getAdminInventory = async (query) => {
  const { sellerId, search, status, sortBy, page = 1, limit = 20 } = query;

  const where = {
    product: {
      isDeleted: false,
    }
  };

  if (sellerId) where.product.sellerId = Number(sellerId);
  if (status) where.status = status;
  if (search) {
    where.product.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { seller: { businessName: { contains: search } } }
    ];
  }

  const orderBy = {};
  if (sortBy === "stock_asc") orderBy.stock = "asc";
  else if (sortBy === "stock_desc") orderBy.stock = "desc";
  else orderBy.updatedAt = "desc";

  const skip = (Number(page) - 1) * Number(limit);

  const [inventories, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        product: { 
          select: { 
            name: true, sku: true, seller: { select: { businessName: true, id: true } },
            images: { take: 1, orderBy: { sortOrder: "asc" } } 
          } 
        }
      },
      orderBy,
      skip,
      take: Number(limit),
    }),
    prisma.inventory.count({ where }),
  ]);

  return {
    inventories,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getInventoryDetails = async (productId, user) => {
  await assertOwnershipOrAdmin(productId, user);
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
    include: {
      history: {
        orderBy: { createdAt: "desc" },
        include: { updatedBy: { select: { name: true, email: true } } }
      }
    }
  });
  if (!inventory) {
    const err = new Error("Inventory not found");
    err.statusCode = 404;
    throw err;
  }
  return inventory;
};

export const updateStock = async (productId, user, payload) => {
  await assertOwnershipOrAdmin(productId, user);
  const { quantityChange, reason, notes } = payload;

  if (quantityChange === 0) {
    const err = new Error("Quantity change cannot be zero");
    err.statusCode = 400;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Lock/Fetch current inventory
    const inventory = await tx.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new Error("Inventory record not found");
    }

    const newStock = inventory.stock + quantityChange;
    
    // Strict implementation rule: No negative stock
    if (newStock < 0) {
      const err = new Error("Stock cannot become negative");
      err.statusCode = 400;
      throw err;
    }

    // Recalculate computed fields
    const { availableStock, status } = computeInventoryFields(newStock, inventory.reservedStock, inventory.lowStockThreshold);

    // 2. Update Inventory
    const updatedInventory = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        stock: newStock,
        availableStock,
        status
      }
    });

    // 3. Insert History Log
    await tx.inventoryHistory.create({
      data: {
        inventoryId: inventory.id,
        quantityChange,
        reason,
        notes,
        previousStock: inventory.stock,
        newStock: newStock,
        updatedById: user.id
      }
    });

    return updatedInventory;
  });
};

export const getInventorySummary = async (userId) => {
  const seller = await getSellerProfileOrThrow(userId);
  
  const inventories = await prisma.inventory.findMany({
    where: { product: { sellerId: seller.id, isDeleted: false } }
  });

  const summary = {
    totalProducts: inventories.length,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalUnits: 0
  };

  inventories.forEach(inv => {
    summary.totalUnits += inv.stock;
    if (inv.status === "IN_STOCK") summary.inStock++;
    else if (inv.status === "LOW_STOCK") summary.lowStock++;
    else if (inv.status === "OUT_OF_STOCK") summary.outOfStock++;
  });

  return summary;
};

// Integration for Order Module
export const deductStockForOrder = async (productId, quantity, userId, tx) => {
  const inventory = await tx.inventory.findUnique({ where: { productId } });
  if (!inventory) throw new Error("Inventory not found");

  const updatedRows = await tx.$executeRaw`
    UPDATE inventories 
    SET reservedStock = reservedStock + ${quantity},
        availableStock = stock - (reservedStock + ${quantity}),
        status = CASE 
                   WHEN stock - (reservedStock + ${quantity}) <= 0 THEN 'OUT_OF_STOCK'
                   WHEN stock - (reservedStock + ${quantity}) <= lowStockThreshold THEN 'LOW_STOCK'
                   ELSE 'IN_STOCK'
                 END
    WHERE id = ${inventory.id} AND stock >= reservedStock + ${quantity}
  `;

  if (updatedRows === 0) {
    const err = new Error("Insufficient stock or concurrency conflict");
    err.statusCode = 409;
    throw err;
  }

  await tx.inventoryHistory.create({
    data: {
      inventoryId: inventory.id,
      quantityChange: 0,
      reason: "ORDER_DEDUCTION",
      notes: `Reserved ${quantity} units for order`,
      previousStock: inventory.stock,
      newStock: inventory.stock,
      updatedById: userId,
    }
  });
};

export const restockOnCancel = async (productId, quantity, userId, tx) => {
  const inventory = await tx.inventory.findUnique({ where: { productId } });
  if (!inventory) throw new Error("Inventory not found");

  const newReserved = Math.max(0, inventory.reservedStock - quantity);
  const { availableStock, status } = computeInventoryFields(inventory.stock, newReserved, inventory.lowStockThreshold);

  await tx.inventory.update({
    where: { id: inventory.id },
    data: { reservedStock: newReserved, availableStock, status }
  });

  await tx.inventoryHistory.create({
    data: {
      inventoryId: inventory.id,
      quantityChange: 0,
      reason: "ORDER_CANCELLATION",
      notes: `Un-reserved ${quantity} units from cancelled order`,
      previousStock: inventory.stock,
      newStock: inventory.stock,
      updatedById: userId,
    }
  });
};

export const restockOnReturn = async (productId, quantity, userId, tx) => {
  const db = tx || prisma;
  const inventory = await db.inventory.findUnique({ where: { productId } });
  if (!inventory) return;

  const newStock = inventory.stock + quantity;
  const { availableStock, status } = computeInventoryFields(newStock, inventory.reservedStock, inventory.lowStockThreshold);

  await db.inventory.update({
    where: { id: inventory.id },
    data: { stock: newStock, availableStock, status }
  });

  await db.inventoryHistory.create({
    data: {
      inventoryId: inventory.id,
      quantityChange: quantity,
      reason: "RETURNED_ITEMS",
      notes: `Restocked ${quantity} units from completed return`,
      previousStock: inventory.stock,
      newStock: newStock,
      updatedById: userId,
    }
  });
};