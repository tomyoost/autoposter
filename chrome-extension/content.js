// Autoposter - Content Script for "Plakken" (auto-paste) on Vinted
// Fills photos, title, description, price, category, brand, size, condition, colour and material on the Vinted sell/edit page.
// config.js is loaded before this file (manifest content_scripts).

// Verbose console logging + "Copy debug info" button. Follows AP_CONFIG.DEV_MODE (false in store builds).
const DEBUG_MODE = typeof AP_CONFIG !== 'undefined' && AP_CONFIG.DEV_MODE === true;

const PLATFORM_SELECTORS = {
  vinted: {
    // Enhanced selectors for Vinted's dynamic UI
    titleField: [
      'input[data-testid="title--input"]',
      'input[data-testid="title-input"]',
      'input[name="title"]',
      '.web_ui__Input__input input[type="text"]',
      'input[placeholder*="titel" i]',
      'input[placeholder*="title" i]',
      '[data-testid="title"] input',
      'form input[type="text"]:first-of-type'
    ],
    descriptionField: [
      'textarea[data-testid="description--input"]',
      'textarea[data-testid="description-input"]',
      'textarea[name="description"]',
      '.web_ui__Textarea__textarea',
      'textarea[placeholder*="beschrijf" i]',
      'textarea[placeholder*="describe" i]',
      '[data-testid="description"] textarea',
      'form textarea'
    ],
    priceField: [
      'input[data-testid="price-input--input"]',
      'input[data-testid="price-input"]',
      'input[name="price"]',
      'input[inputmode="decimal"]',
      'input[type="number"]',
      'input[placeholder*="prijs" i]',
      'input[placeholder*="price" i]',
      '[data-testid="price"] input'
    ],
    categoryButton: [
      '.web_ui__Cell__cell[data-testid="catalog-selection-cell"]',
      '[data-testid="category-select"]',
      'button[data-testid="category"]',
      '.category-selector',
      '[class*="CategorySelect"]',
      'div[role="button"][class*="Cell"]'
    ],
    categoryModal: [
      '.web_ui__Modal__modal',
      '[role="dialog"]',
      '.ReactModal__Content',
      '[data-testid="catalog-modal"]'
    ],
    categorySearchInput: [
      'input[type="search"]',
      'input[placeholder*="zoek" i]',
      'input[placeholder*="search" i]',
      'input[placeholder*="Zoeken" i]',
      '.web_ui__Input__input input',
      '[role="dialog"] input[type="text"]',
      '[role="dialog"] input:not([type="hidden"])'
    ],
    categoryItem: [
      '[role="option"]',
      '.category-list-item',
      '[data-testid="category-item"]',
      'li[class*="Category"]',
      'button[class*="ListItem"]',
      '[class*="catalog"] li',
      '[class*="catalog"] button',
      'li button',
      '[class*="Cell"] button'
    ],
    uploadZone: [
      'input[type="file"][accept*="image"]',
      '[data-testid="photo-upload"]',
      '.upload-dropzone',
      '[class*="PhotoUpload"]',
      '[class*="ImageUpload"]',
      '[class*="dropzone"]',
      'label[for*="photo"]',
      'label[for*="image"]'
    ]
  }
};

// Translations
// Language: the user's choice in the popup, otherwise the browser (Dutch for nl/nl-BE)
const BROWSER_LANG = (navigator.language || '').toLowerCase().startsWith('nl') ? 'nl' : 'en';
let currentLang = BROWSER_LANG;

const translations = {
  nl: {
    paste: 'Plakken',
    filling: 'Invullen...',
    filled: 'Ingevuld',
    filledFields: 'Ingevuld',
    noData: 'Nog niets om te plakken. Klik in de Autoposter-popup op \'Open\' of \'Kopieer\'.',
    fieldsNotFound: 'Velden niet gevonden. Tekst gekopieerd - plak met Ctrl+V',
    couldNotFill: 'Kon niet invullen. Probeer handmatig.',
    platformNotRecognized: 'Platform niet herkend',
    categoryHint: 'Selecteer categorie handmatig',
    title: 'titel',
    description: 'beschrijving',
    price: 'prijs',
    partialSuccess: 'Deels ingevuld',
    copyFallback: 'Gekopieerd naar klembord - plak met Ctrl+V',
    step1Category: 'Stap 1/3: Categorie selecteren...',
    step2Fields: 'Stap 2/3: Velden invullen...',
    step3Done: 'Klaar!',
    categoryNotFound: 'Categorie niet gevonden, selecteer handmatig',
    categorySelected: 'Categorie geselecteerd',
    searchingCategory: 'Categorie zoeken...',
    uploadingPhotos: 'Foto\'s uploaden...',
    photosUploaded: 'foto\'s geüpload',
    photoUploadFailed: 'Foto upload mislukt, upload handmatig',
    stepPhotos: 'Stap 1/3: Foto\'s uploaden...',
    stepCategory: 'Stap 3/3: Categorie selecteren...',
    stepFields: 'Stap 2/3: Titel, beschrijving en prijs invullen...',
    stepDetails: 'Stap 3/3: Merk, maat, staat en kleur invullen...',
    manualFields: 'Zelf invullen',
    category: 'categorie',
    brand: 'merk',
    size: 'maat',
    condition: 'staat',
    colors: 'kleur',
    material: 'materiaal',
    failed: 'mislukt'
  },
  en: {
    paste: 'Paste',
    filling: 'Filling...',
    filled: 'Filled',
    filledFields: 'Filled',
    noData: 'Nothing to paste yet. Click \'Open\' or \'Copy\' in the Autoposter popup.',
    fieldsNotFound: 'Fields not found. Text copied - paste with Ctrl+V',
    couldNotFill: 'Could not fill. Try manually.',
    platformNotRecognized: 'Platform not recognized',
    categoryHint: 'Select category manually',
    title: 'title',
    description: 'description',
    price: 'price',
    partialSuccess: 'Partially filled',
    copyFallback: 'Copied to clipboard - paste with Ctrl+V',
    step1Category: 'Step 1/3: Selecting category...',
    step2Fields: 'Step 2/3: Filling fields...',
    step3Done: 'Done!',
    categoryNotFound: 'Category not found, select manually',
    categorySelected: 'Category selected',
    searchingCategory: 'Searching category...',
    uploadingPhotos: 'Uploading photos...',
    photosUploaded: 'photos uploaded',
    photoUploadFailed: 'Photo upload failed, upload manually',
    stepPhotos: 'Step 1/3: Uploading photos...',
    stepCategory: 'Step 3/3: Selecting category...',
    stepFields: 'Step 2/3: Filling title, description and price...',
    stepDetails: 'Step 3/3: Filling brand, size, condition and colour...',
    manualFields: 'Fill in yourself',
    category: 'category',
    brand: 'brand',
    size: 'size',
    condition: 'condition',
    colors: 'colour',
    material: 'material',
    failed: 'failed'
  }
};

// Category translations for NL ↔ EN matching on Vinted
const categoryTranslations = {
  // Main categories
  'Women': ['Women', 'Dames', 'women', 'dames'],
  'Men': ['Men', 'Heren', 'men', 'heren'],
  'Kids': ['Kids', 'Kinderen', 'kids', 'kinderen'],
  'Home': ['Home', 'Wonen', 'home', 'wonen'],
  'Electronics': ['Electronics', 'Elektronica', 'electronics', 'elektronica'],
  'Entertainment': ['Entertainment', 'entertainment'],
  'Hobbies & Collectables': ['Hobbies & Collectables', 'Hobby\'s & Verzamelingen', 'hobbies', 'hobby\'s'],
  'Sports': ['Sports', 'Sport', 'sports', 'sport'],
  
  // Clothing level
  'Clothing': ['Clothing', 'Kleding', 'clothing', 'kleding', 'Clothes', 'clothes', 'Apparel', 'apparel', "Women's clothing", "Women\u2019s clothing", 'Womenswear', 'womenswear'],
  'Shoes': ['Shoes', 'Schoenen', 'shoes', 'schoenen'],
  'Accessories': ['Accessories', 'Accessoires', 'accessories', 'accessoires'],
  
  // Dress types
  'Dresses': ['Dresses', 'Jurken', 'dresses', 'jurken'],
  'Long dresses': ['Long dresses', 'Lange jurken', 'Maxi jurken', 'long dresses', 'lange jurken', 'maxi jurken', 'maxi dresses'],
  'Midi dresses': ['Midi dresses', 'Midi jurken', 'midi dresses', 'midi jurken'],
  'Mini dresses': ['Mini dresses', 'Mini-dresses', 'Mini jurken', 'Korte jurken', 'mini dresses', 'mini-dresses', 'mini jurken', 'korte jurken'],
  
  // Tops
  'Tops': ['Tops', 'tops'],
  'Tops & t-shirts': ['Tops & t-shirts', 'Tops & T-shirts', 'tops & t-shirts'],
  'T-shirts': ['T-shirts', 't-shirts'],
  'Blouses': ['Blouses', 'blouses'],
  'Shirts': ['Shirts', 'Overhemden', 'shirts', 'overhemden'],
  
  // Bottoms
  'Trousers': ['Trousers', 'Broeken', 'trousers', 'broeken'],
  'Jeans': ['Jeans', 'Spijkerbroeken', 'jeans', 'spijkerbroeken'],
  'Skirts': ['Skirts', 'Rokken', 'skirts', 'rokken'],
  'Shorts': ['Shorts', 'Korte broeken', 'shorts', 'korte broeken'],
  
  // Outerwear
  'Jackets': ['Jackets', 'Jassen', 'jackets', 'jassen'],
  'Coats': ['Coats', 'Winterjassen', 'coats', 'winterjassen'],
  'Jumpers': ['Jumpers', 'Truien', 'jumpers', 'truien'],
  'Sweaters': ['Sweaters', 'Sweaters', 'sweaters'],
  'Hoodies': ['Hoodies', 'hoodies'],
  
  // Shoe types
  'Sneakers': ['Sneakers', 'sneakers'],
  'Boots': ['Boots', 'Laarzen', 'boots', 'laarzen'],
  'Heels': ['Heels', 'Hakken', 'heels', 'hakken'],
  'Sandals': ['Sandals', 'Sandalen', 'sandals', 'sandalen'],
  'Flats': ['Flats', 'Platte schoenen', 'flats', 'platte schoenen'],
  
  // Other categories
  'Bags': ['Bags', 'Tassen', 'bags', 'tassen'],
  'Jewellery': ['Jewellery', 'Sieraden', 'jewellery', 'sieraden'],
  'Video games & consoles': ['Video games & consoles', 'Videogames & consoles', 'video games', 'videogames'],
  'Games': ['Games', 'Spellen', 'games', 'spellen']
};

// Expand a category term to all NL/EN synonyms
function expandSynonyms(levelText) {
  if (!levelText) return [levelText];

  const addVariants = (set, term) => {
    if (!term) return;
    const raw = String(term);
    const unified = raw.replace(/[–—]/g, '-').trim();
    const spaced = unified.replace(/\s+/g, ' ').trim();
    const hyphenated = spaced.replace(/\s+/g, '-');
    const dehyphenated = spaced.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();

    set.add(spaced);
    set.add(spaced.toLowerCase());
    set.add(hyphenated);
    set.add(hyphenated.toLowerCase());
    set.add(dehyphenated);
    set.add(dehyphenated.toLowerCase());
  };

  const lowerText = String(levelText).toLowerCase().trim();

  // Check all translation entries
  for (const [key, synonyms] of Object.entries(categoryTranslations)) {
    const lowerSynonyms = synonyms.map(s => String(s).toLowerCase());
    if (lowerSynonyms.includes(lowerText) || key.toLowerCase() === lowerText) {
      const out = new Set();
      addVariants(out, key);
      synonyms.forEach(s => addVariants(out, s));
      return Array.from(out).filter(Boolean);
    }
  }

  // No match found, return original with variations
  const out = new Set();
  addVariants(out, levelText);
  return Array.from(out).filter(Boolean);
}

