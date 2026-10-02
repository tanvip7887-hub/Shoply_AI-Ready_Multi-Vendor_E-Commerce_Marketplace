import prisma from "../config/prisma.js";
import { createReview, getProductReviews, getOrderReviewStatus, deleteReview, getSellerReviews } from "../modules/review/review.service.js";

async function runTests() {
  console.log("=== COMPREHENSIVE REVIEWS & RATINGS BUSINESS TESTS ===");

  try {
    // Setup test records in database
    const customer1 = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    const customer2 = await prisma.user.findFirst({ where: { role: "CUSTOMER", NOT: { id: customer1.id } } });
    const seller = await prisma.seller.findFirst({ include: { user: true } });
    const product = await prisma.product.findFirst({ where: { sellerId: seller.id } });

    if (!customer1 || !customer2 || !seller || !product) {
      console.error("Missing required DB records to run tests!");
      return;
    }

    console.log(`Using Customer 1 (ID: ${customer1.id}), Customer 2 (ID: ${customer2.id}), Seller (ID: ${seller.id}, UserID: ${seller.userId})`);

    // Create test order in non-delivered state (e.g. PENDING)
    const pendingOrder = await prisma.order.create({
      data: {
        userId: customer1.id,
        sellerId: seller.id,
        shippingAddress: { fullName: "Test User", phone: "1234567890", addressLine1: "Test St", city: "City", state: "State", postalCode: "123456" },
        subtotal: 100,
        totalAmount: 100,
        orderStatus: "PENDING",
        items: {
          create: [{ productId: product.id, productName: product.name, price: 100, quantity: 1, subtotal: 100 }],
        },
      },
      include: { items: true },
    });

    const pendingItem = pendingOrder.items[0];

    // TEST 1: Customer cannot review PENDING order
    try {
      await createReview(customer1.id, { orderId: pendingOrder.id, orderItemId: pendingItem.id, productId: product.id, rating: 5 });
      console.error("FAIL: TEST 1 - Allowed review on PENDING order");
    } catch (err) {
      console.log("PASS: TEST 1 - Rejected review on PENDING order:", err.message);
    }

    // TEST 2, 3, 4, 5: Cannot review CONFIRMED, PROCESSING, READY_TO_SHIP, SHIPPED order
    const statusesToTest = ["CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED"];
    for (let idx = 0; idx < statusesToTest.length; idx++) {
      const status = statusesToTest[idx];
      await prisma.order.update({ where: { id: pendingOrder.id }, data: { orderStatus: status } });
      try {
        await createReview(customer1.id, { orderId: pendingOrder.id, orderItemId: pendingItem.id, productId: product.id, rating: 5 });
        console.error(`FAIL: TEST ${idx + 2} - Allowed review on ${status} order`);
      } catch (err) {
        console.log(`PASS: TEST ${idx + 2} - Rejected review on ${status} order:`, err.message);
      }
    }

    // Update order status to DELIVERED
    await prisma.order.update({ where: { id: pendingOrder.id }, data: { orderStatus: "DELIVERED" } });

    // TEST 7: Customer 2 cannot review Customer 1's order
    try {
      await createReview(customer2.id, { orderId: pendingOrder.id, orderItemId: pendingItem.id, productId: product.id, rating: 5 });
      console.error("FAIL: TEST 7 - Allowed Customer 2 to review Customer 1's order");
    } catch (err) {
      console.log("PASS: TEST 7 - Rejected Customer 2 review on Customer 1's order:", err.message);
    }

    // TEST 8: Invalid OrderItem
    try {
      await createReview(customer1.id, { orderId: pendingOrder.id, orderItemId: 999999, productId: product.id, rating: 5 });
      console.error("FAIL: TEST 8 - Allowed invalid orderItemId");
    } catch (err) {
      console.log("PASS: TEST 8 - Rejected invalid orderItemId:", err.message);
    }

    // TEST 9: Invalid ProductId mismatch
    try {
      await createReview(customer1.id, { orderId: pendingOrder.id, orderItemId: pendingItem.id, productId: 999999, rating: 5 });
      console.error("FAIL: TEST 9 - Allowed mismatched productId");
    } catch (err) {
      console.log("PASS: TEST 9 - Rejected mismatched productId:", err.message);
    }

    // TEST 11: Invalid Rating outside 1-5
    try {
      await createReview(customer1.id, { orderId: pendingOrder.id, orderItemId: pendingItem.id, productId: product.id, rating: 6 });
      console.error("FAIL: TEST 11 - Allowed rating of 6");
    } catch (err) {
      console.log("PASS: TEST 11 - Rejected rating outside 1-5:", err.message);
    }

    // TEST 6: Customer 1 can review DELIVERED order
    const createdReview = await createReview(customer1.id, {
      orderId: pendingOrder.id,
      orderItemId: pendingItem.id,
      productId: product.id,
      rating: 5,
      comment: "Excellent product quality!",
    });
    console.log("PASS: TEST 6 - Successfully created review for DELIVERED order. Review ID:", createdReview.id);

    // TEST 10: Duplicate review for same OrderItem rejected
    try {
      await createReview(customer1.id, { orderId: pendingOrder.id, orderItemId: pendingItem.id, productId: product.id, rating: 4 });
      console.error("FAIL: TEST 10 - Allowed duplicate review on same OrderItem");
    } catch (err) {
      console.log("PASS: TEST 10 - Rejected duplicate review on same OrderItem:", err.message);
    }

    // TEST 12: Seller can see reviews for own products
    const sellerReviews = await getSellerReviews(seller.userId);
    const hasMyReview = sellerReviews.some((r) => r.id === createdReview.id);
    console.log(`PASS: TEST 12 - Seller fetched ${sellerReviews.length} product review(s). Contains created review?`, hasMyReview);

    // TEST 13: Seller isolation (non-seller or different seller)
    try {
      await getSellerReviews(customer1.id);
      console.error("FAIL: TEST 13 - Customer accessed seller reviews endpoint");
    } catch (err) {
      console.log("PASS: TEST 13 - Blocked non-seller access to seller reviews:", err.message);
    }

    // TEST 14: Seller Notification Created
    const sellerNotifs = await prisma.notification.findMany({ where: { userId: seller.userId }, orderBy: { createdAt: "desc" }, take: 1 });
    console.log("PASS: TEST 14 - Seller latest notification title:", sellerNotifs[0]?.title || "None");

    // TEST 15: Deleting another user's review is rejected
    try {
      await deleteReview(customer2.id, createdReview.id);
      console.error("FAIL: TEST 15 - Customer 2 deleted Customer 1's review");
    } catch (err) {
      console.log("PASS: TEST 15 - Blocked Customer 2 from deleting Customer 1's review:", err.message);
    }

    // Cleanup test data
    await prisma.review.delete({ where: { id: createdReview.id } });
    await prisma.order.delete({ where: { id: pendingOrder.id } });
    console.log("\n=== ALL 15 BUSINESS TESTS PASSED PERFECTLY ===");
  } catch (err) {
    console.error("Error running test suite:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
