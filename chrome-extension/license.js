// Autoposter - License Activation (first screen)
// Needs config.js, i18n.js and license-api.js loaded first.

// Welcome mode: this page opened in a tab right after installing (background.js)
const PARAMS = new URLSearchParams(location.search);
const WELCOME = PARAMS.get('welcome') === '1';
const FROM_OLD_VERSION = PARAMS.get('update') === '1';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  if (WELCOME) {
    document.body.classList.add('welcome-mode');
    document.getElementById('welcome').hidden = false;
    document.getElementById('welcomeUpdate').hidden = !FROM_OLD_VERSION;
  }

  // Load i18n
  await window.i18n.loadLanguage();
  
  // Load theme
  loadTheme();
  
  // Gumroad links come from config.js
  applyConfigLinks();
  
  // Update UI
  updateUI();
  
  // Check existing license
  checkExistingLicense();
  
  // Explain why the user is back here (key was rejected by the server)
  showLicenseNotice();
  
  // Setup event listeners
  setupEventListeners();
});

function loadTheme() {
  chrome.storage.local.get(['theme'], (result) => {
    const theme = result.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.body.setAttribute('data-theme', theme);
  });
}

function updateUI() {
  const t = window.i18n.t;
  const lang = window.i18n.getCurrentLanguage();
  
  // Update language toggle
  const langToggle = document.getElementById('langToggle');
  langToggle.textContent = lang === 'nl' ? 'NL' : 'EN';
  document.documentElement.lang = lang;
  langToggle.title = lang === 'nl' ? 'Switch to English' : 'Wissel naar Nederlands';
  
  // Update all i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
}

function applyConfigLinks() {
  document.querySelectorAll('a[data-config-url]').forEach(link => {
    const url = AP_CONFIG.GUMROAD[link.dataset.configUrl];
    if (url) link.href = url;
  });
}

async function showLicenseNotice() {
  const { licenseNotice } = await chrome.storage.local.get(['licenseNotice']);
  if (!licenseNotice) return;
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = licenseErrorMessage({ status: 200, data: { error_code: licenseNotice } }, window.i18n.t);
  await chrome.storage.local.remove(['licenseNotice']);
}

function setupEventListeners() {
  // Language toggle
  document.getElementById('langToggle').addEventListener('click', () => {
    const currentLang = window.i18n.getCurrentLanguage();
    const newLang = currentLang === 'nl' ? 'en' : 'nl';
    window.i18n.setLanguage(newLang);
    updateUI();
  });
  
  // Activate button
  document.getElementById('activateBtn').addEventListener('click', handleActivation);
  
  // Enter key
  document.getElementById('licenseKey').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleActivation();
  });
  
  // Clear error on input
  document.getElementById('licenseKey').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
    document.getElementById('licenseKey').classList.remove('error');
    document.getElementById('errorMessage').textContent = '';
  });
}

async function checkExistingLicense() {
  const result = await chrome.storage.local.get(['licenseValidated', 'licenseKey']);
  
  if (result.licenseValidated && result.licenseKey) {
    // Already has a valid license: in the welcome tab say it is ready, in the popup go to the main screen
    if (WELCOME && !FROM_OLD_VERSION) showWelcomeDone();
    else if (!WELCOME) window.location.href = 'popup.html';
  }
}

async function handleActivation() {
  const t = window.i18n.t;
  const input = document.getElementById('licenseKey');
  const btn = document.getElementById('activateBtn');
  const btnText = document.getElementById('activateBtnText');
  const errorEl = document.getElementById('errorMessage');
  
  const licenseKey = normalizeLicenseKey(input.value);
  
  if (!licenseKey) {
    input.classList.add('error');
    errorEl.textContent = t('licenseErrEmpty');
    return;
  }
  
  if (!navigator.onLine) {
    input.classList.add('error');
    errorEl.textContent = t('noInternet');
    return;
  }
  
  // Show loading state
  btn.disabled = true;
  btnText.textContent = t('licenseActivating');
  errorEl.textContent = '';
  
  try {
    // Forces a fresh Gumroad check (refresh: true) and stores key + licenseData on success
    const activation = await activateLicenseKey(licenseKey);
    
    if (activation.ok) {
      input.classList.remove('error');
      input.classList.add('success');
      btn.classList.add('success');
      btnText.textContent = t('licenseSuccess');
      
      // Show onboarding for new users
      await chrome.storage.local.set({ showOnboarding: true });
      if (typeof trackEvent === 'function') trackEvent('license_activated', { welcome: WELCOME });
      
      if (WELCOME) {
        // Welcome tab: the popup opens from the toolbar icon, so explain that instead of loading the popup here
        showWelcomeDone();
      } else {
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = 'popup.html';
        }, 1000);
      }
    } else {
      input.classList.add('error');
      errorEl.textContent = licenseErrorMessage(activation.result, t);
      btn.disabled = false;
      btnText.textContent = t('licenseActivate');
    }
  } catch (error) {
    console.error('License activation error:', error);
    input.classList.add('error');
    errorEl.textContent = t('licenseNetworkError');
    btn.disabled = false;
    btnText.textContent = t('licenseActivate');
  }
}

function showWelcomeDone() {
  document.getElementById('welcome').hidden = true;
  document.getElementById('keyGroup').hidden = true;
  document.getElementById('activateBtn').hidden = true;
  document.getElementById('subtitle').hidden = true;
  document.getElementById('welcomeDone').hidden = false;
}
