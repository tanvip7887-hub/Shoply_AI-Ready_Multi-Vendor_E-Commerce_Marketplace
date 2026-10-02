import prisma from "./src/config/prisma.js";
import { hashValue } from "./src/utils/hash.util.js";

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("=== STARTING DELIVERY SECURITY & APPROVAL TEST SUITE ===");

  // Ensure Admin User has password 'Admin@123'
  const adminHashed = await hashValue("Admin@123");
  await prisma.user.upsert({
    where: { email: "admin@shoply.com" },
    update: { password: adminHashed, role: "ADMIN" },
    create: {
      name: "Shoply Admin",
      email: "admin@shoply.com",
      password: adminHashed,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  const timestamp = Date.now();
  let passedCount = 0;
  let totalCount = 11;

  const extractCookies = (res) => {
    let rawCookies = [];
    if (typeof res.headers.getSetCookie === "function") {
      rawCookies = res.headers.getSetCookie();
    } else {
      const header = res.headers.get("set-cookie");
      if (header) rawCookies = [header];
    }
    const parsed = rawCookies.map((c) => c.split(";")[0].trim()).filter(Boolean).join("; ");
    return parsed;
  };

  // Helper for requests
  const req = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    const cookieHeader = extractCookies(res);
    return { status: res.status, data, headers: res.headers, cookies: cookieHeader };
  };

  try {
    // 1. Normal Registration
    console.log("\n1. Testing Normal Registration...");
    const reg1 = await req("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Normal Customer",
        email: `sec_normal_${timestamp}@test.com`,
        password: "password123",
      }),
    });
    const cookieCustomer1 = reg1.cookies;

    if (reg1.status === 201 && reg1.data.data?.role === "CUSTOMER") {
      console.log("✅ PASSED: Normal registration created role CUSTOMER");
      passedCount++;
    } else {
      console.error("❌ FAILED: Normal registration:", reg1);
    }

    // 2. Registration with role=DELIVERY_AGENT
    console.log("\n2. Testing Registration with role=DELIVERY_AGENT...");
    const reg2 = await req("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Agent Attempt",
        email: `sec_agent_${timestamp}@test.com`,
        password: "password123",
        role: "DELIVERY_AGENT",
      }),
    });
    if (reg2.status === 201 && reg2.data.data?.role === "CUSTOMER") {
      console.log("✅ PASSED: Server ignored DELIVERY_AGENT and created role CUSTOMER");
      passedCount++;
    } else {
      console.error("❌ FAILED: Registration allowed self-assigned DELIVERY_AGENT:", reg2);
    }

    // 3. Registration with role=ADMIN
    console.log("\n3. Testing Registration with role=ADMIN...");
    const reg3 = await req("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Admin Attempt",
        email: `sec_admin_${timestamp}@test.com`,
        password: "password123",
        role: "ADMIN",
      }),
    });
    if (reg3.status === 201 && reg3.data.data?.role === "CUSTOMER") {
      console.log("✅ PASSED: Server ignored ADMIN and created role CUSTOMER");
      passedCount++;
    } else {
      console.error("❌ FAILED: Registration allowed self-assigned ADMIN:", reg3);
    }

    // 4. Registration with role=SELLER
    console.log("\n4. Testing Registration with role=SELLER...");
    const reg4 = await req("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Seller Attempt",
        email: `sec_seller_${timestamp}@test.com`,
        password: "password123",
        role: "SELLER",
      }),
    });
    if (reg4.status === 201 && reg4.data.data?.role === "CUSTOMER") {
      console.log("✅ PASSED: Server ignored SELLER and created role CUSTOMER");
      passedCount++;
    } else {
      console.error("❌ FAILED: Registration allowed self-assigned SELLER:", reg4);
    }

    // 5. Customer submits Delivery Application
    console.log("\n5. Customer Submits Delivery Partner Application...");
    const appRes = await req("/delivery-applications", {
      method: "POST",
      headers: { Cookie: cookieCustomer1 },
      body: JSON.stringify({
        phone: "9876543210",
        vehicleType: "Motorcycle",
        city: "Mumbai",
      }),
    });
    const appId = appRes.data.data?.id;
    if (appRes.status === 201 && appRes.data.data?.status === "PENDING") {
      console.log("✅ PASSED: Application created with status PENDING");
      passedCount++;
    } else {
      console.error("❌ FAILED: Submit application:", appRes);
    }

    // 6. Customer attempts /delivery/* while PENDING
    console.log("\n6. Customer attempts /delivery/* while PENDING...");
    const pendingAccess = await req("/delivery/available", {
      headers: { Cookie: cookieCustomer1 },
    });
    if (pendingAccess.status === 403) {
      console.log("✅ PASSED: Access denied (403 Forbidden) while application is PENDING");
      passedCount++;
    } else {
      console.error("❌ FAILED: Customer accessed delivery endpoint while PENDING:", pendingAccess);
    }

    // Login as Admin
    console.log("\nLogging in as Admin (admin@shoply.com)...");
    const adminLogin = await req("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@shoply.com",
        password: "Admin@123",
      }),
    });
    const cookieAdmin = adminLogin.cookies;

    // 7. Admin Approves Application
    console.log("\n7. Admin Approves Application...");
    const approveRes = await req(`/delivery-applications/${appId}/approve`, {
      method: "PATCH",
      headers: { Cookie: cookieAdmin },
    });
    if (approveRes.status === 200 && approveRes.data.data?.status === "APPROVED" && approveRes.data.data?.user?.role === "DELIVERY_AGENT") {
      console.log("✅ PASSED: Application APPROVED and user role promoted to DELIVERY_AGENT");
      passedCount++;
    } else {
      console.error("❌ FAILED: Approve application:", approveRes);
    }

    // Refresh Customer 1 Login session to update role token/cookies
    const reloginCustomer1 = await req("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: `sec_normal_${timestamp}@test.com`,
        password: "password123",
      }),
    });
    const cookieCustomer1Approved = reloginCustomer1.cookies;

    // 8. Approved DELIVERY_AGENT accesses /delivery/*
    console.log("\n8. Approved DELIVERY_AGENT accesses /delivery/*...");
    const approvedAccess = await req("/delivery/available", {
      headers: { Cookie: cookieCustomer1Approved },
    });
    if (approvedAccess.status === 200) {
      console.log("✅ PASSED: Approved DELIVERY_AGENT successfully accessed delivery portal");
      passedCount++;
    } else {
      console.error("❌ FAILED: DELIVERY_AGENT denied delivery access:", approvedAccess);
    }

    // 9. Admin Rejects Application
    console.log("\n9. Admin Rejects Application...");
    const regReject = await req("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Reject Candidate",
        email: `sec_reject_${timestamp}@test.com`,
        password: "password123",
      }),
    });
    const cookieReject = regReject.cookies;

    const appReject = await req("/delivery-applications", {
      method: "POST",
      headers: { Cookie: cookieReject },
      body: JSON.stringify({
        phone: "9123456789",
        vehicleType: "Bicycle",
        city: "Pune",
      }),
    });
    const appRejectId = appReject.data.data?.id;

    const rejectRes = await req(`/delivery-applications/${appRejectId}/reject`, {
      method: "PATCH",
      headers: { Cookie: cookieAdmin },
      body: JSON.stringify({ rejectionReason: "Invalid documentation" }),
    });

    if (rejectRes.status === 200 && rejectRes.data.data?.status === "REJECTED" && rejectRes.data.data?.user?.role === "CUSTOMER") {
      console.log("✅ PASSED: Application REJECTED and user remains CUSTOMER");
      passedCount++;
    } else {
      console.error("❌ FAILED: Reject application:", rejectRes);
    }

    // 10. Customer A cannot view Customer B's application
    console.log("\n10. Customer A cannot view Customer B's application...");
    const crossView = await req(`/delivery-applications/${appRejectId}`, {
      headers: { Cookie: cookieCustomer1Approved },
    });
    if (crossView.status === 403) {
      console.log("✅ PASSED: Cross-user application viewing denied (403 Forbidden)");
      passedCount++;
    } else {
      console.error("❌ FAILED: Customer A accessed Customer B's application:", crossView);
    }

    // 11. Non-admin cannot approve/reject an application
    console.log("\n11. Non-admin cannot approve an application...");
    const nonAdminApprove = await req(`/delivery-applications/${appRejectId}/approve`, {
      method: "PATCH",
      headers: { Cookie: cookieReject },
    });
    if (nonAdminApprove.status === 403) {
      console.log("✅ PASSED: Non-admin approval attempt denied (403 Forbidden)");
      passedCount++;
    } else {
      console.error("❌ FAILED: Non-admin was able to approve application:", nonAdminApprove);
    }

  } catch (err) {
    console.error("Error during test execution:", err);
  } finally {
    console.log(`\n==================================================`);
    console.log(`TEST SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED`);
    console.log(`==================================================\n`);
    await prisma.$disconnect();
    process.exit(passedCount === totalCount ? 0 : 1);
  }
}

runTests();
