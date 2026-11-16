// Autoposter - Upgrade Page
// Needs config.js, i18n.js and license-api.js loaded first.

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load i18n
  await window.i18n.loadLanguage();
  
  // Load theme
  loadTheme();
  
  // Contact/feedback link comes from config.js
  const feedbackLink = document.getElementById('feedbackLink');
  if (feedbackLink) feedbackLink.href = AP_CONFIG.FEEDBACK_URL;
  
  // Update UI
  updateUI();
  
  // Load current plan
  loadCurrentPlan();
  
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

  // Getallen en prijzen in de schrijfwijze van de taal (NL: 1.000 en €29,99; EN: 1,000 and €29.99)
  const locale = lang === 'nl' ? 'nl-NL' : 'en-GB';
  document.querySelectorAll('[data-num]').forEach(el => {
    el.textContent = Number(el.dataset.num).toLocaleString(locale);
  });
  document.querySelectorAll('[data-price]').forEach(el => {
    const price = Number(el.dataset.price);
    el.textContent = new Intl.NumberFormat(locale, {
      style: 'currency', currency: 'EUR', minimumFractionDigits: price % 1 ? 2 : 0,
    }).format(price);
  });
}

function setupEventListeners() {
  // Language toggle
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = window.i18n.getCurrentLanguage();
      const newLang = currentLang === 'nl' ? 'en' : 'nl';
      window.i18n.setLanguage(newLang);
      updateUI();
      loadCurrentPlan();
    });
  }
  
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'popup.html';
    });
  }
  
  // Upgrade buttons: one Gumroad membership product, the buyer picks Starter or Pro there
  document.querySelectorAll('.upgrade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      handleUpgrade();
    });
  });
  
  // Re-check the stored key after upgrading on Gumroad
  const refreshPlanBtn = document.getElementById('refreshPlanBtn');
  if (refreshPlanBtn) {
    refreshPlanBtn.addEventListener('click', handleRefreshPlan);
  }
  
  // License key activation
  const activateBtn = document.getElementById('activateLicenseBtn');
  const licenseInput = document.getElementById('licenseKeyInput');
  
  if (activateBtn) {
    activateBtn.addEventListener('click', handleActivateLicense);
  }
  
  if (licenseInput) {
    licenseInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleActivateLicense();
      }
    });
  }
}

async function loadCurrentPlan() {
  const result = await chrome.storage.local.get(['licenseData']);
  const t = window.i18n.t;
  
  const tierEl = document.getElementById('currentTier');
  const usageEl = document.getElementById('currentUsage');
  
  if (!tierEl || !usageEl) return;
  
  if (result.licenseData) {
    const data = { ...result.licenseData, tier: result.licenseData.tier || 'free' };
    const tierName = t(`tier${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}`);
    tierEl.textContent = tierName;
    
    if (data.usageLimit === -1) {
      usageEl.textContent = `${data.usageCount} (${t('unlimited')})`;
    } else {
      usageEl.textContent = `${data.usageCount}/${data.usageLimit}`;
    }
    
    updateCardStates(data.tier || 'free');
  } else {
    tierEl.textContent = t('tierFree');
    usageEl.textContent = `0/${AP_CONFIG.TIER_LIMITS.free}`;
    updateCardStates('free');
  }
}

function updateCardStates(currentTier) {
  const t = window.i18n.t;
  const cards = document.querySelectorAll('.pricing-card');
  const tierOrder = ['free', 'starter', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  cards.forEach(card => {
    const cardTier = card.dataset.tier;
    const btn = card.querySelector('.btn');
    const cardIndex = tierOrder.indexOf(cardTier);
    
    btn.classList.remove('btn-primary', 'btn-secondary', 'btn-outline', 'current-btn', 'upgrade-btn');
    btn.disabled = false;
    btn.style.visibility = '';
    card.classList.remove('current');
    
    if (cardTier === currentTier) {
      btn.textContent = t('currentButton');
      btn.disabled = true;
      btn.classList.add('btn-outline', 'current-btn');
      card.classList.add('current');
    } else if (cardIndex > currentIndex) {
      btn.classList.add('upgrade-btn');
      const tierName = t(`tier${cardTier.charAt(0).toUpperCase() + cardTier.slice(1)}`);
      btn.innerHTML = `${t('upgradeButton')} ${tierName}`;
      
      if (cardTier === 'starter') {
        btn.classList.add('btn-primary');
      } else {
        btn.classList.add('btn-secondary');
      }
    } else {
      // Lower plan than the current one: no button (it is included in your plan)
      btn.textContent = '';
      btn.disabled = true;
      btn.style.visibility = 'hidden';
    }
  });
}

function handleUpgrade() {
  chrome.tabs.create({ url: AP_CONFIG.GUMROAD.BUY_URL });
}

function showLicenseMessage(text, type) {
  const messageEl = document.getElementById('licenseMessage');
  messageEl.textContent = text;
  messageEl.className = `license-message ${type}`;
}

async function handleActivateLicense() {
  const t = window.i18n.t;
  const input = document.getElementById('licenseKeyInput');
  const btn = document.getElementById('activateLicenseBtn');
  
  // Check internet connection first
  if (!navigator.onLine) {
    showLicenseMessage(t('noInternet'), 'error');
    return;
  }
  
  // No format check here: Gumroad keys and manual keys are both valid, the server decides
  const licenseKey = normalizeLicenseKey(input.value);
  if (!licenseKey) {
    showLicenseMessage(t('licenseErrEmpty'), 'error');
    return;
  }
  
  // Show loading state
  btn.disabled = true;
  btn.textContent = '...';
  showLicenseMessage('', '');
  
  try {
    // refresh: true forces a fresh Gumroad check; stores licenseKey, licenseValidated and licenseData
    const activation = await activateLicenseKey(licenseKey);
    
    if (activation.ok) {
      showLicenseMessage(t('licenseChanged'), 'success');
      input.value = '';
      loadCurrentPlan();
    } else {
      // The previously stored key (if any) is left untouched
      showLicenseMessage(licenseErrorMessage(activation.result, t), 'error');
    }
  } catch (error) {
    console.error('License activation error:', error);
    showLicenseMessage(t('licenseNetworkError'), 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = t('activateLicense');
  }
}

async function handleRefreshPlan() {
  const t = window.i18n.t;
  const btn = document.getElementById('refreshPlanBtn');
  const { licenseKey } = await chrome.storage.local.get(['licenseKey']);
  
  if (!licenseKey) {
    window.location.href = 'license.html';
    return;
  }
  if (!navigator.onLine) {
    showLicenseMessage(t('noInternet'), 'error');
    return;
  }
  
  btn.disabled = true;
  try {
    const activation = await activateLicenseKey(licenseKey);
    if (activation.ok) {
      showLicenseMessage(t('planRefreshed'), 'success');
      loadCurrentPlan();
    } else if (isLicenseRejected(activation.result)) {
      // Server says this key is no longer valid: forget it and go back to the key screen
      await chrome.storage.local.remove(['licenseValidated', 'licenseData', 'licenseKey']);
      await chrome.storage.local.set({ licenseNotice: activation.result.data.error_code });
      window.location.href = 'license.html';
    } else {
      // Network error or server trouble: keep the stored key
      showLicenseMessage(licenseErrorMessage(activation.result, t), 'error');
    }
  } catch (error) {
    console.error('Plan refresh error:', error);
    showLicenseMessage(t('licenseNetworkError'), 'error');
  } finally {
    btn.disabled = false;
  }
}
