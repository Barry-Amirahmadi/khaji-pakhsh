// Static site generator for خاجی پخش. No dependencies: `node build.mjs`.
//   BASE_PATH  where the site is served from, e.g. "/khaji-pakhsh" (default: "")
//   SITE_URL   origin for canonical and Open Graph URLs (default: localhost)
//   OUT_DIR    output folder (default: dist)
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as D from './src/data.mjs';
import { icon } from './src/icons.mjs';
import { norm } from './src/norm.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, process.env.OUT_DIR || 'dist');
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
const ORIGIN = (process.env.SITE_URL || 'http://localhost:4417').replace(/\/$/, '');
const { PREVIEW, business: B } = D;

const css = readFileSync(join(ROOT, 'src/site.css'), 'utf8');
const js = readFileSync(join(ROOT, 'src/site.js'), 'utf8')
  .replace('/*NORM*/', norm.toString())
  .replace('/*ICONS*/', JSON.stringify({ plus: icon('plus'), minus: icon('minus'), trash: icon('trash'), check: icon('check') }));
const VER = createHash('md5').update(css + js).digest('hex').slice(0, 8);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fa = (n) => Number(n).toLocaleString('fa-IR');
const pad = (n) => fa(n).padStart(2, '۰');
const u = (p) => BASE + p;
const abs = (p) => ORIGIN + BASE + p;
const catBy = Object.fromEntries(D.categories.map((c) => [c.slug, c]));
const brandBy = Object.fromEntries(D.brands.map((b) => [b.slug, b]));
const countIn = (pred) => D.products.filter(pred).length;
const tel = `tel:${B.phone}`;
const phoneLtr = `<span dir="ltr">${B.phoneDisplay}</span>`;

// ---------- shared pieces ----------

const logoMark = () => `<span class="mark">${icon('bolt')}</span>`;

