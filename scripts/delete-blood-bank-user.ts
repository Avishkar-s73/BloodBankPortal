import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAndReset() {
  try {
    const email = 'aku@example.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        bloodBank: true,
      },
    });

    if (!user) {
      console.log(`User ${email} not found.`);
      return;
    }

    console.log(`\nFound user: ${user.firstName} ${user.lastName} (${user.email})`);

    // If user manages a blood bank, unlink it
    if (user.bloodBank) {
      console.log(`Unlinking from blood bank: ${user.bloodBank.name}`);
      await prisma.bloodBank.update({
        where: { id: user.bloodBank.id },
        data: { managerId: null },
      });
    }

    // Delete the user
    console.log(`Deleting user...`);
    await prisma.user.delete({
      where: { email },
    });

    console.log(`✅ User deleted successfully!\n`);
    console.log(`You can now register again with ${email}\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndReset();
