/**
 * Database Connection Diagnostic Tool
 * Tests various PostgreSQL connection configurations
 */

import { PrismaClient } from '@prisma/client';

async function testConnection(url: string, description: string) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`   URL: ${url.replace(/:[^:@]+@/, ':****@')}`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log(`   ✅ SUCCESS - Connection works!`);
    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.log(`   ❌ FAILED - ${error.message}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  console.log('🚀 Database Connection Diagnostic Tool\n');
  console.log('Testing multiple configurations...\n');

  const tests = [
    {
      url: 'postgresql://postgres:Nitika%407238@localhost:5432/bloodlink_dev?schema=public',
      desc: 'Port 5432 with URL-encoded password'
    },
    {
      url: 'postgresql://postgres:Nitika%407238@localhost:5433/bloodlink_dev?schema=public',
      desc: 'Port 5433 with URL-encoded password'
    },
    {
      url: 'postgresql://postgres:admin@localhost:5432/bloodlink_dev?schema=public',
      desc: 'Port 5432 with password "admin"'
    },
    {
      url: 'postgresql://postgres:admin@localhost:5433/bloodlink_dev?schema=public',
      desc: 'Port 5433 with password "admin"'
    },
    {
      url: 'postgresql://postgres:postgres@localhost:5432/bloodlink_dev?schema=public',
      desc: 'Port 5432 with password "postgres"'
    },
    {
      url: 'postgresql://postgres:postgres@localhost:5433/bloodlink_dev?schema=public',
      desc: 'Port 5433 with password "postgres"'
    },
  ];

  let successCount = 0;
  const workingUrls: string[] = [];

  for (const test of tests) {
    const success = await testConnection(test.url, test.desc);
    if (success) {
      successCount++;
      workingUrls.push(test.url);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Results: ${successCount}/${tests.length} configurations worked\n`);

  if (workingUrls.length > 0) {
    console.log('✅ Working configuration(s):\n');
    workingUrls.forEach((url, i) => {
      console.log(`${i + 1}. ${url.replace(/:[^:@]+@/, ':****@')}\n`);
    });
    console.log('💡 Copy one of the working URLs above to your .env file');
  } else {
    console.log('❌ No working configurations found.\n');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Verify PostgreSQL is running');
    console.log('   2. Check password in pgAdmin');
    console.log('   3. Confirm port (5432 or 5433)');
    console.log('   4. Ensure database "bloodlink_dev" exists');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
