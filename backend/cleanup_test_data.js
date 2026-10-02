import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    const testUsers = await prisma.user.findMany({
      where: {
        email: { startsWith: 'carttest_' }
      }
    });

    if (testUsers.length === 0) {
      console.log('No temporary test users found.');
      return;
    }

    for (const user of testUsers) {
      console.log(`Cleaning up test user: ${user.email}`);

      // Find cart
      const cart = await prisma.cart.findUnique({
        where: { userId: user.id }
      });

      if (cart) {
        // Delete CartItems
        const deletedItems = await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
        console.log(`- Deleted ${deletedItems.count} CartItems`);

        // Delete Cart
        await prisma.cart.delete({
          where: { id: cart.id }
        });
        console.log(`- Deleted Cart`);
      }

      // Delete User
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`- Deleted User`);
    }

    console.log('Cleanup completed successfully.');
    
    // Verify deletion
    const remaining = await prisma.user.count({
      where: { email: { startsWith: 'carttest_' } }
    });
    console.log(`Remaining test users: ${remaining}`);
    
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
