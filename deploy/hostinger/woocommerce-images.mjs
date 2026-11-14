import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { request as httpRequest } from 'node:http';

const env = parseEnv(readFileSync('/srv/paradivine/shared/app.env', 'utf8'));
if (!env.CRON_SECRET || env.CRON_SECRET.length < 32) throw new Error('Missing CRON_SECRET.');
const result = await new Promise((resolve, reject) => {
  const request = httpRequest('http://127.0.0.1:3000/api/cron/woocommerce-images', {
    headers: { Authorization: `Bearer ${env.CRON_SECRET}` }, signal: AbortSignal.timeout(840_000),
  }, response => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', chunk => { body += chunk; });
    response.on('error', reject);
    response.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (response.statusCode !== 200 || !payload.success) return reject(new Error('WooCommerce image import failed; inspect admin history.'));
        resolve({ success: true, disabled: Boolean(payload.disabled), updated: payload.updated || 0, imagesAdded: payload.imagesAdded || 0 });
      } catch (error) { reject(error); }
    });
  });
  request.on('error', reject);
  request.end();
});
console.log(JSON.stringify(result));
