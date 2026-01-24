import { prisma } from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, phone: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
