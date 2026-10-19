// خاجی پخش — price-list search, inquiry list, mobile menu. No dependencies.
(() => {
  const norm = /*NORM*/;
  const ICON = /*ICONS*/;
  const PHONE = (window.KHAJI && window.KHAJI.phone) || '';
  const KEY = 'khaji-inquiry-v1';
  const NOTE_KEY = 'khaji-inquiry-note-v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fa = (n) => Number(n).toLocaleString('fa-IR');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // ---------- storage: optional, the page works without it ----------
  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode or blocked storage */ }
  }
  let list = read(KEY, []);
  if (!Array.isArray(list)) list = [];
  list = list.filter((x) => x && x.id && x.name && x.qty > 0);
  let note = read(NOTE_KEY, '');
  if (typeof note !== 'string') note = '';

  // ---------- toast ----------
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  // ---------- mobile menu ----------
  const nav = $('#site-nav');
  const navBtn = $('[data-nav-toggle]');
  function setNav(open) {
    if (!nav || !navBtn) return;
    nav.classList.toggle('open', open);
    navBtn.setAttribute('aria-expanded', String(open));
    navBtn.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  }
  navBtn && navBtn.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav && nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  // ---------- price lists ----------
  $$('[data-pricelist]').forEach((pl) => {
    const input = $('[data-q]', pl);
    const rows = $$('tr[data-row]', pl);
    const chips = $$('[data-chip]', pl);
    const count = $('[data-count]', pl);
    const empty = $('[data-empty]', pl);
    const more = $('[data-more]', pl);
    const moreWrap = $('[data-more-wrap]', pl);
    let cat = '';
    function apply() {
      const q = norm(input.value);
      const toks = q ? q.split(' ') : [];
      let shown = 0;
      rows.forEach((r) => {
        const ok = (!cat || r.dataset.cat === cat) && toks.every((t) => r.dataset.s.includes(t));
        r.hidden = !ok;
        if (ok) shown++;
      });
      const filtering = Boolean(q || cat);
      pl.classList.toggle('filtering', filtering);
      count.textContent = filtering ? `${fa(shown)} قلم پیدا شد` : `${fa(rows.length)} قلم`;
      empty.hidden = shown > 0;
      if (moreWrap) moreWrap.hidden = filtering || pl.classList.contains('open');
    }
    input.addEventListener('input', apply);
    chips.forEach((c) => c.addEventListener('click', () => {
      cat = c.dataset.chip;
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      apply();
    }));
    more && more.addEventListener('click', () => {
      pl.classList.add('open');
      apply();
      const next = rows.find((r) => r.hasAttribute('data-extra'));
      const btn = next && $('.add', next);
      btn && btn.focus({ preventScroll: true });
    });
    pl._apply = apply;
  });

  // Header search icon and ?q= both land on the home price list.
  const find = $('[data-find]');
  if (find) {
    const q0 = new URLSearchParams(location.search).get('q');
    if (q0) { find.value = q0; find.closest('[data-pricelist]')._apply(); }
    const focusFind = () => { if (location.hash === '#find') find.focus({ preventScroll: true }); };
    focusFind();
    window.addEventListener('hashchange', focusFind);
  }

  // ---------- inquiry list ----------
  const drawer = $('#inquiry');
  const listEl = $('[data-list]');
  const emptyEl = $('[data-inq-empty]');
  const noteWrap = $('[data-inq-note]');
  const noteEl = $('[data-note]');
  const smsEl = $('[data-sms]');
  const copyEl = $('[data-copy]');
  const clearEl = $('[data-clear]');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function message() {
    const lines = list.map((x, i) => `${fa(i + 1)}. ${x.name} — ${x.brand} — ${fa(x.qty)} × ${x.unit}`);
    let t = `سلام، لطفاً قیمت روز و موجودی این اقلام را اعلام کنید:\n${lines.join('\n')}`;
    if (note.trim()) t += `\n\nتوضیح: ${note.trim()}`;
    return `${t}\n\nارسال از وب‌سایت خاجی پخش`;
  }

  function save() { write(KEY, list); }

  function render() {
    const n = list.length;
    $$('[data-count-badge]').forEach((b) => { b.textContent = fa(n); });
    $$('[data-add]').forEach((btn) => {
      const item = list.find((x) => x.id === btn.dataset.add);
      btn.classList.toggle('in', Boolean(item));
      btn.querySelector('span').textContent = item ? `در لیست · ${fa(item.qty)}` : 'افزودن';
      btn.setAttribute('aria-label', item
        ? `${btn.dataset.name}، تعداد ${fa(item.qty)} در لیست استعلام؛ افزودن یکی دیگر`
        : `افزودن ${btn.dataset.name} به لیست استعلام`);
    });
    if (!drawer) return;
    emptyEl.hidden = n > 0;
    noteWrap.hidden = n === 0;
    listEl.innerHTML = list.map((x) => `<li data-id="${esc(x.id)}">
      <div><p class="inq-name">${esc(x.name)}</p><p class="inq-sub">${esc(x.brand)} · ${esc(x.unit)}</p></div>
      <div class="qty" role="group" aria-label="تعداد ${esc(x.name)}">
        <button type="button" data-inc aria-label="یکی بیشتر">${ICON.plus}</button>
        <input type="text" inputmode="numeric" value="${fa(x.qty)}" aria-label="تعداد ${esc(x.name)}" data-qty>
        <button type="button" data-dec aria-label="یکی کمتر">${ICON.minus}</button>
      </div>
      <button type="button" class="btn-text inq-del" data-del>${ICON.trash}حذف از لیست</button>
    </li>`).join('');
    const off = n === 0;
    [smsEl, copyEl, clearEl].forEach((el) => {
      el.setAttribute('aria-disabled', String(off));
      if (off) el.setAttribute('tabindex', '-1'); else el.removeAttribute('tabindex');
    });
    smsEl.href = `sms:${PHONE}${isIOS ? '&' : '?'}body=${encodeURIComponent(message())}`;
  }

  function add(btn) {
    const item = list.find((x) => x.id === btn.dataset.add);
    if (item) item.qty = Math.min(item.qty + 1, 9999);
    else list.push({ id: btn.dataset.add, name: btn.dataset.name, unit: btn.dataset.unit, brand: btn.dataset.brand, qty: 1 });
    save();
    render();
    toast(`«${btn.dataset.name}» به لیست استعلام اضافه شد`);
  }

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) { add(addBtn); return; }
    const opener = e.target.closest('[data-open-list]');
    if (opener && drawer) {
      setNav(false);
      if (typeof drawer.showModal === 'function') drawer.showModal(); else drawer.setAttribute('open', '');
    }
  });

  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer || e.target.closest('[data-close]')) { drawer.close ? drawer.close() : drawer.removeAttribute('open'); return; }
      const li = e.target.closest('li[data-id]');
      if (!li) return;
      const item = list.find((x) => x.id === li.dataset.id);
      if (!item) return;
      if (e.target.closest('[data-inc]')) item.qty = Math.min(item.qty + 1, 9999);
      else if (e.target.closest('[data-dec]')) item.qty = Math.max(item.qty - 1, 1);
      else if (e.target.closest('[data-del]')) { list = list.filter((x) => x !== item); toast(`«${item.name}» از لیست حذف شد`); }
      else return;
      save();
      const focusSel = e.target.closest('[data-inc]') ? '[data-inc]' : e.target.closest('[data-dec]') ? '[data-dec]' : null;
      render();
      if (focusSel) { const again = $(`li[data-id="${item.id}"] ${focusSel}`, listEl); again && again.focus(); }
      else (list.length ? $('[data-del]', listEl) : $('[data-close]', drawer)).focus();
    });
    listEl.addEventListener('change', (e) => {
      if (!e.target.matches('[data-qty]')) return;
      const li = e.target.closest('li[data-id]');
      const item = list.find((x) => x.id === li.dataset.id);
      const v = parseInt(norm(e.target.value), 10);
      if (item) item.qty = Number.isFinite(v) && v > 0 ? Math.min(v, 9999) : 1;
      save();
      render();
    });
    noteEl.value = note;
    noteEl.addEventListener('input', () => { note = noteEl.value; write(NOTE_KEY, note); render(); });
    copyEl.addEventListener('click', async () => {
      const text = message();
      try { await navigator.clipboard.writeText(text); }
      catch {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        drawer.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch { /* nothing else to try */ }
        ta.remove();
      }
      toast('متن لیست کپی شد؛ در واتساپ، تلگرام یا پیامک بچسبانید');
    });
    clearEl.addEventListener('click', () => {
      if (!list.length) return;
      list = [];
      save();
      render();
      toast('لیست استعلام پاک شد');
      $('[data-close]', drawer).focus();
    });
  }

  // Another tab changed the list: keep this one in step.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    list = read(KEY, []);
    if (!Array.isArray(list)) list = [];
    render();
  });

  render();
})();
