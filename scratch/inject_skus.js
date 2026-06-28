const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Update Product interface
const interfaceTarget = `export interface Product {
  id: number;
  title: string;
  name?: string;
  nameFr?: string;
  vendor: string;
  image: string;
  images: string[];
  price: number;
  comparePrice: number;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  description: string;
  ingredients: string;
  usage: string;
  stock?: number;
  points?: number;
  variants?: ProductVariant[];
  // SEO fields`;

const interfaceReplacement = `export interface Product {
  id: number;
  title: string;
  name?: string;
  nameFr?: string;
  vendor: string;
  image: string;
  images: string[];
  price: number;
  comparePrice: number;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  description: string;
  ingredients: string;
  usage: string;
  stock?: number;
  points?: number;
  variants?: ProductVariant[];
  sku?: string;
  buyingCost?: number;
  // SEO fields`;

content = content.replace(interfaceTarget, interfaceReplacement);

// Regex to capture product blocks inside PRODUCTS_DB
const productBlockRegex = /(\{\s*id:\s*(\d+),[\s\S]*?price:\s*([\d.]+),[\s\S]*?vendor:\s*"([^"]+)",[\s\S]*?usage:\s*"([\s\S]*?)"\s*\})/g;

let matchCount = 0;
const updatedContent = content.replace(productBlockRegex, (match, block, idStr, priceStr, vendorStr, usageStr) => {
  const id = parseInt(idStr);
  const price = parseFloat(priceStr);
  
  // Format vendor for SKU: remove spaces, special characters, uppercase
  const formattedVendor = vendorStr.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const padId = String(id).padStart(3, '0');
  const sku = `SKU-${formattedVendor}-${padId}`;
  
  // buying cost is roughly 60% of the retail price
  const buyingCost = Math.round(price * 0.6);
  
  // If it already has sku, return match
  if (match.includes('sku:')) {
    return match;
  }
  
  matchCount++;
  // We insert sku and buyingCost before the closing brace
  const lastIndex = match.lastIndexOf('}');
  const beforeBrace = match.substring(0, lastIndex);
  
  // Check if we need a comma after usage
  const lines = beforeBrace.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  let newBlock = beforeBrace;
  if (!lastLine.trim().endsWith(',')) {
    newBlock += ',';
  }
  
  newBlock += `\n        sku: "${sku}",\n        buyingCost: ${buyingCost}\n    }`;
  return newBlock;
});

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log(`Injected SKU and buyingCost into ${matchCount} products in data.ts`);
