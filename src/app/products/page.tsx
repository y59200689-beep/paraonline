import { Product } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import ProductsClient from './ProductsClient';

export const revalidate = 3600; // 1 hour

function rowToProduct(item: any): Product {
  return {
    id: item.id as number,
    title: item.title as string,
    name: (item.name as string) || undefined,
    nameFr: (item.name_fr as string) || undefined,
    vendor: item.vendor as string,
    image: item.image as string,
    images: (item.images as string[]) || [],
    price: Number(item.price),
    comparePrice: Number(item.compare_price || item.price),
    category: item.category as string,
    tags: (item.tags as string[]) || [],
    rating: Number(item.rating || 5),
    reviews: Number(item.reviews || 0),
    description: (item.description as string) || '',
    ingredients: (item.ingredients as string) || '',
    usage: (item.usage as string) || '',
    stock: item.stock != null ? Number(item.stock) : 100,
    sku: (item.sku as string) || undefined,
    buyingCost: item.buying_cost != null ? Number(item.buying_cost) : undefined,
    points: item.points != null ? Number(item.points) : 0,
  };
}

export default async function ProductsPage() {
  let products: Product[] = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'live')
      .order('id', { ascending: true })
      .limit(500);
    
    if (!error && data) {
      products = data.map(rowToProduct);
    }
  } catch (err) {
    console.error("Error loading products on server:", err);
  }
  
  return <ProductsClient initialProducts={products} />;
}
