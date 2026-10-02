import prisma from "../config/prisma.js";
import {
  getSellerOrders,
  getSellerOrderById,
  updateOrderStatusBySeller,
  getMyOrderById,
} from "../modules/order/order.service.js";

async function ensureSeller(index) {
  const email = `test_seller_${index}_${Date.now()}@example.com`;
  let user = await prisma.user.create({
    data: {
      name: `Test Seller ${index}`,
      email,
      password: "password123",
      role: "SELLER",
    },
  });

  const address = await prisma.sellerAddress.create({
    data: {
      fullName: `Seller ${index} Business`,
      phone: `990000000${index}`,
      addressLine1: `${index} Vendor Street`,
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560001",
    },
  });

  const application = await prisma.sellerApplication.create({
    data: {
      userId: user.id,
      businessName: `Seller ${index} Store`,
      ownerName: `Owner ${index}`,
      mobileNumber: `990000000${index}`,
      businessType: "INDIVIDUAL",
      sellerAddressId: address.id,
      status: "APPROVED",
    },
  });

  const seller = await prisma.seller.create({
    data: {
      userId: user.id,
      applicationId: application.id,
      sellerAddressId: address.id,
      businessName: `Seller ${index} Store`,
      ownerName: `Owner ${index}`,
      mobileNumber: `990000000${index}`,
      sellerCode: `SEL_${index}_${Date.now()}`,
      status: "VERIFIED",
    },
  });

  return seller;
}

