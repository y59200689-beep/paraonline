const { supabase } = require('../src/lib/supabase');

async function main() {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  console.log("Settings data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

main().catch(console.error);
