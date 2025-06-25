const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeqvkvmywbvuthtssrfy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcXZrdm15d2J2dXRodHNzcmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjg3OTIsImV4cCI6MjA2NTEwNDc5Mn0.32O-K-TLTzbHqHzSbI8nzG7HNYw2CSx4VjwdVWbVJmc';

const client = createClient(supabaseUrl, supabaseKey);

const locationMap = {
  // US
  'USA': 'United States',
  'usa': 'United States',
  'Dallas Texas': 'United States',
  'dallas texas': 'United States',
  'florida': 'United States',
  'Texas': 'United States',
  'dallas': 'United States',
  // UK
  'UK': 'United Kingdom',
  'uk': 'United Kingdom',
  // Pakistan
  'pakistan': 'Pakistan',
  'Pakistan': 'Pakistan',
  // Turkey
  'istanbul': 'Turkey',
  // Russia
  'russia': 'Russia',
  // Qatar
  'Qatar': 'Qatar',
  // Belize
  'Belize': 'Belize',
  // UAE
  'UAE': 'United Arab Emirates',
  'uae': 'United Arab Emirates',
};

async function cleanLocations() {
  try {
    const { data, error } = await client
      .from('submissions')
      .select('id, location');
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    let updated = 0;
    for (const row of data) {
      const original = row.location;
      let normalized = locationMap[original];
      if (!normalized && original) {
        // Try case-insensitive match
        normalized = locationMap[original.toLowerCase()];
      }
      if (!normalized && original) {
        // If not in map, assume it's already a country name and capitalize properly
        normalized = original
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
      if (normalized && normalized !== original) {
        const { error: updateError } = await client
          .from('submissions')
          .update({ location: normalized })
          .eq('id', row.id);
        if (updateError) {
          console.error(`Failed to update ${original} (id: ${row.id}):`, updateError);
        } else {
          console.log(`Updated '${original}' → '${normalized}' (id: ${row.id})`);
          updated++;
        }
      }
    }
    console.log(`\nTotal records updated: ${updated}`);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

cleanLocations(); 