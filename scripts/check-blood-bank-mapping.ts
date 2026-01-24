import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBloodBankMapping() {
  try {
    // Get all users with BLOOD_BANK role
    const bloodBankUsers = await prisma.user.findMany({
      where: { role: 'BLOOD_BANK' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log('\n=== Blood Bank Users and Their Blood Banks ===\n');
    
    for (const user of bloodBankUsers) {
      console.log(`User: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`User ID: ${user.id.substring(0, 8)}...`);
      
      // Find blood bank managed by this user
      const bloodBank = await prisma.bloodBank.findFirst({
        where: { managerId: user.id },
        select: {
          id: true,
          name: true,
          city: true,
        },
      });
      
      if (bloodBank) {
        console.log(`✅ Manages: ${bloodBank.name} (${bloodBank.city})`);
        console.log(`   Blood Bank ID: ${bloodBank.id.substring(0, 8)}...`);
        
        // Check how many requests this blood bank has
        const requestCount = await prisma.bloodRequest.count({
          where: {
            bloodBankId: bloodBank.id,
            status: {
              in: ['PENDING', 'PENDING_APPROVAL', 'ESCALATED_TO_DONORS']
            }
          }
        });
        console.log(`   Pending requests: ${requestCount}`);
      } else {
        console.log(`⚠️  NOT linked to any blood bank!`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBloodBankMapping();
