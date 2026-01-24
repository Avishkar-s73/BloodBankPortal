import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking for Lifesaver Bank Users ===\n');

  // Find all users whose email contains "lifesaver" or first name contains "sonali"
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'sonali', mode: 'insensitive' } },
        { email: { contains: 'lifesaver', mode: 'insensitive' } },
        { firstName: { contains: 'sonali', mode: 'insensitive' } },
      ]
    },
    include: {
      bloodBank: true,
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found with "sonali" or "lifesaver" in name/email');
    return;
  }

  console.log(`Found ${users.length} user(s):\n`);

  for (const user of users) {
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`User ID: ${user.id}`);
    
    if (user.role === 'BLOOD_BANK') {
      const bloodBank = await prisma.bloodBank.findFirst({
        where: { managerId: user.id }
      });
      
      if (bloodBank) {
        console.log(`✅ Manages Blood Bank: ${bloodBank.name} (${bloodBank.city})`);
        console.log(`   Blood Bank ID: ${bloodBank.id}`);
      } else {
        console.log('❌ No blood bank linked');
      }
    }
    console.log('---\n');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
