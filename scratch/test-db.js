const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.replace(/^"|"\s*$/g, '');
    }
    env[key] = value;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Supabase URL or Key not found in .env.local');
  process.exit(1);
}

async function test() {
  try {
    const res = await fetch(`${url}/rest/v1/operators?select=*&limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('REST API error:', res.status, txt);
      return;
    }
    const data = await res.json();
    console.log('Operator columns/data:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
