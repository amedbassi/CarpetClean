const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Applying repair completed migration...');
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/add_repair_completed.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⚙️  Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');
      
      await prisma.$executeRawUnsafe(statement);
      console.log('✅ Success');
    }
    
    console.log('\n🎉 Migration applied successfully!');
    console.log('\n📊 Verifying migration...');
    
    // Verify the column exists by querying
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'CarpetItem' 
      AND column_name = 'repairCompleted'
    `;
    
    if (result.length > 0) {
      console.log('✅ Column "repairCompleted" exists in database');
      console.log('   Type:', result[0].data_type);
      console.log('   Default:', result[0].column_default);
    } else {
      console.log('❌ Column "repairCompleted" not found!');
    }
    
    // Check index
    const indexResult = await prisma.$queryRaw`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'CarpetItem' 
      AND indexname = 'CarpetItem_repairCompleted_idx'
    `;
    
    if (indexResult.length > 0) {
      console.log('✅ Index "CarpetItem_repairCompleted_idx" exists');
    } else {
      console.log('❌ Index "CarpetItem_repairCompleted_idx" not found!');
    }
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    
    // Check if column already exists
    if (error.message && error.message.includes('already exists')) {
      console.log('\n⚠️  Column may already exist. Verifying...');
      
      try {
        const result = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'CarpetItem' 
          AND column_name = 'repairCompleted'
        `;
        
        if (result.length > 0) {
          console.log('✅ Migration already applied - column exists');
        }
      } catch (verifyError) {
        console.error('Error verifying:', verifyError);
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
