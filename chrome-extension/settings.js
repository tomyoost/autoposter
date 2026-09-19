// AutoPoster Pro - Settings Page

let currentPlatform = 'vinted';
let templates = {};

// Improved SEO-optimized example templates (NL)
const exampleTemplatesNL = {
  vinted: `{{title}} | {{condition}}

{{description}}

━━━━━━━━━━━━━━━━━━
{{brand}} {{color}} {{size}}

✓ Snelle verzending
✓ Vragen? Stuur een berichtje!

{{tags}}`,

  marktplaats: `{{title}}

{{description}}

━━━━━ PRODUCTDETAILS ━━━━━
{{brand}} | {{color}} | {{size}} | {{condition}}

✔ Ophalen of verzenden mogelijk
✔ Snel antwoord op berichten
✔ Bekijk ook mijn andere advertenties!

Prijs: €{{price}}`,

  facebook: `{{title}} | {{condition}}

{{description}}

{{brand}} {{color}} {{size}}

€{{price}} ─ Stuur een bericht!
✓ Lokaal ophalen mogelijk`,

  etsy: `{{title}} - {{condition}}

{{description}}

━━━━━━ ITEM DETAILS ━━━━━━
• Brand: {{brand}}
• Color: {{color}}
• Size: {{size}}
• Material: {{material}}

✓ Ships within 1-2 business days
✓ Secure packaging
✓ International shipping available

Questions? Feel free to message me!`,

  ebay: `{{title}} - {{condition}}

{{description}}

━━━━━━ SPECIFICATIONS ━━━━━━
• Brand: {{brand}}
• Color: {{color}}
• Size: {{size}}
• Material: {{material}}

✓ Fast dispatch (1-2 business days)
✓ Professional packaging
✓ Worldwide shipping available

Buy with confidence - check my feedback!`
};

// Improved SEO-optimized example templates (EN)
const exampleTemplatesEN = {
  vinted: `{{title}} | {{condition}}

{{description}}

━━━━━━━━━━━━━━━━━━
{{brand}} {{color}} {{size}}

✓ Fast shipping
✓ Questions? Send me a message!

{{tags}}`,

  marktplaats: `{{title}}

{{description}}

━━━━━ PRODUCT DETAILS ━━━━━
{{brand}} | {{color}} | {{size}} | {{condition}}

✔ Pickup or shipping available
✔ Quick response to messages
✔ Check out my other listings!

Price: €{{price}}`,

  facebook: `{{title}} | {{condition}}

{{description}}

{{brand}} {{color}} {{size}}

€{{price}} ─ Send me a message!
✓ Local pickup available`,

  etsy: `{{title}} - {{condition}}

{{description}}

━━━━━━ ITEM DETAILS ━━━━━━
• Brand: {{brand}}
• Color: {{color}}
• Size: {{size}}
• Material: {{material}}

✓ Ships within 1-2 business days
✓ Secure packaging
✓ International shipping available

Questions? Feel free to message me!`,

  ebay: `{{title}} - {{condition}}

{{description}}

━━━━━━ SPECIFICATIONS ━━━━━━
• Brand: {{brand}}
• Color: {{color}}
• Size: {{size}}
• Material: {{material}}

✓ Fast dispatch (1-2 business days)
✓ Professional packaging
✓ Worldwide shipping available

Buy with confidence - check my feedback!`
};

// Default templates (empty = use AI)
const defaultTemplates = {
  vinted: '',
  marktplaats: '',
  facebook: '',
  etsy: '',
  ebay: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await window.i18n.loadLanguage();
  loadTemplates();
  loadCurrentPlan();
  setupEventListeners();
  updateLanguageButtons();
  translateUI();
});

const SUPABASE_URL = 'https://JOUW_PROJECT_ID.supabase.co';
const VERIFY_LICENSE_URL = `${SUPABASE_URL}/functions/v1/verify-license`;

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
      showToast(lang === 'nl' ? 'Taal gewijzigd naar Nederlands' : 'Language changed to English', 'success');
    });
  });

  // Template tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Save current template before switching
      saveCurrentTemplate();
      
      // Switch tab
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPlatform = btn.dataset.platform;
      
      // Load template for this platform
      loadTemplateForPlatform();
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
    ? `Voorbeeld template geladen voor ${currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)}`
    : `Example template loaded for ${currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)}`;
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
  
  // Update data-i18n elements
  const i18nElements = {
    'language': lang === 'nl' ? 'Taal' : 'Language',
    'templates': lang === 'nl' ? 'Templates' : 'Templates',
    'templatesDescription': lang === 'nl' 
      ? 'Maak custom templates per platform. Lege placeholder regels worden automatisch verwijderd.'
      : 'Create custom templates for each platform. Empty placeholder lines are automatically removed.',
    'availablePlaceholders': lang === 'nl' ? 'Beschikbare placeholders:' : 'Available placeholders:',
    'saveTemplate': lang === 'nl' ? 'Template Opslaan' : 'Save Template',
    'useAI': lang === 'nl' ? 'Gebruik AI (geen template)' : 'Use AI (no template)',
    'loadExample': lang === 'nl' ? 'Laad Voorbeeld' : 'Load Example',
    'placeholderInfo': lang === 'nl' ? 'Placeholder Info' : 'Placeholder Info',
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
  chrome.storage.local.set({ customTemplates: templates });
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
    badge.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
    badge.className = `plan-badge ${tier}`;
  });
}

