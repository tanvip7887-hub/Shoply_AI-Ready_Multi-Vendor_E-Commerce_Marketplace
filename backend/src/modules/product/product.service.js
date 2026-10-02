import prisma from "../../config/prisma.js";
import { slugify } from "../../utils/slugify.util.js";
import cloudinary from "../../config/cloudinary.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.util.js";

const generateUniqueSlug = async (name, excludeId = null) => {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
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

const assertCategoryAndBrand = async (categoryId, brandId) => {
  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      const err = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }
  }
  if (brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand || !brand.isActive) {
      const err = new Error("Brand not found or inactive");
      err.statusCode = 404;
      throw err;
    }
  }
};

/**
 * Ownership check: a product's sellerId must belong to the requesting
 * user's own seller profile — UNLESS the requester is an ADMIN, who can
 * manage any product. Mirrors the same pattern used for addresses.
 */
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
    const err = new Error("You do not have permission to modify this product");
    err.statusCode = 403;
    throw err;
  }
  return product;
};

export const createProduct = async (userId, data) => {
  const seller = await getSellerProfileOrThrow(userId);

  if (!seller.isPayoutSetup) {
    const err = new Error("Complete your payout setup before you can list products");
    err.statusCode = 403;
    throw err;
  }

  await assertCategoryAndBrand(data.categoryId, data.brandId);

  const slug = await generateUniqueSlug(data.name);
  const sku = await generateSku(seller.id);

  return prisma.product.create({
    data: { ...data, slug, sku, sellerId: seller.id, inventory: { create: {} } },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true, inventory: true },
  });
};

export const getAllProducts = async (query) => {
  const {
    categoryId,
    brandId,
    sellerId,
    minPrice,
    maxPrice,
    search,
    sortBy,
    page = 1,
    limit = 20,
  } = query;

  const where = { isActive: true, isDeleted: false, approvalStatus: "APPROVED" };
  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  if (sellerId) where.sellerId = sellerId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  // Keyword search across name, description, and brand name —
  // matches how real e-commerce search works (a search for "Nike"
  // should surface Nike products even if the word never appears
  // in the product's own title/description).
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
      { brand: { name: { contains: search } } },
      { category: { name: { contains: search } } },
    ];
  }

  const orderBy =
    sortBy === "price_asc"
      ? { price: "asc" }
      : sortBy === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" }; // "newest" and the default both mean this

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true, inventory: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id, isDeleted: false },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true, seller: { select: { id: true, businessName: true } }, inventory: true },
  });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  return product;
};

export const getProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug, isDeleted: false, isActive: true, approvalStatus: "APPROVED" },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true, seller: { select: { id: true, businessName: true } }, inventory: true },
  });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  return product;
};

export const getMyProducts = async (userId, query = {}) => {
  const seller = await getSellerProfileOrThrow(userId);
  const { search, categoryId, status, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = query;

  const where = { sellerId: seller.id, isDeleted: false };
  if (categoryId) where.categoryId = Number(categoryId);
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (status === "ACTIVE") where.isActive = true;
  if (status === "INACTIVE") where.isActive = false;
  if (search) {
    where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
  }

  const orderBy =
    sortBy === "oldest" ? { createdAt: "asc" } :
      sortBy === "price_asc" ? { price: "asc" } :
        sortBy === "price_desc" ? { price: "desc" } :
          sortBy === "alphabetical" ? { name: "asc" } :
            { createdAt: "desc" };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true, inventory: true },
      orderBy,
      skip: (page - 1) * limit,
      take: Number(limit),
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(withAvailability),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

export const updateProduct = async (productId, user, data) => {
  const existing = await assertOwnershipOrAdmin(productId, user);
  await assertCategoryAndBrand(data.categoryId, data.brandId);

  const updateData = { ...data };
  if (data.name && data.name !== existing.name) {
    updateData.slug = await generateUniqueSlug(data.name, productId);
  }

  // Prevent users from manually updating these fields
  delete updateData.approvalStatus;
  delete updateData.rejectionReason;
  delete updateData.approvedAt;
  delete updateData.approvedBy;
  delete updateData.rejectedAt;
  delete updateData.rejectedBy;

  if (user.role !== "ADMIN") {
    // Any seller edit resets the product to PENDING
    updateData.approvalStatus = "PENDING";
    updateData.rejectionReason = null;
  }

  return prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true },
  });
};

export const setProductStatus = async (productId, user, isActive) => {
  await assertOwnershipOrAdmin(productId, user);
  return prisma.product.update({ where: { id: productId }, data: { isActive } });
};

export const deleteProduct = async (productId, user) => {
  await assertOwnershipOrAdmin(productId, user);
  await prisma.product.delete({ where: { id: productId } });
};

export const addProductImages = async (productId, user, files) => {
  const product = await assertOwnershipOrAdmin(productId, user);

  // Find current max sortOrder to append new images at the end
  const existingImages = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "desc" },
    take: 1,
  });
  let nextOrder = existingImages.length > 0 ? existingImages[0].sortOrder + 1 : 0;

  const uploads = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, `meesho_clone/products/seller_${product.sellerId}`))
  );

  await prisma.productImage.createMany({
    data: uploads.map((result) => ({
      productId,
      url: result.secure_url,
      publicId: result.public_id,
      sortOrder: nextOrder++,
    })),
  });

  return prisma.product.findUnique({ 
    where: { id: productId }, 
    include: { images: { orderBy: { sortOrder: "asc" } } } 
  });
};

export const deleteProductImage = async (productId, imageId, user) => {
  await assertOwnershipOrAdmin(productId, user);

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== productId) {
    const err = new Error("Image not found on this product");
    err.statusCode = 404;
    throw err;
  }

  // Delete from Cloudinary first
  if (image.publicId) {
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
    }
  }

  await prisma.productImage.delete({ where: { id: imageId } });
};

export const reorderProductImages = async (productId, user, imageIds) => {
  await assertOwnershipOrAdmin(productId, user);

  // Use a transaction to update all sort orders
  await prisma.$transaction(
    imageIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return prisma.product.findUnique({ 
    where: { id: productId }, 
    include: { images: { orderBy: { sortOrder: "asc" } } } 
  });
};

const generateSku = async (sellerId) => {
  const count = await prisma.product.count({ where: { sellerId } });
  return `SKU-${sellerId}-${String(count + 1).padStart(5, "0")}`;
};

const withAvailability = (product) => {
  const stock = product.inventory?.stock ?? 0;
  const reserved = product.inventory?.reservedStock ?? 0;
  const available = stock - reserved;
  return {
    ...product,
    availableStock: available,
    // Derived, not stored — matches "no stock field on Product" decision.
    computedStatus: product.isDeleted 
      ? "DELETED" 
      : !product.isActive
        ? "DISABLED"
        : available <= 0
          ? "OUT_OF_STOCK"
          : "ACTIVE",
  };
};