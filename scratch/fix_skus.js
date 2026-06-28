const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// We want to find each product block. A product block starts with { and contains id: X.
// Let's find all occurrences of "id: " and trace the product block.
let pos = 0;
while (true) {
  const index = content.indexOf('id: ', pos);
  if (index === -1) break;
  
  // Find the start of the object: search backward for '{'
  let startBracket = content.lastIndexOf('{', index);
  if (startBracket === -1) {
    pos = index + 4;
    continue;
  }
  
  // Find the end of the object: search forward for matching '}'
  // Since we know the nesting level, we can count brackets.
  let bracketCount = 1;
  let endBracket = -1;
  for (let i = startBracket + 1; i < content.length; i++) {
    if (content[i] === '{') bracketCount++;
    else if (content[i] === '}') {
      bracketCount--;
      if (bracketCount === 0) {
        endBracket = i;
        break;
      }
    }
  }
  
  if (endBracket === -1) {
    pos = index + 4;
    continue;
  }
  
  // Extract the product block content
  const block = content.substring(startBracket, endBracket + 1);
  
  // Check if it already has sku
  if (block.includes('sku:')) {
    pos = endBracket + 1;
    continue;
  }
  
  // Parse fields using regex on the block
  const idMatch = block.match(/id:\s*(\d+)/);
  const priceMatch = block.match(/price:\s*([\d.]+)/);
  const vendorMatch = block.match(/vendor:\s*"([^"]+)"/);
  
  if (idMatch && priceMatch && vendorMatch) {
    const id = parseInt(idMatch[1]);
    const price = parseFloat(priceMatch[1]);
    const vendor = vendorMatch[1];
    
    const formattedVendor = vendor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const padId = String(id).padStart(3, '0');
    const sku = `SKU-${formattedVendor}-${padId}`;
    const buyingCost = Math.round(price * 0.6);
    
    // Inject before the closing '}'
    const insertPos = block.lastIndexOf('}');
    const before = block.substring(0, insertPos).trim();
    let newBlock = before;
    if (!before.endsWith(',')) {
      newBlock += ',';
    }
    newBlock += `\n        sku: "${sku}",\n        buyingCost: ${buyingCost}\n    }`;
    
    // Replace in main content
    content = content.substring(0, startBracket) + newBlock + content.substring(endBracket + 1);
    // Move pos past the new block end
    pos = startBracket + newBlock.length;
  } else {
    pos = endBracket + 1;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Cleaned and injected SKUs for all products.");
