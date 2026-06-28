const http = require('http');

const URL = 'http://localhost:3000/api/cron/snippets';
const INTERVAL_MS = 60 * 1000; // 1 minute

console.log('\x1b[36m%s\x1b[0m', '===============================================');
console.log('\x1b[36m%s\x1b[0m', '   Local Cron Runner for Next.js E-Commerce   ');
console.log('\x1b[36m%s\x1b[0m', '===============================================');
console.log(`Target URL: ${URL}`);
console.log(`Interval  : Every 1 minute`);
console.log(`Status    : Running in background... Press Ctrl+C to stop.`);
console.log('\x1b[36m%s\x1b[0m', '-----------------------------------------------');

// Perform the first ping immediately on startup
pingCronEndpoint();

// Start the periodic scheduler
setInterval(pingCronEndpoint, INTERVAL_MS);

function pingCronEndpoint() {
  const timestamp = new Date().toLocaleTimeString('fr-FR');
  console.log(`[${timestamp}] Pinging cron scheduler endpoint...`);

  const req = http.get(URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.success) {
          console.log(
            `\x1b[32m[${timestamp}] Success:\x1b[0m ${parsed.message || 'Cron snippets checked and executed successfully.'}`
          );
        } else {
          console.log(
            `\x1b[31m[${timestamp}] Failure:\x1b[0m ${parsed.error || 'Unknown endpoint error.'}`
          );
        }
      } catch (err) {
        console.log(`\x1b[33m[${timestamp}] Responded with status ${res.statusCode} (Non-JSON payload).\x1b[0m`);
      }
    });
  });

  req.setTimeout(10000, () => {
    req.destroy();
    console.log(`\x1b[31m[${timestamp}] Timeout Error:\x1b[0m Next.js server did not respond within 10 seconds.`);
  });

  req.on('error', (err) => {
    console.log(
      `\x1b[31m[${timestamp}] Connection Error:\x1b[0m Is your Next.js development server running on http://localhost:3000? (${err.message})`
    );
  });
}
