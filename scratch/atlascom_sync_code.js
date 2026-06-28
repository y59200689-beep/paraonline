console.log('Starting Atlascom catalog synchronization (Force Full Bulk)...');

try {
  const wsdlUrl = 'https://paraoficinal.ruijieddnsa.com/WebServiceAtlasCom/atlascomservice.asmx';
  const codeEmploye = '000051';
  const password = '000051';
  
  // 1. Authenticate to get security token
  console.log('Authenticating with Atlascom...');
  const authResponse = await fetch(wsdlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/generateTOKEN'
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <generateTOKEN xmlns="http://tempuri.org/">
      <utilisateur>${codeEmploye}</utilisateur>
      <motDePasse>${password}</motDePasse>
    </generateTOKEN>
  </soap:Body>
</soap:Envelope>`
  });

  if (!authResponse.ok) {
    throw new Error(`Authentication request failed with status: ${authResponse.status}`);
  }

  const authXml = await authResponse.text();
  const tokenMatch = authXml.match(/<generateTOKENResult>(.*?)<\/generateTOKENResult>/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    throw new Error('Could not retrieve token from Atlascom response.');
  }
  console.log('Authentication successful. Token generated.');

  // 2. Fetch products (Articles) from Atlascom
  console.log('Fetching articles list from Atlascom...');
  const articlesResponse = await fetch(wsdlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/getListeArticles'
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getListeArticles xmlns="http://tempuri.org/">
      <PDateSynch>2024-01-01</PDateSynch>
      <codeAgence>${codeEmploye}</codeAgence>
      <nbrPartition>1</nbrPartition>
      <partition>1</partition>
      <ImageOrArticle>1</ImageOrArticle>
      <token>${token}</token>
    </getListeArticles>
  </soap:Body>
</soap:Envelope>`
  });

  if (!articlesResponse.ok) {
    throw new Error(`Failed to fetch articles with status: ${articlesResponse.status}`);
  }

  const articlesXml = await articlesResponse.text();
  
  // 3. Parse XML response for Articles
  const articleMatches = articlesXml.match(/<Article>([\s\S]*?)<\/Article>/g);
  if (!articleMatches || articleMatches.length === 0) {
    console.log('No articles returned from Atlascom.');
    return;
  }

  console.log(`Found ${articleMatches.length} articles in Atlascom API. Querying existing products...`);
  
  // Fetch all existing products to map them in memory
  const { data: allProducts, error: fetchProductsError } = await supabase
    .from('products')
    .select('*');
    
  if (fetchProductsError) {
    throw new Error(`Failed to retrieve existing products: ${fetchProductsError.message}`);
  }
  
  const productMap = new Map();
  let maxId = 0;
  if (allProducts) {
    for (const p of allProducts) {
      if (p.sku) {
        productMap.set(p.sku.trim().toLowerCase(), p);
      }
      const numId = Number(p.id);
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId;
      }
    }
  }
  
  let nextId = maxId > 0 ? maxId + 1 : 1000;
  
  const itemsToUpsert = [];
  let updateCount = 0;
  let insertCount = 0;
  
  for (const articleXml of articleMatches) {
    const codeMatch = articleXml.match(/<codeArticle>(.*?)<\/codeArticle>/);
    const qteMatch = articleXml.match(/<qteStock>(.*?)<\/qteStock>/);
    const prixMatch = articleXml.match(/<prix>(.*?)<\/prix>/);
    const libelleMatch = articleXml.match(/<(libelle|designation|nom)>(.*?)<\/(?:libelle|designation|nom)>/);
    
    if (codeMatch) {
      const sku = codeMatch[1].trim();
      const skuKey = sku.toLowerCase();
      const stock = qteMatch ? parseInt(qteMatch[1], 10) : 0;
      const price = prixMatch ? parseFloat(prixMatch[1]) : 0;
      const title = libelleMatch ? libelleMatch[2].trim() : `Produit ${sku}`;
      
      const existingProduct = productMap.get(skuKey);
      
      if (existingProduct) {
        let stockChanged = false;
        let priceChanged = false;
        let nameChanged = false;
        const existingTitle = existingProduct.title || existingProduct.name || existingProduct.name_fr || '';
        if (existingTitle && existingTitle !== title) {
          console.log(`[NAME UPDATE] SKU ${sku}: ${existingTitle} -> ${title}`);
          nameChanged = true;
        }
        if (Number(existingProduct.stock) !== Number(stock)) {
          console.log(`[STOCK UPDATE] SKU ${sku} (${existingTitle || ''}): ${existingProduct.stock} -> ${stock}`);
          stockChanged = true;
        }
        if (Number(existingProduct.price) !== Number(price)) {
          console.log(`[PRICE UPDATE] SKU ${sku} (${existingTitle || ''}): ${existingProduct.price} DH -> ${price} DH`);
          priceChanged = true;
        }
        itemsToUpsert.push({
          ...existingProduct,
          title: title,
          name: title,
          name_fr: title,
          stock: stock,
          price: price
        });
        if (stockChanged || priceChanged || nameChanged) {
          updateCount++;
        }
      } else {
        // Insert as draft
        itemsToUpsert.push({
          id: nextId++,
          sku: sku,
          title: title,
          name: title,
          name_fr: title,
          price: price,
          compare_price: price,
          stock: stock,
          vendor: 'Atlascom',
          category: 'visage',
          image: '',
          status: 'draft'
        });
        insertCount++;
      }
    }
  }

  console.log(`Processing bulk synchronization of all ${itemsToUpsert.length} records (Existing: ${updateCount}, New: ${insertCount})...`);

  // Bulk upsert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < itemsToUpsert.length; i += batchSize) {
    const batch = itemsToUpsert.slice(i, i + batchSize);
    console.log(`Upserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(itemsToUpsert.length/batchSize)}...`);
    const { error: upsertError } = await supabase.from('products').upsert(batch);
    if (upsertError) {
      throw new Error(`Bulk upsert failed for batch: ${upsertError.message}`);
    }
  }

  console.log(`Sync complete. Successfully processed all ${itemsToUpsert.length} products.`);

} catch (error) {
  console.error('An error occurred during synchronization:', error.message || error);
}