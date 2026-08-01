import { supabaseAdmin as supabase } from '@/lib/supabase';

const DEFAULT_URL = 'https://paraoficinal.ruijieddnsa.com/WebServiceAtlasCom/atlascomservice.asmx';
const RETRY_DELAY_MS = 5 * 60 * 1000;

type OrderRecord = {
  order_id: string; customer_name: string; phone_number: string; address: string; city: string;
  notes?: string | null; total: number; created_at?: string | null;
  items: Array<{ id: number; title: string; quantity: number; price: number; sku?: string | null }>;
};

const xml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const money = (value: unknown) => Number.isFinite(Number(value)) ? Number(value).toFixed(2) : '0.00';
const tag = (source: string, name: string) => source.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1]?.trim() || '';

export function atlascomOrderCode(orderId: string) {
  const numericCode = String(orderId).replace(/\D/g, '');
  if (!numericCode) throw new Error(`La référence de commande « ${orderId} » ne contient aucun chiffre.`);
  return numericCode;
}

function config() {
  return {
    enabled: process.env.ATLASCOM_ORDER_EXPORT_ENABLED === 'true',
    url: process.env.ATLASCOM_WSDL_URL || DEFAULT_URL,
    employee: process.env.ATLASCOM_EMPLOYEE_CODE || '', password: process.env.ATLASCOM_PASSWORD || '',
    agency: process.env.ATLASCOM_AGENCY_CODE || '000052', commercial: process.env.ATLASCOM_COMMERCIAL_CODE || '000052',
    customer: process.env.ATLASCOM_WEB_CUSTOMER_CODE || '6666',
    tier: process.env.ATLASCOM_TIER_CODE || '',
    taxRate: Math.max(0, Number(process.env.ATLASCOM_TAX_RATE || 0)),
  };
}

async function note(orderId: string, body: string) {
  await supabase.from('order_notes').insert({ order_id: orderId, body, kind: 'atlascom' });
}

async function updateJob(orderId: string, values: Record<string, unknown>) {
  const { error } = await supabase.from('atlascom_order_exports').update({ ...values, updated_at: new Date().toISOString() }).eq('order_id', orderId);
  if (error) throw new Error(error.message);
}

export async function queueAtlascomOrderExport(orderId: string) {
  const { data: existing, error: lookupError } = await supabase.from('atlascom_order_exports').select('order_id, status').eq('order_id', orderId).maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing) return { queued: false, status: existing.status as string };
  const { error } = await supabase.from('atlascom_order_exports').insert({ order_id: orderId, status: 'queued' });
  if (error) throw new Error(error.message);
  return { queued: true, status: 'queued' };
}

async function authenticate(current: ReturnType<typeof config>) {
  const response = await fetch(current.url, {
    method: 'POST', headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: 'http://tempuri.org/generateTOKEN' },
    body: `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><generateTOKEN xmlns="http://tempuri.org/"><utilisateur>${xml(current.employee)}</utilisateur><motDePasse>${xml(current.password)}</motDePasse></generateTOKEN></soap:Body></soap:Envelope>`,
  });
  if (!response.ok) throw new Error(`Authentification Atlascom refusée (HTTP ${response.status}).`);
  const token = tag(await response.text(), 'generateTOKENResult');
  if (!token) throw new Error('Atlascom n’a pas retourné de jeton d’authentification.');
  return token;
}

async function resolveItems(order: OrderRecord) {
  const ids = order.items.filter(item => !item.sku).map(item => Number(item.id)).filter(Number.isFinite);
  const skuById = new Map<number, string>();
  if (ids.length) {
    const { data, error } = await supabase.from('products').select('id, sku').in('id', ids);
    if (error) throw new Error(error.message);
    for (const product of data || []) if (product.sku) skuById.set(Number(product.id), String(product.sku));
  }
  return order.items.map(item => ({ ...item, sku: item.sku || skuById.get(Number(item.id)) || '' }));
}

