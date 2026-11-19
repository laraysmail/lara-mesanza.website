// Checks the affiliate links (and, with --prices, the current price) of every product ticked
// "Show on website" in a Notion "🛒 Product list" export.
//
// Usage: node scripts/check-products.mjs <rows.json> [...] [--prices] > report.json
//
// Output JSON:
//   broken:    [{url, name, link, reason}]   → link is dead (404/410 twice); take it off the website
//   toReview:  [{url, name, link, reason}]   → Amazon said 404 (often a false alarm); leave it on, ask Lara to check
//   unchecked: {store: count}                → the store blocks robots (403/429/captcha); not counted as broken
//   prices:    [{url, name, old, new}]       → only with --prices, only non-Amazon stores, only when the page states a price clearly
//   checked:   [notion urls whose link answered]  (to stamp "Link comprobado")
//   priceChecked: [notion urls whose price was read] (to stamp "Precio comprobado")
//
// Amazon pages are never read for prices (Amazon's affiliate rules forbid it).

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const withPrices = args.includes('--prices');
const files = args.filter((a) => !a.startsWith('--'));

const rows = new Map();
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of Array.isArray(data) ? data : data.results ?? []) rows.set(r.url ?? r.Name, r);
}
const yes = (v) => v === true || v === '__YES__';
const todo = [...rows.values()].filter((r) => yes(r['Show on website']) && /^https?:\/\//.test(r['Affiliate link'] ?? ''));

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isAmazon = (r, finalUrl = '') => /amazon/i.test(r.Store ?? '') || /amzn\.to|link\.amazon|amazon\./i.test(r['Affiliate link'] + finalUrl);

async function get(link) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(link, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': UA, 'Accept-Language': 'es-ES,es;q=0.9' } });
      const body = res.status === 200 ? await res.text() : '';
      return { status: res.status, finalUrl: res.url, body };
    } catch (e) {
      if (attempt === 1) return { status: 0, error: e.cause?.code ?? e.name };
      await sleep(3000);
    }
  }
}

function findPrice(html) {
  // 1. JSON-LD Product offers
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const stack = [JSON.parse(m[1].trim())];
      while (stack.length) {
        const n = stack.pop();
        if (Array.isArray(n)) { stack.push(...n); continue; }
        if (!n || typeof n !== 'object') continue;
        const offers = n.offers ? (Array.isArray(n.offers) ? n.offers : [n.offers]) : [];
        for (const o of offers) {
          const p = o.price ?? o.lowPrice;
          if (p != null && (o.priceCurrency ?? 'EUR') === 'EUR' && !isNaN(parseFloat(p))) return parseFloat(p);
        }
        stack.push(...Object.values(n));
      }
    } catch { /* ignore bad JSON-LD */ }
  }
  // 2. Meta tags
  const meta = html.match(/<meta[^>]+(?:property|name)=["'](?:product:price:amount|og:price:amount)["'][^>]+content=["']([\d.,]+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([\d.,]+)["'][^>]+(?:property|name)=["'](?:product:price:amount|og:price:amount)["']/i);
  if (meta) return parseFloat(meta[1].replace(',', '.'));
  return null;
}
const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const num = (s) => { const m = String(s ?? '').replace(/\./g, '').replace(',', '.').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };

const report = { broken: [], unchecked: {}, prices: [], checked: [], priceChecked: [] };
let lastHost = '';
for (const r of todo) {
  const link = r['Affiliate link'].trim();
  const host = new URL(link).host;
  if (host === lastHost) await sleep(1500);
  lastHost = host;
  const res = await get(link);
  const store = r.Store ?? host;
  // Only a clear "page not found" from the shop counts as broken. Network errors (no internet,
  // DNS hiccups, timeouts) are never treated as broken: they're re-tried next time.
  if (res.status === 404 || res.status === 410) {
    // Some shops (Amazon especially) answer 404 to scripts at random. Confirm with a second,
    // independent request (curl) after a pause; only a second 404/410 counts as broken.
    await sleep(3000);
    const again = spawnSync('curl', ['-sL', '-o', '/dev/null', '--max-time', '25', '-A', UA, '-H', 'Accept-Language: es-ES', '-w', '%{http_code}', link], { encoding: 'utf8' }).stdout.trim();
    if (again === '404' || again === '410') {
      // Amazon shows its "page not found" to robots at random, even for live products, so an
      // Amazon 404 is only flagged for a human to check; it never takes the product off the site.
      if (isAmazon(r, res.finalUrl)) report.toReview = [...(report.toReview ?? []), { url: r.url, name: r.Name, link, reason: 'Amazon dice que no existe (puede ser falso)' }];
      else report.broken.push({ url: r.url, name: r.Name, link, reason: `error ${again}` });
      continue;
    }
    if (again !== '200') { report.unchecked[store] = (report.unchecked[store] ?? 0) + 1; continue; }
    report.checked.push(r.url);
    continue;
  }
  if (res.status === 0) {
    report.networkErrors = (report.networkErrors ?? 0) + 1;
    continue;
  }
  if (res.status !== 200 || /captcha|security verification/i.test(res.body.slice(0, 5000))) {
    report.unchecked[store] = (report.unchecked[store] ?? 0) + 1;
    continue;
  }
  report.checked.push(r.url);
  if (withPrices && !isAmazon(r, res.finalUrl)) {
    const p = findPrice(res.body);
    if (p && p > 0) {
      report.priceChecked.push(r.url);
      if (num(r.Price) !== p) report.prices.push({ url: r.url, name: r.Name, old: r.Price ?? null, new: fmt(p) });
    }
  }
}
// Safety net: if many links fail at once, it's almost certainly our connection or a blocked
// redirector, not the shops. Report nothing as broken so nothing gets taken off the website.
const tooMany = report.broken.length > Math.max(5, todo.length * 0.15) || (report.networkErrors ?? 0) > todo.length * 0.3;
if (tooMany) {
  report.aborted = `Demasiados fallos a la vez (${report.broken.length} rotos, ${report.networkErrors ?? 0} sin conexión de ${todo.length}); seguramente es la conexión. No se marca nada como roto.`;
  report.suspectedBroken = report.broken;
  report.broken = [];
}
console.log(JSON.stringify(report, null, 2));
