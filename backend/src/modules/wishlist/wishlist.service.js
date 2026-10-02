import prisma from "../../config/prisma.js";

const assertProductExistsAndActive = async (productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    const err = new Error("Product not found or unavailable");
    err.statusCode = 404;
    throw err;
  }
  return product;
};

export const addToWishlist = async (userId, productId) => {
  await assertProductExistsAndActive(productId);

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    const err = new Error("Product is already in your wishlist");
    err.statusCode = 409;
    throw err;
  }

  return prisma.wishlist.create({
    data: { userId, productId },
    include: { product: { include: { images: true } } },
  });
};

export const getWishlist = async (userId) => {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: { include: { images: true, brand: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const removeFromWishlist = async (userId, productId) => {
  // Idempotent by design: deleteMany doesn't throw if zero rows match,
  // unlike delete({ where: { id } }) which would 404/error on a
  // non-existent unique key. Calling this twice in a row is safe and
  // both calls return success — matches the "safe even if already
  // gone" rule exactly.
  await prisma.wishlist.deleteMany({ where: { userId, productId } });
};