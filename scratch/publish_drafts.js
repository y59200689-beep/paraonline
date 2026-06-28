const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../supabase-mock-db.json');

try {
  if (!fs.existsSync(dbPath)) {
    console.error(`Mock database file not found at: ${dbPath}`);
    process.exit(1);
  }

  const dbContent = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(dbContent);
  
  if (db.products && Array.isArray(db.products)) {
    let count = 0;
    db.products.forEach(p => {
      if (p.status === 'draft') {
        p.status = 'live';
        count++;
      }
    });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Successfully published ${count} products.`);
  } else {
    console.log('No products array found in mock database.');
  }
} catch (err) {
  console.error('Error modifying DB:', err);
  process.exit(1);
}
