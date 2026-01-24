const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/bloodlink_dev?schema=public'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Step 1: Add enum values
    console.log('\nStep 1: Adding new enum values...');
    const enumSql = fs.readFileSync(
      path.join(__dirname, 'prisma', 'migrations', '20260124050922_add_workflow_statuses_and_donation_intents', 'migration_step1_enums.sql'),
      'utf8'
    );
    await client.query(enumSql);
    console.log('✓ Enum values added successfully');

    // Commit the enum changes
    await client.query('COMMIT');
    
    // Step 2: Create tables
    console.log('\nStep 2: Creating donation_intents table...');
    const tableSql = fs.readFileSync(
      path.join(__dirname, 'prisma', 'migrations', '20260124050922_add_workflow_statuses_and_donation_intents', 'migration_step2_tables.sql'),
      'utf8'
    );
    await client.query(tableSql);
    console.log('✓ Tables created successfully');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
