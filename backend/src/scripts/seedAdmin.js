import prisma from "../config/prisma.js";
import { hashValue } from "../utils/hash.util.js";
import logger from "../utils/logger.js";

const ADMIN_EMAIL = "admin@shoply.com";
const ADMIN_PASSWORD = "Admin@123";

const seedAdmin = async () => {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    logger.info("Admin account already exists, skipping seed.");
    return;
  }

  const hashedPassword = await hashValue(ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      name: "Shoply Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
      isEmailVerified: true, // no verification flow needed for a seeded account
    },
  });

  logger.info(`Admin account created: ${ADMIN_EMAIL}`);
};

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`Admin seed failed: ${err.message}`);
    process.exit(1);
  });