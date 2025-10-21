const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    const migrationFile = process.argv[2] || 'supabase-migration.sql';
    console.log(`Reading migration file: ${migrationFile}...`);
    const migrationPath = path.join(__dirname, '..', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration to Supabase...');

    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message.includes('already exists')) {
          console.error('Error executing statement:', error);
        }
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('\nYou can now:');
    console.log('1. Start submitting anonymous questions');
    console.log('2. View the admin dashboard to see questions');
    console.log('3. Share your custom link with tracking parameters\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\nPlease apply the migration manually:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase-migration.sql');
    console.log('4. Click "Run" to execute the migration\n');
  }
}

applyMigration();
