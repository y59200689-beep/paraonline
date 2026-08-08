import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { PRODUCTS_DB } from '@/lib/data';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_CATALOG_PRODUCTS = 300;

type ChatMessage = {
  sender?: unknown;
  textFr?: unknown;
  textAr?: unknown;
};

function normalizeMessages(messages: unknown): Array<{ role: 'user' | 'model'; text: string }> {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return [];

  const normalized = messages.map((message: ChatMessage) => {
    const rawText = typeof message.textFr === 'string'
      ? message.textFr
      : typeof message.textAr === 'string'
        ? message.textAr
        : '';
    return {
      role: message.sender === 'user' ? 'user' as const : 'model' as const,
      text: rawText.trim(),
    };
  }).filter((message) => message.text.length > 0 && message.text.length <= MAX_MESSAGE_LENGTH);

  const totalLength = normalized.reduce((total, message) => total + message.text.length, 0);
  return totalLength <= MAX_MESSAGES * MAX_MESSAGE_LENGTH ? normalized : [];
}

export async function POST(request: Request) {
  try {
    // Rate limit: 30 AI messages per IP per minute to protect API quota
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`ai-chat:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, fallback: true, error: 'Trop de messages. Veuillez patienter une minute.' }, { status: 429 });
    }

    const { messages } = await request.json();
    const contents = normalizeMessages(messages);

    if (contents.length === 0) {
      return NextResponse.json({ success: false, error: 'Messages invalides ou trop volumineux.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json({ success: false, fallback: true, error: 'API key not configured' });
    }

    // 0. Fetch brand restriction config from cms_chat_config
    let allowedBrands: string[] = [];
    let isBrandFilterEnabled = false;
    try {
      const { data: chatConfig } = await supabase
        .from('cms_chat_config')
        .select('business_facts')
        .eq('id', 1)
        .maybeSingle();

      if (chatConfig) {
        const rawFacts = Array.isArray(chatConfig.business_facts) ? chatConfig.business_facts : [];
        const brandConfigItem = rawFacts.find((item: any) => item && item.type === 'allowed_brands_config');
        allowedBrands = Array.isArray(brandConfigItem?.allowed_brands) ? brandConfigItem.allowed_brands : [];
        isBrandFilterEnabled = Boolean(brandConfigItem?.allowed_brands_enabled) && allowedBrands.length > 0;
      }
    } catch (configError) {
      console.warn("Failed to fetch brand filter config:", configError);
    }

    // Normalize allowed brands list for case-insensitive matching
    const normalizedAllowedBrands = allowedBrands.map(b => b.trim().toLowerCase());

    // 1. Fetch products for RAG context
    let productsList: any[] = [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, name_fr, vendor, price, category, tags, description, ingredients, usage, image')
        .eq('status', 'live')
        .limit(1000);
      
      if (error || !data || data.length === 0) {
        throw error || new Error('No products in database');
      }

      productsList = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        nameFr: item.name_fr || item.title,
        vendor: item.vendor || '',
        price: item.price,
        category: item.category || '',
        tags: item.tags || [],
        description: item.description || '',
        ingredients: item.ingredients || '',
        usage: item.usage || '',
        image: item.image || ''
      }));
    } catch (dbError) {
      console.warn("Failed to fetch products from Supabase, falling back to static PRODUCTS_DB:", dbError);
      productsList = PRODUCTS_DB.map(p => ({
        id: p.id,
        title: p.title,
        nameFr: p.nameFr || p.title,
        vendor: p.vendor || '',
        price: p.price,
        category: p.category || '',
        tags: p.tags || [],
        description: p.description || '',
        ingredients: p.ingredients || '',
        usage: p.usage || '',
        image: p.image || ''
      }));
    }

    // Filter products if brand restriction is enabled (matching vendor, title, or nameFr)
    if (isBrandFilterEnabled) {
      productsList = productsList.filter(p => {
        const vendorLower = (p.vendor || '').trim().toLowerCase();
        const titleLower = (p.title || '').trim().toLowerCase();
        const nameFrLower = (p.nameFr || '').trim().toLowerCase();
        const combined = `${vendorLower} ${titleLower} ${nameFrLower}`;
        return normalizedAllowedBrands.some(allowed => combined.includes(allowed));
      });
    }

    // Relevance scoring against user's latest query
    const lastUserMsg = contents.filter(m => m.role === 'user').pop()?.text || '';
    const userKeywords = lastUserMsg
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (userKeywords.length > 0) {
      productsList.sort((a, b) => {
        const textA = `${a.title} ${a.nameFr} ${a.vendor} ${a.category} ${a.tags.join(' ')} ${a.description}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const textB = `${b.title} ${b.nameFr} ${b.vendor} ${b.category} ${b.tags.join(' ')} ${b.description}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        const scoreA = userKeywords.reduce((score, word) => score + (textA.includes(word) ? 1 : 0), 0);
        const scoreB = userKeywords.reduce((score, word) => score + (textB.includes(word) ? 1 : 0), 0);
        return scoreB - scoreA;
      });
    }

    // Limit RAG context to top 80 most relevant items to keep prompt concise and sharp
    const ragProducts = productsList.slice(0, 80);

    // 2. Format the products context for RAG
    const productsContext = ragProducts.map((p: any) => {
      return `Product ID: ${p.id}
Title: ${p.title}
Name (FR): ${p.nameFr}
Brand: ${p.vendor}
Price: ${p.price} DH
Category: ${p.category}
Tags: ${p.tags.join(', ')}
Description: ${p.description}
Ingredients: ${p.ingredients}
Usage: ${p.usage}
---`;
    }).join('\n');

    // 3. Define clinical guidelines and active ingredient compatibilities
    const brandRestrictionNotice = isBrandFilterEnabled
      ? `\nCRITICAL BRAND RESTRICTION:\n- The store admin has STRICTLY restricted product recommendations to the following allowed brands ONLY: ${allowedBrands.join(', ')}.\n- You MUST ONLY recommend and mention products belonging to these allowed brands.\n- Do NOT suggest, mention, or recommend products from any other brand under any circumstances.\n`
      : '';

    const systemInstruction = `You are the "Pharmacienne Digitale IA" (Digital Pharmacist AI), a clinical dermo-cosmetic consultant for the premium Moroccan e-commerce store "Para Officinal S.A".
Your role is to guide customers, analyze ingredient compatibilities, suggest skincare routines, and recommend real products from the catalog below.
${brandRestrictionNotice}
Here is the complete catalog of products available in the shop:
${productsContext}

PRODUCT MATCHING RULES (critical — follow exactly):
- The "Category" field is your primary signal. Use it to match user needs:
  • "solaire" = sunscreen / sun protection products
  • "bébé" = baby products (for babies, infants, children)
  • "acné" = acne treatment products
  • "visage" = face care products
  • "corp" = body care products
  • "cheveux" = hair care products
  • "complement" = food supplements / vitamins
  • "dentaire" = dental / oral care
  • "homme" = men's products
  • "anti tache" = anti-spot / hyperpigmentation
  • "orthopedique" = orthopedic / posture support
  • "secheresse" = dry skin
- When the product title contains "SPF" or "ecran" or "solaire", it is a sunscreen.
- When the user asks for "sunscreen for babies" or "crème solaire bébé" or "واقي شمس للأطفال":
  • FIRST look for products where category contains "bébé" AND (title or tags contain "solaire", "spf", "sun")
  • IF none found, look for products where category is "solaire" AND title/tags contain "bébé", "enfant", "kids", "baby", "doux", "sensitive"
  • IF still none found, pick the 3 gentlest/highest SPF sunscreens from the catalog (SPF 50+, mineral, sensitive-skin friendly)
  • NEVER return an empty products array when products exist in the catalog — always pick the 3 best matches even if not perfect
- When the user asks for any product recommendation, ALWAYS pick the TOP 3 best matching products from the catalog and include them in the "products" array.
- CRITICAL: You MUST ALWAYS populate the "products" array with at least 1-3 items whenever recommending products. An empty products array is NOT acceptable when the catalog contains relevant items.

GUIDELINES:
1. ALWAYS respond with a JSON object. Translate the response in BOTH French (textFr) and Arabic (textAr).
2. Be professional, warm, empathetic, and clinically precise. Write in clean modern French and professional Moroccan Arabic.
3. PRODUCT RECOMMENDATIONS: Whenever a user asks for a product (sunscreen, cream, serum, etc.), ALWAYS:
   - Set "type" to "card"
   - Include a "products" array with exactly the TOP 3 most relevant products from the catalog
   - Each product entry must include: productId, title, price, and a short reason (reasonFr, reasonAr) why it's recommended
   - Only use real products from the catalog above. Never invent product names or IDs.
4. If the user's question is about active ingredient compatibility or skincare routine (not product search), use type "card" with cardData bullet points.
5. cardData fields when used:
   - "titleFr": Title in French
   - "titleAr": Title in Arabic
   - "tagFr": Short tag like "Conseil de Pharmacienne"
   - "tagAr": Tag in Arabic
   - "status": "success" | "warning" | "info"
   - "pointsFr": 3 to 4 bullet points in French
   - "pointsAr": 3 to 4 bullet points in Arabic
6. Incompatibilities to always flag:
   - Vitamin C + Retinol: Not at same time. Vitamin C in morning, Retinol at night.
   - AHA/BHA + Retinol: Not together, risk of skin barrier damage.
   - Recommend SPF daily when using active ingredients.
7. Shipping info:
   - Casablanca / Rabat: 24h delivery.
   - Other cities: 48h to 72h.
   - Free shipping for orders >= 600 DH, otherwise 29 DH.
8. If the user wants to ORDER a product ("Je veux commander", "أريد طلب"):
   - Set "type" to "order_collect"
   - Under "orderData", set "items" with the product ID and quantity 1
   - If ALL details (name, phone, address, city) are known, set "type" to "order_confirm"

JSON Output Schema:
{
  "textFr": "French text response...",
  "textAr": "Arabic text response...",
  "type": "text" | "card" | "order_collect" | "order_confirm",
  "products": [
    { "productId": 123, "title": "...", "price": 99, "reasonFr": "Idéal pour...", "reasonAr": "مثالي لـ..." }
  ],
  "cardData": {
    "titleFr": "...",
    "titleAr": "...",
    "tagFr": "...",
    "tagAr": "...",
    "status": "success" | "warning" | "info",
    "pointsFr": ["...", "..."],
    "pointsAr": ["...", "..."]
  },
  "orderData": {
    "items": [{ "productId": 123, "quantity": 1 }],
    "customerName": "...",
    "phone": "...",
    "address": "...",
    "city": "..."
  }
}`;

    // 4. Format validated, bounded conversation history for Gemini.
    const geminiContents = contents.map(({ role, text }) => ({ role, parts: [{ text }] }));

    // Call Gemini API using native fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                textFr: { type: 'STRING' },
                textAr: { type: 'STRING' },
                type: { type: 'STRING', enum: ['text', 'card', 'order_collect', 'order_confirm'] },
                products: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      productId: { type: 'INTEGER' },
                      title: { type: 'STRING' },
                      price: { type: 'NUMBER' },
                      image: { type: 'STRING' },
                      reasonFr: { type: 'STRING' },
                      reasonAr: { type: 'STRING' }
                    },
                    required: ['productId', 'title', 'price', 'reasonFr', 'reasonAr']
                  }
                },
                cardData: {
                  type: 'OBJECT',
                  properties: {
                    titleFr: { type: 'STRING' },
                    titleAr: { type: 'STRING' },
                    pointsFr: { type: 'ARRAY', items: { type: 'STRING' } },
                    pointsAr: { type: 'ARRAY', items: { type: 'STRING' } },
                    tagFr: { type: 'STRING' },
                    tagAr: { type: 'STRING' },
                    status: { type: 'STRING', enum: ['success', 'warning', 'info'] }
                  },
                  required: ['titleFr', 'titleAr', 'pointsFr', 'pointsAr', 'tagFr', 'tagAr', 'status']
                },
                orderData: {
                  type: 'OBJECT',
                  properties: {
                    items: {
                      type: 'ARRAY',
                      items: {
                        type: 'OBJECT',
                        properties: {
                          productId: { type: 'INTEGER' },
                          quantity: { type: 'INTEGER' }
                        },
                        required: ['productId', 'quantity']
                      }
                    },
                    customerName: { type: 'STRING' },
                    phone: { type: 'STRING' },
                    address: { type: 'STRING' },
                    city: { type: 'STRING' }
                  }
                }
              },
              required: ['textFr', 'textAr', 'type', 'products']
            }
          }
        }),
        signal: AbortSignal.timeout(20_000),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const resData = await response.json();
    const modelText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!modelText) {
      throw new Error('Empty response from Gemini');
    }

    const result = JSON.parse(modelText);

    if (result.products && Array.isArray(result.products)) {
      result.products = result.products.map((pItem: any) => {
        const dbProd = productsList.find((p: any) => p.id === pItem.productId);
        return {
          ...pItem,
          image: dbProd?.image || pItem.image || ''
        };
      });
    }

    return NextResponse.json({ success: true, message: result });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
