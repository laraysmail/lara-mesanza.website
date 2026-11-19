// Turns an export of the Notion "🛒 Product list" database into src/data/products.json.
//
// Usage: node scripts/notion-to-products.mjs <rows.json> [more-rows.json ...]
//
// Each input file is the JSON returned by the Notion MCP SQL query (an object with a
// "results" array, or a bare array of rows) with at least these columns:
//   url, Name, Store, Price, Photo, "Affiliate link", "Show on website", Destacado,
//   "Top producto", "Etiqueta destacado", Espacio, "Subcategoría", createdTime
//
// Own digital products (type "propio") are kept exactly as they are in products.json;
// every affiliate product is rebuilt from Notion. Only rows ticked "Show on website" are used.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'src/data/products.json');

const STORE_NAMES = {
  ikea: 'IKEA', 'bricot depot': 'Brico Dépôt', electrodepot: 'Electro Depot', nazza: 'Nazza',
  Aliexpress: 'AliExpress', ebay: 'eBay', Nordkapp: 'NordKapp',
};
const ESPACIO = { 'Furgoneta Camper': 'camper', Piso: 'piso', Viaje: 'viaje' };

// Optional: --broken <file.json> = output of scripts/check-products.mjs; its broken links are left out too.
const args = process.argv.slice(2);
const brokenIdx = args.indexOf('--broken');
const brokenUrls = new Set();
if (brokenIdx !== -1) {
  const report = JSON.parse(fs.readFileSync(args[brokenIdx + 1], 'utf8'));
  for (const b of report.broken ?? []) brokenUrls.add(b.url);
  args.splice(brokenIdx, 2);
}
const files = args;
if (!files.length) {
  console.error('Usage: node scripts/notion-to-products.mjs <rows.json> [...] [--broken report.json]');
  process.exit(1);
}

const list = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v); } catch { return []; }
};
const yes = (v) => v === true || v === '__YES__';
const clean = (v) => (typeof v === 'string' ? v.trim() : v) || null;
const slug = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Read and de-duplicate rows (by Notion page url) across all input files.
const rows = new Map();
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of Array.isArray(data) ? data : data.results ?? []) rows.set(r.url ?? r.Name, r);
}

const problems = [];
const seen = new Set();
const affiliate = [...rows.values()]
  .filter((r) => yes(r['Show on website']))
  .sort((a, b) => String(a.Name).localeCompare(String(b.Name), 'es', { sensitivity: 'base' }))
  .flatMap((r) => {
    const name = clean(r.Name);
    const link = clean(r['Affiliate link']);
    const espacios = list(r.Espacio).map((e) => ESPACIO[e]).filter(Boolean);
    const subcategorias = list(r['Subcategoría']);
    // Anything incomplete stays off the website and is reported so it can be fixed in Notion.
    const issues = [];
    if (!name) issues.push('sin nombre');
    if (!link || !/^https?:\/\//.test(link)) issues.push('sin link válido');
    else if (brokenUrls.has(r.url)) issues.push('link roto');
    if (!clean(r.Photo) || !/^https?:\/\//.test(clean(r.Photo))) issues.push('sin foto');
    if (!espacios.length) issues.push('sin Espacio');
    if (!subcategorias.length) issues.push('sin Subcategoría');
    if (issues.length) { problems.push({ url: r.url, name: name ?? '(sin nombre)', issues }); return []; }

    const rawStore = clean(r.Store) ?? (/hitway/i.test(name) ? 'Hitway' : 'Otro');
    let id = slug(name);
    if (seen.has(id)) id = `${id}-${String(r.url ?? '').slice(-32, -28)}`;
    seen.add(id);

    return [{
      id,
      type: 'afiliado',
      source: STORE_NAMES[rawStore] ?? rawStore,
      name,
      price: clean(r.Price),
      espacios,
      subcategorias,
      categories: espacios,
      url: link,
      image: clean(r.Photo),
      destacado: yes(r.Destacado),
      top: yes(r['Top producto']),
      etiqueta: clean(r['Etiqueta destacado']),
      added: String(r.createdTime ?? '').slice(0, 10) || null,
    }];
  });

const current = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const own = current.filter((p) => p.type === 'propio');
const before = new Map(current.filter((p) => p.type === 'afiliado').map((p) => [p.id, p]));
const after = new Map(affiliate.map((p) => [p.id, p]));

fs.writeFileSync(OUT, JSON.stringify([...own, ...affiliate], null, 2) + '\n');

const added = [...after.keys()].filter((k) => !before.has(k)).map((k) => after.get(k).name);
const removed = [...before.keys()].filter((k) => !after.has(k)).map((k) => before.get(k).name);
const changed = [...after.keys()].filter((k) => before.has(k) && JSON.stringify(before.get(k)) !== JSON.stringify(after.get(k))).map((k) => after.get(k).name);

console.log(JSON.stringify({ total: affiliate.length, added, removed, changed, problems }, null, 2));
