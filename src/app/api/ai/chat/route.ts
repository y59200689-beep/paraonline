import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { PRODUCTS_DB } from '@/lib/data';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limit: 30 AI messages per IP per minute to protect API quota
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`ai-chat:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, fallback: true, error: 'Trop de messages. Veuillez patienter une minute.' }, { status: 429 });
    }

    const { messages, language } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'Messages are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json({ success: false, fallback: true, error: 'API key not configured' });
    }

    // 1. Fetch products for RAG context
    let productsList: any[] = [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, name_fr, vendor, price, category, tags, description, ingredients, usage');
      
      if (error || !data || data.length === 0) {
        throw error || new Error('No products in database');
      }

      productsList = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        nameFr: item.name_fr || item.title,
        vendor: item.vendor,
        price: item.price,
        category: item.category,
        tags: item.tags || [],
        description: item.description || '',
        ingredients: item.ingredients || '',
        usage: item.usage || ''
      }));
    } catch (dbError) {
      console.warn("Failed to fetch products from Supabase, falling back to static PRODUCTS_DB:", dbError);
      productsList = PRODUCTS_DB.map(p => ({
        id: p.id,
        title: p.title,
        nameFr: p.nameFr || p.title,
        vendor: p.vendor,
        price: p.price,
        category: p.category,
        tags: p.tags || [],
        description: p.description || '',
        ingredients: p.ingredients || '',
        usage: p.usage || ''
      }));
    }

    // 2. Format the products context for RAG
    const productsContext = productsList.map((p: any) => {
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
    const systemInstruction = `You are the "Pharmacienne Digitale IA" (Digital Pharmacist AI), a clinical dermo-cosmetic consultant for the premium Moroccan e-commerce store "Para Officinal S.A".
Your role is to guide customers, analyze ingredient compatibilities, suggest routines, and recommend products from the catalog.

Here is the current catalog of products available in the shop:
${productsContext}

GUIDELINES:
1. ALWAYS respond with a JSON object. You MUST translate or compose the response in BOTH French (textFr) and Arabic (textAr).
2. For textFr and textAr, be professional, warm, empathetic, and clinically precise. Write in clean, modern French and professional Moroccan/Modern Standard Arabic.
3. If the user's question relates to active ingredients, routine guides, or clinical advice, you can structure your response with a recommendation card by setting type to "card".
4. If type is "card", populate the "cardData" object with:
   - "titleFr": Title in French (e.g. "Ordonnance Clinique Recommandée" or "Mise en Garde Clinique")
   - "titleAr": Title in Arabic (e.g. "الوصفة العلاجية الموصى بها" or "تحذير سريري هام")
   - "tagFr": A short tag like "Conseil de Pharmacienne" or "Expertise Peau Grasse"
   - "tagAr": Tag in Arabic (e.g., "نصيحة الصيدلية" or "خبرة البشرة الدهنية")
   - "status": One of "success" (for routine recommendation, compatible pairing), "warning" (for incompatible pairing, safety alert), "info" (for shipping, usage tips)
   - "pointsFr": Array of 3 to 4 bullet points in French detailing the steps, rules, or recommendations. Keep them concise.
   - "pointsAr": Array of 3 to 4 bullet points in Arabic matching the French points.
5. Incompatibilities to flag:
   - Vitamin C + Retinol: Don't use at the same time. Suggest Vitamin C in the morning and Retinol at night.
   - AHA/BHA + Retinol: Don't use at the same time to avoid skin barrier damage.
   - Always recommend wearing SPF sunscreen (like Eucerin Oil Control or Garnier Super UV) when using active ingredients.
6. Address shipping questions:
   - Casablanca / Rabat: 24h delivery.
   - Other cities: 48h to 72h.
   - Free shipping for orders >= 600 DH, else 29 DH (or 35 DH).
7. If the user asks about products, recommend actual products from the catalog provided above, including their titles and prices. Do not invent products.
8. If the user expresses interest in buying or ordering a product (e.g. "Je veux commander", "Je souhaite acheter le produit X"), detect the product from the catalog.
   - Set "type" to "order_collect".
   - Under "orderData", populate "items" with the identified product ID and quantity (default 1).
   - If any delivery details (customerName, phone, address, city) are found in the conversation history, populate those fields in "orderData".
   - If ALL delivery details (Name, Phone, Address, City) are successfully gathered, set "type" to "order_confirm".
   - Ask the user to confirm their order or fill out the missing details.

JSON Output Schema:
{
  "textFr": "French text response...",
  "textAr": "Arabic text response...",
  "type": "text" | "card" | "order_collect" | "order_confirm",
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

    // 4. Format conversation history for Gemini
    const contents = [];
    
    // Convert past messages to Gemini roles
    for (const msg of messages) {
      const role = msg.sender === 'user' ? 'user' : 'model';
      // Use textFr or textAr (for user messages they are identical)
      const text = msg.textFr || msg.textAr || '';
      if (text) {
        contents.push({
          role,
          parts: [{ text }]
        });
      }
    }

    // Call Gemini API using native fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
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
              required: ['textFr', 'textAr']
            }
          }
        })
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
    return NextResponse.json({ success: true, message: result });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
