const crypto = require('crypto');

// Get arguments from CLI
const args = process.argv.slice(2);
const username = args[0] || 'admin';
const password = args[1];
const name = args[2] || 'Administrator';
const role = args[3] || 'owner'; // default to owner role

if (!password) {
  console.log('\x1b[33m%s\x1b[0m', '=====================================================================');
  console.log('\x1b[36m%s\x1b[0m', '      Para Officinal S.A — Admin Password Hashing CLI Tool');
  console.log('\x1b[33m%s\x1b[0m', '=====================================================================');
  console.log('Usage:');
  console.log('  node scripts/generate-admin-hash.js <username> <password> ["Full Name"] [role]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/generate-admin-hash.js admin SuperSecretPassword123');
  console.log('  node scripts/generate-admin-hash.js support SupportPass "John Doe" support');
  console.log('\x1b[33m%s\x1b[0m', '=====================================================================');
  process.exit(0);
}

// Scrypt configuration matching src/lib/session.ts
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

async function generateHash(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(plainPassword, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

generateHash(password)
  .then(hashedPassword => {
    console.log('\n\x1b[32m%s\x1b[0m', '✓ Password successfully hashed using secure scrypt algorithm!');
    console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------------------------');
    console.log(`Username : ${username}`);
    console.log(`Role     : ${role}`);
    console.log(`Full Name: ${name}`);
    console.log(`Hash     : ${hashedPassword}`);
    console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------------------------');
    console.log('\nCopy-paste this SQL statement to insert this operator into your database:');
    console.log('\x1b[35m%s\x1b[0m', '=============================================================');
    console.log(`INSERT INTO operators (username, password, role, name, is_active, created_at) \nVALUES ('${username}', '${hashedPassword}', '${role}', '${name}', true, NOW());`);
    console.log('\x1b[35m%s\x1b[0m', '=============================================================');
    console.log('');
  })
  .catch(err => {
    console.error('Error generating secure hash:', err);
  });
