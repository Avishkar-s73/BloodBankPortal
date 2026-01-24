import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRequests() {
  try {
    const requests = await prisma.bloodRequest.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        bloodBank: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log('\n=== Recent Blood Requests ===\n');
    
    if (requests.length === 0) {
      console.log('No requests found in database.');
    } else {
      requests.forEach((r, index) => {
        console.log(`${index + 1}. Request ID: ${r.id.substring(0, 8)}...`);
        console.log(`   Status: ${r.status}`);
        console.log(`   Blood Group: ${r.bloodGroup}`);
        console.log(`   Quantity Needed: ${r.quantityNeeded} units`);
        console.log(`   Requester: ${r.requester.firstName} ${r.requester.lastName}`);
        console.log(`   Blood Bank: ${r.bloodBank.name}`);
        console.log(`   Created: ${r.createdAt.toISOString()}`);
        console.log('');
      });
    }

    console.log(`\nTotal requests found: ${requests.length}`);
  } catch (error) {
    console.error('Error checking requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRequests();
