// Autoposter: vult de Vinted-velden in die bij een categorie horen (categorie, merk, maat, staat, kleur, materiaal).
// Werkt met Vinted's eigen id's, zodat het in elke taal en elk land hetzelfde doet.
// Bewaart ook de categorieboom van de gebruiker, zodat de AI uit precies die lijst kan kiezen.
(() => {
  'use strict';

  const CATALOG_KEY = 'vintedCatalog';
  const CATALOG_MAX_AGE = 24 * 60 * 60 * 1000;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitFor(fn, timeout = 4000, step = 100) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      try {
        const r = fn();
        if (r) return r;
      } catch (_) { /* opnieuw proberen */ }
      await sleep(step);
    }
    return null;
  }

  const byTestId = (id, root = document) => root.querySelector(`[data-testid="${id}"]`);

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[’`´]/g, "'")
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9']+/g, ' ')
      .trim();
  }

  function setInputValue(el, value) {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (el._valueTracker) el._valueTracker.setValue('');
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Volledige muisklik (pointerdown, mousedown, pointerup, mouseup, click).
   * Vinted (17-11-2026): de keuzevakken zijn knoppen geworden die niet op alleen click() reageren.
   */
  function realClick(el) {
    if (!el) return false;
    const mouse = { bubbles: true, cancelable: true, button: 0 };
    const pointer = { ...mouse, pointerType: 'mouse', isPrimary: true };
    el.dispatchEvent(new PointerEvent('pointerdown', pointer));
    el.dispatchEvent(new MouseEvent('mousedown', mouse));
    el.dispatchEvent(new PointerEvent('pointerup', pointer));
    el.dispatchEvent(new MouseEvent('mouseup', mouse));
    el.dispatchEvent(new MouseEvent('click', mouse));
    return true;
  }

  /**
   * Wat er in een keuzevak staat. Oud: een invulveld met .value. Nieuw (17-11-2026): een knop met de tekst in
   * "<testid>--value"; een leeg vak heeft dan het kenmerk data-placeholder (de tekst is dan "Kies een maat" e.d.).
   */
  function fieldValue(el) {
    if (!el) return '';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value || '';
    if (el.hasAttribute('data-placeholder')) return '';
    const testId = el.getAttribute('data-testid');
    const valueEl = testId ? (el.querySelector(`[data-testid="${testId}--value"]`) || byTestId(`${testId}--value`)) : null;
    return ((valueEl || el).textContent || '').trim();
  }

  /** Klikt op de rij waar een radio/checkbox in zit (zo reageert Vinted's lijst). */
  function clickRow(inner) {
    if (!inner) return false;
    const row = inner.closest('li') || inner.closest('[role="button"]') || inner.parentElement;
    const target = (row && (row.querySelector('.web_ui__Cell__cell') || row.firstElementChild)) || row || inner;
    realClick(target);
    return true;
  }

  function closeDropdown(input) {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
  }

  async function openDropdown(inputTestId, contentTestId) {
    const input = byTestId(inputTestId);
    if (!input) return null;
    if (!byTestId(contentTestId)) {
      input.scrollIntoView({ block: 'center' });
      // Knop (nieuw): volledige muisklik. Invulveld (oud): gewone klik. Lukt de ene niet, probeer de andere.
      if (input.tagName === 'BUTTON') realClick(input); else input.click();
      if (!(await waitFor(() => byTestId(contentTestId), 1200))) {
        if (input.tagName === 'BUTTON') input.click(); else realClick(input);
      }
    }
    const content = await waitFor(() => byTestId(contentTestId), 3000);
    return content ? { input, content } : null;
  }

  // ---------------------------------------------------------------------------------------
  // Categorieboom van de gebruiker (taal en indeling zoals Vinted hem aan deze gebruiker toont)
  // ---------------------------------------------------------------------------------------

  async function fetchCatalog() {
    const res = await fetch('/api/v2/item_upload/catalogs', { headers: { accept: 'application/json' }, credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    const nodes = [];
    const walk = (n, parent) => {
      if (!n || !Number.isInteger(n.id) || typeof n.title !== 'string') return;
      nodes.push([n.id, parent, n.title.slice(0, 120)]);
      (n.catalogs || []).forEach((c) => walk(c, n.id));
    };
    (data.catalogs || []).forEach((c) => walk(c, 0));
    if (nodes.length < 50) return null;
    return { v: 1, origin: location.origin, lang: document.documentElement.lang || '', fetchedAt: Date.now(), nodes };
  }

  /** Haalt de boom op als hij er nog niet is, te oud is of van een ander land/taal komt. */
  async function refreshCatalog(force = false) {
    try {
      const stored = (await chrome.storage.local.get([CATALOG_KEY]))[CATALOG_KEY];
      const fresh = stored && stored.v === 1 && stored.origin === location.origin &&
        stored.lang === (document.documentElement.lang || '') && Date.now() - stored.fetchedAt < CATALOG_MAX_AGE;
      if (fresh && !force) return stored;
      const catalog = await fetchCatalog();
      if (catalog) {
        await chrome.storage.local.set({ [CATALOG_KEY]: catalog });
        return catalog;
      }
      return stored || null;
    } catch (_) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------------------
  // Velden invullen
  // ---------------------------------------------------------------------------------------

  async function selectCategory(catalogId) {
    if (!Number.isInteger(catalogId)) return false;
    const catalog = await refreshCatalog();
    const node = catalog && catalog.nodes.find((n) => n[0] === catalogId);
    if (!node) return false; // deze categorie bestaat niet in de indeling van deze gebruiker

    const opened = await openDropdown('catalog-select-dropdown-input', 'catalog-select-dropdown-content');
    if (!opened) return false;
    const search = [...opened.content.querySelectorAll('input')].find((i) => i.type === 'text' || i.type === 'search');
    if (!search) {
      closeDropdown(opened.input);
      return false;
    }
    search.focus();
    setInputValue(search, node[2]);
    const radio = await waitFor(() => document.getElementById(`catalog-search-${catalogId}-radio`), 5000);
    if (!radio) {
      setInputValue(search, '');
      closeDropdown(opened.input);
      return false;
    }
    clickRow(radio);
    // Only a success if exactly this category is in the field (not Vinted's own suggestion from the title)
    const ok = await waitFor(() => !byTestId('catalog-select-dropdown-content') && norm(fieldValue(opened.input)) === norm(node[2]), 3000);
    if (!ok && byTestId('catalog-select-dropdown-content')) closeDropdown(opened.input);
    return !!ok;
  }

  async function selectBrand(brand) {
    if (!brand) return false;
    const opened = await openDropdown('brand-select-dropdown-input', 'brand-select-dropdown-content');
    if (!opened) return false;
    const search = await waitFor(() => byTestId('brand-search--input'), 2000);
    if (!search) {
      closeDropdown(opened.input);
      return false;
    }
    const want = norm(brand);
    const brandRows = () => [...(byTestId('brand-select-dropdown-content')?.querySelectorAll('li') || [])]
      .filter((li) => li.querySelector('input[id^="brand-radio-"]'));
    // Vinted toont eerst "populaire merken" en ververst de lijst pas na het typen: wacht tot de nieuwe lijst er is
    const signature = () => brandRows().map((li) => li.querySelector('input').id).join(',') +
      '|' + !!document.getElementById('custom-select-brand-radio');
    const before = signature();
    search.focus();
    setInputValue(search, brand);
    await waitFor(() => {
      const now = signature();
      return now !== before && now !== '|false';
    }, 5000);
    await sleep(300); // laat de lijst uitlopen

    const label = (li) => norm(li.innerText.split('\n')[0]);
    for (let attempt = 0; attempt < 2; attempt++) {
      const rows = brandRows();
      const exact = rows.find((li) => label(li) === want) ||
        rows.find((li) => label(li).replace(/'/g, '') === want.replace(/'/g, '')) ||
        rows.find((li) => label(li).startsWith(want + ' ')); // "Levi Strauss" → "Levi Strauss & Co."
      if (exact) {
        clickRow(exact.querySelector('input'));
      } else {
        const custom = document.getElementById('custom-select-brand-radio');
        if (!custom) break;
        clickRow(custom); // "Gebruik ... als merk"
      }
      if (await waitFor(() => fieldValue(opened.input), 1500)) break;
      await sleep(600); // lijst was nog in beweging: nog één keer
    }
    const ok = !!fieldValue(opened.input);
    if (byTestId('brand-select-dropdown-content')) closeDropdown(opened.input);
    return ok;
  }

  function sizeTokens(label) {
    const base = norm(label).replace(/\bcm\b/g, '').replace(/\beu\b/g, '').trim();
    const parts = String(label).split(/[\/|,()]/).map((p) => norm(p).replace(/\bcm\b/g, '').replace(/\beu\b/g, '').trim());
    return new Set([base, ...parts].filter(Boolean));
  }

  async function selectSize(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) return false;
    const opened = await openDropdown('category-size-single-grid-input', 'category-size-single-grid-content');
    if (!opened) return false;
    const options = [...opened.content.querySelectorAll('[data-testid*="-grid-option-"]')]
      .filter((el) => /^size-group-\d+-grid-option-\d+$/.test(el.getAttribute('data-testid')));
    for (const cand of candidates) {
      const want = norm(cand).replace(/\bcm\b/g, '').replace(/\beu\b/g, '').trim();
      if (!want) continue;
      const hit = options.find((el) => sizeTokens(el.innerText).has(want));
      if (hit) {
        realClick(hit);
        const ok = await waitFor(() => fieldValue(opened.input), 2000);
        if (byTestId('category-size-single-grid-content')) closeDropdown(opened.input);
        return !!ok;
      }
    }
    closeDropdown(opened.input);
    return false;
  }

  async function selectCondition(statusId) {
    if (!Number.isInteger(statusId)) return false;
    const opened = await openDropdown('category-condition-single-list-input', 'category-condition-single-list-content');
    if (!opened) return false;
    const cell = await waitFor(() => byTestId(`condition-${statusId}`), 2000);
    if (!cell) {
      closeDropdown(opened.input);
      return false;
    }
    realClick(cell);
    const ok = await waitFor(() => fieldValue(opened.input), 2000);
    if (byTestId('category-condition-single-list-content')) closeDropdown(opened.input);
    return !!ok;
  }

  async function selectMulti(inputId, contentId, prefix, ids, max) {
    if (!Array.isArray(ids) || ids.length === 0) return false;
    const opened = await openDropdown(inputId, contentId);
    if (!opened) return false;
    let picked = 0;
    for (const id of ids.slice(0, max)) {
      const opt = byTestId(`${prefix}-${id}`, opened.content);
      if (!opt) continue;
      const box = opt.closest('[aria-checked]') || opt.querySelector('[aria-checked]');
      if (box && box.getAttribute('aria-checked') === 'true') {
        picked++;
        continue;
      }
      realClick(opt);
      picked++;
      await sleep(250);
    }
    closeDropdown(opened.input);
    await sleep(250);
    return picked > 0 && !!fieldValue(opened.input);
  }

  /**
   * Vult alles in wat de AI voor Vinted heeft bepaald. Geeft per veld terug of het lukte.
   * Velden die al een waarde hebben (bijv. door de gebruiker gekozen) blijven staan.
   */
  async function fillVintedFields(v, opts = {}) {
    const done = {};
    if (!v || typeof v !== 'object') return done;

    if (opts.category !== false && Number.isInteger(v.catalogId)) {
      done.category = await selectCategory(v.catalogId);
    }
    // De extra velden verschijnen pas na de categorie
    const hasDetails = await waitFor(() => byTestId('category-condition-single-list-input') || byTestId('brand-select-dropdown-input'), 4000);
    if (!hasDetails) return done;
    await sleep(400);

    const empty = (testId) => {
      const el = byTestId(testId);
      return el && !fieldValue(el);
    };
    if (v.brand && empty('brand-select-dropdown-input')) done.brand = await selectBrand(v.brand);
    // No size readable on the photos: leave it to the user (not a failure)
    if (Array.isArray(v.sizeCandidates) && v.sizeCandidates.length && empty('category-size-single-grid-input')) {
      done.size = await selectSize(v.sizeCandidates);
    }
    if (empty('category-condition-single-list-input')) done.condition = await selectCondition(v.statusId);
    if (Array.isArray(v.colorIds) && v.colorIds.length && empty('color-select-dropdown-input')) {
      done.colors = await selectMulti('color-select-dropdown-input', 'color-select-dropdown-content', 'color', v.colorIds, 2);
    }
    // Materiaal is op Vinted optioneel: alleen invullen (en melden) als de AI het zeker weet
    if (Array.isArray(v.materialIds) && v.materialIds.length && empty('category-material-multi-list-input')) {
      done.material = await selectMulti('category-material-multi-list-input', 'category-material-multi-list-content', 'material', v.materialIds, 3);
    }
    return done;
  }

  /** Staat er een categorie in het formulier (van ons of Vinted's eigen voorstel)? */
  function hasCategory() {
    return !!fieldValue(byTestId('catalog-select-dropdown-input'));
  }

  window.AutoposterVinted = { refreshCatalog, fillVintedFields, selectCategory, hasCategory };

  // Boom alvast ophalen, zodat de volgende analyse in de popup de eigen lijst van de gebruiker gebruikt.
  setTimeout(() => { refreshCatalog(); }, 2500);
})();
