import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listBloodBanks() {
  try {
    const bloodBanks = await prisma.bloodBank.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        managerId: true,
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log('\n=== Blood Banks ===\n');
    
    bloodBanks.forEach((bb, index) => {
      console.log(`${index + 1}. ${bb.name} (${bb.city})`);
      console.log(`   ID: ${bb.id.substring(0, 8)}...`);
      if (bb.manager) {
        console.log(`   ✅ Manager: ${bb.manager.firstName} ${bb.manager.lastName} (${bb.manager.email})`);
      } else {
        console.log(`   ⚠️ NO MANAGER ASSIGNED`);
      }
      console.log('');
    });

    // Now link the blood bank user to Central Blood Bank
    const bloodBankUser = await prisma.user.findUnique({
      where: { email: 'aku@example.com' },
    });

    if (bloodBankUser) {
      const centralBloodBank = bloodBanks.find(bb => bb.name === 'Central Blood Bank');
      
      if (centralBloodBank && !centralBloodBank.managerId) {
        console.log(`\n🔧 Linking ${bloodBankUser.firstName} to ${centralBloodBank.name}...\n`);
        
        await prisma.bloodBank.update({
          where: { id: centralBloodBank.id },
          data: { managerId: bloodBankUser.id },
        });
        
        console.log('✅ Successfully linked!\n');
      } else if (centralBloodBank && centralBloodBank.managerId) {
        console.log(`\n⚠️ ${centralBloodBank.name} already has a manager.\n`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listBloodBanks();
