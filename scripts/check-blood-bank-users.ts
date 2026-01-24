import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBloodBankUsers() {
  try {
    const bloodBankUsers = await prisma.user.findMany({
      where: {
        role: 'BLOOD_BANK',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bloodBankId: true,
        bloodBank: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    console.log('\n=== Blood Bank Users ===\n');
    
    if (bloodBankUsers.length === 0) {
      console.log('No blood bank users found.');
    } else {
      bloodBankUsers.forEach((user, index) => {
        console.log(`${index + 1}. User: ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   User ID: ${user.id.substring(0, 8)}...`);
        console.log(`   Blood Bank ID: ${user.bloodBankId ? user.bloodBankId.substring(0, 8) + '...' : 'NOT LINKED'}`);
        if (user.bloodBank) {
          console.log(`   Blood Bank: ${user.bloodBank.name} (${user.bloodBank.city})`);
        } else {
          console.log(`   ⚠️ WARNING: User not linked to any blood bank!`);
        }
        console.log('');
      });
    }

    console.log(`\nTotal blood bank users: ${bloodBankUsers.length}`);
  } catch (error) {
    console.error('Error checking blood bank users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBloodBankUsers();
