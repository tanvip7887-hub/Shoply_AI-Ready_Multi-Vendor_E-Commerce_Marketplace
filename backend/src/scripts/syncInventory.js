import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sync() {
  console.log("Starting inventory sync...");
  const products = await prisma.product.findMany({
    include: { inventory: true }
  });

  let synced = 0;
  for (const p of products) {
    if (!p.inventory) {
      await prisma.inventory.create({
        data: {
          productId: p.id,
          stock: 0,
          reservedStock: 0,
          availableStock: 0,
          status: "OUT_OF_STOCK",
          lowStockThreshold: 5
        }
      });
      synced++;
    }
  }
  console.log(`Synced ${synced} missing inventory records.`);
  await prisma.$disconnect();
}

sync().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
