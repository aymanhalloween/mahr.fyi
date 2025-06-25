const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeqvkvmywbvuthtssrfy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcXZrdm15d2J2dXRodHNzcmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjg3OTIsImV4cCI6MjA2NTEwNDc5Mn0.32O-K-TLTzbHqHzSbI8nzG7HNYw2CSx4VjwdVWbVJmc';

const client = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('Checking submissions table...');
    
    const { data, error, count } = await client
      .from('submissions')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`\nTotal submissions: ${count}`);
    
    if (data && data.length > 0) {
      console.log('\nSample data:');
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
      
      // Check date range
      const dates = data.map(d => new Date(d.created_at)).sort();
      console.log(`\nDate range: ${dates[0].toISOString()} to ${dates[dates.length-1].toISOString()}`);
    } else {
      console.log('\nNo data found in submissions table');
    }
    
  } catch (e) {
    console.error('Connection error:', e.message);
  }
}

checkDatabase(); 