// AutoPoster Pro - Settings Page

const currentPlatform = 'vinted';
let templates = {};

// Example templates (NL)
const exampleTemplatesNL = {
  vinted: `{{title}} | {{condition}}

{{description}}

━━━━━━━━━━━━━━━━━━
{{brand}} {{color}} {{size}}

✓ Snelle verzending
✓ Vragen? Stuur een berichtje!

{{tags}}`
};

// Example templates (EN)
const exampleTemplatesEN = {
  vinted: `{{title}} | {{condition}}

{{description}}

━━━━━━━━━━━━━━━━━━
{{brand}} {{color}} {{size}}

✓ Fast shipping
✓ Questions? Send me a message!

{{tags}}`
};

// Default templates (empty = use AI). Only Vinted is supported.
const defaultTemplates = {
  vinted: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await window.i18n.loadLanguage();
  chrome.storage.local.get(['theme'], (result) => {
    const theme = result.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  });
  loadTemplates();
  loadCurrentPlan();
  document.getElementById('manageSubscriptionBtn').href = AP_CONFIG.GUMROAD.LIBRARY_URL;
  setupEventListeners();
  updateLanguageButtons();
  translateUI();
});

function setupEventListeners() {
  // Back button
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'popup.html';
  });

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      window.i18n.setLanguage(lang);
      updateLanguageButtons();
      translateUI();
      loadCurrentPlan();
      showToast(lang === 'nl' ? 'Taal gewijzigd naar Nederlands' : 'Language changed to English', 'success');
    });
  });

  // Save template
  document.getElementById('saveTemplateBtn').addEventListener('click', () => {
    saveCurrentTemplate();
    saveTemplates();
    const lang = window.i18n.getCurrentLanguage();
    showToast(lang === 'nl' ? 'Template opgeslagen!' : 'Template saved!', 'success');
  });

  // Reset template (use AI)
  document.getElementById('resetTemplateBtn').addEventListener('click', () => {
    document.getElementById('templateEditor').value = '';
    templates[currentPlatform] = '';
    saveTemplates();
    const lang = window.i18n.getCurrentLanguage();
    const msg = lang === 'nl' 
      ? 'Template verwijderd. AI wordt gebruikt.' 
      : 'Template removed. AI will be used.';
    showToast(msg, 'info');
  });

  // Load example template button
  document.getElementById('loadExampleBtn')?.addEventListener('click', loadExampleTemplate);

  // Placeholder click to insert
  document.querySelectorAll('.placeholder-grid code').forEach(code => {
    code.addEventListener('click', () => {
      const editor = document.getElementById('templateEditor');
      const placeholder = code.textContent;
      
      // Insert at cursor position
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = editor.value;
      editor.value = text.substring(0, start) + placeholder + text.substring(end);
      editor.selectionStart = editor.selectionEnd = start + placeholder.length;
      editor.focus();
    });
  });
}

function loadExampleTemplate() {
  const lang = window.i18n.getCurrentLanguage();
  const examples = lang === 'nl' ? exampleTemplatesNL : exampleTemplatesEN;
  const example = examples[currentPlatform] || '';
  
  document.getElementById('templateEditor').value = example;
  templates[currentPlatform] = example;
  
  const msg = lang === 'nl' 
    ? 'Voorbeeldsjabloon geladen'
    : 'Example template loaded';
  showToast(msg, 'success');
}

