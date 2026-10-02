import prisma from "../../config/prisma.js";
import { createNotification } from "../notification/notification.service.js";

/**
 * Submit a review for a delivered order item.
 */
export const createReview = async (
  userId,
  { orderId, orderItemId, productId, rating, comment }
) => {
  const parsedRating = Number(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    const err = new Error("Rating must be an integer between 1 and 5");
    err.statusCode = 400;
    throw err;
  }

  if (comment && comment.length > 1000) {
    const err = new Error("Comment cannot exceed 1000 characters");
    err.statusCode = 400;
    throw err;
  }

  // 1. Verify Order
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
  });

  if (!order || order.userId !== userId) {
    const err = new Error("Order not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  // 2. Verify Delivery Status
  if (order.orderStatus !== "DELIVERED") {
    const err = new Error("Reviews can only be submitted for delivered orders");
    err.statusCode = 400;
    throw err;
  }

  // 3. Verify OrderItem
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: Number(orderItemId) },
  });

  if (
    !orderItem ||
    orderItem.orderId !== Number(orderId) ||
    orderItem.productId !== Number(productId)
  ) {
    const err = new Error("Order item does not match requested order or product");
    err.statusCode = 400;
    throw err;
  }

  // 4. Verify Not Already Reviewed
  const existingReview = await prisma.review.findUnique({
    where: { orderItemId: Number(orderItemId) },
  });

  if (existingReview) {
    const err = new Error("You have already submitted a review for this item");
    err.statusCode = 409;
    throw err;
  }

  // 5. Create Review
  const review = await prisma.review.create({
    data: {
      userId,
      orderId: Number(orderId),
      orderItemId: Number(orderItemId),
      productId: Number(productId),
      rating: parsedRating,
      comment: comment ? comment.trim() : null,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      product: { select: { id: true, name: true, sellerId: true } },
    },
  });

  // 6. Notify Seller
  if (review.product && review.product.sellerId) {
    prisma.seller.findUnique({ where: { id: review.product.sellerId } }).then((seller) => {
      if (seller) {
        createNotification(
          seller.userId,
          "New Review Received",
          `Your product "${review.product.name}" received a new ${parsedRating}-star review.`
        ).catch(() => {});
      }
    });
  }

  return review;
};

/**
 * Get aggregated ratings and reviews for a product.
 */
export const getProductReviews = async (productId) => {
  const reviews = await prisma.review.findMany({
    where: { productId: Number(productId) },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReviews = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumRating = 0;

  for (const r of reviews) {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating] += 1;
    }
    sumRating += r.rating;
  }

  const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

  return {
    averageRating,
    totalReviews,
    distribution,
    reviews,
  };
};

/**
 * Get review eligibility status for items in an order.
 */
export const getOrderReviewStatus = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      items: {
        include: {
          review: true,
        },
      },
    },
  });

  if (!order || order.userId !== userId) {
    const err = new Error("Order not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  return order.items.map((item) => ({
    orderItemId: item.id,
    productId: item.productId,
    isReviewed: !!item.review,
    review: item.review
      ? {
          id: item.review.id,
          rating: item.review.rating,
          comment: item.review.comment,
          createdAt: item.review.createdAt,
        }
      : null,
  }));
};

/**
 * Delete a review (owner only).
 */
export const deleteReview = async (userId, reviewId) => {
  const review = await prisma.review.findUnique({
    where: { id: Number(reviewId) },
  });

  if (!review || review.userId !== userId) {
    const err = new Error("Review not found or permission denied");
    err.statusCode = 403;
    throw err;
  }

  return prisma.review.delete({
    where: { id: Number(reviewId) },
  });
};

/**
 * Get reviews for products belonging to the logged-in seller.
 */
export const getSellerReviews = async (userId) => {
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) {
    const err = new Error("Seller profile not found");
    err.statusCode = 403;
    throw err;
  }

  return prisma.review.findMany({
    where: {
      product: { sellerId: seller.id },
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      product: { select: { id: true, name: true, slug: true, images: { take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
  });
};
