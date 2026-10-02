import { PrismaClient } from "@prisma/client";
import { getCart } from "./src/modules/cart/cart.service.js";

const prisma = new PrismaClient();

async function main() {
  const cart = await getCart(3);
  console.log(JSON.stringify(cart, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

main().catch(console.error).finally(() => prisma.$disconnect());