// Expose for use in selectLevelGlobally.
// NOTE: categories.js is not loaded on Vinted (popup only). Even when it was, this declaration
// replaced its global expandSynonyms, so this has always been the engine used on Vinted.
if (!window.expandSynonyms) {
  window.expandSynonyms = expandSynonyms;
}

function t(key) {
  return translations[currentLang]?.[key] || translations['en'][key] || key;
}

// Load language setting
function loadLanguage() {
  chrome.storage.local.get(['language'], (result) => {
    currentLang = result.language || BROWSER_LANG;
    updateButtonText();
  });
}

const AP_BOLT_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style="flex:none"><path d="M9.2 1.5L3.5 9h4l-1 5.5L12.5 7h-4l.7-5.5z" fill="currentColor"/></svg>';
const AP_SPINNER = '<span class="autoposter-spinner" aria-hidden="true"></span>';

function updateButtonText() {
  const btn = document.getElementById('autoposter-paste-btn');
  if (btn && !btn.disabled) {
    btn.innerHTML = `${AP_BOLT_SVG}<span>${t('paste')}</span>`;
  }
}

// Detect current platform (this script only runs on Vinted, see manifest)
function detectPlatform() {
  return /(^|\.)vinted\.[a-z.]+$/i.test(location.hostname) ? 'vinted' : null;
}

// Create paste button
function createPasteButton() {
  const btn = document.createElement('button');
  btn.id = 'autoposter-paste-btn';
  btn.innerHTML = `${AP_BOLT_SVG}<span>${t('paste')}</span>`;
  btn.type = 'button';
  btn.title = 'Autoposter';
  // Opmaak staat in content.css (marineblauw zoals het logo, zwevende knop rechtsonder)
  
  btn.addEventListener('click', handlePaste);
  
  return btn;
}

// Try multiple selectors to find a field
function findField(selectors) {
  if (typeof selectors === 'string') {
    selectors = selectors.split(', ');
  }
  
  for (const selector of selectors) {
    try {
      const field = document.querySelector(selector);
      if (field && isElementVisible(field)) {
        return field;
      }
    } catch (e) {
      // Invalid selector, skip
    }
  }
  return null;
}

// Check if element is visible
function isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  
  // Basic visibility checks
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (style.opacity === '0') return false;
  
  // offsetParent is null for fixed/absolute positioned elements (portals/dropdowns)
  // Allow these! Only check offsetParent for static/relative positioned elements
  if (style.position !== 'fixed' && style.position !== 'absolute') {
    if (el.offsetParent === null && el.tagName !== 'BODY') return false;
  }
  
  // Check element has actual dimensions
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Set field value using native setter (for React/Vue apps)
function setNativeValue(element, value) {
  const isTextArea = element.tagName === 'TEXTAREA';
  const prototype = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  
  // Reset React's internal value tracker so it detects the change
  const tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue('');
  }
  
  if (nativeSetter) {
    nativeSetter.call(element, value);
  } else {
    element.value = value;
  }
  
  // Dispatch events for React/Vue/Angular
  element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
}

// Fill a field with value (enhanced for React/Vue apps)
function fillField(selectors, value, fieldName) {
  if (!value) return { success: false, fieldName };
  
  const field = findField(selectors);
  
  if (!field) {
    debugLog(`${fieldName} field not found`);
    return { success: false, fieldName };
  }
  
  try {
    // Focus the field first
    field.focus();
    
    // Use native setter
    setNativeValue(field, value);
    
    // Some frameworks need blur to register the change
    setTimeout(() => {
      field.dispatchEvent(new Event('blur', { bubbles: true }));
    }, 50);
    
    debugLog(`${fieldName} filled successfully`);
    return { success: true, fieldName };
  } catch (error) {
    console.error(`AutoPoster: Error filling ${fieldName}:`, error);
    return { success: false, fieldName };
  }
}

// Wait for element to appear (for dynamic loading)
function waitForElement(selectors, timeout = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      const element = findField(selectors);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve(null);
        return;
      }
      
      requestAnimationFrame(check);
    };
    
    check();
  });
}

// ============================================
// VINTED CATEGORY AUTOFILL - INLINE DOM VERSION
// No modals - works within category card container
// Uses chevron state + input.value as success condition
// ============================================

// Category picker diagnostics (for support/debug)
let activeDropdownRoot = null;
let __autoposterLastCategoryDiagnostics = null;

// Helper: safe clipboard copy
async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Copy last diagnostics JSON to clipboard (easy to share)
window.copyAutoPosterDiagnostics = async function copyAutoPosterDiagnostics() {
  try {
    const payload = __autoposterLastCategoryDiagnostics || { error: 'No diagnostics captured yet' };
    const text = JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(text);
    debugLog('✅ Diagnostics copied to clipboard');
    return payload;
  } catch (e) {
    debugWarn('❌ Failed to copy diagnostics', e);
    return __autoposterLastCategoryDiagnostics;
  }
};

function debugLog(...args) {
  if (DEBUG_MODE) console.log('AutoPoster:', ...args);
}

function debugWarn(...args) {
  if (DEBUG_MODE) console.warn('AutoPoster:', ...args);
}

function setCategoryDiagnostics(update) {
  __autoposterLastCategoryDiagnostics = {
    ts: new Date().toISOString(),
    url: location.href,
    ...(__autoposterLastCategoryDiagnostics || {}),
    ...(update || {})
  };
}

// Detect Vinted error modal ("Something went wrong", etc.)
function detectVintedErrorModal() {
  const errorIndicators = [
    'Something went wrong',
    'Er is iets misgegaan',
    'Oops',
    'system error',
    'systeemfout',
    'try again later',
    'probeer het later'
  ];
  
  // Check for modal dialogs first
  const modals = document.querySelectorAll('[role="dialog"], [class*="modal" i], [class*="Modal"], [class*="error" i], [class*="Error"]');
  
  for (const modal of modals) {
    if (!isElementVisible(modal)) continue;
    const modalText = modal.innerText || modal.textContent || '';
    
    for (const indicator of errorIndicators) {
      if (modalText.toLowerCase().includes(indicator.toLowerCase())) {
        debugWarn(`⚠️ Vinted error modal detected: "${indicator}"`);
        return true;
      }
    }
  }
  
  return false;
}

function getElementSummary(el) {
  if (!el) return null;
  const rect = el.getBoundingClientRect?.();
  return {
    tag: el.tagName,
    role: el.getAttribute?.('role') || null,
    testid: el.getAttribute?.('data-testid') || null,
    class: (el.className || '').toString().slice(0, 120),
    rect: rect ? { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) } : null
  };
}

function getVisibleTextSamples(scope, limit = 18) {
  const root = scope && scope.querySelectorAll ? scope : document;
  const items = Array.from(root.querySelectorAll('[role="option"], li, button, [tabindex]'))
    .filter(el => isPortalItemVisible(el) && !isInHeader(el))
    .map(el => (el.textContent || '').trim())
    .filter(Boolean);
  return items.slice(0, limit);
}

function dispatchMouseClick(el) {
  if (!el) return;
  try {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
  } catch (e) {
    try {
      el.click();
    } catch {
      // ignore
    }
  }
}

function resolveClickableTarget(el) {
  if (!el) return null;

  const isClickable = (node) => {
    if (!node || node.nodeType !== 1) return false;
    const tag = node.tagName;
    const role = node.getAttribute?.('role');
    return (
      tag === 'BUTTON' ||
      tag === 'A' ||
      role === 'option' ||
      role === 'menuitem' ||
      role === 'button' ||
      node.getAttribute?.('tabindex') !== null ||
      typeof node.onclick === 'function'
    );
  };

  if (isClickable(el)) return el;

  // Many UIs render the click-handler on a child (button/a) inside an li
  const child = el.querySelector?.('button, a, [role="option"], [role="menuitem"], [role="button"], [tabindex]');
  if (child && isClickable(child)) return child;

  // Or on a parent wrapper
  let parent = el.parentElement;
  for (let i = 0; i < 6 && parent; i++) {
    if (isClickable(parent)) return parent;
    parent = parent.parentElement;
  }

  return el;
}

