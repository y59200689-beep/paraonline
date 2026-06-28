const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  let browser;
  try {
    console.log('Launching Chrome in non-headless mode...');
    browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to http://localhost:3000 (Storefront)...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Inject custom scroll CSS to ensure smooth scrolling
    await page.addStyleTag({ content: 'html { scroll-behavior: smooth !important; }' });

    console.log('Successfully loaded homepage. Starting slow human-like scroll...');
    
    const outDir = '/Users/youssefmahir/.gemini/antigravity-ide/brain/24ac1495-ddb3-45eb-aeca-020961a1f63a';
    
    // Human scroll helper
    const humanScroll = async (targetY) => {
      await page.evaluate(async (target) => {
        await new Promise((resolve) => {
          let currentY = window.scrollY;
          const step = 8; // small increments for smooth scrolling
          const interval = setInterval(() => {
            const diff = target - currentY;
            if (Math.abs(diff) <= step) {
              window.scrollTo(0, target);
              clearInterval(interval);
              resolve();
            } else {
              currentY += diff > 0 ? step : -step;
              window.scrollTo(0, currentY);
            }
          }, 15); // 15ms interval
        });
      }, targetY);
    };

    // Get page metrics
    const metrics = await page.evaluate(() => {
      return {
        height: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight
      };
    });
    
    console.log(`Page height is ${metrics.height}px. Moving in deliberate increments to capture sections.`);

    // Deliberate sections to stop and view like a human
    // 1. Hero / Header: y = 0
    // 2. Bundles / Special Offers: y = 700
    // 3. Category / Products Grid: y = 1400
    // 4. Diagnostic Card: y = 2300
    // 5. Scratch Card: y = 3200
    // 6. Ingredients / Composition: y = 4100
    // 7. Testimonials / Reviews: y = 5000
    // 8. FAQ & Footer: end of page

    const scrollSteps = [
      { name: 'hero_section', target: 0, waitTime: 4000 },
      { name: 'special_bundles', target: 750, waitTime: 4000 },
      { name: 'products_grid', target: 1550, waitTime: 4500 },
      { name: 'skin_diagnostic', target: 2350, waitTime: 4500 },
      { name: 'scratch_card', target: 3100, waitTime: 4000 },
      { name: 'skincare_routine_composition', target: 3950, waitTime: 4500 },
      { name: 'reviews_faq', target: 4800, waitTime: 4000 },
      { name: 'footer', target: metrics.height - metrics.viewportHeight, waitTime: 4000 }
    ];

    for (let i = 0; i < scrollSteps.length; i++) {
      const step = scrollSteps[i];
      const targetY = Math.min(step.target, metrics.height - metrics.viewportHeight);
      console.log(`Scrolling to ${step.name} (y=${targetY}px) like a human...`);
      
      await humanScroll(targetY);
      
      console.log(`Arrived at ${step.name}. Pausing for ${step.waitTime}ms to read page content...`);
      await new Promise(r => setTimeout(r, step.waitTime));
      
      const screenshotFilename = `media__screenshot_slow_${i}_${step.name}.png`;
      const screenshotPath = path.join(outDir, screenshotFilename);
      await page.screenshot({ path: screenshotPath });
      console.log(`Took screenshot: ${screenshotFilename}`);
    }

    console.log('Scrolling back up to the top slowly...');
    await humanScroll(0);
    await new Promise(r => setTimeout(r, 2000));

    console.log('Audit run finished. Closing browser.');
  } catch (err) {
    console.error('Audit scroll failed:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
