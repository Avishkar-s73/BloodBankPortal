import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseLifesaver() {
  try {
    console.log('\n=== Lifesaver Blood Bank Diagnosis ===\n');
    
    // 1. Find Lifesaver Blood Bank
    const lifesaver = await prisma.bloodBank.findFirst({
      where: { 
        name: {
          contains: 'Lifesaver',
          mode: 'insensitive'
        }
      },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!lifesaver) {
      console.log('❌ Lifesaver Blood Bank not found!');
      return;
    }

    console.log('1. Lifesaver Blood Bank:');
    console.log(`   ID: ${lifesaver.id}`);
    console.log(`   Name: ${lifesaver.name}`);
    console.log(`   City: ${lifesaver.city}`);
    
    if (lifesaver.manager) {
      console.log(`   ✅ Manager: ${lifesaver.manager.firstName} ${lifesaver.manager.lastName} (${lifesaver.manager.email})`);
    } else {
      console.log(`   ⚠️ NO MANAGER ASSIGNED!`);
    }

    // 2. Check requests for Lifesaver
    const requests = await prisma.bloodRequest.findMany({
      where: {
        bloodBankId: lifesaver.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        requester: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    console.log(`\n2. Blood Requests for Lifesaver:`);
    console.log(`   Total requests: ${requests.length}`);
    
    if (requests.length > 0) {
      console.log('\n   Recent Requests:');
      requests.forEach((req, i) => {
        console.log(`   ${i + 1}. Status: ${req.status} | Blood: ${req.bloodGroup} | Qty: ${req.quantityNeeded}`);
        console.log(`      Requester: ${req.requester.firstName} ${req.requester.lastName}`);
        console.log(`      Created: ${req.createdAt.toISOString()}`);
      });
      
      // Count by status
      const pending = requests.filter(r => r.status === 'PENDING_APPROVAL' || r.status === 'PENDING').length;
      const escalated = requests.filter(r => r.status === 'ESCALATED_TO_DONORS').length;
      
      console.log(`\n   Status Summary:`);
      console.log(`   - PENDING/PENDING_APPROVAL: ${pending}`);
      console.log(`   - ESCALATED_TO_DONORS: ${escalated}`);
    }

    // 3. Check all blood bank users
    console.log(`\n3. All Blood Bank Users:`);
    const bbUsers = await prisma.user.findMany({
      where: { role: 'BLOOD_BANK' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    for (const user of bbUsers) {
      const managedBank = await prisma.bloodBank.findFirst({
        where: { managerId: user.id },
        select: { name: true, city: true }
      });
      
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      if (managedBank) {
        console.log(`     ✅ Manages: ${managedBank.name} (${managedBank.city})`);
      } else {
        console.log(`     ⚠️ NOT linked to any blood bank`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseLifesaver();
