import prisma from "./src/config/prisma.js";
import { getAllApplications } from "./src/modules/delivery_application/delivery_application.service.js";

async function test() {
  const appsInDb = await prisma.deliveryPartnerApplication.findMany({
    include: { user: true }
  });
  console.log("Total DB Applications count:", appsInDb.length);
  console.log("Apps in DB:", JSON.stringify(appsInDb, null, 2));

  const appsViaService = await getAllApplications();
  console.log("Service getAllApplications count:", appsViaService.length);
  console.log("Service output:", JSON.stringify(appsViaService, null, 2));

  await prisma.$disconnect();
}

test().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