function soapForOrder(order: OrderRecord, items: Awaited<ReturnType<typeof resolveItems>>, token: string) {
  const current = config();
  const missing = items.find(item => !item.sku);
  if (missing) throw new Error(`Le produit « ${missing.title} » n’a pas de référence Atlascom (SKU).`);
  const totalTtc = Number(order.total || 0); const totalHt = current.taxRate ? totalTtc / (1 + current.taxRate / 100) : totalTtc;
  const when = order.created_at ? new Date(order.created_at) : new Date(); const date = Number.isNaN(when.getTime()) ? new Date() : when;
  const orderCode = atlascomOrderCode(order.order_id);
  const syncCode = `${orderCode}${Date.now()}`;
  // Atlascom's server dereferences codeTiers even when the published WSDL marks it optional.
  const tier = `<codeTiers>${xml(current.tier || current.agency)}</codeTiers>`;
  const header = `<Commande><Livreur></Livreur><Annule>false</Annule><Livre>false</Livre><Partiel>false</Partiel><codeCommande>${orderCode}</codeCommande>${tier}<codeClient>${xml(current.customer)}</codeClient><dateC>${date.toLocaleDateString('en-GB')}</dateC><date>${date.toISOString()}</date><codeModeP></codeModeP><dateEchu></dateEchu><totalHt>${money(totalHt)}</totalHt><totalTtc>${money(totalTtc)}</totalTtc><totalTva>${money(totalTtc - totalHt)}</totalTva><observation></observation><remarqueDev></remarqueDev><codedeSynchcronisation>${syncCode}</codedeSynchcronisation><remise>0</remise><mtremise>0</mtremise><codeCommerciale>${xml(current.commercial)}</codeCommerciale></Commande>`;
  const lines = items.map((item, index) => {
    const ttc = Number(item.price || 0); const ht = current.taxRate ? ttc / (1 + current.taxRate / 100) : ttc;
    return `<LigneCommande><Tva>${money(current.taxRate)}</Tva><PlafondRM>0</PlafondRM><QteLivre>0</QteLivre><codeLCommande>${index + 1}</codeLCommande><codeArticle>${xml(item.sku)}</codeArticle><qte>${money(item.quantity)}</qte><prixU>${money(ht)}</prixU><prixTTTC>${money(ttc)}</prixTTTC><codeCommande>${orderCode}</codeCommande><nbrPiece>0</nbrPiece><qteCar>0</qteCar><codedeSynchcronisation>${syncCode}</codedeSynchcronisation><puttc>${money(ttc)}</puttc><ptttc>${money(ttc * item.quantity)}</ptttc><ptht>${money(ht * item.quantity)}</ptht><puht>${money(ht)}</puht><remise>0</remise><qteGratuit>0</qteGratuit><codeTva>0</codeTva><ordre>${index + 1}</ordre><codeUnite>0</codeUnite><libelle>${xml(item.title)}</libelle><TypePrix></TypePrix><typeLigne></typeLigne><codesup></codesup><qteG>0</qteG></LigneCommande>`;
  }).join('');
  return `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><setListeCommandes xmlns="http://tempuri.org/"><codeEmploye>${xml(current.employee)}</codeEmploye><codeAgence>${xml(current.agency)}</codeAgence><listeCommandes>${header}</listeCommandes><listeLigneCommandes>${lines}</listeLigneCommandes><token>${xml(token)}</token><codeLangue>FR</codeLangue></setListeCommandes></soap:Body></soap:Envelope>`;
}

export async function processAtlascomOrderExport(orderId: string) {
  const { data: job, error } = await supabase.from('atlascom_order_exports').select('*').eq('order_id', orderId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!job || job.status === 'sent' || job.status === 'sending') return { status: job?.status || 'missing' };
  const current = config();
  if (!current.enabled || !current.employee || !current.password) {
    const message = !current.enabled ? 'Export Atlascom en attente : activez ATLASCOM_ORDER_EXPORT_ENABLED après validation du paramétrage.' : 'Export Atlascom en attente : les identifiants Atlascom ne sont pas configurés.';
    await updateJob(orderId, { status: 'blocked', last_error: message, next_retry_at: null }); await note(orderId, message); return { status: 'blocked' };
  }
  const attempt = Number(job.attempt_count || 0) + 1;
  await updateJob(orderId, { status: 'sending', attempt_count: attempt, last_error: null });
  let responseSummary = '';
  try {
    const { data: order, error: orderError } = await supabase.from('orders').select('*').eq('order_id', orderId).maybeSingle();
    if (orderError || !order) throw new Error(orderError?.message || 'Commande introuvable.');
    const typedOrder = order as OrderRecord; const items = await resolveItems(typedOrder); const token = await authenticate(current);
    const response = await fetch(current.url, { method: 'POST', headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"http://tempuri.org/setListeCommandes"' }, body: soapForOrder(typedOrder, items, token) });
    const responseXml = await response.text();
    const fault = tag(responseXml, 'faultstring') || tag(responseXml, 'Text');
    if (fault) throw new Error(`Atlascom a refusé la commande : ${fault}`);
    if (!response.ok) throw new Error(`Envoi Atlascom refusé (HTTP ${response.status}).`);
    const remoteOrderId = tag(responseXml, 'setListeCommandesResult');
    responseSummary = remoteOrderId || (responseXml.includes('setListeCommandesResult') ? 'Résultat Atlascom vide (HTTP 200).' : 'Réponse Atlascom sans résultat identifiable (HTTP 200).');
    if (!remoteOrderId) throw new Error(`Atlascom n’a retourné aucun identifiant de commande. Vérifiez que le client ${current.customer}, le commercial ${current.commercial} et les références produit existent et sont autorisés dans Atlascom.`);
    await updateJob(orderId, { status: 'sent', remote_order_id: remoteOrderId, response_summary: remoteOrderId.slice(0, 500), last_error: null, next_retry_at: null, sent_at: new Date().toISOString() });
    await note(orderId, `Commande synchronisée avec Atlascom. ID distant : ${remoteOrderId}`); return { status: 'sent', remoteOrderId };
  } catch (caught: any) {
    const message = caught?.message || 'Erreur inconnue lors de l’envoi Atlascom.';
    await updateJob(orderId, { status: 'failed', last_error: message.slice(0, 1000), response_summary: responseSummary || null, next_retry_at: new Date(Date.now() + RETRY_DELAY_MS).toISOString() });
    await note(orderId, `Échec de la synchronisation Atlascom (tentative ${attempt}) : ${message}`); return { status: 'failed', error: message };
  }
}

export async function processDueAtlascomOrderExports() {
  const current = config();
  const statuses = current.enabled && current.employee && current.password
    ? ['queued', 'failed', 'blocked']
    : ['queued', 'failed'];
  const { data, error } = await supabase.from('atlascom_order_exports').select('order_id, status, next_retry_at').in('status', statuses).limit(50);
  if (error) throw new Error(error.message);
  const now = Date.now(); const due = (data || []).filter((job: any) => job.status === 'queued' || job.status === 'blocked' || (job.next_retry_at && new Date(job.next_retry_at).getTime() <= now));
  return Promise.all(due.map((job: any) => processAtlascomOrderExport(job.order_id)));
}
