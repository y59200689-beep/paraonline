import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

async function getStoreSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (!error && data) {
    return data.value;
  }
  return {};
}

export async function GET() {
  try {
    const settings = await getStoreSettings();
    const partner = settings.courierPartner || 'yalidine';
    const apiId = settings.yalidineApiId;
    const apiKey = settings.yalidineApiKey;

    // If Yalidine API is configured and active, fetch from Yalidine's endpoints
    if (partner === 'yalidine' && apiId && apiKey && !apiKey.includes('placeholder') && apiKey.trim() !== '') {
      try {
        // Fetch Wilayas (provinces)
        const wilayasRes = await fetch('https://api.yalidine.com/v1/wilayas', {
          headers: {
            'X-API-ID': apiId,
            'X-API-KEY': apiKey,
          },
        });
        
        // Fetch Communes (districts)
        const communesRes = await fetch('https://api.yalidine.com/v1/communes?limit=1000', {
          headers: {
            'X-API-ID': apiId,
            'X-API-KEY': apiKey,
          },
        });

        if (wilayasRes.ok && communesRes.ok) {
          const wilayasData = await wilayasRes.json();
          const communesData = await communesRes.json();

          const wilayas = (wilayasData.data || []).map((w: any) => ({
            id: String(w.id),
            name: String(w.name)
          }));
          const communes = (communesData.data || []).map((c: any) => ({
            id: String(c.id),
            wilaya_id: String(c.wilaya_id),
            name: String(c.name)
          }));

          return NextResponse.json({
            success: true,
            source: 'yalidine-api',
            wilayas,
            communes,
          });
        }
      } catch (err) {
        console.error('Failed to retrieve shipping zones from Yalidine production API:', err);
      }
    }

    // Fallback static list of Moroccan regions/cities for simulation/Cathedis/unconfigured settings
    const fallbackWilayas = [
      { id: '1', name: 'Casablanca-Settat' },
      { id: '2', name: 'Rabat-Salé-Kénitra' },
      { id: '3', name: 'Marrakech-Safi' },
      { id: '4', name: 'Fès-Meknès' },
      { id: '5', name: 'Tanger-Tétouan-Al Hoceïma' },
      { id: '6', name: 'Souss-Massa' }
    ];

    const fallbackCommunes = [
      { id: '101', wilaya_id: '1', name: 'Casablanca' },
      { id: '102', wilaya_id: '1', name: 'Mohammedia' },
      { id: '103', wilaya_id: '1', name: 'Berrechid' },
      { id: '201', wilaya_id: '2', name: 'Rabat' },
      { id: '202', wilaya_id: '2', name: 'Salé' },
      { id: '203', wilaya_id: '2', name: 'Kénitra' },
      { id: '204', wilaya_id: '2', name: 'Témara' },
      { id: '301', wilaya_id: '3', name: 'Marrakech' },
      { id: '302', wilaya_id: '3', name: 'Essaouira' },
      { id: '303', wilaya_id: '3', name: 'Safi' },
      { id: '401', wilaya_id: '4', name: 'Fès' },
      { id: '402', wilaya_id: '4', name: 'Meknès' },
      { id: '501', wilaya_id: '5', name: 'Tanger' },
      { id: '502', wilaya_id: '5', name: 'Tétouan' },
      { id: '503', wilaya_id: '5', name: 'Al Hoceima' },
      { id: '601', wilaya_id: '6', name: 'Agadir' },
      { id: '602', wilaya_id: '6', name: 'Tiznit' }
    ];

    return NextResponse.json({
      success: true,
      source: 'fallback-static',
      wilayas: fallbackWilayas,
      communes: fallbackCommunes,
    });
  } catch (error: any) {
    console.error('Zones endpoint runtime error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
