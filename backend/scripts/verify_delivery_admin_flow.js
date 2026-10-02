import prisma from "../src/config/prisma.js";
import { hashValue } from "../src/utils/hash.util.js";

const API_BASE = "http://localhost:5000/api/v1";

const extractCookies = (res) => {
  let rawCookies = [];
  if (typeof res.headers.getSetCookie === "function") {
    rawCookies = res.headers.getSetCookie();
  } else {
    const header = res.headers.get("set-cookie");
    if (header) rawCookies = [header];
  }
  return rawCookies.map((c) => c.split(";")[0].trim()).filter(Boolean).join("; ");
};

async function runTest() {
  console.log("=== STARTING END-TO-END DELIVERY ADMIN FLOW TEST ===");

  const testEmail = `delivtest_${Date.now()}@example.com`;
  const password = "Password123!";
  const name = "Test Delivery Applicant";

  // 1. Register Customer
  console.log("\n1. Registering customer account:", testEmail);
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email: testEmail, password, role: "CUSTOMER" }),
  });
  const customerCookies = extractCookies(regRes);
  console.log("Customer registered successfully.");

  // 2. Submit Delivery Application as Customer
  console.log("\n2. Submitting Delivery Partner application...");
  const appRes = await fetch(`${API_BASE}/delivery-applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: customerCookies,
    },
    body: JSON.stringify({
      phone: "9876543210",
      vehicleType: "Bike",
      city: "Test City",
    }),
  });

  const appDataJson = await appRes.json();
  console.log("Application response status:", appRes.status);
  console.log("Application response body:", JSON.stringify(appDataJson, null, 2));
  const submittedApp = appDataJson.data;
  console.log("Application ID:", submittedApp.id);

  // 3. Verify in Prisma DB
  console.log("\n3. Verifying application in database...");
  const dbApp = await prisma.deliveryPartnerApplication.findUnique({
    where: { id: submittedApp.id },
    include: { user: true },
  });
  console.log("DB Record found:", {
    id: dbApp.id,
    userId: dbApp.userId,
    status: dbApp.status,
    phone: dbApp.phone,
    vehicleType: dbApp.vehicleType,
    city: dbApp.city,
    userName: dbApp.user.name,
    userEmail: dbApp.user.email,
  });

  if (!dbApp || dbApp.status !== "PENDING") {
    throw new Error("Failed: Application in DB is missing or not PENDING!");
  }

  // 4. Log in as ADMIN
  console.log("\n4. Logging in as ADMIN...");
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

  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@shoply.com", password: "Admin@123" }),
  });
  const adminCookies = extractCookies(adminLoginRes);
  console.log("Admin logged in successfully. Cookie header length:", adminCookies.length);

  // 5. Call GET /api/v1/delivery-applications as ADMIN
  console.log("\n5. Calling GET /api/v1/delivery-applications as ADMIN...");
  const getAppsRes = await fetch(`${API_BASE}/delivery-applications`, {
    headers: { Cookie: adminCookies },
  });
  const getAppsJson = await getAppsRes.json();

  console.log("GET /delivery-applications response status:", getAppsRes.status);
  console.log("Raw GET response body keys:", Object.keys(getAppsJson));
  console.log("Number of applications returned:", getAppsJson.data ? getAppsJson.data.length : 0);

  const foundInList = getAppsJson.data?.find((a) => a.id === submittedApp.id);
  if (!foundInList) {
    throw new Error("Failed: Newly submitted application NOT returned in GET /api/v1/delivery-applications!");
  }
  console.log("FOUND application in GET list:", {
    id: foundInList.id,
    name: foundInList.user?.name,
    email: foundInList.user?.email,
    phone: foundInList.phone,
    vehicleType: foundInList.vehicleType,
    city: foundInList.city,
    status: foundInList.status,
  });

  // 6. Test GET /api/v1/delivery-applications?status=PENDING
  console.log("\n6. Calling GET /api/v1/delivery-applications?status=PENDING...");
  const getPendingRes = await fetch(`${API_BASE}/delivery-applications?status=PENDING`, {
    headers: { Cookie: adminCookies },
  });
  const getPendingJson = await getPendingRes.json();
  const foundInPending = getPendingJson.data?.find((a) => a.id === submittedApp.id);
  if (!foundInPending) {
    throw new Error("Failed: Application not found when filtering status=PENDING!");
  }
  console.log("FOUND application under PENDING filter.");

  // 7. Test Admin Approve
  console.log("\n7. Approving application as ADMIN...");
  const approveRes = await fetch(`${API_BASE}/delivery-applications/${submittedApp.id}/approve`, {
    method: "PATCH",
    headers: { Cookie: adminCookies },
  });
  console.log("Approve response status:", approveRes.status);

  // 8. Verify user role promoted to DELIVERY_AGENT in DB
  console.log("\n8. Verifying user role updated to DELIVERY_AGENT in DB...");
  const updatedUser = await prisma.user.findUnique({
    where: { id: dbApp.userId },
  });
  console.log("Updated user role:", updatedUser.role);
  if (updatedUser.role !== "DELIVERY_AGENT") {
    throw new Error(`Failed: User role is ${updatedUser.role}, expected DELIVERY_AGENT!`);
  }

  console.log("\n=============================================");
  console.log("ALL VERIFICATIONS PASSED SUCCESSFULLY!");
  console.log("=============================================\n");
}

runTest()
  .catch((err) => {
    console.error("TEST FAILED:", err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