function header(path) {
  const home = path === '/';
  const h = (id) => (home ? `#${id}` : u(`/#${id}`));
  const nav = [
    ['دسته‌بندی‌ها', h('categories')],
    ['لیست قیمت', h('prices')],
    ['برندها', h('brands')],
    ['تماس و آدرس', u('/contact/')],
  ];
  return `<header class="site-header">
<div class="wrap hdr">
  <a class="logo" href="${u('/')}" aria-label="${B.name}، صفحه اصلی">${logoMark()}<span class="logo-txt"><strong>${B.name}</strong><span>${B.tagline}</span></span></a>
  <nav class="nav" id="site-nav" aria-label="منوی اصلی">
    <ul>${nav.map(([t, href]) => `<li><a href="${href}"${path === '/contact/' && href.endsWith('/contact/') ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul>
    <a class="nav-phone" href="${tel}">${icon('phone')}<span>تماس با فروش</span>${phoneLtr}</a>
  </nav>
  <div class="hdr-actions">
    <a class="btn-icon hide-lg" href="${home ? '#find' : u('/#find')}" aria-label="جست‌وجوی کالا">${icon('search')}</a>
    <a class="btn btn-ghost-light show-lg" href="${tel}">${icon('phone')}${phoneLtr}</a>
    <button class="btn btn-list" type="button" data-open-list aria-haspopup="dialog" aria-controls="inquiry">${icon('list')}<span class="show-sm">لیست استعلام</span><span class="sr-only">، تعداد اقلام:</span><span class="badge" data-count-badge>۰</span></button>
    <button class="btn-icon hide-lg nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav" aria-label="باز کردن منو">${icon('menu', 'i i-open')}${icon('close', 'i i-close')}</button>
  </div>
</div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
<div class="wrap ft-grid">
  <div class="ft-brand">
    <a class="logo" href="${u('/')}">${logoMark()}<span class="logo-txt"><strong>${B.name}</strong><span>${B.tagline}</span></span></a>
    <p>پخش عمده سیم و کابل، کلید و پریز، تجهیزات حفاظتی، روشنایی و برق صنعتی در بازار لاله‌زار تهران.</p>
  </div>
  <nav aria-labelledby="ft-q"><h2 class="ft-h" id="ft-q">دسترسی سریع</h2><ul>
    <li><a href="${u('/#categories')}">دسته‌بندی‌ها</a></li>
    <li><a href="${u('/#prices')}">لیست قیمت</a></li>
    <li><a href="${u('/#brands')}">برندها</a></li>
    <li><a href="${u('/#faq')}">سؤالات متداول</a></li>
  </ul></nav>
  <nav aria-labelledby="ft-c"><h2 class="ft-h" id="ft-c">گروه‌های کالا</h2><ul class="ft-cats">
    ${D.categories.map((c) => `<li><a href="${u(`/categories/${c.slug}/`)}">${c.name}</a></li>`).join('')}
  </ul></nav>
  <div><h2 class="ft-h">تماس</h2>
    <p><a class="ft-phone" href="${tel}">${phoneLtr}</a></p>
    <p class="ft-addr">${B.address}</p>
    <p><a href="${u('/contact/')}">آدرس و مسیریابی</a></p>
  </div>
</div>
<div class="wrap ft-bottom">
  <p>© ۱۴۰۵ ${B.name}</p>
  ${PREVIEW ? '<p>نسخه پیش‌نمایش طراحی؛ قیمت‌ها نمونه‌اند.</p>' : ''}
</div>
</footer>`;
}

const mobileBar = () => `<div class="mbar">
  <a class="btn btn-outline" href="${tel}">${icon('phone')}تماس</a>
  <button class="btn btn-primary" type="button" data-open-list aria-haspopup="dialog" aria-controls="inquiry">${icon('list')}لیست استعلام<span class="badge" data-count-badge>۰</span></button>
</div>`;

const drawer = () => `<dialog class="drawer" id="inquiry" aria-labelledby="inq-title">
<div class="drawer-in">
  <div class="drawer-head">
    <h2 id="inq-title">لیست استعلام</h2>
    <button class="btn-icon" type="button" data-close aria-label="بستن لیست">${icon('close')}</button>
  </div>
  <div class="drawer-body">
    <div class="drawer-empty" data-inq-empty>
      <p><strong>لیست خالی است.</strong></p>
      <p>در لیست قیمت، کنار هر کالا «افزودن» را بزنید. لیست روی همین دستگاه می‌ماند.</p>
      <a class="btn btn-outline" href="${u('/#prices')}" data-close>رفتن به لیست قیمت</a>
    </div>
    <ul class="inq-list" data-list></ul>
    <div class="field inq-note" data-inq-note>
      <label for="inq-note">توضیح برای واحد فروش <span class="opt">اختیاری</span></label>
      <textarea id="inq-note" rows="3" data-note placeholder="مثلاً نام فروشگاه، شهر یا برند ترجیحی"></textarea>
    </div>
  </div>
  <div class="drawer-foot">
    <a class="btn btn-primary btn-block" href="sms:${B.phone}" data-sms>${icon('message')}ارسال لیست با پیامک</a>
    <div class="drawer-row">
      <button class="btn btn-outline" type="button" data-copy>${icon('copy')}کپی متن لیست</button>
      <a class="btn btn-outline" href="${tel}">${icon('phone')}تماس</a>
    </div>
    <button class="btn-text" type="button" data-clear>پاک کردن لیست</button>
  </div>
</div>
</dialog>`;

function layout({ path, title, desc, body, jsonld }) {
  const full = title ? `${title} | ${B.name}` : `${B.name} | ${B.tagline}`;
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
${PREVIEW ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<link rel="canonical" href="${abs(path)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fa_IR">
<meta property="og:site_name" content="${B.name}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs('/og.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B1324">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${u('/apple-touch-icon.png')}">
<link rel="preload" href="${u('/fonts/Vazirmatn-Variable.woff2')}" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="${u('/assets/site.css')}?v=${VER}">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}</head>
<body>
<a class="skip" href="#main">پرش به محتوای اصلی</a>
${PREVIEW ? '<p class="preview-bar">نسخه پیش‌نمایش طراحی وب‌سایت؛ قیمت‌ها نمونه‌اند و این سایت رسمی فروشگاه نیست.</p>\n' : ''}${header(path)}
<main id="main">
${body}
</main>
${footer()}
${mobileBar()}
${drawer()}
<div class="toast" role="status" aria-live="polite" data-toast></div>
<script>window.KHAJI={phone:${JSON.stringify(B.phone)}}</script>
<script src="${u('/assets/site.js')}?v=${VER}" defer></script>
</body>
</html>
`;
}

const secHead = (n, label, h2, lead = '', id = '') => `<div class="sec-head">
  <p class="sec-label"><span class="n">${n}</span>${label}</p>
  <h2${id ? ` id="${id}"` : ''}>${h2}</h2>
  ${lead ? `<p class="sec-lead">${lead}</p>` : ''}
</div>`;

const crumbs = (items) => `<nav class="crumbs" aria-label="مسیر صفحه"><ol>${items
  .map(([t, href]) => (href ? `<li><a href="${href}">${t}</a></li>` : `<li aria-current="page">${t}</li>`))
  .join('')}</ol></nav>`;

const faq = (items) => `<div class="faq">${items
  .map(([q, a]) => `<details><summary><span>${q}</span>${icon('plus', 'i faq-i')}</summary><p>${a}</p></details>`)
  .join('')}</div>`;

const mapLinks = () => `<div class="map-links">${D.maps
  .map((m) => `<a href="${m.href}" target="_blank" rel="noopener">${icon('pin')}مسیریابی با ${m.label}</a>`)
  .join('')}</div>`;

const contactBand = () => `<section class="band" aria-labelledby="band-h">
<div class="wrap band-grid">
  <div>
    <p class="eyebrow"><span class="dot"></span>آماده استعلام هستید؟</p>
    <h2 id="band-h">قیمت روز و موجودی را از واحد فروش بپرسید</h2>
    <p>لیست اقلام را پیامک کنید یا مستقیم تماس بگیرید؛ شرایط سفارش و تحویل هم همان‌جا هماهنگ می‌شود.</p>
  </div>
  <div class="band-actions">
    <a class="btn btn-signal btn-lg" href="${tel}">${icon('phone')}${phoneLtr}</a>
    <button class="btn btn-outline-light btn-lg" type="button" data-open-list aria-haspopup="dialog" aria-controls="inquiry">${icon('list')}لیست استعلام</button>
  </div>
  <div class="band-addr">
    <p class="addr">${icon('pin')}<span>${B.address}</span></p>
    ${mapLinks()}
  </div>
</div>
</section>`;

function row(p, extra) {
  const c = catBy[p.cat];
  const b = p.brand ? brandBy[p.brand] : null;
  const bname = b ? b.name : 'چند برند';
  const price = p.price ? `<span class="price">${fa(p.price)}</span>` : '<span class="ask">استعلام</span>';
  const s = norm([p.name, p.spec, bname, c.name, p.unit].join(' '));
  return `<tr data-row data-cat="${p.cat}" data-s="${esc(s)}"${extra ? ' data-extra' : ''}>
  <th scope="row"><span class="p-name">${esc(p.name)}</span><span class="p-spec">${esc(p.spec)}</span><span class="p-meta-m">${esc(bname)} · ${esc(p.unit)}</span></th>
  <td class="c-cat"><a href="${u(`/categories/${c.slug}/`)}">${c.name}</a></td>
  <td class="c-brand">${b ? `<a href="${u(`/brands/${b.slug}/`)}">${b.name}</a>` : bname}</td>
  <td class="c-unit">${esc(p.unit)}</td>
  <td class="c-price num">${price}</td>
  <td class="c-add"><button type="button" class="add" data-add="${p.id}" data-name="${esc(p.name)}" data-unit="${esc(p.unit)}" data-brand="${esc(bname)}" aria-label="افزودن ${esc(p.name)} به لیست استعلام">${icon('plus')}<span>افزودن</span></button></td>
</tr>`;
}

function priceList({ id, items, chips = false, limit = 0, caption }) {
  const cats = chips ? D.categories.filter((c) => items.some((p) => p.cat === c.slug)) : [];
  return `<div class="pl" data-pricelist data-limit="${limit}">
  <div class="pl-tools">
    <div class="field pl-search"${id === 'home' ? ' id="find"' : ''}>
      <label for="q-${id}">جست‌وجوی کالا یا برند</label>
      <div class="search">${icon('search')}<input id="q-${id}" type="search" autocomplete="off" enterkeyhint="search" placeholder="مثلاً سیم افشان، دلند یا C16" data-q${id === 'home' ? ' data-find' : ''}></div>
    </div>
    ${chips ? `<div class="chips" role="group" aria-label="فیلتر گروه کالا"><button type="button" class="chip" aria-pressed="true" data-chip="">همه</button>${cats.map((c) => `<button type="button" class="chip" aria-pressed="false" data-chip="${c.slug}">${c.name}</button>`).join('')}</div>` : ''}
  </div>
  <p class="pl-meta"><span data-count aria-live="polite">${fa(items.length)} قلم</span><span>قیمت‌ها به تومان${PREVIEW ? '؛ نمونه' : ''}</span></p>
  <div class="pt-wrap"><table class="pt">
    <caption class="sr-only">${caption}</caption>
    <thead><tr><th scope="col">کالا</th><th scope="col" class="c-cat">گروه</th><th scope="col" class="c-brand">برند</th><th scope="col" class="c-unit">واحد</th><th scope="col" class="num">${PREVIEW ? 'قیمت نمونه' : 'قیمت'}</th><th scope="col" class="c-add"><span class="sr-only">افزودن به لیست</span></th></tr></thead>
    <tbody>${items.map((p, i) => row(p, limit && i >= limit)).join('')}</tbody>
  </table></div>
  <div class="pl-empty" data-empty hidden><p>کالایی با این عبارت پیدا نشد؛ شاید با نام دیگری ثبت شده باشد.</p><a class="btn btn-outline" href="${tel}">${icon('phone')}از واحد فروش بپرسید</a></div>
  ${limit && items.length > limit ? `<div class="center" data-more-wrap><button type="button" class="btn btn-outline" data-more>نمایش همه ${fa(items.length)} قلم</button></div>` : ''}
</div>`;
}

const catCard = (c) => `<li><a class="cat" href="${u(`/categories/${c.slug}/`)}">
  <span class="cat-ico">${icon(c.icon)}</span><span class="cat-code" dir="ltr">${c.code}</span>
  <h3>${c.name}</h3><p>${c.items}</p>
  <span class="cat-foot">${fa(countIn((p) => p.cat === c.slug))} قلم در لیست قیمت${icon('chevron')}</span>
</a></li>`;

const brandCard = (b) => `<li><a class="brand" href="${u(`/brands/${b.slug}/`)}">
  <span class="brand-plate">${b.name}</span><span class="brand-field">${b.field}</span>
  <span class="brand-count">${fa(countIn((p) => p.brand === b.slug))} قلم در لیست قیمت</span>
</a></li>`;

const catMini = (list) => `<ul class="cat-mini">${list
  .map((c) => `<li><a href="${u(`/categories/${c.slug}/`)}">${icon(c.icon)}<span>${c.name}</span></a></li>`)
  .join('')}</ul>`;

const storeLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: B.name,
  description: 'پخش عمده تجهیزات الکتریکی: سیم و کابل، کلید و پریز، روشنایی و برق صنعتی',
  telephone: B.phone,
  url: abs('/'),
  image: abs('/og.png'),
  address: { '@type': 'PostalAddress', streetAddress: 'خیابان انقلاب اسلامی، حوالی تقاطع لاله‌زار نو', addressLocality: 'تهران', addressCountry: 'IR' },
  geo: { '@type': 'GeoCoordinates', latitude: B.geo.lat, longitude: B.geo.lng },
});

