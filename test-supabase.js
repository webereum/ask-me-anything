const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
const supabaseUrl = 'https://zldkcbttriyjphibgqnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZGtjYnR0cml5anBoaWJncW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTE3MTcsImV4cCI6MjA3NjQ2NzcxN30.k87XCFGI3KnFBeGFPK_erOQVWDP99aqcKxo82lUPXhU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('creator_profiles')
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('Creator profiles count:', data);
    
    // Test insert operation
    console.log('\nTesting insert operation...');
    const testProfile = {
      user_id: 'test_user_123',
      display_name: 'Test User',
      bio: 'This is a test profile',
      custom_slug: 'test-user-123',
      profile_image_url: null,
      created_at: new Date().toISOString(),
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('creator_profiles')
      .insert([testProfile])
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('✅ Insert successful!');
      console.log('Inserted data:', insertData);
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('creator_profiles')
        .delete()
        .eq('user_id', 'test_user_123');
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();