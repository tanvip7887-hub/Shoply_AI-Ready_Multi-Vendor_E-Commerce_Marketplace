import prisma from "../config/prisma.js";
import { hashValue } from "../utils/hash.util.js";

async function runAuthVerification() {
  console.log("=== STARTING AUTH LOGIN VERIFICATION ===");

  try {
    // 1. Ensure test users exist for all roles (CUSTOMER, SELLER, ADMIN)
    const timestamp = Date.now();

    // CUSTOMER
    let customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: "Test Customer",
          email: `cust_${timestamp}@example.com`,
          password: await hashValue("Customer@123"),
          role: "CUSTOMER",
          isEmailVerified: true,
        },
      });
    }

    // SELLER
    let sellerUser = await prisma.user.findFirst({ where: { role: "SELLER" } });
    if (!sellerUser) {
      sellerUser = await prisma.user.create({
        data: {
          name: "Test Seller",
          email: `seller_${timestamp}@example.com`,
          password: await hashValue("Seller@123"),
          role: "SELLER",
          isEmailVerified: true,
        },
      });
    }

    // ADMIN
    let adminUser = await prisma.user.findUnique({ where: { email: "admin@shoply.com" } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: "Shoply Admin",
          email: "admin@shoply.com",
          password: await hashValue("Admin@123"),
          role: "ADMIN",
          isEmailVerified: true,
        },
      });
    }

    const testPassword = "Admin@123";

    // Set a known password for customer and seller if needed
    const passHash = await hashValue("TestPass@123");
    await prisma.user.update({ where: { id: customer.id }, data: { password: passHash } });
    await prisma.user.update({ where: { id: sellerUser.id }, data: { password: passHash } });

    console.log(`Testing with Customer (${customer.email}), Seller (${sellerUser.email}), Admin (${adminUser.email})`);

    // TEST A: Correct Credentials - Admin Login
    console.log("\n--- TEST A: Correct Credentials (ADMIN) ---");
    let res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminUser.email, password: testPassword }),
    });
    let data = await res.json();
    let setCookieHeader = res.headers.get("set-cookie") || "";
    if (res.status === 200 && data.success && data.data.role === "ADMIN") {
      console.log("PASSED: Admin login succeeded. Set-Cookie contains sameSite=lax:", setCookieHeader.toLowerCase().includes("samesite=lax"));
    } else {
      throw new Error(`FAILED: Admin login failed. Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }

    // TEST B: Correct Credentials - Seller Login
    console.log("\n--- TEST B: Correct Credentials (SELLER) ---");
    res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sellerUser.email, password: "TestPass@123" }),
    });
    data = await res.json();
    if (res.status === 200 && data.success && data.data.role === "SELLER") {
      console.log("PASSED: Seller login succeeded.");
    } else {
      throw new Error(`FAILED: Seller login failed. Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }

    // TEST C: Correct Credentials - Customer Login
    console.log("\n--- TEST C: Correct Credentials (CUSTOMER) ---");
    res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: customer.email, password: "TestPass@123" }),
    });
    data = await res.json();
    if (res.status === 200 && data.success && data.data.role === "CUSTOMER") {
      console.log("PASSED: Customer login succeeded.");
    } else {
      throw new Error(`FAILED: Customer login failed. Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }

    // TEST D: Wrong Password
    console.log("\n--- TEST D: Wrong Password ---");
    res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminUser.email, password: "WrongPassword!999" }),
    });
    data = await res.json();
    if (res.status === 401 && !data.success && data.message === "Invalid email or password") {
      console.log("PASSED: Wrong password returned 401 Unauthorized with proper error message.");
    } else {
      throw new Error(`FAILED: Unexpected wrong password response. Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }

    // TEST E: Non-existing User
    console.log("\n--- TEST E: Non-existing User ---");
    res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "definitely_non_existing_99999@shoply.com", password: "SomePassword123" }),
    });
    data = await res.json();
    if (res.status === 401 && !data.success && data.message === "Invalid email or password") {
      console.log("PASSED: Non-existing user returned 401 Unauthorized with proper error message.");
    } else {
      throw new Error(`FAILED: Unexpected non-existing user response. Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }

    console.log("\n🎉 ALL AUTH LOGIN VERIFICATION TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Auth verification failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthVerification();
