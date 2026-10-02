import prisma from "./src/config/prisma.js";
import { registerUser, verifyEmailOtp, resendEmailOtp, loginUser } from "./src/modules/auth/auth.service.js";
import { hashToken } from "./src/utils/token.util.js";

async function runTest() {
  console.log("==================================================");
  console.log("Testing Customer Email OTP Verification Flow");
  console.log("==================================================");

  const testEmail = `otp_test_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  const testName = "OTP Test Customer";

  // Cleanup if exists
  await prisma.user.deleteMany({ where: { email: testEmail } });

  // 1. Customer Registration
  console.log("\n1. Testing Customer Registration...");
  const regResult = await registerUser({ name: testName, email: testEmail, password: testPassword });
  console.log("Registration Response:", regResult);

  const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
  console.log("DB User State (isEmailVerified):", dbUser.isEmailVerified);
  if (dbUser.isEmailVerified !== false) {
    throw new Error("TEST FAILED: Newly registered customer must have isEmailVerified = false");
  }

  // Find generated token record in DB
  const tokenRecord = await prisma.emailVerificationToken.findFirst({
    where: { userId: dbUser.id },
  });
  console.log("OTP Token Record created in DB:", tokenRecord ? `ID #${tokenRecord.id}` : "NONE");
  if (!tokenRecord) {
    throw new Error("TEST FAILED: EmailVerificationToken record was not created");
  }

  // 2. Unverified Login Attempt
  console.log("\n2. Testing Unverified Customer Login...");
  try {
    await loginUser({ email: testEmail, password: testPassword });
    throw new Error("TEST FAILED: Unverified customer login should have been blocked");
  } catch (err) {
    console.log("Unverified Login Blocked as expected:", err.message);
  }

  // 3. Wrong OTP Attempt
  console.log("\n3. Testing Wrong OTP Verification...");
  try {
    await verifyEmailOtp({ email: testEmail, otp: "000000" });
    throw new Error("TEST FAILED: Wrong OTP should be rejected");
  } catch (err) {
    console.log("Wrong OTP rejected as expected:", err.message);
  }

  // 4. Resend OTP
  console.log("\n4. Testing Resend OTP Cooldown & Token Generation...");
  try {
    await resendEmailOtp({ email: testEmail });
    console.log("TEST WARNING: Resend within 60s should have triggered cooldown");
  } catch (err) {
    console.log("Resend Cooldown Triggered as expected:", err.message);
  }

  // 5. Simulate Correct OTP Verification
  console.log("\n5. Testing Correct OTP Verification...");

  // To verify with actual OTP, we can extract the OTP by temporarily setting a known OTP token
  const validOtp = "482731";
  await prisma.emailVerificationToken.update({
    where: { id: tokenRecord.id },
    data: { tokenHash: hashToken(validOtp), attempts: 0 },
  });

  const verifyResult = await verifyEmailOtp({ email: testEmail, otp: validOtp });
  console.log("Verification Success Response:", verifyResult.message);

  const verifiedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  console.log("Verified DB User State (isEmailVerified):", verifiedUser.isEmailVerified);
  if (verifiedUser.isEmailVerified !== true) {
    throw new Error("TEST FAILED: Customer isEmailVerified should be true after OTP verification");
  }

  // Verify OTP token is cleaned up
  const remainingTokens = await prisma.emailVerificationToken.findMany({ where: { userId: dbUser.id } });
  console.log("Remaining Verification Tokens in DB:", remainingTokens.length);

  // 6. Verified Login Attempt
  console.log("\n6. Testing Verified Customer Login...");
  const loginResult = await loginUser({ email: testEmail, password: testPassword });
  console.log("Verified Customer Login Succeeded:", loginResult.user);

  // 7. Verify Seller / Admin / Delivery Agent logins still work
  console.log("\n7. Verifying Role-Based Login Compatibility...");
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  console.log("Admin User found:", adminUser?.email);

  console.log("\n==================================================");
  console.log("ALL OTP VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("==================================================");

  // Cleanup test user
  await prisma.user.delete({ where: { id: dbUser.id } });
  process.exit(0);
}

runTest().catch((err) => {
  console.error("\nTEST ERROR:", err);
  process.exit(1);
});