async function runVerification() {
  console.log("=== STARTING SELLER ORDER MANAGEMENT VERIFICATION ===");

  let createdSellers = [];
  let createdProducts = [];
  let createdUsers = [];

  try {
    let sellers = await prisma.seller.findMany({
      take: 2,
      include: { user: true },
    });

    if (sellers.length < 2) {
      console.log("Creating temporary sellers for isolation test...");
      while (sellers.length < 2) {
        const newSeller = await ensureSeller(sellers.length + 1);
        sellers.push(newSeller);
        createdSellers.push(newSeller);
      }
    }

    const sellerA = sellers[0];
    const sellerB = sellers[1];

    console.log(`Seller A: ID ${sellerA.id}, User ID ${sellerA.userId}`);
    console.log(`Seller B: ID ${sellerB.id}, User ID ${sellerB.userId}`);

    // Fetch or create a test customer user
    let customer = await prisma.user.findFirst({
      where: { role: "CUSTOMER" },
    });

    if (!customer) {
      console.log("Creating temporary customer user...");
      customer = await prisma.user.create({
        data: {
          name: "Test Customer",
          email: `testcustomer_${Date.now()}@example.com`,
          password: "password123",
          role: "CUSTOMER",
        },
      });
      createdUsers.push(customer);
    }

    // Find or create category
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({ data: { name: "Test Category", slug: `test-cat-${Date.now()}` } });
    }

    // Find or create products for Seller A and Seller B
    let productA = await prisma.product.findFirst({ where: { sellerId: sellerA.id } });
    let productB = await prisma.product.findFirst({ where: { sellerId: sellerB.id } });

    if (!productA) {
      console.log("Creating test product for Seller A...");
      productA = await prisma.product.create({
        data: {
          sellerId: sellerA.id,
          categoryId: category.id,
          name: "Seller A Test Product",
          slug: `seller-a-prod-${Date.now()}`,
          price: 499.00,
          approvalStatus: "APPROVED",
          inventory: { create: { stock: 50, availableStock: 50 } },
        },
      });
      createdProducts.push(productA);
    }

    if (!productB) {
      console.log("Creating test product for Seller B...");
      productB = await prisma.product.create({
        data: {
          sellerId: sellerB.id,
          categoryId: category.id,
          name: "Seller B Test Product",
          slug: `seller-b-prod-${Date.now()}`,
          price: 899.00,
          approvalStatus: "APPROVED",
          inventory: { create: { stock: 30, availableStock: 30 } },
        },
      });
      createdProducts.push(productB);
    }

    // Dummy delivery address
    const dummyAddress = {
      fullName: "Test Customer",
      phone: "9876543210",
      addressLine1: "456 Market Lane",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
    };

    // Create multi-seller orders (Order A for Seller A, Order B for Seller B)
    const orderA = await prisma.order.create({
      data: {
        userId: customer.id,
        sellerId: sellerA.id,
        shippingAddress: dummyAddress,
        subtotal: 499.00,
        shippingCharge: 0,
        discount: 0,
        totalAmount: 499.00,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        items: {
          create: [{
            productId: productA.id,
            productName: productA.name,
            price: 499.00,
            quantity: 1,
            subtotal: 499.00,
          }],
        },
      },
    });

    const orderB = await prisma.order.create({
      data: {
        userId: customer.id,
        sellerId: sellerB.id,
        shippingAddress: dummyAddress,
        subtotal: 899.00,
        shippingCharge: 0,
        discount: 0,
        totalAmount: 899.00,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        items: {
          create: [{
            productId: productB.id,
            productName: productB.name,
            price: 899.00,
            quantity: 1,
            subtotal: 899.00,
          }],
        },
      },
    });

    console.log(`✅ Created Order A (ID #${orderA.id}) for Seller A`);
    console.log(`✅ Created Order B (ID #${orderB.id}) for Seller B`);

    // TEST 1: Seller A sees only Seller A's order, not Seller B's order
    console.log("\n--- TEST 1: Ownership & Isolation ---");
    const sellerAOrders = await getSellerOrders(sellerA.userId);
    const hasOrderA = sellerAOrders.some((o) => o.id === orderA.id);
    const hasOrderB = sellerAOrders.some((o) => o.id === orderB.id);

    if (hasOrderA && !hasOrderB) {
      console.log("PASSED: Seller A list contains Order A and DOES NOT contain Order B.");
    } else {
      throw new Error(`FAILED: Seller A list contains Order A: ${hasOrderA}, Order B: ${hasOrderB}`);
    }

    // TEST 2: Seller A cannot GET Seller B's order
    try {
      await getSellerOrderById(sellerA.userId, orderB.id);
      throw new Error("FAILED: Seller A was able to GET Seller B's order!");
    } catch (err) {
      if (err.statusCode === 404 || err.message.includes("not found")) {
        console.log("PASSED: Seller A GET Seller B's order was rejected with 404.");
      } else {
        throw err;
      }
    }

    // TEST 3: Seller A cannot PATCH Seller B's order
    try {
      await updateOrderStatusBySeller(sellerA.userId, orderB.id, "CONFIRMED");
      throw new Error("FAILED: Seller A was able to PATCH Seller B's order!");
    } catch (err) {
      if (err.statusCode === 404 || err.message.includes("not found")) {
        console.log("PASSED: Seller A PATCH Seller B's order was rejected with 404.");
      } else {
        throw err;
      }
    }

    // TEST 4: Valid status flow: PENDING -> CONFIRMED -> PROCESSING -> READY_TO_SHIP -> SHIPPED -> DELIVERED
    console.log("\n--- TEST 4: Valid Status Transitions & Stock Checks ---");
    const initialInv = await prisma.inventory.findUnique({ where: { productId: productA.id } });
    const initialStock = initialInv.stock;

    // Transition 1: PENDING -> CONFIRMED
    let updated = await updateOrderStatusBySeller(sellerA.userId, orderA.id, "CONFIRMED");
    console.log(`Transition to CONFIRMED: orderStatus=${updated.orderStatus}, paymentStatus=${updated.paymentStatus}`);

    // Transition 2: CONFIRMED -> PROCESSING
    updated = await updateOrderStatusBySeller(sellerA.userId, orderA.id, "PROCESSING");
    console.log(`Transition to PROCESSING: orderStatus=${updated.orderStatus}, paymentStatus=${updated.paymentStatus}`);

    // Transition 3: PROCESSING -> READY_TO_SHIP
    updated = await updateOrderStatusBySeller(sellerA.userId, orderA.id, "READY_TO_SHIP");
    console.log(`Transition to READY_TO_SHIP: orderStatus=${updated.orderStatus}, paymentStatus=${updated.paymentStatus}`);

    // Transition 4: READY_TO_SHIP -> SHIPPED
    updated = await updateOrderStatusBySeller(sellerA.userId, orderA.id, "SHIPPED");
    console.log(`Transition to SHIPPED: orderStatus=${updated.orderStatus}, paymentStatus=${updated.paymentStatus}`);

    // Transition 5: SHIPPED -> DELIVERED
    updated = await updateOrderStatusBySeller(sellerA.userId, orderA.id, "DELIVERED");
    console.log(`Transition to DELIVERED: orderStatus=${updated.orderStatus}, paymentStatus=${updated.paymentStatus}`);

    if (updated.orderStatus === "DELIVERED" && updated.paymentStatus === "PENDING") {
      console.log("PASSED: Full status flow completed. COD payment status remains PENDING as required!");
    } else {
      throw new Error(`FAILED: Unexpected state after status flow: orderStatus=${updated.orderStatus}, paymentStatus=${updated.paymentStatus}`);
    }

    // Check stock was NOT altered by seller status updates
    const finalInv = await prisma.inventory.findUnique({ where: { productId: productA.id } });
    if (finalInv.stock === initialStock) {
      console.log("PASSED: Inventory stock remained untouched during seller status updates.");
    } else {
      throw new Error(`FAILED: Inventory stock changed! Initial: ${initialStock}, Final: ${finalInv.stock}`);
    }

    // TEST 5: Customer sees updated status
    console.log("\n--- TEST 5: Customer Visibility ---");
    const customerOrderView = await getMyOrderById(customer.id, orderA.id);
    if (customerOrderView.orderStatus === "DELIVERED") {
      console.log("PASSED: Customer sees updated fulfillment status DELIVERED.");
    } else {
      throw new Error(`FAILED: Customer order view status is ${customerOrderView.orderStatus}`);
    }

    // TEST 6: Invalid/backward transitions rejected
    console.log("\n--- TEST 6: Invalid & Backward Transitions ---");
    try {
      await updateOrderStatusBySeller(sellerA.userId, orderA.id, "SHIPPED");
      throw new Error("FAILED: Backward transition from DELIVERED to SHIPPED was allowed!");
    } catch (err) {
      if (err.statusCode === 400 || err.message.includes("Cannot move order")) {
        console.log(`PASSED: Backward transition rejected with error: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // Test invalid skip transition on Order B (which is currently PENDING)
    try {
      await updateOrderStatusBySeller(sellerB.userId, orderB.id, "SHIPPED");
      throw new Error("FAILED: Skipping from PENDING directly to SHIPPED was allowed!");
    } catch (err) {
      if (err.statusCode === 400 || err.message.includes("Cannot move order")) {
        console.log(`PASSED: Invalid skip transition rejected with error: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // Cleanup test orders
    await prisma.orderItem.deleteMany({ where: { orderId: { in: [orderA.id, orderB.id] } } });
    await prisma.order.deleteMany({ where: { id: { in: [orderA.id, orderB.id] } } });
    console.log("\nCleaned up test orders.");

    // Cleanup created sellers/products/users
    for (const prod of createdProducts) {
      await prisma.inventory.deleteMany({ where: { productId: prod.id } });
      await prisma.product.delete({ where: { id: prod.id } });
    }
    for (const seller of createdSellers) {
      await prisma.seller.delete({ where: { id: seller.id } });
      await prisma.sellerApplication.delete({ where: { id: seller.applicationId } });
      await prisma.sellerAddress.delete({ where: { id: seller.sellerAddressId } });
      await prisma.user.delete({ where: { id: seller.userId } });
    }
    for (const u of createdUsers) {
      await prisma.user.delete({ where: { id: u.id } });
    }

    console.log("\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