function updateLanguageButtons() {
  const currentLang = window.i18n.getCurrentLanguage();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function translateUI() {
  const lang = window.i18n.getCurrentLanguage();
  document.documentElement.lang = lang;
  
  // Update data-i18n elements
  const i18nElements = {
    'language': lang === 'nl' ? 'Taal' : 'Language',
    'templates': lang === 'nl' ? 'Eigen sjabloon' : 'Own template',
    'templatesDescription': lang === 'nl' 
      ? 'Maak je eigen sjabloon voor de Vinted-beschrijving. Regels met een lege placeholder worden automatisch weggehaald.'
      : 'Create your own template for the Vinted description. Lines with an empty placeholder are removed automatically.',
    'availablePlaceholders': lang === 'nl' ? 'Klik op een code om hem in te voegen:' : 'Click a code to insert it:',
    'saveTemplate': lang === 'nl' ? 'Sjabloon opslaan' : 'Save template',
    'useAI': lang === 'nl' ? 'Terug naar AI-tekst' : 'Back to AI text',
    'loadExample': lang === 'nl' ? 'Voorbeeld laden' : 'Load example',
    'placeholderInfo': lang === 'nl' ? 'Wat betekenen de codes?' : 'What do the codes mean?',
    'placeholderTitle': lang === 'nl' ? 'Producttitel' : 'Product title',
    'placeholderPrice': lang === 'nl' ? 'Prijs (alleen getal, zonder €)' : 'Price (number only, without €)',
    'placeholderCondition': lang === 'nl' ? 'Productconditie' : 'Product condition',
    'placeholderCategory': lang === 'nl' ? 'Categorie' : 'Category',
    'placeholderTags': lang === 'nl' ? 'Tags (voor Vinted: als #hashtags)' : 'Tags (for Vinted: as #hashtags)',
    'placeholderDescription': lang === 'nl' ? 'Je beschrijvingstekst' : 'Your description text',
    'placeholderExtraInfo': lang === 'nl' ? 'Extra info (merk, maat, etc.)' : 'Additional info (brand, size, etc.)',
    'placeholderBrand': lang === 'nl' ? 'Merk (uit AI analyse, leeg = regel verwijderd)' : 'Brand (from AI, empty = line removed)',
    'placeholderSize': lang === 'nl' ? 'Maat (uit AI analyse, leeg = regel verwijderd)' : 'Size (from AI, empty = line removed)',
    'placeholderColor': lang === 'nl' ? 'Kleur (uit AI analyse, leeg = regel verwijderd)' : 'Color (from AI, empty = line removed)',
    'placeholderMaterial': lang === 'nl' ? 'Materiaal (uit AI analyse, leeg = regel verwijderd)' : 'Material (from AI, empty = line removed)',
    'settings': lang === 'nl' ? 'Instellingen' : 'Settings',
    'licenseSettings': lang === 'nl' ? 'License Key' : 'License Key',
    'currentLicense': lang === 'nl' ? 'Huidig plan:' : 'Current plan:',
    'changeLicense': lang === 'nl' ? 'Wijzig License' : 'Change License',
    'licenseHelp': lang === 'nl' ? 'Voer een nieuwe license key in om te upgraden naar Starter of Pro.' : 'Enter a new license key to upgrade to Starter or Pro.'
  };

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18nElements[key]) {
      el.textContent = i18nElements[key];
    } else if (window.i18n.translations[lang]?.[key]) {
      // Shared texts (subscription section) live in i18n.js
      el.textContent = window.i18n.t(key);
    }
  });

  // Update placeholder
  const editor = document.getElementById('templateEditor');
  editor.placeholder = lang === 'nl' 
    ? `Voer hier je custom template in...

Voorbeeld:
{{title}} | {{condition}}

{{description}}

{{brand}} {{color}} {{size}}

Prijs: €{{price}}

{{tags}}

TIP: Lege placeholder regels worden automatisch verwijderd!`
    : `Enter your custom template here...

Example:
{{title}} | {{condition}}

{{description}}

{{brand}} {{color}} {{size}}

Price: €{{price}}

{{tags}}

TIP: Empty placeholder lines are automatically removed!`;
}

function loadTemplates() {
  chrome.storage.local.get(['customTemplates'], (result) => {
    templates = result.customTemplates || { ...defaultTemplates };
    loadTemplateForPlatform();
  });
}

function loadTemplateForPlatform() {
  const editor = document.getElementById('templateEditor');
  editor.value = templates[currentPlatform] || '';
}

function saveCurrentTemplate() {
  const editor = document.getElementById('templateEditor');
  templates[currentPlatform] = editor.value.trim();
}

function saveTemplates() {
  chrome.storage.local.set({ customTemplates: templates }).catch((error) => {
    console.error('Saving templates failed:', error);
    showToast(window.i18n.t('storageFull'), 'error');
  });
}

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Load current plan for subscription section
function loadCurrentPlan() {
  chrome.storage.local.get(['licenseData'], (result) => {
    const badge = document.getElementById('currentPlanBadge');
    if (!badge) return;
    
    const tier = result.licenseData?.tier || 'free';
    const tierKey = { free: 'tierFree', starter: 'tierStarter', pro: 'tierPro' }[tier];
    badge.textContent = tierKey ? window.i18n.t(tierKey) : tier.charAt(0).toUpperCase() + tier.slice(1);
    badge.className = `plan-badge ${tier}`;
  });
}

