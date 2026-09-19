// AutoPoster Pro - Upgrade Page

const SUPABASE_URL = 'https://JOUW_PROJECT_ID.supabase.co';
const VERIFY_LICENSE_URL = `${SUPABASE_URL}/functions/v1/verify-license`;

// Tier limits for display
const TIER_LIMITS = {
  free: 3,
  starter: 50,
  pro: -1 // unlimited
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load i18n
  await window.i18n.loadLanguage();
  
  // Load theme
  loadTheme();
  
  // Update UI
  updateUI();
  
  // Load current plan
  loadCurrentPlan();
  
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
  
  // Upgrade buttons
  document.querySelectorAll('.upgrade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.tier;
      const url = btn.dataset.url;
      handleUpgrade(tier, url);
    });
  });
  
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
    const data = result.licenseData;
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
    usageEl.textContent = '0/3';
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
      btn.textContent = t('currentButton');
      btn.disabled = true;
      btn.classList.add('btn-outline');
    }
  });
}

function handleUpgrade(tier, url) {
  chrome.tabs.create({ url });
}

async function handleActivateLicense() {
  const t = window.i18n.t;
  const input = document.getElementById('licenseKeyInput');
  const btn = document.getElementById('activateLicenseBtn');
  const messageEl = document.getElementById('licenseMessage');
  
  // Check internet connection first
  if (!navigator.onLine) {
    messageEl.textContent = t('noInternet') || 'Geen internetverbinding';
    messageEl.className = 'license-message error';
    return;
  }
  
  const licenseKey = input.value.trim().toUpperCase();
  
  if (!licenseKey || licenseKey.length < 8) {
    messageEl.textContent = t('licenseInvalid') || 'Please enter a valid license key';
    messageEl.className = 'license-message error';
    return;
  }
  
  // Show loading state
  btn.disabled = true;
  btn.textContent = '...';
  messageEl.textContent = '';
  
  try {
    const response = await fetch(VERIFY_LICENSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });
    
    const data = await response.json();
    
    if (response.ok && data.valid) {
      // Save license data with ALL required fields for popup.js compatibility
      const licenseData = {
        tier: data.tier,
        usageCount: data.usageCount || 0,
        usageLimit: data.usageLimit,  // Fixed: was data.tierLimit
        usageLeft: data.usageLeft,
        canUseAI: data.canUseAI,
        expiresAt: data.expiresAt || null,
        lastChecked: Date.now()
      };
      
      // CRITICAL: Store licenseKey and licenseValidated so popup.js recognizes the new license
      await chrome.storage.local.set({ 
        licenseData,
        licenseKey: licenseKey,
        licenseValidated: true
      });
      
      // Show success
      messageEl.textContent = t('licenseChanged') || `License activated! Welcome to ${data.tier.toUpperCase()}`;
      messageEl.className = 'license-message success';
      input.value = '';
      
      // Refresh the page to show new plan
      loadCurrentPlan();
    } else {
      messageEl.textContent = data.error || t('licenseChangeFailed') || 'Invalid license key';
      messageEl.className = 'license-message error';
    }
  } catch (error) {
    console.error('License activation error:', error);
    messageEl.textContent = t('licenseChangeFailed') || 'Failed to activate license. Please try again.';
    messageEl.className = 'license-message error';
  } finally {
    btn.disabled = false;
    btn.textContent = t('activateLicense') || 'Activeren';
  }
}
