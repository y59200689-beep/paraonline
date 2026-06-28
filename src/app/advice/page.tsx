import { supabaseAdmin as supabase } from '@/lib/supabase';
import AdviceClient from './AdviceClient';

export const revalidate = 3600; // 1 hour

export default async function AdvicePage() {
  let articles: any[] = [];
  try {
    const { data, error } = await supabase
      .from('advice_articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      articles = data;
    }
  } catch (err) {
    console.error("Error loading advice articles on server:", err);
  }

  return <AdviceClient initialArticles={articles} />;
}
