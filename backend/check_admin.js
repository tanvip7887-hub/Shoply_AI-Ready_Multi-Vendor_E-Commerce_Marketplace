import prisma from "./src/config/prisma.js";

async function checkAdmin() {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  console.log("Admins in DB:", JSON.stringify(admins, null, 2));
  await prisma.$disconnect();
}

checkAdmin();
