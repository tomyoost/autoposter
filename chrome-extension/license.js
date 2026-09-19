// AutoPoster Pro - License Activation

const SUPABASE_URL = 'https://JOUW_PROJECT_ID.supabase.co';
const VERIFY_LICENSE_URL = `${SUPABASE_URL}/functions/v1/verify-license`;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load i18n
  await window.i18n.loadLanguage();
  
  // Load theme
  loadTheme();
  
  // Update UI
  updateUI();
  
  // Check existing license
  checkExistingLicense();
  
  // Setup event listeners
  setupEventListeners();
});

function loadTheme() {
  chrome.storage.local.get(['theme'], (result) => {
    document.body.setAttribute('data-theme', result.theme || 'dark');
  });
}

function updateUI() {
  const t = window.i18n.t;
  const lang = window.i18n.getCurrentLanguage();
  
  // Update language toggle
  const langToggle = document.getElementById('langToggle');
  langToggle.textContent = lang === 'nl' ? '🇳🇱' : '🇬🇧';
  langToggle.title = lang === 'nl' ? 'Switch to English' : 'Wissel naar Nederlands';
  
  // Update all i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
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
    // Already has valid license, redirect to popup
    window.location.href = 'popup.html';
  }
}

async function handleActivation() {
  const t = window.i18n.t;
  const input = document.getElementById('licenseKey');
  const btn = document.getElementById('activateBtn');
  const btnText = document.getElementById('activateBtnText');
  const errorEl = document.getElementById('errorMessage');
  
  const licenseKey = input.value.trim().toUpperCase();
  
  if (!licenseKey) {
    input.classList.add('error');
    errorEl.textContent = t('licenseInvalid');
    return;
  }
  
  // Show loading state
  btn.disabled = true;
  btnText.textContent = t('licenseActivating');
  
  try {
    const isValid = await validateLicense(licenseKey);
    
    if (isValid) {
      input.classList.remove('error');
      input.classList.add('success');
      btn.classList.add('success');
      btnText.textContent = t('licenseSuccess');
      
      // Save license and show onboarding for new users
      await chrome.storage.local.set({
        licenseKey,
        licenseValidated: true,
        showOnboarding: true
      });
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = 'popup.html';
      }, 1000);
    } else {
      input.classList.add('error');
      errorEl.textContent = t('licenseInvalid');
      btn.disabled = false;
      btnText.textContent = t('licenseActivate');
    }
  } catch (error) {
    console.error('License validation error:', error);
    input.classList.add('error');
    errorEl.textContent = error.message || t('licenseInvalid');
    btn.disabled = false;
    btnText.textContent = t('licenseActivate');
  }
}

async function validateLicense(licenseKey) {
  // Check internet connection first
  if (!navigator.onLine) {
    throw new Error(window.i18n.t('noInternet') || 'Geen internetverbinding');
  }
  
  try {
    const response = await fetch(VERIFY_LICENSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });
    
    const data = await response.json();
    
    if (data.valid) {
      // Store license data
      await chrome.storage.local.set({
        licenseData: {
          tier: data.tier,
          usageCount: data.usageCount,
          usageLimit: data.usageLimit,
          usageLeft: data.usageLeft,
          canUseAI: data.canUseAI
        }
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('API error:', error);
    throw new Error('Connection error. Please try again.');
  }
}