// ---------- pages ----------

function homePage() {
  const facts = [
    [`${B.years} سال`, 'سابقه در کالای برق'],
    [`${fa(D.categories.length)} گروه`, 'کالای ساختمانی و صنعتی'],
    [`${fa(D.brands.length)} برند`, 'ایرانی در سبد کالا'],
    ['حضوری', 'در بازار لاله‌زار'],
  ];
  const body = `<section class="hero" aria-labelledby="hero-h">
<div class="wrap hero-grid">
  <div class="hero-copy">
    <p class="eyebrow"><span class="dot"></span>بازار لاله‌زار تهران · فروش عمده و حضوری</p>
    <h1 id="hero-h">تأمین عمده کالای برق، <span class="hl">از سیم تا تابلو</span></h1>
    <p class="lead">سیم و کابل، کلید و پریز، تجهیزات حفاظتی، روشنایی و برق صنعتی از ${fa(D.brands.length)} برند ایرانی. اقلام موردنیازتان را در لیست استعلام جمع کنید و یک‌جا بفرستید.</p>
    <div class="cta-row">
      <a class="btn btn-signal btn-lg" href="#prices">مشاهده لیست قیمت</a>
      <a class="btn btn-outline-light btn-lg" href="${tel}">${icon('phone')}تماس با فروش</a>
    </div>
    <ul class="facts">${facts.map(([a, b]) => `<li><strong>${a}</strong><span>${b}</span></li>`).join('')}</ul>
  </div>
  <div class="board">
    <div class="board-head"><h2 class="board-title">تابلوی کالا</h2><span class="board-sub">یک گروه را انتخاب کنید</span></div>
    <ul class="rail">${D.categories
      .map((c) => `<li><a class="mod" href="${u(`/categories/${c.slug}/`)}"><span class="mod-led" aria-hidden="true"></span><span class="mod-code" dir="ltr">${c.code}</span><span class="mod-lever" aria-hidden="true"><span></span></span><span class="mod-name">${c.name}</span></a></li>`)
      .join('')}</ul>
  </div>
</div>
</section>

<section class="sec" id="categories" aria-labelledby="cat-h">
<div class="wrap">
  ${secHead('۰۱', 'دسته‌بندی‌ها', 'هر آنچه پروژه برق لازم دارد', 'هشت گروه اصلی برق ساختمانی، روشنایی و صنعتی؛ هر گروه با راهنمای استعلام و لیست قیمت خودش.', 'cat-h')}
  <ul class="cat-grid">${D.categories.map(catCard).join('')}</ul>
</div>
</section>

<section class="sec sec-paper" id="prices" aria-labelledby="price-h">
<div class="wrap">
  ${secHead('۰۲', 'لیست قیمت', 'لیست قیمت عمده', PREVIEW ? 'جست‌وجو کنید، گروه را انتخاب کنید و اقلام را به لیست استعلام اضافه کنید. قیمت‌های این پیش‌نمایش نمونه‌اند؛ قیمت روز هنگام استعلام اعلام می‌شود.' : 'جست‌وجو کنید، گروه را انتخاب کنید و اقلام را به لیست استعلام اضافه کنید. قیمت قطعی هنگام استعلام اعلام می‌شود.', 'price-h')}
  ${priceList({ id: 'home', items: D.products, chips: true, limit: 8, caption: 'لیست قیمت عمده همه گروه‌ها' })}
</div>
</section>

<section class="sec" id="brands" aria-labelledby="brand-h">
<div class="wrap">
  ${secHead('۰۳', 'برندها', 'برندهای ایرانی در سبد کالا', 'محصولات هر برند را در صفحه همان برند ببینید.', 'brand-h')}
  <ul class="brand-grid">${D.brands.map(brandCard).join('')}</ul>
  <p class="fine">نام برندها فقط برای معرفی کالاست و به معنی نمایندگی رسمی نیست.</p>
</div>
</section>

<section class="sec sec-paper" id="how" aria-labelledby="how-h">
<div class="wrap">
  ${secHead('۰۴', 'مسیر خرید', 'سفارش عمده در سه قدم', '', 'how-h')}
  <ol class="steps">${D.steps.map(([t, d], i) => `<li class="step"><span class="step-n">${fa(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
</div>
</section>

<section class="sec" id="faq" aria-labelledby="faq-h">
<div class="wrap">
  ${secHead('۰۵', 'سؤالات متداول', 'پیش از تماس بدانید', '', 'faq-h')}
  ${faq(D.homeFaq)}
</div>
</section>

${contactBand()}`;
  return layout({
    path: '/',
    desc: 'خاجی پخش، پخش عمده تجهیزات الکتریکی در بازار لاله‌زار تهران: سیم و کابل، کلید و پریز، تجهیزات حفاظتی، روشنایی و برق صنعتی از ۱۳ برند ایرانی.',
    body,
    jsonld: storeLd(),
  });
}

function categoryPage(c) {
  const items = D.products.filter((p) => p.cat === c.slug);
  const inBrands = D.brands.filter((b) => b.cats.includes(c.slug));
  let n = 0;
  const num = () => pad(++n);
  const body = `<section class="phero" aria-labelledby="ph-h">
<div class="wrap phero-grid">
  <div>
    ${crumbs([['خانه', u('/')], ['دسته‌بندی‌ها', u('/#categories')], [c.name]])}
    <p class="eyebrow"><span class="dot"></span>گروه کالا <span dir="ltr">${c.code}</span></p>
    <h1 id="ph-h">${c.title}</h1>
    <p class="lead">${c.intro}</p>
    <p class="phero-items">${icon('tag')}<span>${c.items}</span></p>
    <div class="cta-row">
      <a class="btn btn-signal" href="#prices">لیست قیمت این گروه</a>
      <a class="btn btn-outline-light" href="${tel}">${icon('phone')}استعلام تلفنی</a>
    </div>
  </div>
  <div class="phero-tile" aria-hidden="true">${icon(c.icon, 'i tile-i')}<span dir="ltr">${c.code}</span></div>
</div>
</section>

<section class="sec" aria-labelledby="tips-h">
<div class="wrap">
  ${secHead(num(), 'راهنمای استعلام', 'پیش از تماس این‌ها را مشخص کنید', 'با این چهار نکته، قیمت دقیق‌تر و سریع‌تری می‌گیرید.', 'tips-h')}
  <ol class="tips">${c.tips.map(([t, d], i) => `<li class="tip"><span class="tip-n">${fa(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
</div>
</section>

<section class="sec sec-paper" id="prices" aria-labelledby="price-h">
<div class="wrap">
  ${secHead(num(), 'لیست قیمت', `لیست قیمت ${c.name}`, PREVIEW ? 'قیمت‌های این پیش‌نمایش نمونه‌اند؛ اقلام را به لیست استعلام اضافه کنید تا قیمت روز را بگیرید.' : 'اقلام را به لیست استعلام اضافه کنید تا قیمت روز و موجودی را بگیرید.', 'price-h')}
  ${priceList({ id: c.slug, items, caption: `لیست قیمت ${c.name}` })}
</div>
</section>

${inBrands.length ? `<section class="sec" aria-labelledby="cb-h">
<div class="wrap">
  ${secHead(num(), 'برندها', `برندهای ${c.name}`, '', 'cb-h')}
  <ul class="brand-grid">${inBrands.map(brandCard).join('')}</ul>
</div>
</section>` : ''}

<section class="sec ${inBrands.length ? 'sec-paper' : ''}" aria-labelledby="cf-h">
<div class="wrap">
  ${secHead(num(), 'سؤالات متداول', `پرسش‌های رایج ${c.name}`, '', 'cf-h')}
  ${faq(c.faq)}
</div>
</section>

<section class="sec sec-tight" aria-labelledby="other-h">
<div class="wrap">
  <h2 class="h-sm" id="other-h">گروه‌های دیگر</h2>
  ${catMini(D.categories.filter((x) => x !== c))}
</div>
</section>

${contactBand()}`;
  return layout({
    path: `/categories/${c.slug}/`,
    title: c.title,
    desc: `${c.title} از خاجی پخش: ${c.items}. لیست قیمت، راهنمای انتخاب و استعلام از واحد فروش.`,
    body,
  });
}

function brandPage(b) {
  const items = D.products.filter((p) => p.brand === b.slug);
  const cats = b.cats.map((s) => catBy[s]);
  const body = `<section class="phero" aria-labelledby="ph-h">
<div class="wrap phero-grid">
  <div>
    ${crumbs([['خانه', u('/')], ['برندها', u('/#brands')], [b.name]])}
    <p class="eyebrow"><span class="dot"></span>برند ایرانی · حوزه فعالیت: ${b.field}</p>
    <h1 id="ph-h">محصولات ${b.name}</h1>
    <p class="lead">اقلام ${b.name} در گروه ${cats.map((c) => c.name).join(' و ')} را از لیست قیمت انتخاب کنید و برای قیمت روز و موجودی استعلام بگیرید.</p>
    <div class="cta-row">
      <a class="btn btn-signal" href="#prices">اقلام این برند</a>
      <a class="btn btn-outline-light" href="${tel}">${icon('phone')}استعلام تلفنی</a>
    </div>
  </div>
  <div class="phero-tile plate-tile" aria-hidden="true"><span class="plate">${b.name}</span><span class="plate-sub">${b.field}</span></div>
</div>
</section>

<section class="sec sec-paper" id="prices" aria-labelledby="price-h">
<div class="wrap">
  ${secHead('۰۱', 'لیست قیمت', `اقلام ${b.name}`, 'موجودی و مدل‌های دیگر این برند را هنگام استعلام بپرسید.', 'price-h')}
  ${priceList({ id: b.slug, items, caption: `اقلام ${b.name}` })}
</div>
</section>

<section class="sec" aria-labelledby="bc-h">
<div class="wrap">
  ${secHead('۰۲', 'دسته‌بندی', `${b.name} در کدام گروه‌هاست؟`, '', 'bc-h')}
  <ul class="cat-grid cat-grid-sm">${cats.map(catCard).join('')}</ul>
  <p class="fine">نام ${b.name} فقط برای معرفی کالاست و به معنی نمایندگی رسمی نیست.</p>
</div>
</section>

<section class="sec sec-paper sec-tight" aria-labelledby="ob-h">
<div class="wrap">
  <h2 class="h-sm" id="ob-h">برندهای دیگر</h2>
  <ul class="brand-grid">${D.brands.filter((x) => x !== b).map(brandCard).join('')}</ul>
</div>
</section>

${contactBand()}`;
  return layout({
    path: `/brands/${b.slug}/`,
    title: `محصولات ${b.name}`,
    desc: `خرید عمده محصولات ${b.name}، حوزه ${b.field}، از خاجی پخش در بازار لاله‌زار تهران. لیست قیمت و استعلام موجودی.`,
    body,
  });
}

function contactPage() {
  const body = `<section class="phero" aria-labelledby="ph-h">
<div class="wrap phero-grid">
  <div>
    ${crumbs([['خانه', u('/')], ['تماس و آدرس']])}
    <p class="eyebrow"><span class="dot"></span>${B.years} سال سابقه در کالای برق</p>
    <h1 id="ph-h">تماس و آدرس خاجی پخش</h1>
    <p class="lead">فروش عمده تجهیزات الکتریکی ساختمانی، روشنایی و صنعتی. برای قیمت روز، موجودی و هماهنگی سفارش با واحد فروش در تماس باشید.</p>
  </div>
</div>
</section>

<section class="sec">
<div class="wrap cgrid">
  <article class="ccard">
    <h2>${icon('phone')}تلفن واحد فروش</h2>
    <p class="big-phone"><a href="${tel}">${phoneLtr}</a></p>
    <p class="note">برای استعلام کالا، قیمت و هماهنگی سفارش.</p>
    <div class="actions"><a class="btn btn-primary" href="${tel}">${icon('phone')}تماس</a><a class="btn btn-outline" href="sms:${B.phone}">${icon('message')}پیامک</a></div>
  </article>
  <article class="ccard">
    <h2>${icon('store')}آدرس فروشگاه</h2>
    <p class="addr-lg">${B.address}</p>
    <p class="note">پیش از مراجعه حضوری تماس بگیرید تا از موجودی کالا مطمئن شوید.</p>
    ${mapLinks()}
  </article>
  <article class="ccard">
    <h2>${icon('list')}لیست استعلام</h2>
    <p>اقلام موردنیاز را از لیست قیمت جمع کنید و یک‌جا برای واحد فروش پیامک کنید؛ دیگر لازم نیست قلم‌به‌قلم پشت تلفن بخوانید.</p>
    <div class="actions"><button class="btn btn-primary" type="button" data-open-list aria-haspopup="dialog" aria-controls="inquiry">${icon('list')}باز کردن لیست</button><a class="btn btn-outline" href="${u('/#prices')}">لیست قیمت</a></div>
  </article>
</div>
</section>

<section class="sec sec-paper" aria-labelledby="cf-h">
<div class="wrap">
  ${secHead('۰۱', 'سؤالات متداول', 'خرید حضوری و ارسال', '', 'cf-h')}
  ${faq(D.homeFaq.slice(2))}
</div>
</section>`;
  return layout({
    path: '/contact/',
    title: 'تماس و آدرس',
    desc: `تلفن، آدرس و مسیریابی خاجی پخش: ${B.address}.`,
    body,
    jsonld: storeLd(),
  });
}

function notFoundPage() {
  const body = `<section class="sec nf">
<div class="wrap">
  <p class="nf-code" dir="ltr">404</p>
  <h1>این صفحه پیدا نشد</h1>
  <p class="sec-lead">شاید نشانی تغییر کرده باشد. از دسته‌بندی‌ها یا لیست قیمت شروع کنید.</p>
  <div class="cta-row center"><a class="btn btn-primary" href="${u('/')}">صفحه اصلی</a><a class="btn btn-outline" href="${u('/#prices')}">لیست قیمت</a></div>
</div>
</section>`;
  return layout({ path: '/404.html', title: 'صفحه پیدا نشد', desc: 'صفحه موردنظر پیدا نشد.', body });
}

// ---------- write ----------

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });
cpSync(join(ROOT, 'static'), OUT, { recursive: true });
writeFileSync(join(OUT, 'assets/site.css'), css);
writeFileSync(join(OUT, 'assets/site.js'), js);

const pages = [['/', homePage()], ['/contact/', contactPage()]];
for (const c of D.categories) pages.push([`/categories/${c.slug}/`, categoryPage(c)]);
for (const b of D.brands) pages.push([`/brands/${b.slug}/`, brandPage(b)]);
for (const [p, html] of pages) {
  const dir = join(OUT, p);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}
writeFileSync(join(OUT, '404.html'), notFoundPage());
writeFileSync(join(OUT, '.nojekyll'), '');
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p]) => `  <url><loc>${abs(p)}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\n${PREVIEW ? 'Allow: /\n# Preview build: every page carries noindex.\n' : `Allow: /\nSitemap: ${abs('/sitemap.xml')}\n`}`);
console.log(`built ${pages.length + 1} pages → ${OUT} (base "${BASE || '/'}", v${VER})`);
