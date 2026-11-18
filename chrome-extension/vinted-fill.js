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

  const byTestId = (id, root = document) => {
    const exact = root.querySelector(`[data-testid="${id}"]`);
    if (exact) return exact;
    // Vinted heeft soms een variant van hetzelfde vak, bijvoorbeeld "category-size-single-grid_chips-input"
    // (maatvak met keuzeknoppen S/M/L, EU, UK; gezien bij damesvesten, 17-11-2026). Opties heten hetzelfde.
    const m = /^(.+)-(input|content)$/.exec(id);
    if (!m || id.includes('--')) return null;
    return root.querySelector(`[data-testid^="${m[1]}_"][data-testid$="-${m[2]}"]:not([data-testid*="--"])`);
  };

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
      // Ruim wachten vóór de andere klik: is Vinted traag en gaat de lijst net daarna alsnog open,
      // dan zou de tweede klik hem weer dichtdoen (18-11-2026: kleur bleef leeg).
      if (!(await waitFor(() => byTestId(contentTestId), 2500))) {
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

  // Waarom de laatste categoriekeuze mislukte (gaat mee in de meting na het plakken)
  let lastCategoryReason = '';

  /**
   * Kiest de categorie. Vlak na het uploaden van de foto's is Vinted zelf nog bezig (het zoekt een categorievoorstel
   * en tekent het vak opnieuw); een poging kan dan mislukken. Daarom tot 3 pogingen, elke keer met verse elementen.
   */
  async function selectCategory(catalogId) {
    lastCategoryReason = '';
    if (!Number.isInteger(catalogId)) { lastCategoryReason = 'no-id'; return false; }
    const catalog = await refreshCatalog();
    const node = catalog && catalog.nodes.find((n) => n[0] === catalogId);
    if (!node) { lastCategoryReason = 'not-in-tree'; return false; } // bestaat niet in de indeling van deze gebruiker
    for (let attempt = 1; attempt <= 3; attempt++) {
      if (await trySelectCategory(node)) {
        lastCategoryReason = attempt > 1 ? `ok-attempt-${attempt}` : '';
        return true;
      }
      await sleep(1200);
    }
    return false;
  }

  async function trySelectCategory(node) {
    const [catalogId, , title] = node;
    const current = () => byTestId('catalog-select-dropdown-input');
    const opened = await openDropdown('catalog-select-dropdown-input', 'catalog-select-dropdown-content');
    if (!opened) { lastCategoryReason = 'not-open'; return false; }
    const search = [...opened.content.querySelectorAll('input')].find((i) => i.type === 'text' || i.type === 'search');
    if (!search) {
      lastCategoryReason = 'no-search';
      closeDropdown(current() || opened.input);
      return false;
    }
    search.focus();
    setInputValue(search, title);
    const radio = await waitFor(() => document.getElementById(`catalog-search-${catalogId}-radio`), 5000);
    if (!radio) {
      lastCategoryReason = 'no-result';
      setInputValue(search, '');
      closeDropdown(current() || opened.input);
      return false;
    }
    clickRow(radio);
    // Alleen gelukt als precies deze categorie in het vak staat (niet Vinted's eigen voorstel uit de titel)
    const ok = await waitFor(() => !byTestId('catalog-select-dropdown-content') && norm(fieldValue(current())) === norm(title), 3000);
    if (!ok) {
      lastCategoryReason = 'not-applied';
      if (byTestId('catalog-select-dropdown-content')) closeDropdown(current() || opened.input);
    }
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
      if (await waitFor(() => fieldValue(byTestId(opened.input.getAttribute('data-testid')) || opened.input), 1500)) break;
      await sleep(600); // lijst was nog in beweging: nog één keer
    }
    const ok = !!fieldValue(byTestId(opened.input.getAttribute('data-testid')) || opened.input);
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
        const ok = await waitFor(() => fieldValue(byTestId(opened.input.getAttribute('data-testid')) || opened.input), 2000);
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
    const ok = await waitFor(() => fieldValue(byTestId(opened.input.getAttribute('data-testid')) || opened.input), 2000);
    if (byTestId('category-condition-single-list-content')) closeDropdown(opened.input);
    return !!ok;
  }

  async function selectMulti(inputId, contentId, prefix, ids, max, replace = false) {
    if (!Array.isArray(ids) || ids.length === 0) return false;
    const opened = await openDropdown(inputId, contentId);
    if (!opened) return false;
    const want = new Set(ids.slice(0, max).map((id) => `${prefix}-${id}`));
    const isChecked = (opt) => {
      const box = opt.closest('[aria-checked]') || opt.querySelector('[aria-checked]');
      return !!box && box.getAttribute('aria-checked') === 'true';
    };
    if (replace) {
      // Vinted zette er zelf iets in (eigen voorstel uit de foto's): haal dat eerst weg
      for (const opt of opened.content.querySelectorAll(`[data-testid^="${prefix}-"]`)) {
        const tid = opt.getAttribute('data-testid');
        if (/^\w+-\d+$/.test(tid) && !want.has(tid) && isChecked(opt)) {
          realClick(opt);
          await sleep(200);
        }
      }
    }
    let picked = 0;
    // Na elk vinkje tekent Vinted de lijst opnieuw (gezien 17-11-2026): elke keer de lijst vers opzoeken,
    // zo nodig opnieuw openen, en nakijken of het vinkje er echt staat.
    for (const id of ids.slice(0, max)) {
      for (let attempt = 0; attempt < 3; attempt++) {
        let content = byTestId(contentId);
        if (!content) {
          const again = await openDropdown(inputId, contentId);
          if (!again) break;
          content = again.content;
        }
        const opt = byTestId(`${prefix}-${id}`, content);
        if (!opt) break; // deze optie bestaat niet bij deze categorie
        if (isChecked(opt)) { picked++; break; }
        realClick(opt);
        await sleep(350);
        const check = byTestId(`${prefix}-${id}`, byTestId(contentId) || document);
        if (check && isChecked(check)) { picked++; break; }
      }
    }
    if (byTestId(contentId)) closeDropdown(byTestId(inputId) || opened.input);
    await sleep(250);
    return picked > 0 && !!fieldValue(byTestId(inputId) || opened.input);
  }

  const DETAIL_FIELDS = ['brand-select-dropdown-input', 'category-size-single-grid-input',
    'category-condition-single-list-input', 'color-select-dropdown-input', 'category-material-multi-list-input'];

  /** Welke vakken al een waarde hadden vóór het plakken (die heeft de gebruiker zelf gekozen). */
  function filledFields() {
    return DETAIL_FIELDS.filter((t) => fieldValue(byTestId(t))); // basisnamen (ook als Vinted een variant toont)
  }

  /**
   * Vult alles in wat de AI voor Vinted heeft bepaald. Geeft per veld terug of het lukte.
   * Wat de gebruiker vóór het plakken zelf koos (opts.userFilled) blijft staan. Wat Vinted er tijdens het plakken zelf
   * in zet (Vinted stelt na elke foto een merk e.d. voor, en dat is vaak fout) mag de AI-waarde vervangen.
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

    const userFilled = new Set(Array.isArray(opts.userFilled) ? opts.userFilled : []);
    // Invullen als het vak bestaat en de gebruiker het niet zelf vóór het plakken had ingevuld
    const empty = (testId) => {
      const el = byTestId(testId);
      return !!el && !userFilled.has(testId) && (!fieldValue(el) || opts.replaceVinted !== false);
    };
    const replace = (testId) => !!fieldValue(byTestId(testId));
    // Vinted tekent het formulier soms opnieuw terwijl we bezig zijn (trage verbinding). Mislukt een vak,
    // dan na een korte pauze nog één keer proberen (18-11-2026: kleur bleef leeg bij een trage Vinted).
    const twice = async (fn) => {
      if (await fn()) return true;
      await sleep(1500);
      return !!(await fn());
    };
    if (v.brand && empty('brand-select-dropdown-input')) {
      const sameBrand = () => {
        const now = norm(fieldValue(byTestId('brand-select-dropdown-input')));
        return !!now && now === norm(v.brand);
      };
      done.brand = sameBrand() ? true : await twice(async () => sameBrand() || selectBrand(v.brand));
    }
    // No size readable on the photos: leave it to the user (not a failure)
    if (Array.isArray(v.sizeCandidates) && v.sizeCandidates.length && empty('category-size-single-grid-input')) {
      done.size = await twice(() => selectSize(v.sizeCandidates));
    }
    if (empty('category-condition-single-list-input')) done.condition = await twice(() => selectCondition(v.statusId));
    if (Array.isArray(v.colorIds) && v.colorIds.length && empty('color-select-dropdown-input')) {
      done.colors = await twice(() => selectMulti('color-select-dropdown-input', 'color-select-dropdown-content', 'color', v.colorIds, 2, replace('color-select-dropdown-input')));
    }
    // Materiaal is op Vinted optioneel: alleen invullen (en melden) als de AI het zeker weet
    if (Array.isArray(v.materialIds) && v.materialIds.length && empty('category-material-multi-list-input')) {
      done.material = await twice(() => selectMulti('category-material-multi-list-input', 'category-material-multi-list-content', 'material', v.materialIds, 3, replace('category-material-multi-list-input')));
    }
    return done;
  }

  /** Staat er een categorie in het formulier (van ons of Vinted's eigen voorstel)? */
  function hasCategory() {
    return !!fieldValue(byTestId('catalog-select-dropdown-input'));
  }

  window.AutoposterVinted = {
    refreshCatalog, fillVintedFields, selectCategory, hasCategory,
    categoryReason: () => lastCategoryReason,
    filledFields,
  };

  // Boom alvast ophalen, zodat de volgende analyse in de popup de eigen lijst van de gebruiker gebruikt.
  setTimeout(() => { refreshCatalog(); }, 2500);
})();