function normalizeUiText(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function isShadowHost(el) {
  return !!(el && el.shadowRoot);
}

function querySelectorAllDeep(selector, root = document) {
  const results = [];
  const visited = new Set();

  const walk = (node) => {
    if (!node || visited.has(node)) return;
    visited.add(node);

    let scope;
    if (node instanceof Document) scope = node;
    else if (node instanceof ShadowRoot) scope = node;
    else if (node instanceof Element) scope = node;
    else return;

    try {
      results.push(...scope.querySelectorAll(selector));
    } catch {
      // ignore invalid selector
    }

    const elements = scope.querySelectorAll ? scope.querySelectorAll('*') : [];
    for (const el of elements) {
      if (isShadowHost(el)) {
        walk(el.shadowRoot);
      }
    }
  };

  walk(root);
  return results;
}

function detectSuggestedCategory() {
  // Vinted may show a "Suggested" category block that can interfere with opening the real picker.
  const suggestedKeywords = ['suggested', 'aanbevolen', 'recommended'];
  const changeKeywords = ['change', 'select', 'edit', 'wijzig', 'kies', 'bewerken', 'aanpassen'];

  const all = Array.from(document.querySelectorAll('div, section, article, li'));
  let suggestedEl = null;

  for (const el of all) {
    const text = normalizeUiText(el.textContent);
    if (!text) continue;
    if (suggestedKeywords.some(k => text.includes(k))) {
      if (isElementVisible(el)) {
        suggestedEl = el;
        break;
      }
    }
  }

  if (!suggestedEl) {
    return { exists: false, visible: false, textSnippet: null, clickTargetCandidate: null };
  }

  // Find a nearby CTA button to switch/change category selection
  let container = suggestedEl;
  for (let i = 0; i < 6 && container; i++) {
    const buttons = Array.from(container.querySelectorAll('button, [role="button"]'));
    const cta = buttons.find(b => changeKeywords.some(k => normalizeUiText(b.textContent).includes(k)));
    if (cta && isElementVisible(cta)) {
      return {
        exists: true,
        visible: true,
        textSnippet: (suggestedEl.textContent || '').trim().slice(0, 140),
        clickTargetCandidate: cta
      };
    }
    container = container.parentElement;
  }

  return {
    exists: true,
    visible: true,
    textSnippet: (suggestedEl.textContent || '').trim().slice(0, 140),
    clickTargetCandidate: null
  };
}

async function waitForDropdownRender(timeoutMs = 2000) {
  // Try immediate scan first
  const findBestRoot = () => {
    const candidates = [];

    const listboxes = querySelectorAllDeep('[role="listbox"]');
    for (const lb of listboxes) {
      if (!isPortalItemVisible(lb)) continue;
      candidates.push(lb);
    }

    // Fallback: common dropdown/portal containers
    const containers = querySelectorAllDeep('ul, [data-testid], [class*="dropdown" i], [class*="menu" i], [class*="list" i]');
    for (const c of containers) {
      if (!isPortalItemVisible(c)) continue;
      candidates.push(c);
    }

    const uniq = Array.from(new Set(candidates));

    const scoreRoot = (root) => {
      const items = root.querySelectorAll('[role="option"], li, button, [tabindex]');

      const rootTextLower = normalizeUiText(root.textContent || '');

      // Heuristic: this is a global nav / page list, not the actual category picker.
      // We've seen false-positives where the listing-form <ul> contains "Catalogue sections" and gets picked.
      const containsCatalogueSections =
        rootTextLower.includes('catalogue sections') ||
        rootTextLower.includes('catalogussecties') ||
        rootTextLower.includes('catalogus secties');

      // Another false-positive: the container that *contains the input itself* is usually the form, not the dropdown.
      const containsCategoryInput = !!root.querySelector?.('[data-testid="catalog-select-dropdown-input"]');

      const visibleTexts = Array.from(items)
        .filter(el => isPortalItemVisible(el) && !isInHeader(el))
        .map(el => (el.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      const shortTexts = visibleTexts.filter(t => t.length > 0 && t.length <= 40);
      const longTexts = visibleTexts.filter(t => t.length > 80);

      // Keep samples readable; huge list-item text is a strong hint we picked the wrong container.
      const sample = shortTexts.slice(0, 30);

      const sampleLower = sample.map(s => normalizeUiText(s));
      const hasTopLevel = ['women', 'men', 'kids', 'home', 'electronics', 'entertainment', 'hobbies & collectables', 'sports']
        .some(k => sampleLower.includes(k));

      // Anchor: Find a category search input (confirmed by user)
      const hasFindInput = !!root.querySelector(
        'input[type="search"], input[placeholder*="find a category" i], input[aria-label*="find a category" i]'
      );

      // Some Vinted UIs put the input outside listbox; also check parent chain up to a few levels.
      let parentHasFindInput = false;
      let parent = root.parentElement;
      for (let i = 0; i < 4 && parent; i++) {
        if (parent.querySelector?.('input[type="search"], input[placeholder*="find a category" i], input[aria-label*="find a category" i]')) {
          parentHasFindInput = true;
          break;
        }
        parent = parent.parentElement;
      }

      let score = 0;
      const breakdown = {
        itemCount: items.length,
        shortItemCount: shortTexts.length,
        longItemCount: longTexts.length,
        hasTopLevel,
        hasFindInput,
        parentHasFindInput,
        containsCatalogueSections,
        containsCategoryInput,
      };

      // Weighting: heavily prefer "Find a category" search, otherwise rely on "many short items".
      if (hasFindInput) score += 120;
      if (parentHasFindInput) score += 70;

      // Top-level categories are helpful but show up in other menus too.
      if (hasTopLevel) score += 15;

      score += Math.min(shortTexts.length, 60);
      score -= Math.min(longTexts.length, 30) * 4;

      // Hard penalties for known false positives.
      if (containsCatalogueSections) score -= 220;
      if (containsCategoryInput) score -= 60;

      return { root, count: items.length, sample: sample.slice(0, 12), score, breakdown };
    };

    const scored = uniq
      .map(scoreRoot)
      // Require "option-like" density; this avoids picking the listing form container.
      .filter(x => x.breakdown.shortItemCount >= 4)
      // Require some confidence.
      .filter(x => x.score >= 25)
      .sort((a, b) => b.score - a.score);

    return scored[0] || null;
  };

  const immediate = findBestRoot();
  if (immediate && immediate.count > 0) {
    return immediate;
  }

  return await new Promise((resolve) => {
    const start = Date.now();
    let resolved = false;
    const observer = new MutationObserver(() => {
      if (resolved) return;
      const best = findBestRoot();
      if (best && best.count > 0) {
        resolved = true;
        observer.disconnect();
        resolve(best);
      } else if (Date.now() - start > timeoutMs) {
        resolved = true;
        observer.disconnect();
        resolve(null);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    // timeout guard
    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      observer.disconnect();
      resolve(null);
    }, timeoutMs + 50);
  });
}

// Detect if a loading spinner is visible near the category input
function detectLoadingSpinner() {
  const spinnerSelectors = [
    '[class*="Loader" i]',
    '[class*="Loading" i]',
    '[class*="Spinner" i]',
    '[class*="spinner" i]',
    '[role="progressbar"]',
    '[aria-busy="true"]',
    'svg[class*="spin" i]',
    '.web_ui__Loader',
    '[data-testid*="loader" i]',
    '[data-testid*="loading" i]'
  ];
  
  for (const sel of spinnerSelectors) {
    try {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (isElementVisible(el)) {
          const rect = el.getBoundingClientRect();
          // Only count spinners in the main content area (not header/footer)
          if (rect.y > 100 && rect.y < window.innerHeight - 100) {
            return { found: true, selector: sel, rect };
          }
        }
      }
    } catch (e) { /* invalid selector */ }
  }
  return { found: false };
}

// Wait for loading spinner to disappear (max 3s)
async function waitForSpinnerToDisappear(maxWait = 3000) {
  const start = Date.now();
  let spinnerInfo = detectLoadingSpinner();
  
  while (spinnerInfo.found && Date.now() - start < maxWait) {
    debugLog('⏳ Waiting for spinner to disappear...');
    await new Promise(r => setTimeout(r, 200));
    spinnerInfo = detectLoadingSpinner();
  }
  
  return {
    hadSpinner: Date.now() - start > 200,
    waitedMs: Date.now() - start,
    stillLoading: spinnerInfo.found
  };
}

async function openCategoryPicker(categoryInput) {
  const suggested = detectSuggestedCategory();

  // Try multiple open strategies
  const attempts = [];
  const tryAttempt = async (name, fn) => {
    try {
      await fn();
      attempts.push({ name, ok: true });
    } catch (e) {
      attempts.push({ name, ok: false, error: String(e) });
    }
  };

  await tryAttempt('focus+nativeClick', async () => {
    categoryInput.focus();
    categoryInput.click();
  });

  await new Promise(r => setTimeout(r, 150));

  await tryAttempt('mouseEventsOnInput', async () => {
    categoryInput.focus();
    dispatchMouseClick(categoryInput);
  });

  await new Promise(r => setTimeout(r, 150));

  await tryAttempt('clickWrapper', async () => {
    const wrapper = categoryInput.closest('button, [role="button"], [data-testid*="catalog" i], [class*="Cell" i], [class*="cell" i]');
    if (wrapper) dispatchMouseClick(wrapper);
  });

  await new Promise(r => setTimeout(r, 150));

  if (suggested?.visible && suggested.clickTargetCandidate) {
    await tryAttempt('clickSuggestedCTA', async () => {
      dispatchMouseClick(suggested.clickTargetCandidate);
    });
  }

  // Fallback: even when detectSuggestedCategory() misses, the Category field itself often contains a CTA
  // like "Change"/"Edit" that opens the *real* picker.
  await new Promise(r => setTimeout(r, 120));
  await tryAttempt('clickInlineChangeCTA', async () => {
    const changeKeywords = ['change', 'select', 'edit', 'wijzig', 'kies', 'bewerken', 'aanpassen'];
    const container = categoryInput.closest('li, [data-testid*="catalog-select" i], [class*="Cell" i], [class*="cell" i], section, div');
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button, [role="button"]'))
      .filter(b => isElementVisible(b));
    const cta = buttons.find(b => changeKeywords.some(k => normalizeUiText(b.textContent).includes(k)));
    if (cta) dispatchMouseClick(cta);
  });

  // NEW: Wait for any loading spinner to disappear (Vinted now loads categories async)
  const spinnerWait = await waitForSpinnerToDisappear(3000);
  if (spinnerWait.hadSpinner) {
    debugLog(`Spinner wait: ${spinnerWait.waitedMs}ms, still loading: ${spinnerWait.stillLoading}`);
    attempts.push({ 
      name: 'waitForSpinner', 
      ok: !spinnerWait.stillLoading,
      waitedMs: spinnerWait.waitedMs 
    });
  }

  // Wait until options appear (increased timeout from 2s to 4s for async loading)
  const best = await waitForDropdownRender(4000);
  if (best?.root) {
    activeDropdownRoot = best.root;
  }

  return {
    opened: !!best,
    attempts,
    suggested,
    dropdown: best,
    spinnerInfo: spinnerWait
  };
}

// Portal/dropdown items sometimes fail the offsetParent check even when visible.
// Use a looser visibility check specifically for category dropdown candidates.
function isPortalItemVisible(el) {
  if (!el) return false;
  if (el.getAttribute?.('aria-hidden') === 'true') return false;

  const style = window.getComputedStyle(el);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (style.opacity === '0') return false;
  if (style.pointerEvents === 'none') return false;

  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Check if element is in header/nav (must be excluded)
function isInHeader(el) {
  let parent = el;
  while (parent) {
    const tag = parent.tagName?.toLowerCase();
    const className = (parent.className || '').toLowerCase();
    const role = parent.getAttribute?.('role') || '';
    
    if (tag === 'header' || tag === 'nav') return true;
    if (role === 'navigation' || role === 'banner') return true;
    if (className.includes('header') || className.includes('topbar') || 
        className.includes('navbar') || className.includes('search-bar') ||
        className.includes('searchbar')) {
      return true;
    }
    
    parent = parent.parentElement;
  }
  return false;
}

// Find category input (exact Vinted selector - INLINE, NOT A MODAL)
function findCategoryInput() {
  debugLog('=== FINDING CATEGORY INPUT ===');
  
  // Primary selector - the readonly input element
  const exactSelectors = [
    '[data-testid="catalog-select-dropdown-input"]',  // Primary - the actual input
    'input#category[readonly]',                       // By ID + readonly
    'input[name="category"][readonly]',               // By name + readonly
    '[data-testid*="catalog-select"] input',          // Nested in catalog-select
    'input[placeholder*="category" i][readonly]',     // By placeholder
    'input[placeholder*="categor" i][readonly]'       // Dutch/partial
  ];
  
  for (const sel of exactSelectors) {
    try {
      const el = document.querySelector(sel);
      if (el && isElementVisible(el)) {
        debugLog(`✅ Found category input: ${sel}`);
        debugLog('✅ Category input found:', {
          tagName: el.tagName,
          testId: el.getAttribute('data-testid'),
          id: el.id,
          value: el.value,
          placeholder: el.placeholder
        });
        return el;
      }
    } catch (e) { /* invalid selector */ }
  }
  
  debugWarn('❌ Category input not found');
  return null;
}

// ============= CATEGORY DETECTION STRATEGIES =============

// STRATEGY 1: Find element with EXACT text match
function findExactTextMatch(searchTerms, root = null) {
  const scope = root || activeDropdownRoot || document;
  const candidates = (scope.querySelectorAll ? scope.querySelectorAll(
    '[role="option"], [role="menuitem"], [role="listitem"], li, button, ' +
    'div[tabindex], span[tabindex], [class*="option" i], [class*="item" i]'
  ) : []);
  
  for (const el of candidates) {
    if (!isPortalItemVisible(el)) continue;
    if (isInHeader(el)) continue;
    
    const text = (el.textContent || '').trim().toLowerCase();
    for (const term of searchTerms) {
      if (text === term.toLowerCase()) {
        return { element: el, matchedTerm: term, strategy: 'exact' };
      }
    }
  }
  return null;
}

// STRATEGY 2: Find text node and traverse to clickable parent
function findNestedTextMatch(searchTerms, root = null) {
  const scopeRoot = root || activeDropdownRoot || document.body;
  const walker = document.createTreeWalker(
    scopeRoot,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim().toLowerCase();
    
    for (const term of searchTerms) {
      if (text === term.toLowerCase()) {
        // Find clickable parent (up to 6 levels)
        let parent = node.parentElement;
        for (let i = 0; i < 6 && parent; i++) {
          const isClickable = 
            parent.tagName === 'BUTTON' ||
            parent.tagName === 'A' ||
            parent.tagName === 'LI' ||
            parent.getAttribute('role') === 'option' ||
            parent.getAttribute('role') === 'menuitem' ||
            parent.getAttribute('tabindex') !== null ||
            parent.onclick !== null;
          
          if (isClickable && isPortalItemVisible(parent) && !isInHeader(parent)) {
            return { element: parent, matchedTerm: term, strategy: 'nested' };
          }
          parent = parent.parentElement;
        }
      }
    }
  }
  return null;
}

// STRATEGY 3: Fuzzy matching with similarity score
function findFuzzyMatch(searchTerms, threshold = 0.4, root = null) {
  const scope = root || activeDropdownRoot || document;
  const candidates = (scope.querySelectorAll ? scope.querySelectorAll(
    'li, [role="option"], [role="menuitem"], [role="listitem"], button, ' +
    '[class*="Item"], [class*="item"], [class*="Option"], [class*="option"], ' +
    '[class*="Cell"], [class*="cell"], div[tabindex], span[tabindex], ' +
    '[data-testid*="category"], [class*="category" i], [class*="select" i]'
  ) : []);
  
  let bestMatch = null;
  let bestScore = 0;
  let matchedTerm = null;
  
  for (const el of candidates) {
    if (!isPortalItemVisible(el)) continue;
    if (isInHeader(el)) continue;
    
    const text = (el.textContent || '').trim();
    if (text.length === 0 || text.length > 80) continue;
    
    // Exclude cookie/privacy items
    const textLower = text.toLowerCase();
    if (textLower.includes('cookie') || textLower.includes('privacy') || 
        textLower.includes('vendor') || textLower.includes('inloggen') ||
        textLower.includes('login') || textLower.includes('accepteer')) continue;
    
    for (const term of searchTerms) {
      const score = calculateSimilarity(text, term);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = el;
        matchedTerm = term;
      }
    }
  }
  
  if (bestMatch && bestScore >= threshold) {
    return { element: bestMatch, matchedTerm, score: bestScore, strategy: 'fuzzy' };
  }
  return null;
}

// ============= DIAGNOSTIC LOGGING =============

function logDOMDiagnostics(searchTerms, options = {}) {
  const { log = true } = options;
  const listboxes = querySelectorAllDeep('[role="listbox"]');
  // Avoid shadowing the function parameter `options`
  const optionEls = querySelectorAllDeep('[role="option"]');

  const rootScope = activeDropdownRoot && activeDropdownRoot.querySelectorAll ? activeDropdownRoot : null;
  const docScope = document;

  // NEW: Extract all available clickable options in the dropdown
  const extractAvailableOptions = (scope) => {
    if (!scope) return [];
    const selectors = 'li, [role="option"], button, [class*="Cell"], [class*="Item"]';
    const elements = scope.querySelectorAll(selectors);
    const options = [];
    const seen = new Set();
    
    for (const el of elements) {
      if (!isPortalItemVisible(el)) continue;
      if (isInHeader(el)) continue;
      
      const text = (el.textContent || '').trim();
      // Filter: reasonable option text (2-80 chars, no duplicates)
      if (text.length >= 2 && text.length <= 80 && !seen.has(text)) {
        // Exclude common UI elements
        const lower = text.toLowerCase();
        if (!lower.includes('cookie') && !lower.includes('privacy') && 
            !lower.includes('inloggen') && !lower.includes('login') &&
            !lower.includes('save draft') && !lower.includes('upload')) {
          seen.add(text);
          options.push(text);
        }
      }
    }
    return options.slice(0, 30); // Max 30 options
  };

  const scanExactMatches = (scope) => {
    const matches = [];
    const all = scope?.querySelectorAll ? scope.querySelectorAll('*') : [];
    for (const term of searchTerms) {
      const termLower = term.toLowerCase();
      for (const el of all) {
        const text = (el.textContent || '').trim().toLowerCase();
        if (text === termLower) {
          matches.push({
            term,
            element: getElementSummary(el),
            visible: isPortalItemVisible(el),
            inHeader: isInHeader(el)
          });
        }
      }
    }
    return matches;
  };

  const rootMatches = rootScope ? scanExactMatches(rootScope) : [];
  const docMatches = scanExactMatches(docScope);
  
  // NEW: Get available options from dropdown
  const availableOptions = extractAvailableOptions(rootScope);

  const diagnostics = {
    listboxCount: listboxes.length,
    optionCount: optionEls.length,
    activeDropdownRoot: getElementSummary(activeDropdownRoot),
    // NEW: Show what options ARE available (critical for debugging)
    availableOptions,
    // NEW: Include listing context for debugging category mapping
    listingContext: {
      title: (window.autoFillerData?.title || '').slice(0, 100),
      category: window.autoFillerData?.category || null
    },
    rootSamples: rootScope ? getVisibleTextSamples(rootScope, 18) : [],
    docSamples: getVisibleTextSamples(document, 18),
    rootExactMatchesCount: rootMatches.length,
    docExactMatchesCount: docMatches.length,
    rootExactMatches: rootMatches.slice(0, 20),
    docExactMatches: docMatches.slice(0, 20),
    // NEW: Suggest a fix based on available options
    suggestedFix: availableOptions.length > 0 
      ? `Try one of: ${availableOptions.slice(0, 5).join(', ')}` 
      : 'No options detected - dropdown may not be open'
  };

  // ADMIN ONLY: Log to console
  if (log && DEBUG_MODE) {
    console.group('AutoPoster: 🔍 DOM Diagnostics');
    console.log(`Found ${listboxes.length} [role="listbox"] elements`);
    console.log(`Found ${optionEls.length} [role="option"] elements`);
    console.log('activeDropdownRoot:', diagnostics.activeDropdownRoot);
    console.log('availableOptions:', availableOptions);
    console.log('listingContext:', diagnostics.listingContext);
    console.log('rootSamples:', diagnostics.rootSamples);
    console.log('docSamples:', diagnostics.docSamples);
    if (rootMatches.length > 0) console.log('rootExactMatches:', rootMatches);
    if (docMatches.length > 0) console.log('docExactMatches:', docMatches);
    if (rootMatches.length === 0) console.log(`Root scope: no exact match for: ${searchTerms.join(', ')}`);
    if (docMatches.length === 0) console.log(`Document scope: no exact match for: ${searchTerms.join(', ')}`);
    console.log('suggestedFix:', diagnostics.suggestedFix);
    console.groupEnd();
  }

  // Persist for copy button / support
  setCategoryDiagnostics({ domDiagnostics: diagnostics });
  return diagnostics;
}

// ============= MAIN LEVEL SELECTION =============

// Select one level GLOBALLY (portal-based - items NOT in card)
async function selectLevelGlobally(levelText) {
  debugLog(`\n========== Selecting: "${levelText}" ==========`);
  
  // SYNONYM EXPANSION: Get all NL ↔ EN variants
  const searchTerms = window.expandSynonyms 
    ? window.expandSynonyms(levelText) 
    : [levelText];
  
  debugLog(`Search terms (with synonyms):`, searchTerms);

  // Diagnostics are expensive + noisy; only compute + log them on failure.
  let domDiagnostics = null;

  const trySelectInScope = async (scope, scopeName) => {
    // STRATEGY 1: Exact
    debugLog(`[${scopeName}] Strategy 1: Exact text match...`);
    const exactResult = findExactTextMatch(searchTerms, scope);
    if (exactResult) {
      if (DEBUG_MODE) {
        console.log(`AutoPoster: ✅ EXACT MATCH (${scopeName}) for "${exactResult.matchedTerm}"`, {
          tag: exactResult.element.tagName,
          text: exactResult.element.textContent?.trim().slice(0, 50)
        });
      }
      dispatchMouseClick(resolveClickableTarget(exactResult.element));
      await new Promise(r => setTimeout(r, 500));
      setCategoryDiagnostics({
        lastSelection: { levelText, matchedTerm: exactResult.matchedTerm, strategy: 'exact', scope: scopeName }
      });
      return true;
    }

    // STRATEGY 2: Nested
    debugLog(`[${scopeName}] Strategy 2: Nested text match...`);
    const nestedResult = findNestedTextMatch(searchTerms, scope);
    if (nestedResult) {
      if (DEBUG_MODE) {
        console.log(`AutoPoster: ✅ NESTED MATCH (${scopeName}) for "${nestedResult.matchedTerm}"`, {
          tag: nestedResult.element.tagName,
          text: nestedResult.element.textContent?.trim().slice(0, 50)
        });
      }
      dispatchMouseClick(resolveClickableTarget(nestedResult.element));
      await new Promise(r => setTimeout(r, 500));
      setCategoryDiagnostics({
        lastSelection: { levelText, matchedTerm: nestedResult.matchedTerm, strategy: 'nested', scope: scopeName }
      });
      return true;
    }

    // STRATEGY 3: Fuzzy
    debugLog(`[${scopeName}] Strategy 3: Fuzzy match...`);
    const fuzzyResult = findFuzzyMatch(searchTerms, 0.4, scope);
    if (fuzzyResult) {
      if (DEBUG_MODE) {
        console.log(
          `AutoPoster: ✅ FUZZY MATCH (${scopeName}) for "${fuzzyResult.matchedTerm}" (score: ${fuzzyResult.score.toFixed(2)})`,
          { tag: fuzzyResult.element.tagName, text: fuzzyResult.element.textContent?.trim().slice(0, 50) }
        );
      }
      dispatchMouseClick(resolveClickableTarget(fuzzyResult.element));
      await new Promise(r => setTimeout(r, 500));
      setCategoryDiagnostics({
        lastSelection: { levelText, matchedTerm: fuzzyResult.matchedTerm, strategy: 'fuzzy', scope: scopeName, score: fuzzyResult.score }
      });
      return true;
    }

    return false;
  };

  // 1) Try within detected root, 2) then fallback to document-wide.
  // This prevents regressions when the root detection chooses the wrong list.
  if (activeDropdownRoot) {
    const ok = await trySelectInScope(activeDropdownRoot, 'root');
    if (ok) return true;
  }

  const okDoc = await trySelectInScope(document, 'document');
  if (okDoc) return true;
  
  // ALL STRATEGIES FAILED - Log detailed error (ADMIN ONLY)
  domDiagnostics = logDOMDiagnostics(searchTerms, { log: DEBUG_MODE });
  
  if (DEBUG_MODE) {
    console.error(`AutoPoster: ❌ FAILED to find "${levelText}"`);
    const troubleshooting = {
      searchTerms,
      domDiagnostics,
      strategies_tried: ['exact', 'nested', 'fuzzy'],
      possible_causes: [
        'Dropdown not open/visible',
        'Category label not in synonym list',
        'Vinted using Shadow DOM',
        'Element filtered by visibility/header check'
      ],
      action: 'Check DOM Diagnostics above for element structure'
    };
    try {
      console.error('AutoPoster: TROUBLESHOOTING_JSON:', JSON.stringify(troubleshooting, null, 2));
    } catch {
      // ignore
    }
  }

  // Make it easy to copy from console even if window.copyAutoPosterDiagnostics is not callable.
  setCategoryDiagnostics({
    code: 'LABEL_NOT_FOUND',
    failedLevel: levelText,
    searchTerms
  });
  
  // ADMIN ONLY: Log diagnostics JSON
  if (DEBUG_MODE) {
    try {
      console.log('AutoPoster: DIAGNOSTICS_JSON:', JSON.stringify(__autoposterLastCategoryDiagnostics || {}, null, 2));
    } catch {
      // ignore
    }
  }
  
  return false;
}

// "Copy debug info" button: DEV_MODE builds only (see init)
function createDebugButton() {
  const btn = document.createElement('button');
  btn.id = 'autoposter-debug-btn';
  btn.type = 'button';
  btn.textContent = '🔧 Copy debug info';
  btn.style.cssText = `
    position: fixed;
    bottom: 72px;
    right: 20px;
    z-index: 99999;
    background: rgba(17, 24, 39, 0.92);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.16);
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    transition: transform 0.15s ease, opacity 0.15s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-1px)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
  });

  btn.addEventListener('click', async () => {
    const payload = __autoposterLastCategoryDiagnostics || { error: 'No diagnostics captured yet' };
    const text = JSON.stringify(payload, null, 2);

    const ok = await copyTextToClipboard(text);
    if (ok) {
      showNotification('✅ Debug info copied', 'success', 1800);
    } else {
      console.log('AutoPoster: DIAGNOSTICS_JSON:', text);
      showNotification('⚠️ Copy failed. See console: DIAGNOSTICS_JSON', 'warning', 2600);
    }
  });

  return btn;
}


// Calculate text similarity score
function calculateSimilarity(text1, text2) {
  const t1 = text1.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const t2 = text2.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  
  if (t1 === t2) return 1.0;
  if (t1.includes(t2) || t2.includes(t1)) return 0.8;
  
  // Word overlap
  const words1 = t1.split(/\s+/).filter(w => w.length > 2);
  const words2 = t2.split(/\s+/).filter(w => w.length > 2);
  
  let matches = 0;
  for (const w1 of words1) {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      matches++;
    }
  }
  
  if (words1.length > 0) {
    return (matches / Math.max(words1.length, words2.length)) * 0.6;
  }
  
  return 0;
}


// Main category selection function - GLOBAL PORTAL-BASED APPROACH WITH PATH REPAIR

// =========================
// DEBUG STATS PERSISTENCE (for popup admin panel)
// =========================

function updateStoredDebugStats(mutator) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['debugStats'], (res) => {
      const current = (res && res.debugStats && typeof res.debugStats === 'object') ? res.debugStats : {};
      const next = mutator({ ...current }) || current;
      chrome.storage.local.set({ debugStats: next }, () => resolve(next));
    });
  });
}

async function recordVintedCategoryAttempt(payload) {
  return updateStoredDebugStats((stats) => {
    stats.categoryAttempts = (stats.categoryAttempts || 0) + 1;
    stats.lastActiveTime = Date.now();

    stats.categoryEventHistory = Array.isArray(stats.categoryEventHistory) ? stats.categoryEventHistory : [];
    stats.categoryEventHistory.unshift({
      kind: 'attempt',
      timestamp: Date.now(),
      ...payload,
    });
    if (stats.categoryEventHistory.length > 50) stats.categoryEventHistory.length = 50;
    return stats;
  });
}

async function recordVintedCategoryResult(success, categoryPath, errorData) {
  return updateStoredDebugStats((stats) => {
    stats.lastActiveTime = Date.now();
    stats.categorySuccesses = stats.categorySuccesses || 0;
    stats.categoryFailures = stats.categoryFailures || 0;
    stats.categoryErrorHistory = Array.isArray(stats.categoryErrorHistory) ? stats.categoryErrorHistory : [];
    stats.categoryEventHistory = Array.isArray(stats.categoryEventHistory) ? stats.categoryEventHistory : [];

    if (success) {
      stats.categorySuccesses += 1;
      stats.categoryEventHistory.unshift({
        kind: 'success',
        timestamp: Date.now(),
        path: categoryPath,
      });
    } else {
      stats.categoryFailures += 1;
      const availableOptions =
        errorData?.availableOptions ||
        __autoposterLastCategoryDiagnostics?.domDiagnostics?.availableOptions ||
        [];

      stats.lastCategoryError = {
        path: categoryPath,
        error: errorData?.code || 'UNKNOWN',
        failedLevel: errorData?.failedLevel || null,
        availableOptions: Array.isArray(availableOptions) ? availableOptions.slice(0, 15) : [],
        timestamp: Date.now(),
      };

      stats.categoryErrorHistory.unshift(stats.lastCategoryError);
      if (stats.categoryErrorHistory.length > 10) stats.categoryErrorHistory.length = 10;

      stats.categoryEventHistory.unshift({
        kind: 'failure',
        timestamp: Date.now(),
        path: categoryPath,
        code: errorData?.code || 'UNKNOWN',
        failedLevel: errorData?.failedLevel || null,
      });
    }

    if (stats.categoryEventHistory.length > 50) stats.categoryEventHistory.length = 50;
    return stats;
  });
}

function closeVintedCategoryPicker() {
  try {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
  } catch {
    // ignore
  }

  try {
    document.body?.click?.();
  } catch {
    // ignore
  }
}

async function selectVintedCategory(categoryPath) {
  if (!categoryPath) return false;

  // reset per-run state
  activeDropdownRoot = null;
  setCategoryDiagnostics(null);
  
  debugLog('=== VINTED CATEGORY SELECTION (GLOBAL) ===');
  debugLog('Original category path:', categoryPath);
  
  // REPAIR PATH: normalize common AI mismatches (e.g. "Collectables" pseudo-level)
  const repairedPath = repairVintedCategoryPath(categoryPath);
  debugLog('Repaired category path:', repairedPath);
  
  const levels = repairedPath.split(/[>\/]/).map(s => s.trim()).filter(s => s.length > 0);
  if (levels.length === 0) return false;
  
  // SCOPE A: Find the category input (for trigger + success check)
  const categoryInput = findCategoryInput();
  
  if (!categoryInput) {
    debugWarn('Category input not found');
    showNotification(`📁 Select category: ${repairedPath}`, 'info', 8000);

    // Persist stats for admin panel
    if (DEBUG_MODE) {
      await recordVintedCategoryAttempt({ url: location.href, requestedPath: categoryPath, repairedPath });
      await recordVintedCategoryResult(false, repairedPath, { code: 'INPUT_NOT_FOUND', failedLevel: null });
    }

    return false;
  }
  
  // Check if already filled
  if (categoryInput.value && categoryInput.value.length > 0) {
    debugLog(`Category already has value: "${categoryInput.value}"`);
    return true;
  }

  // Persist attempt (admin only)
  if (DEBUG_MODE) {
    await recordVintedCategoryAttempt({ url: location.href, requestedPath: categoryPath, repairedPath });
  }
  
  // Click input to open dropdown
  debugLog('Opening category picker (robust)...');
  const openResult = await openCategoryPicker(categoryInput);

  // Enhanced diagnostics with spinner info
  const spinnerInfo = openResult.spinnerInfo || { hadSpinner: false };
  
  setCategoryDiagnostics({
    code: openResult.opened ? 'PICKER_OPENED' : 'PICKER_NOT_OPENED',
    requestedPath: categoryPath,
    repairedPath,
    suggested: openResult.suggested,
    openAttempts: openResult.attempts,
    dropdown: openResult.dropdown ? {
      count: openResult.dropdown.count,
      sample: openResult.dropdown.sample?.slice(0, 12)
    } : null,
    // NEW: spinner/loading info for debugging async loading issues
    spinner: {
      detected: spinnerInfo.hadSpinner,
      waitedMs: spinnerInfo.waitedMs || 0,
      stillLoading: spinnerInfo.stillLoading || false
    }
  });

  if (!openResult.opened) {
    const waitTime = spinnerInfo.stillLoading ? 'still loading after 4s' : '4.0s';
    const spinnerMsg = spinnerInfo.hadSpinner ? ` (spinner detected, waited ${spinnerInfo.waitedMs}ms)` : '';
    debugWarn(`⚠️ Dropdown options did not appear within ${waitTime}${spinnerMsg}`);
    showNotification(`📁 Select category manually: ${repairedPath}`, 'info', 8000);

    if (DEBUG_MODE) {
      await recordVintedCategoryResult(false, repairedPath, {
        code: 'PICKER_NOT_OPENED',
        failedLevel: levels?.[0] || null,
        availableOptions: openResult?.dropdown?.sample || [],
      });
    }

    return false;
  }
  
  // SCOPE B: Navigate level-by-level using GLOBAL scan
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    debugLog(`\n>>> Level ${i + 1}/${levels.length}: "${level}"`);
    
    let success = await selectLevelGlobally(level);
    
    // AUTO-FALLBACK: If the last level fails, try selecting "Other" instead
    if (!success && i === levels.length - 1) {
      debugLog(`Level "${level}" not found — trying fallback to "Other"...`);
      const fallbackSuccess = await selectLevelGlobally('Other');
      if (fallbackSuccess) {
        debugLog(`✅ Fallback to "Other" succeeded (original: "${level}")`);
        showNotification(`📁 "${level}" niet beschikbaar → "Other" geselecteerd`, 'info', 5000);
        success = true;
      }
    }
    
    if (!success) {
      setCategoryDiagnostics({
        code: 'LABEL_NOT_FOUND',
        failedLevelIndex: i + 1,
        failedLevel: level,
        completedLevels: levels.slice(0, i),
        remainingLevels: levels.slice(i),
        activeDropdownRoot: activeDropdownRoot ? {
          tag: activeDropdownRoot.tagName,
          role: activeDropdownRoot.getAttribute?.('role'),
          class: (activeDropdownRoot.className || '').toString().slice(0, 120)
        } : null
      });
      debugWarn('❌ Category selection FAILED', {
        failedLevelIndex: i + 1,
        failedLevel: level,
        fullPath: levels.join(' > '),
        completedLevels: levels.slice(0, i),
        remainingLevels: levels.slice(i)
      });
      
      // Show remaining path with English labels since user uses EN
      const remainingPath = levels.slice(i).join(' > ');
      showNotification(`📁 Select manually: ${remainingPath}`, 'info', 8000);

      if (DEBUG_MODE) {
        await recordVintedCategoryResult(false, repairedPath, {
          code: 'LABEL_NOT_FOUND',
          failedLevel: level,
          availableOptions: __autoposterLastCategoryDiagnostics?.domDiagnostics?.availableOptions,
        });
      }

      closeVintedCategoryPicker();
      return false;
    }
    
    // Wait for next level to appear and re-detect the active dropdown root (Vinted swaps list DOM per level)
    await new Promise(r => setTimeout(r, 450));
    if (i < levels.length - 1) {
      const best = await waitForDropdownRender(1200);
      if (best?.root) {
        activeDropdownRoot = best.root;
      }
    }
  }

  // AUTO-FALLBACK: After selecting the last level, check if Vinted opened another sub-level
  // If so, the AI didn't provide a deep enough path — select "Other" as fallback
  await new Promise(r => setTimeout(r, 600));
  const postSelectDropdown = await waitForDropdownRender(800);
  if (postSelectDropdown?.root && postSelectDropdown.count > 0) {
    debugLog(`⚠️ Sub-level appeared after last selection — trying "Other" fallback...`);
    const otherFallback = await selectLevelGlobally('Other');
    if (!otherFallback) {
      // Try Dutch variant
      await selectLevelGlobally('Anders');
    }
    if (otherFallback) {
      debugLog('✅ Auto-selected "Other" for unexpected sub-level');
      showNotification('📁 Extra sub-categorie → "Other" geselecteerd', 'info', 5000);
    }
  }
  
  // SUCCESS CHECK: input.value should now be filled
  await new Promise(r => setTimeout(r, 600));
  
  if (categoryInput.value && categoryInput.value.length > 0) {
    debugLog(`✅ Category selected: "${categoryInput.value}"`);
    setCategoryDiagnostics({ code: 'SUCCESS', finalValue: categoryInput.value });
    showNotification(`✅ Category: ${categoryInput.value}`, 'success', 3000);

    if (DEBUG_MODE) {
      await recordVintedCategoryResult(true, repairedPath);
    }

    return true;
  }
  
  debugLog('Category traversal completed but value not confirmed');
  showNotification(`📁 Verify category: ${repairedPath}`, 'info', 5000);

  // IMPORTANT: If input value did not update, this is NOT a success. In practice this
  // means we ended on an intermediate node (e.g. "Trading cards") and Vinted expects
  // one more level (booster packs / boxes / singles). Returning true here blocks the
  // rest of the autofill flow.
  if (DEBUG_MODE) {
    await recordVintedCategoryResult(false, repairedPath, {
      code: 'VALUE_NOT_CONFIRMED',
      failedLevel: levels?.[levels.length - 1] || null,
      availableOptions: __autoposterLastCategoryDiagnostics?.domDiagnostics?.availableOptions,
    });
  }

  closeVintedCategoryPicker();
  return false;
}

// Repair category path - add missing levels like "Clothing" or "Shoes"
function repairVintedCategoryPath(path) {
  if (!path) return path;
  
  const parts = path.split(/[>\/]/).map(s => s.trim()).filter(s => s.length > 0);
  if (parts.length === 0) return path;

  // Common AI label fixes for Vinted (especially Trading Cards / Collectables).
  // Example bad AI path:
  //   Hobbies & Collectables > Collectables > Trading cards & accessories > Trading card sets & boxes
  // Correct Vinted path:
  //   Hobbies & Collectables > Trading cards > Trading card sets
  const normalizeKey = (text) => (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/\s+and\s+/g, ' & ')
    .replace(/\s+en\s+/g, ' & ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s+/g, ' ')
    .trim();

  const alias = {
    // TCG / collectables: AI commonly invents these labels; map to actual Vinted labels.
    'card games': 'Trading cards',               // AI says "Card games" but Vinted uses "Trading cards"
    'card game': 'Trading cards',
    'trading card games': 'Trading cards',       // AI says "Trading card games" but Vinted uses "Trading cards"
    'trading card game': 'Trading cards',
    'collectable card games': 'Trading cards',
    'collectible card games': 'Trading cards',
    'collectable card game': 'Trading cards',
    'collectible card game': 'Trading cards',
    'tcg': 'Trading cards',
    'sealed products': 'Booster packs',
    'sealed product': 'Booster packs',
    'sealed packs': 'Booster packs',
    'booster boxes': 'Booster boxes',
    'booster box': 'Booster boxes',

    'trading cards & accessories': 'Trading cards',
    'trading card & accessories': 'Trading cards',
    'trading cards accessories': 'Trading cards',
    'trading card sets & boxes': 'Booster boxes',
    'trading card set & boxes': 'Booster boxes',
    'trading card sets boxes': 'Booster boxes',
    'trading card sets': 'Booster boxes',
    
    // CYCLING: AI commonly says "Bicycles" but Vinted uses "Bikes"
    'bicycles': 'Bikes',
    'bicycle': 'Bikes',
    
    // CYCLING: Other label mismatches
    'turbo trainers': 'Indoor cycling trainers',
    'turbo trainer': 'Indoor cycling trainers',
    'home trainers': 'Indoor cycling trainers',
    'hometrainer': 'Indoor cycling trainers',
    'bike accessories & tools': 'Cycling accessories & tools',
    'bike accessories': 'Cycling accessories & tools',
    'bike child seats': "Kids' bike seats",
    'bike child seat': "Kids' bike seats",
    'child seats': "Kids' bike seats",
    'kinderzitjes': "Kids' bike seats"
  };

  // TCG franchise names that should be stripped (Vinted categorizes by product type, not franchise)
  const TCG_FRANCHISES = [
    'pokémon', 'pokemon', 'pikachu',
    'yu-gi-oh', 'yugioh', 'yu gi oh',
    'magic the gathering', 'mtg', 'magic',
    'one piece', 'onepiece',
    'digimon', 'dragon ball', 'dragonball',
    'panini', 'topps', 'upper deck'
  ];

  // Apply per-segment aliasing
  for (let i = 0; i < parts.length; i++) {
    const k = normalizeKey(parts[i]);
    if (alias[k]) parts[i] = alias[k];
  }

  // Remove the bogus "Collectables" intermediate level under Hobbies.
  const key0 = normalizeKey(parts[0]);
  const isHobbiesMain = (key0.includes('hobbies') || key0.includes('hobby')) &&
    (key0.includes('collectables') || key0.includes('verzamel'));
  if (isHobbiesMain && normalizeKey(parts[1]) === 'collectables') {
    parts.splice(1, 1);
    debugLog('Path repair: removed bogus "Collectables" level under Hobbies');
  }

  // NEW: If we end at "Trading cards" only, Vinted often still expects a product-type leaf.
  // Derive a best-guess from the listing title/description.
  if (parts.length === 2 && normalizeKey(parts[1]) === 'trading cards') {
    const listingTitle = (window.autoFillerData?.title || '').toLowerCase();
    const listingDesc = (window.autoFillerData?.description || '').toLowerCase();
    const combined = (listingTitle + ' ' + listingDesc).trim();

    let productType = 'Single trading cards';
    if (combined.includes('box') || combined.includes('etb') || combined.includes('elite trainer')) {
      productType = 'Booster boxes';
    } else if (combined.includes('booster') || combined.includes('pack') || combined.includes('sealed')) {
      productType = 'Booster packs';
    } else if (combined.includes('deck') || combined.includes('theme deck') || combined.includes('starter')) {
      productType = 'Card decks';
    } else if (combined.includes('lot') || combined.includes('bundle') || combined.includes('collection')) {
      productType = 'Trading card lots';
    }

    parts.push(productType);
    debugLog(`Path repair: appended trading-cards leaf "${productType}"`);
  }

  // NEW: Strip TCG franchise names from path (Vinted uses product types, not franchises)
  // Path like "Hobbies & Collectables > Trading cards > Pokémon" should become
  // "Hobbies & Collectables > Trading cards > Booster boxes" (based on listing title)
  const lastLevelKey = normalizeKey(parts[parts.length - 1]);
  if (TCG_FRANCHISES.some(f => lastLevelKey.includes(f))) {
    debugLog(`Path repair: detected TCG franchise "${parts[parts.length - 1]}" as last level`);
    parts.pop(); // Remove franchise name
    
    // Determine correct product type from stored listing data
    const listingTitle = (window.autoFillerData?.title || '').toLowerCase();
    const listingDesc = (window.autoFillerData?.description || '').toLowerCase();
    const combined = listingTitle + ' ' + listingDesc;
    
    let productType = 'Single trading cards'; // default
    if (combined.includes('box') || combined.includes('etb') || combined.includes('elite trainer')) {
      productType = 'Booster boxes';
    } else if (combined.includes('booster') || combined.includes('pack') || combined.includes('sealed')) {
      productType = 'Booster packs';
    } else if (combined.includes('deck') || combined.includes('theme deck') || combined.includes('starter')) {
      productType = 'Card decks';
    } else if (combined.includes('lot') || combined.includes('bundle') || combined.includes('collection')) {
      productType = 'Trading card lots';
    }
    
    parts.push(productType);
    debugLog(`Path repair: replaced franchise with product type "${productType}"`);
  }

  // Deduplicate adjacent segments (can happen after aliasing)
  for (let i = parts.length - 1; i > 0; i--) {
    if (normalizeKey(parts[i]) === normalizeKey(parts[i - 1])) {
      parts.splice(i, 1);
    }
  }
  
  const mainCategory = parts[0].toLowerCase();
  const secondLevel = parts[1]?.toLowerCase() || '';
  const thirdLevel = parts[2]?.toLowerCase() || '';
  
  // ============================================
  // SPORTS CATEGORY REPAIR
  // AI often incorrectly nests Cycling under "Outdoor sports"
  // Vinted structure: Sports > Cycling (NOT Sports > Outdoor sports > Cycling)
  // ============================================
  const sportsMainKeys = ['sports', 'sport'];
  const outdoorKeys = ['outdoor sports', 'outdoor', 'buitensport', 'buitensporten'];
  const directSportsChildren = ['cycling', 'fietsen', 'wielrennen', 'water sports', 'watersport', 
                                 'winter sports', 'wintersport', 'golf', 'horse riding', 'paardrijden',
                                 'martial arts', 'vechtsporten', 'team sports', 'teamsporten'];
  
  if (sportsMainKeys.includes(mainCategory)) {
    // Check if AI incorrectly nested a direct sports child under "Outdoor sports"
    if (outdoorKeys.includes(secondLevel)) {
      if (directSportsChildren.some(t => thirdLevel.includes(t) || thirdLevel === t)) {
        parts.splice(1, 1); // Remove "Outdoor sports" intermediate level
        debugLog(`Path repair: moved "${parts[1]}" to direct child of Sports (removed Outdoor sports nesting)`);
      }
    }
    // Also check if it's ALREADY correct (Cycling at level 2) - no action needed
    
    // CYCLING SUB-LEVEL REPAIR: Items that belong under "Cycling accessories & tools"
    // AI often puts them directly under Cycling, skipping the intermediate level
    const cyclingAccessoriesChildren = [
      'bike baskets', 'bike bells & horns', 'bike bells', 'bike horns',
      'bike fenders & mudguards', 'bike fenders', 'bike mudguards', 'mudguards',
      'bike lights', 'bike locks', 'bike water bottles', 'bottle cages',
      'bike pumps', 'kickstands', 'panniers & bike bags', 'panniers', 'bike bags',
      'bike tools', 'bike stands & wall-mounts', 'bike stands', 'wall-mounts',
      'bike pannier racks', 'pannier racks', 'car bike racks',
      'bike boxes & travel bags', 'bike boxes', 'travel bags',
      'other bike accessories'
    ];
    const cyclingPartsChildren = [
      'bottom brackets', 'brakes', 'chains', 'chainrings', 'cranks',
      'derailleurs', 'forks', 'frames', 'grips', 'handlebars',
      'headsets', 'hubs', 'pedals', 'saddles', 'seatposts',
      'shifters', 'spokes', 'stems', 'tyres', 'tires', 'tubes',
      'wheels', 'rims', 'other bike parts'
    ];
    
    const updatedSecond = (parts[1] || '').toLowerCase();
    if (updatedSecond === 'cycling' || updatedSecond === 'fietsen') {
      const thirdLevelCycling = normalizeKey(parts[2] || '');
      if (cyclingAccessoriesChildren.some(c => thirdLevelCycling === c || thirdLevelCycling.includes(c))) {
        parts.splice(2, 0, 'Cycling accessories & tools');
        debugLog(`Path repair: inserted "Cycling accessories & tools" before "${parts[3]}"`);
      } else if (cyclingPartsChildren.some(c => thirdLevelCycling === c || thirdLevelCycling.includes(c))) {
        parts.splice(2, 0, 'Bike parts');
        debugLog(`Path repair: inserted "Bike parts" before "${parts[3]}"`);
      }
    }
  }
  
  // ============================================
  // FASHION CATEGORY REPAIR
  // ============================================
  const fashionCategories = ['women', 'men', 'kids', 'dames', 'heren', 'kinderen'];
  
  // Clothing types that should be under "Clothing"
  const clothingTypes = [
    'dresses', 'jurken', 'mini dresses', 'midi dresses', 'long dresses',
    'tops', 't-shirts', 'shirts', 'blouses',
    'jeans', 'spijkerbroeken',
    'trousers', 'broeken', 'leggings',
    'skirts', 'rokken',
    'shorts', 'korte broeken',
    'jumpers', 'sweaters', 'truien', 'hoodies',
    'jackets', 'jassen', 'coats',
    'outerwear', 'buitenkleding',
    'suits', 'blazers', 'pakken',
    'jumpsuits', 'playsuits',
    'activewear', 'sportkleding',
    'swimwear', 'zwemkleding',
    'lingerie', 'nightwear', 'nachtkleding',
    'maternity', 'zwangerschapskleding'
  ];
  
  // Shoe types
  const shoeTypes = [
    'sneakers', 'trainers',
    'boots', 'laarzen',
    'heels', 'hakken',
    'flats',
    'sandals', 'sandalen',
    'slippers', 'sloffen',
    'sports shoes', 'sportschoenen',
    'formal shoes', 'nette schoenen'
  ];
  
  // Recalculate secondLevel after potential sports fix
  const updatedSecondLevel = parts[1]?.toLowerCase() || '';
  
  if (fashionCategories.includes(mainCategory)) {
    // Check if second level is a clothing type (missing "Clothing" level)
    if (updatedSecondLevel && updatedSecondLevel !== 'clothing' && updatedSecondLevel !== 'kleding' && 
        updatedSecondLevel !== 'shoes' && updatedSecondLevel !== 'schoenen' &&
        updatedSecondLevel !== 'accessories' && updatedSecondLevel !== 'accessoires' &&
        updatedSecondLevel !== 'grooming' && updatedSecondLevel !== 'verzorging') {
      
      // Check if it's a clothing type
      if (clothingTypes.some(t => updatedSecondLevel.includes(t))) {
        parts.splice(1, 0, 'Clothing');
        debugLog(`Path repair: inserted "Clothing" level`);
      }
      // Check if it's a shoe type
      else if (shoeTypes.some(t => updatedSecondLevel.includes(t))) {
        parts.splice(1, 0, 'Shoes');
        debugLog(`Path repair: inserted "Shoes" level`);
      }
    }
  }
  
  // ============================================
  // BIKES SUB-LEVEL REPAIR
  // ============================================
  // If path ends at "Bikes", we need to add the specific bike type
  const lastLevel = normalizeKey(parts[parts.length - 1]);
  if (lastLevel === 'bikes' || lastLevel === 'fietsen') {
    const listingTitle = (window.autoFillerData?.title || '').toLowerCase();
    const listingDesc = (window.autoFillerData?.description || '').toLowerCase();
    const combined = listingTitle + ' ' + listingDesc;
    
    // Check for e-bike first - this redirects to a different category branch
    if (combined.includes('e-bike') || combined.includes('electric') || combined.includes('elektrisch')) {
      // Replace "Bikes" with "Electric bikes" (separate category in Vinted)
      parts[parts.length - 1] = 'Electric bikes';
      debugLog('Path repair: changed Bikes to Electric bikes');
    } else {
      // Detect specific bike type from title/description
      let bikeType = 'Other bikes'; // Default fallback
      
      if (combined.includes('cargo') || combined.includes('bak') || combined.includes('urban arrow') || combined.includes('bakfiets')) {
        bikeType = 'Cargo bikes';
      } else if (combined.includes('mountain') || combined.includes('mtb') || combined.includes('atb')) {
        bikeType = 'Mountain bikes';
      } else if (combined.includes('road') || combined.includes('race') || combined.includes('racefiets') || combined.includes('wielren')) {
        bikeType = 'Road bikes';
      } else if (combined.includes('city') || combined.includes('stad') || combined.includes('oma') || combined.includes('opa') || combined.includes('stadsfiets')) {
        bikeType = 'City bikes';
      } else if (combined.includes('folding') || combined.includes('vouw') || combined.includes('brompton') || combined.includes('opvouw')) {
        bikeType = 'Folding bikes';
      } else if (combined.includes('bmx')) {
        bikeType = 'BMX bikes';
      } else if (combined.includes('gravel')) {
        bikeType = 'Gravel bikes';
      } else if (combined.includes('hybrid') || combined.includes('hybride')) {
        bikeType = 'Hybrid bikes';
      } else if (combined.includes('touring') || combined.includes('toer') || combined.includes('toerfiets')) {
        bikeType = 'Touring bikes';
      } else if (combined.includes('aero') || combined.includes('triathlon') || combined.includes('tt bike') || combined.includes('tijdrit')) {
        bikeType = 'Aero & triathlon bikes';
      }
      
      parts.push(bikeType);
      debugLog(`Path repair: appended bike type "${bikeType}"`);
    }
  }
  
  return parts.join(' > ');
}

// ============================================
// VINTED IMAGE UPLOAD - SEQUENTIAL WITH DOM VERIFICATION
// ============================================

// Count visible photo thumbnails on page
function countVisibleThumbnails() {
  // Vinted (gezien op het echte formulier, 15-11-2026): geüploade foto's staan in dit raster
  const grid = document.querySelector('[data-testid="media-upload-grid"]');
  if (grid) return grid.children.length;

  const selectors = [
    '[class*="photo"] img',
    '[class*="thumbnail"] img',
    '[class*="preview"] img',
    '[class*="upload"] img',
    '[class*="Photo"] img',
    '[class*="Thumbnail"] img',
    '[class*="image-preview"]',
    '[data-testid*="photo"]',
    '[data-testid*="image"]'
  ];
  
  let count = 0;
  const seenElements = new Set();
  
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (isElementVisible(el) && !seenElements.has(el)) {
          seenElements.add(el);
          count++;
        }
      }
    } catch (e) { /* invalid selector */ }
  }
  
  return count;
}

// Wait for thumbnail count to increase (with polling)
async function waitForThumbnailIncrease(initialCount, timeout = 6000) {
  const startTime = Date.now();
  const pollInterval = 200;
  
  while (Date.now() - startTime < timeout) {
    const currentCount = countVisibleThumbnails();
    if (currentCount > initialCount) {
      debugLog(`Thumbnail count increased: ${initialCount} → ${currentCount}`);
      return true;
    }
    await new Promise(r => setTimeout(r, pollInterval));
  }
  
  debugWarn(`Thumbnail increase not detected after ${timeout}ms`);
  return false;
}

// ============================================
// AVIF TO JPEG CONVERSION HELPER
// ============================================
async function convertImageToJpeg(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Convert to JPEG with 90% quality
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(jpegUrl);
      } catch (e) {
        reject(new Error('Canvas conversion failed: ' + e.message));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = dataUrl;
  });
}

async function uploadImagesToVinted(images) {
  if (!images || images.length === 0) {
    debugLog('No images to upload');
    return false;
  }
  
  debugLog('=== IMAGE UPLOAD START ===');
  debugLog(`Total images to upload: ${images.length}`);
  
  // Check for AVIF format and convert them - these cause server errors on Vinted
  const avifImages = images.filter(img => 
    img.name?.toLowerCase().endsWith('.avif') || 
    img.data?.includes('image/avif') ||
    img.data?.startsWith('data:image/avif')
  );
  
  if (avifImages.length > 0) {
    debugLog(`🔄 Converting ${avifImages.length} AVIF images to JPEG...`);
    showNotification(`🔄 Converting ${avifImages.length} AVIF image(s) to compatible format...`, 'info', 3000);
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const isAvif = img.name?.toLowerCase().endsWith('.avif') || 
                     img.data?.includes('image/avif') ||
                     img.data?.startsWith('data:image/avif');
      
      if (isAvif) {
        try {
          debugLog(`Converting AVIF image ${i + 1} to JPEG...`);
          const jpegData = await convertImageToJpeg(img.data);
          images[i].data = jpegData;
          // Update filename extension
          if (images[i].name) {
            images[i].name = images[i].name.replace(/\.avif$/i, '.jpg');
          }
          debugLog(`✅ AVIF image ${i + 1} converted to JPEG successfully`);
        } catch (e) {
          debugWarn(`⚠️ AVIF conversion failed for image ${i + 1}, will try original:`, e.message);
          // Continue with original - it may still work
        }
      }
    }
  }
  
  const CONFIRMATION_TIMEOUT = 10000; // Increased for stability
  const DELAY_BETWEEN_UPLOADS = 2000; // Increased to prevent rate limiting
  const MAX_CONSECUTIVE_FAILURES = 3; // Stop after 3 consecutive failures
  
  let successCount = 0;
  let failCount = 0;
  let consecutiveFailures = 0;
  
  showNotification(`📷 ${t('uploadingPhotos')} (0/${images.length})`, 'info', 3000);
  
  // Find upload zone
  const selectors = PLATFORM_SELECTORS.vinted.uploadZone;
  let fileInput = null;
  let dropZone = null;
  
  // First try to find a file input
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el) {
        if (el.tagName === 'INPUT' && el.type === 'file') {
          fileInput = el;
          debugLog(`✅ Found file input: ${selector}`);
          break;
        } else {
          dropZone = el;
          debugLog(`Found drop zone: ${selector}`);
        }
      }
    } catch (e) { /* Invalid selector */ }
  }
  
  // Fallback: look for any file input
  if (!fileInput) {
    fileInput = document.querySelector('input[type="file"][accept*="image"], input[type="file"][multiple]');
    if (fileInput) {
      debugLog('✅ Found generic file input');
    }
  }
  
  if (!fileInput && !dropZone) {
    debugWarn('❌ No upload zone found');
    showNotification(`⚠️ ${t('photoUploadFailed')}`, 'warning', 4000);
    return false;
  }
  
  // Upload each image SEQUENTIALLY with DOM verification
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    debugLog(`--- Uploading image ${i + 1}/${images.length}: ${img.name || 'unnamed'} ---`);
    
    // Count thumbnails BEFORE upload
    const initialThumbnailCount = countVisibleThumbnails();
    debugLog(`Before upload: ${initialThumbnailCount} thumbnails visible`);
    
    let uploaded = false;
    let retryCount = 0;
    const MAX_RETRIES = 2;
    
    while (!uploaded && retryCount < MAX_RETRIES) {
      try {
        // Convert base64 to File object
        const file = base64ToFile(img.data, img.name || `product-${i + 1}.jpg`);
        debugLog(`Created file: ${file.name}, size: ${file.size} bytes`);
        
        // Create DataTransfer object
        const dt = new DataTransfer();
        dt.items.add(file);
        
        if (fileInput) {
          debugLog('Using file input method');
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          fileInput.dispatchEvent(new Event('input', { bubbles: true }));
          
        } else if (dropZone) {
          debugLog('Using drag & drop method');
          dropZone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
          dropZone.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
          dropZone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
        }
        
        // Wait for DOM verification (thumbnail should appear)
        const confirmed = await waitForThumbnailIncrease(initialThumbnailCount, CONFIRMATION_TIMEOUT);
        
        if (confirmed) {
          successCount++;
          uploaded = true;
          debugLog(`✅ Image ${i + 1} upload confirmed`);
          showNotification(`📷 ${t('uploadingPhotos')} (${successCount}/${images.length})`, 'info', 2000);
        } else {
          retryCount++;
          debugWarn(`Image ${i + 1} not confirmed, retry ${retryCount}/${MAX_RETRIES}`);
          await new Promise(r => setTimeout(r, 500));
        }
        
      } catch (error) {
        retryCount++;
        debugWarn(`Image ${i + 1} error: ${error.message}`);
        if (retryCount >= MAX_RETRIES) {
          failCount++;
          consecutiveFailures++;
          debugWarn(`Image ${i + 1} failed after ${MAX_RETRIES} retries`);
        }
      }
    }
    
    if (!uploaded) {
      failCount++;
      consecutiveFailures++;
    } else {
      // Reset consecutive failures on success
      consecutiveFailures = 0;
    }
    
    // Log final thumbnail count
    const finalCount = countVisibleThumbnails();
    debugLog(`After upload ${i + 1}: ${finalCount} thumbnails visible`);
    
    // Check for Vinted error modal (Something went wrong, etc.)
    if (detectVintedErrorModal()) {
      debugWarn('⚠️ Vinted error modal detected - stopping upload immediately');
      showNotification(`⚠️ Vinted error - upload stopped after ${successCount} photos`, 'error', 5000);
      break; // Exit loop immediately
    }
    
    // Stop uploading if too many consecutive failures (Vinted rate limit or system error)
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      debugWarn(`⚠️ ${consecutiveFailures} consecutive failures - stopping image upload to prevent Vinted crash`);
      showNotification(`⚠️ Upload stopped after ${successCount} photos (Vinted limit)`, 'warning', 5000);
      break; // Exit loop, proceed with rest of autofill
    }
    
    // Wait between uploads (longer delay for stability)
    if (i < images.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_UPLOADS));
    }
  }
  
  debugLog('=== IMAGE UPLOAD COMPLETE ===');
  debugLog(`Success: ${successCount}, Failed: ${failCount}`);
  
  if (failCount > 0) {
    showNotification(`📷 ${successCount}/${images.length} ${t('photosUploaded')}. ${failCount} ${t('failed')}.`, 'warning', 5000);
  } else if (successCount > 0) {
    showNotification(`📷 ${successCount} ${t('photosUploaded')}!`, 'success', 3000);
  } else {
    showNotification(`⚠️ ${t('photoUploadFailed')}`, 'warning', 4000);
  }
  
  return successCount > 0;
}

// Convert base64 to File object
function base64ToFile(base64, filename) {
  try {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error('AutoPoster: Error converting base64 to file:', error);
    throw error;
  }
}

// Handle Vinted specific autofill
// skipImageUpload: true if images were already uploaded in handlePaste() flow
async function handleVintedAutofill(data, skipImageUpload = false) {
  const selectors = PLATFORM_SELECTORS.vinted;
  const results = [];
  
  // Wait a bit for dynamic content to load
  await new Promise(r => setTimeout(r, 500));
  
  // Try image upload (SKIP if already done in handlePaste)
  if (!skipImageUpload && data.savedImages && data.savedImages.length > 0) {
    debugLog('Starting image upload with', data.savedImages.length, 'images');
    await uploadImagesToVinted(data.savedImages);
    await new Promise(r => setTimeout(r, 800));
  } else if (skipImageUpload) {
    debugLog('Skipping image upload (already done in handlePaste)');
  }
  
  // Fill title
  if (data.lastTitle) {
    await waitForElement(selectors.titleField);
    results.push({ ...fillField(selectors.titleField, data.lastTitle, t('title')), key: 'title' });
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Fill description
  if (data.lastFormattedText) {
    await waitForElement(selectors.descriptionField);
    results.push({ ...fillField(selectors.descriptionField, data.lastFormattedText, t('description')), key: 'description' });
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Fill price
  if (data.lastPrice) {
    await waitForElement(selectors.priceField);
    results.push({ ...fillField(selectors.priceField, data.lastPrice, t('price')), key: 'price' });
  }
  
  return results;
}

// Main paste handler with progress steps
async function handlePaste() {
  const btn = document.getElementById('autoposter-paste-btn');
  const platform = detectPlatform();
  
  if (!platform || !btn) {
    showNotification(t('platformNotRecognized'), 'error');
    return;
  }
  
  const pasteStartedAt = Date.now();
  btn.innerHTML = `${AP_SPINNER}<span>${t('filling')}</span>`;
  btn.disabled = true;
  btn.style.opacity = '0.7';
  
  try {
    // Get stored data from extension (including saved images for upload)
    const data = await chrome.storage.local.get([
      'lastFormattedText', 
      'lastTitle', 
      'lastPrice', 
      'lastCategory',
      'lastCategoryPath',
      'lastVinted',
      'lastListingId',
      'listingData',
      'savedImages'
    ]);

    // Only paste text that belongs to the listing that is in the popup now (its photos are savedImages).
    // Old or mismatched text is never combined with new photos.
    const payloadIsCurrent = Boolean(data.lastListingId) &&
      data.lastListingId === (data.listingData && data.listingData.listingId);
    
    debugLog('Retrieved data:', {
      payloadIsCurrent,
      hasFormattedText: !!data.lastFormattedText,
      hasTitle: !!data.lastTitle,
      hasPrice: !!data.lastPrice,
      hasCategoryPath: !!data.lastCategoryPath,
      imageCount: data.savedImages?.length || 0
    });
    
    if (!payloadIsCurrent || (!data.lastFormattedText && !data.lastTitle)) {
      showNotification(t('noData'), 'error');
      resetButton(btn);
      return;
    }

    // Make listing context available for category repair & diagnostics.
    // (Previously this was often empty, so "Trading cards" couldn't be refined.)
    window.autoFillerData = {
      title: data.lastTitle || '',
      description: data.lastFormattedText || '',
      category: data.lastCategory || null,
      categoryPath: data.lastCategoryPath || null,
    };
    
    // Track if we uploaded images (to avoid double upload in handleVintedAutofill)
    let imagesAlreadyUploaded = false;
    
    // STEP 1: Upload images FIRST (this triggers Vinted to render the category dropdown)
    if (data.savedImages && data.savedImages.length > 0) {
      showNotification(`⏳ ${t('stepPhotos')}`, 'info', 2000);
      debugLog('Uploading images FIRST to trigger category dropdown render');
      await uploadImagesToVinted(data.savedImages);
      imagesAlreadyUploaded = true;
      await new Promise(r => setTimeout(r, 1500)); // Wait for Vinted UI to fully update
    }
    
    // STEP 2: Title, description and price first: the most important fields, and quick.
    // (Vinted also uses the title to suggest a category.)
    showNotification(`⏳ ${t('stepFields')}`, 'info', 2000);
    await new Promise(r => setTimeout(r, 300));
    
    // Pass flag to skip image upload if already done
    const results = await handleVintedAutofill(data, imagesAlreadyUploaded);
    
    // STEP 3: Category, then the fields Vinted shows for that category (brand, size, condition, colour, material).
    // Uses Vinted's own ids (same in every language); the old name-based picker is the fallback.
    const vinted = data.lastVinted && typeof data.lastVinted === 'object' ? data.lastVinted : null;
    const filler = window.AutoposterVinted;
    if (vinted && filler) {
      showNotification(`⏳ ${t('stepCategory')}`, 'info', 2000);
      let categoryOk = await filler.selectCategory(vinted.catalogId);
      if (!categoryOk && data.lastCategoryPath) {
        categoryOk = await selectVintedCategory(data.lastCategoryPath);
      }
      results.push({ success: !!categoryOk, fieldName: t('category'), key: 'category' });
      if (categoryOk) {
        showNotification(`⏳ ${t('stepDetails')}`, 'info', 2500);
        const done = await filler.fillVintedFields(vinted, { category: false });
        for (const [key, ok] of Object.entries(done)) {
          if (ok !== undefined) results.push({ success: !!ok, fieldName: t(key), key });
        }
      } else if (data.lastCategory) {
        showNotification(`💡 ${t('categoryHint')}: ${data.lastCategory}`, 'info', 4000);
      }
    } else if (data.lastCategoryPath) {
      showNotification(`⏳ ${t('stepCategory')}`, 'info', 2000);
      const categorySuccess = await selectVintedCategory(data.lastCategoryPath);
      if (!categorySuccess && data.lastCategory) {
        // Fallback to showing category hint
        showNotification(`💡 ${t('categoryHint')}: ${data.lastCategory}`, 'info', 4000);
      }
      await new Promise(r => setTimeout(r, 500));
    }
    
    // Process results
    const successfulFields = results.filter(r => r.success).map(r => r.fieldName);
    const failedFields = results.filter(r => !r.success).map(r => r.fieldName);

    // Measure whether Paste worked (field names and counts only, never the listing text)
    try {
      chrome.runtime.sendMessage({
        action: 'trackEvent',
        event: 'paste_completed',
        extra: {
          platform: 'vinted',
          site: location.hostname,
          filled: successfulFields.length,
          failed: failedFields.length,
          failedFields: results.filter(r => !r.success).map(r => r.key || 'other').slice(0, 10),
          photos: data.savedImages?.length || 0,
          seconds: Math.round((Date.now() - pasteStartedAt) / 1000)
        }
      });
    } catch (_) { /* meten mag plakken nooit storen */ }
    
    if (successfulFields.length > 0) {
      if (failedFields.length > 0) {
        // Partial success
        showNotification(
          `✅ ${t('step3Done')}\n${t('filledFields')}: ${successfulFields.join(', ')}\n⚠️ ${t('manualFields')}: ${failedFields.join(', ')}`,
          'info',
          5000
        );
      } else {
        // Full success
        showNotification(`✅ ${t('step3Done')} - ${successfulFields.join(', ')}`, 'success', 3000);
      }
    } else if (results.length > 0) {
      // All fields failed - use clipboard fallback
      const fullText = buildFallbackText(data);
      await navigator.clipboard.writeText(fullText);
      showNotification(`📋 ${t('copyFallback')}`, 'info', 5000);
    } else {
      showNotification(t('noData'), 'error');
    }
    
  } catch (error) {
    console.error('AutoPoster paste error:', error);
    showNotification(t('couldNotFill'), 'error');
  }
  
  resetButton(btn);
}

// Build fallback text for clipboard
function buildFallbackText(data) {
  const parts = [];
  if (data.lastTitle) parts.push(data.lastTitle);
  if (data.lastFormattedText) parts.push(data.lastFormattedText);
  if (data.lastPrice) {
    const priceLabel = currentLang === 'nl' ? 'Prijs' : 'Price';
    parts.push(`${priceLabel}: €${data.lastPrice}`);
  }
  return parts.join('\n\n');
}

// Reset button state
function resetButton(btn) {
  btn.innerHTML = `${AP_BOLT_SVG}<span>${t('paste')}</span>`;
  btn.disabled = false;
  btn.style.opacity = '1';
}

// Show notification with improved styling
function showNotification(message, type = 'info', duration = 4000) {
  // Remove existing notification
  const existing = document.getElementById('autoposter-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'autoposter-notification';
  
  notification.className = `autoposter-note autoposter-note-${['success', 'error', 'warning'].includes(type) ? type : 'info'}`;
  notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
  // Geen emoji in meldingen; de kleur van het stipje zegt genoeg
  notification.textContent = String(message)
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/^[ \t]+/gm, '')
    .trim();
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('is-leaving');
    setTimeout(() => notification.remove(), 200);
  }, duration);
}

// Add CSS animations
function addStyles() {
  if (document.getElementById('autoposter-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'autoposter-styles';
  style.textContent = '';
  document.head.appendChild(style);
}

// Only the Vinted sell page (/items/new) and edit page (/items/<id>/edit) get the paste button.
// Optional language prefix (e.g. /fr/items/new) for multi-language Vinted sites.
const LISTING_PATH_RE = /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/items\/(?:new|\d+\/edit)\/?$/i;

function isListingPage() {
  return LISTING_PATH_RE.test(location.pathname);
}

function removeAutoposterButtons() {
  document.getElementById('autoposter-paste-btn')?.remove();
  document.getElementById('autoposter-debug-btn')?.remove();
}

// Remember which Vinted country site the user uses, so the popup opens the same one
function rememberVintedOrigin() {
  const origin = location.origin;
  if (typeof AP_CONFIG !== 'undefined' && !AP_CONFIG.VINTED_ORIGINS.includes(origin)) return;
  chrome.storage.local.get(['lastVintedOrigin'], (result) => {
    if (result.lastVintedOrigin !== origin) {
      chrome.storage.local.set({ lastVintedOrigin: origin });
    }
  });
}

// Show the button on sell/edit pages, remove it everywhere else
let buttonTimer = null;
function updatePasteButton() {
  clearTimeout(buttonTimer);
  buttonTimer = null;
  if (!isListingPage()) {
    removeAutoposterButtons();
    return;
  }
  if (document.getElementById('autoposter-paste-btn')) return;
  
  // Give Vinted's form a moment to render
  buttonTimer = setTimeout(() => {
    buttonTimer = null;
    if (!isListingPage() || document.getElementById('autoposter-paste-btn') || !document.body) return;
    addStyles();
    document.body.appendChild(createPasteButton());
    if (DEBUG_MODE) {
      document.body.appendChild(createDebugButton());
      debugLog('Paste button added');
    }
  }, 1000);
}

// Initialize
function init() {
  if (!detectPlatform()) return;
  
  loadLanguage();
  rememberVintedOrigin();
  updatePasteButton();
  
  // Vinted is a single-page app: watch the path cheaply (no DOM observer)
  let lastPath = location.pathname;
  const checkPath = () => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      updatePasteButton();
    } else if (!buttonTimer && isListingPage() && !document.getElementById('autoposter-paste-btn')) {
      // Button got removed by a page re-render: put it back
      updatePasteButton();
    }
  };
  window.addEventListener('popstate', checkPath);
  setInterval(checkPath, 1000);
}

init();

// Listen for language changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.language) {
    currentLang = changes.language.newValue || BROWSER_LANG;
    updateButtonText();
  }
});
