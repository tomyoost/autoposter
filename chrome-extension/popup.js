// Autoposter - Smart Listing Prep Tool
// Server URLs, Gumroad links, tier limits and DEV_MODE live in config.js (AP_CONFIG).
// License helpers (verifyLicenseKey, licenseDataFromResponse, ...) live in license-api.js.
const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB per original photo; we compress before storing
const IMAGE_MAX_SIDE = 1600; // px, longest side of a stored photo
const IMAGE_JPEG_QUALITY = 0.85;
const MAX_IMAGES_FOR_AI = 6; // the server sends at most 6 photos to the AI
const FORM_SAVE_DELAY = 400; // ms debounce for saving text fields
const ANALYZE_TIMEOUT = 60000; // ms; the server stops AI work after about 40 s and answers well within this

// Error codes from the API contract
const LICENSE_ERROR_CODES = ['NO_LICENSE', 'INVALID_LICENSE', 'LICENSE_INACTIVE', 'LICENSE_EXPIRED', 'BAD_FORMAT'];
const AI_RETRYABLE_CODES = ['AI_ERROR', 'AI_NO_CONTENT', 'AI_PARSE_FAIL', 'AI_RATE_LIMIT'];
const IMAGE_ERROR_CODES = ['NO_IMAGE', 'INVALID_IMAGE', 'IMAGE_TOO_LARGE', 'INVALID_FORMAT', 'TOO_MANY_IMAGES', 'PAYLOAD_TOO_LARGE'];

// What "Plakken" on Vinted reads (besides savedImages). Must always describe the listing in the form.
const PASTE_PAYLOAD_KEYS = ['lastFormattedText', 'lastTitle', 'lastPrice', 'lastPlatform', 'lastCategory', 'lastCategoryPath', 'lastVinted', 'lastListingId'];

// Popup condition values → Vinted status ids (the same in every country)
const VINTED_STATUS_IDS = { nieuw: 6, nieuw_zonder: 1, zeer_goed: 2, goed: 3, redelijk: 4 };

// License data (display only; the server decides what is allowed)
let licenseData = {
  tier: 'free',
  usageCount: 0,
  usageLimit: AP_CONFIG.TIER_LIMITS.free,
  usageLeft: AP_CONFIG.TIER_LIMITS.free,
  canUseAI: true
};

// DOM Elements
let uploadArea, imageInput, imagePreviews, generateAIBtn, analyzeImageBtn, useTemplateBtn, aiHint, clearFormBtn, toast;
let uploadedImages = [];
let customTemplates = {};

// Analysis data storage (for template placeholders)
let analysisData = {
  brand: '',
  size: '',
  color: '',
  material: '',
  categoryPath: '', // Store full category path from AI
  quantity: 1, // Default quantity
  vinted: null // Vinted ids from the AI (category, condition, colours, ...) for "Plakken"
};

// Track if template was already applied (to prevent double application)
let templateApplied = false;

// Track if auto-analysis is in progress
let autoAnalyzing = false;

// Track if form was cleared (to reset all fields on new photo upload)
let formWasCleared = false;

// Identifies the listing in the form. A new id is made for every new listing (first photo, or "Wis Formulier").
let currentListingId = null;

// true when the paste payload in storage belongs to currentListingId
let pastePayloadActive = false;

// Pending debounced save of the text fields
let formSaveTimer = null;

// Debug stats tracking (for admin panel) - persisted in chrome.storage.local
let debugStats = {
  // AI Analysis Stats
  totalAnalyses: 0,
  successfulAnalyses: 0,
  failedAnalyses: 0,
  lastError: null,
  lastErrorCode: null,
  lastAnalysisTime: null,
  lastRawResponse: null,
  analysisHistory: [], // last 20 results
  
  // Category Selection Stats (from content script)
  categoryAttempts: 0,
  categorySuccesses: 0,
  categoryFailures: 0,
  lastCategoryError: null,
  categoryErrorHistory: [], // last 10 category errors
  
  // Session Stats
  sessionStart: null,
  lastActiveTime: null,
  totalSessionTime: 0,
  extensionVersion: chrome.runtime.getManifest?.()?.version || 'unknown',
  
  // Performance Metrics
  avgAnalysisTime: 0,
  fastestAnalysis: null,
  slowestAnalysis: null,
  
  // Usage Patterns
  analysisCountByDay: {}, // { 'YYYY-MM-DD': count }
  peakUsageHour: null,
  mostCommonCategory: null,
  categoryUsage: {} // { 'category': count }
};

const DEBUG_STATS_STORAGE_KEY = 'debugStats';

// Debug panel flag. Only available when AP_CONFIG.DEV_MODE is true (Ctrl+Shift+D).
let isAdminMode = false;

// Check license before initializing
async function checkLicense() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['licenseKey', 'licenseValidated', 'licenseData'], async (result) => {
      if (result.licenseValidated && result.licenseKey) {
        // Load cached license data
        if (result.licenseData) {
          licenseData = result.licenseData;
        }
        
        // Refresh license data from server (in background)
        refreshLicenseData(result.licenseKey);
        
        resolve(true);
      } else {
        // Redirect to license page
        window.location.href = 'license.html';
        resolve(false);
      }
    });
  });
}

// Refresh license data from server (in the background, refresh: false = server may use its 6-hour cache)
async function refreshLicenseData(licenseKey) {
  // Check internet connection first
  if (!navigator.onLine) {
    return;
  }
  
  const result = await verifyLicenseKey(licenseKey, { refresh: false });
  
  if (isLicenseValid(result)) {
    licenseData = licenseDataFromResponse(result.data, licenseData);
    await safeStorageSet({ licenseData });
    updateUsageBanner();
  } else if (isLicenseRejected(result)) {
    // Only a definite "this key is not valid" (200 + INVALID_LICENSE/LICENSE_INACTIVE/LICENSE_EXPIRED/BAD_FORMAT)
    // may remove the stored key. Network errors, 5xx and 503 VERIFY_UNAVAILABLE keep it.
    await chrome.storage.local.remove(['licenseValidated', 'licenseData', 'licenseKey']);
    await safeStorageSet({ licenseNotice: result.data.error_code });
    window.location.href = 'license.html';
  } else {
    console.warn('License refresh skipped (status ' + result.status + ' ' + (result.data.error_code || '') + '), using cached data');
  }
}

// Update licenseData from the `usage` object the server returns (analyze-image 200 and 429 QUOTA_EXCEEDED).
// Usage is only counted on the server.
async function applyUsage(usage) {
  if (!usage || typeof usage !== 'object') return;
  licenseData = licenseDataFromResponse(usage, licenseData);
  await safeStorageSet({ licenseData });
  updateUsageBanner();
}

// A function answered 401/403 for the license: tell the user and let verify-license decide about the key.
async function handleLicenseApiError() {
  showToast(window.i18n.t('licenseProblem'), 'error', 6000);
  const { licenseKey } = await chrome.storage.local.get(['licenseKey']);
  if (licenseKey) {
    await refreshLicenseData(licenseKey);
  } else {
    window.location.href = 'license.html';
  }
}

// Localised message for a failed analyze-image / generate-listing call
function apiErrorMessage(status, errorCode, context) {
  const t = window.i18n.t;
  if (errorCode === 'VERIFY_UNAVAILABLE') return t('serviceUnavailable');
  if (errorCode === 'AI_RATE_LIMIT') return t('aiBusy');
  if (errorCode === 'GENERATION_LIMIT') return t('generationLimit');
  if (context === 'analyze' && IMAGE_ERROR_CODES.includes(errorCode)) return t('imageRejected');
  if (status >= 500 && !String(errorCode).startsWith('AI_')) return t('serviceUnavailable');
  return context === 'analyze' ? t('aiFailed') : t('generateFailed');
}

// Parse a JSON body without throwing (gateways can answer with HTML)
async function readJson(response) {
  try {
    return (await response.json()) || {};
  } catch {
    return {};
  }
}

// Error whose message is already a translated, user-facing text
function userFacingError(message) {
  const error = new Error(message);
  error.userFacing = true;
  return error;
}

// Update usage banner UI
function updateUsageBanner() {
  const banner = document.getElementById('usageBanner');
  const usageText = document.getElementById('usageText');
  const usageFill = document.getElementById('usageFill');
  const upgradeBtn = document.getElementById('upgradeBtn');
  
  if (!banner) return;
  
  // Show banner for free and starter tiers
  if (licenseData.tier === 'pro') {
    banner.style.display = 'none';
    return;
  }
  
  banner.style.display = 'flex';
  
  const t = window.i18n?.t || (k => k);
  
  if (licenseData.usageLimit === -1) {
    usageText.textContent = `${licenseData.usageCount} AI analyses (${t('unlimited')})`;
    usageFill.style.width = '100%';
    usageFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
  } else {
    usageText.textContent = `${licenseData.usageCount}/${licenseData.usageLimit} AI analyses`;
    const percentage = (licenseData.usageCount / licenseData.usageLimit) * 100;
    usageFill.style.width = `${Math.min(percentage, 100)}%`;
    
    // Color based on usage
    if (percentage >= 100) {
      usageFill.style.background = '#ef4444';
    } else if (percentage >= 80) {
      usageFill.style.background = '#f59e0b';
    } else {
      usageFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    }
  }
  
  // Show/hide upgrade button
  upgradeBtn.style.display = licenseData.tier !== 'pro' ? 'block' : 'none';
}

// Show onboarding for new users
function checkOnboarding() {
  chrome.storage.local.get(['showOnboarding'], (result) => {
    if (result.showOnboarding) {
      showOnboarding();
    }
  });
}

function showOnboarding() {
  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

function hideOnboarding() {
  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  chrome.storage.local.set({ showOnboarding: false });
}

// Show limit reached modal
function showLimitModal() {
  const modal = document.getElementById('limitModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Hide limit reached modal
function hideLimitModal() {
  const modal = document.getElementById('limitModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  // Check license first
  const hasLicense = await checkLicense();
  if (!hasLicense) return;
  
  // Check admin mode
  await loadAdminMode();
  
  await window.i18n.loadLanguage();
  initializeElements();
  setupEventListeners();
  loadSavedData();
  loadTemplates();
  loadTheme();
  translateUI();
  updateLanguageToggle();
  updateUsageBanner();
  checkOnboarding();
  await loadDebugStats();
  updateDebugPanel();
  
  // Track extension opened
  if (typeof trackEvent === 'function') trackEvent('extension_opened');

  // The popup can close any moment: write pending text changes right away when it is hidden
  const flushIfPending = () => {
    if (formSaveTimer) flushFormSave();
  };
  window.addEventListener('pagehide', flushIfPending);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushIfPending();
  });

  // Live updates: keep popup UI in sync with stats written by content scripts
  // (e.g. Vinted category selection happens while popup is closed)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    if (!changes[DEBUG_STATS_STORAGE_KEY]?.newValue) return;
    debugStats = {
      ...debugStats,
      ...changes[DEBUG_STATS_STORAGE_KEY].newValue,
      analysisHistory: changes[DEBUG_STATS_STORAGE_KEY].newValue.analysisHistory || debugStats.analysisHistory || [],
      categoryErrorHistory:
        changes[DEBUG_STATS_STORAGE_KEY].newValue.categoryErrorHistory || debugStats.categoryErrorHistory || [],
      analysisCountByDay: changes[DEBUG_STATS_STORAGE_KEY].newValue.analysisCountByDay || debugStats.analysisCountByDay || {},
      categoryUsage: changes[DEBUG_STATS_STORAGE_KEY].newValue.categoryUsage || debugStats.categoryUsage || {},
    };

    if (isAdminMode) renderDebugStats();
  });
});

// Load debug panel state. Only possible in DEV_MODE builds.
async function loadAdminMode() {
  if (!AP_CONFIG.DEV_MODE) {
    isAdminMode = false;
    // Flags written by older versions; nothing reads them anymore
    chrome.storage.local.remove(['isAdminMode', 'isAdminUser']);
    return;
  }
  const result = await chrome.storage.local.get(['isAdminMode']);
  isAdminMode = result.isAdminMode === true;
}

// Toggle debug panel (Ctrl+Shift+D) - DEV_MODE builds only
function toggleAdminMode() {
  if (!AP_CONFIG.DEV_MODE) return;
  
  isAdminMode = !isAdminMode;
  chrome.storage.local.set({ isAdminMode }, async () => {
    // Ensure we render the latest persisted stats when the panel is opened.
    await loadDebugStats();
    updateDebugPanel();
    showToast(isAdminMode ? 'Admin mode enabled' : 'Admin mode disabled', 'info');
  });
}

// Update debug panel visibility
function updateDebugPanel() {
  const panel = document.getElementById('debugPanel');
  if (panel) {
    panel.style.display = isAdminMode ? 'block' : 'none';
  }
  if (isAdminMode) {
    // Show version
    const versionEl = document.getElementById('debugVersion');
    if (versionEl) {
      versionEl.textContent = `v${debugStats.extensionVersion || 'unknown'}`;
    }
    renderDebugStats();
  }
}

// Load debug stats from storage (persisted across sessions)
function loadDebugStats() {
  return new Promise((resolve) => {
    chrome.storage.local.get([DEBUG_STATS_STORAGE_KEY], (result) => {
      const saved = result[DEBUG_STATS_STORAGE_KEY];
      if (saved) {
        // Deep merge to preserve new fields while loading saved data
        debugStats = {
          ...debugStats,
          ...saved,
          // Ensure arrays/objects exist
          analysisHistory: saved.analysisHistory || [],
          categoryErrorHistory: saved.categoryErrorHistory || [],
          analysisCountByDay: saved.analysisCountByDay || {},
          categoryUsage: saved.categoryUsage || {},
        };
      }

      // Update session tracking
      if (!debugStats.sessionStart) {
        debugStats.sessionStart = Date.now();
      }
      debugStats.lastActiveTime = Date.now();

      saveDebugStats(() => {
        if (isAdminMode) renderDebugStats();
        resolve(debugStats);
      });
    });
  });
}

// Save debug stats to storage
function saveDebugStats(cb) {
  chrome.storage.local.set({ [DEBUG_STATS_STORAGE_KEY]: debugStats }, () => cb?.());
}

// Record analysis result for debug
function recordAnalysisResult(success, title, errorCode, responseTime, rawResponse, categoryPath) {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  
  debugStats.totalAnalyses++;
  debugStats.lastActiveTime = now;
  
  if (success) {
    debugStats.successfulAnalyses++;
  } else {
    debugStats.failedAnalyses++;
    debugStats.lastError = errorCode || 'Unknown';
    debugStats.lastErrorCode = errorCode;
  }
  
  debugStats.lastAnalysisTime = responseTime;
  debugStats.lastRawResponse = rawResponse ? JSON.stringify(rawResponse, null, 2).slice(0, 5000) : null;
  
  // Performance tracking
  if (responseTime) {
    if (!debugStats.fastestAnalysis || responseTime < debugStats.fastestAnalysis) {
      debugStats.fastestAnalysis = responseTime;
    }
    if (!debugStats.slowestAnalysis || responseTime > debugStats.slowestAnalysis) {
      debugStats.slowestAnalysis = responseTime;
    }
    // Recalculate average
    const successHistory = debugStats.analysisHistory.filter(h => h.success && h.time);
    if (successHistory.length > 0) {
      debugStats.avgAnalysisTime = Math.round(
        successHistory.reduce((sum, h) => sum + h.time, 0) / successHistory.length
      );
    }
  }
  
  // Daily usage tracking
  debugStats.analysisCountByDay[today] = (debugStats.analysisCountByDay[today] || 0) + 1;
  
  // Category usage tracking
  if (categoryPath && success) {
    const mainCategory = categoryPath.split('>')[0]?.trim() || 'Unknown';
    debugStats.categoryUsage[mainCategory] = (debugStats.categoryUsage[mainCategory] || 0) + 1;
    
    // Find most common category
    let maxCount = 0;
    for (const [cat, count] of Object.entries(debugStats.categoryUsage)) {
      if (count > maxCount) {
        maxCount = count;
        debugStats.mostCommonCategory = cat;
      }
    }
  }
  
  // Add to history (keep last 20)
  debugStats.analysisHistory.unshift({
    success,
    title: title || (success ? 'Analysis' : errorCode),
    category: categoryPath?.split('>').pop()?.trim() || null,
    time: responseTime,
    timestamp: now,
    errorCode: success ? null : errorCode
  });
  if (debugStats.analysisHistory.length > 20) {
    debugStats.analysisHistory.pop();
  }
  
  saveDebugStats();
  if (isAdminMode) {
    renderDebugStats();
  }
}

// Record category selection result (called from content script via message)
function recordCategoryResult(success, categoryPath, errorData) {
  debugStats.categoryAttempts++;
  debugStats.lastActiveTime = Date.now();
  
  if (success) {
    debugStats.categorySuccesses++;
  } else {
    debugStats.categoryFailures++;
    debugStats.lastCategoryError = {
      path: categoryPath,
      error: errorData?.code || 'UNKNOWN',
      failedLevel: errorData?.failedLevel || null,
      availableOptions: errorData?.availableOptions?.slice(0, 10) || [],
      timestamp: Date.now()
    };
    
    // Add to category error history (keep last 10)
    debugStats.categoryErrorHistory.unshift(debugStats.lastCategoryError);
    if (debugStats.categoryErrorHistory.length > 10) {
      debugStats.categoryErrorHistory.pop();
    }
  }
  
  saveDebugStats();
  if (isAdminMode) {
    renderDebugStats();
  }
}

// Render debug stats in panel
function renderDebugStats() {
  const successRate = debugStats.totalAnalyses > 0 
    ? Math.round((debugStats.successfulAnalyses / debugStats.totalAnalyses) * 100) 
    : 0;
  
  const categorySuccessRate = debugStats.categoryAttempts > 0
    ? Math.round((debugStats.categorySuccesses / debugStats.categoryAttempts) * 100)
    : 0;
  
  // Update basic stats
  const successRateEl = document.getElementById('debugSuccessRate');
  const totalEl = document.getElementById('debugTotalAnalyses');
  const lastErrorEl = document.getElementById('debugLastError');
  const avgTimeEl = document.getElementById('debugAvgTime');
  const historyList = document.getElementById('debugHistoryList');
  const rawContent = document.getElementById('debugRawContent');
  
  // New elements
  const categoryRateEl = document.getElementById('debugCategoryRate');
  const categoryErrorsEl = document.getElementById('debugCategoryErrors');
  const fastestEl = document.getElementById('debugFastest');
  const slowestEl = document.getElementById('debugSlowest');
  const mostUsedCatEl = document.getElementById('debugMostUsedCategory');
  const todayCountEl = document.getElementById('debugTodayCount');
  const lastCatErrorEl = document.getElementById('debugLastCategoryError');
  const catErrorListEl = document.getElementById('debugCategoryErrorList');
  
  if (successRateEl) {
    successRateEl.textContent = `${successRate}%`;
    successRateEl.className = `stat-value ${successRate >= 80 ? 'stat-success' : successRate >= 50 ? '' : 'stat-error'}`;
  }
  if (totalEl) totalEl.textContent = debugStats.totalAnalyses;
  if (lastErrorEl) lastErrorEl.textContent = debugStats.lastError || 'None';
  if (avgTimeEl) avgTimeEl.textContent = debugStats.avgAnalysisTime > 0 ? `${debugStats.avgAnalysisTime}ms` : '--ms';
  if (rawContent) rawContent.textContent = debugStats.lastRawResponse || 'No response yet';
  
  // Category stats
  if (categoryRateEl) {
    categoryRateEl.textContent = `${categorySuccessRate}%`;
    categoryRateEl.className = `stat-value ${categorySuccessRate >= 80 ? 'stat-success' : categorySuccessRate >= 50 ? '' : 'stat-error'}`;
  }
  if (categoryErrorsEl) categoryErrorsEl.textContent = debugStats.categoryFailures || 0;
  
  // Performance stats
  if (fastestEl) fastestEl.textContent = debugStats.fastestAnalysis ? `${debugStats.fastestAnalysis}ms` : '--';
  if (slowestEl) slowestEl.textContent = debugStats.slowestAnalysis ? `${debugStats.slowestAnalysis}ms` : '--';
  
  // Usage stats
  if (mostUsedCatEl) mostUsedCatEl.textContent = debugStats.mostCommonCategory || 'None';
  const today = new Date().toISOString().split('T')[0];
  if (todayCountEl) todayCountEl.textContent = debugStats.analysisCountByDay?.[today] || 0;
  
  // Last category error
  if (lastCatErrorEl) {
    if (debugStats.lastCategoryError) {
      const err = debugStats.lastCategoryError;
      lastCatErrorEl.innerHTML = `
        <strong>${err.error}</strong>: ${err.failedLevel || 'Unknown level'}<br>
        <small>Path: ${err.path || 'N/A'}</small>
      `;
    } else {
      lastCatErrorEl.textContent = 'None';
    }
  }
  
  // Category error history
  if (catErrorListEl) {
    if (debugStats.categoryErrorHistory?.length > 0) {
      catErrorListEl.innerHTML = debugStats.categoryErrorHistory.map(err => {
        const timeAgo = formatTimeAgo(err.timestamp);
        return `
          <div class="debug-history-item failed">
            <span class="history-title">${err.failedLevel || err.error}</span>
            <span class="history-time">${timeAgo}</span>
            <span class="history-hint" title="${err.availableOptions?.join(', ') || 'No options'}">📋</span>
          </div>
        `;
      }).join('');
    } else {
      catErrorListEl.innerHTML = '<p class="debug-empty">No category errors</p>';
    }
  }
  
  // Render analysis history
  if (historyList) {
    if (debugStats.analysisHistory.length === 0) {
      historyList.innerHTML = '<p class="debug-empty">No analyses yet</p>';
    } else {
      historyList.innerHTML = debugStats.analysisHistory.map(h => {
        const timeAgo = formatTimeAgo(h.timestamp);
        const categoryBadge = h.category ? `<span class="history-category">${h.category}</span>` : '';
        return `
          <div class="debug-history-item ${h.success ? 'success' : 'failed'}">
            <span class="history-title">${h.title}</span>
            ${categoryBadge}
            <span class="history-time">${h.time || '--'}ms • ${timeAgo}</span>
            <span class="history-status">${h.success ? '✓' : '✗'}</span>
          </div>
        `;
      }).join('');
    }
  }
}

// Format time ago
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'unknown';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Clear debug stats
function clearDebugStats() {
  const version = debugStats.extensionVersion;
  debugStats = {
    // AI Analysis Stats
    totalAnalyses: 0,
    successfulAnalyses: 0,
    failedAnalyses: 0,
    lastError: null,
    lastErrorCode: null,
    lastAnalysisTime: null,
    lastRawResponse: null,
    analysisHistory: [],
    
    // Category Selection Stats
    categoryAttempts: 0,
    categorySuccesses: 0,
    categoryFailures: 0,
    lastCategoryError: null,
    categoryErrorHistory: [],
    
    // Session Stats
    sessionStart: Date.now(),
    lastActiveTime: Date.now(),
    totalSessionTime: 0,
    extensionVersion: version,
    
    // Performance Metrics
    avgAnalysisTime: 0,
    fastestAnalysis: null,
    slowestAnalysis: null,
    
    // Usage Patterns
    analysisCountByDay: {},
    peakUsageHour: null,
    mostCommonCategory: null,
    categoryUsage: {}
  };
  saveDebugStats();
  renderDebugStats();
  showToast('Debug stats cleared', 'info');
}

// Export debug stats as JSON file
function exportDebugStats() {
  const exportData = {
    exportedAt: new Date().toISOString(),
    extensionVersion: debugStats.extensionVersion,
    stats: debugStats
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `autoposter-debug-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Debug stats exported', 'success');
}

function initializeElements() {
  uploadArea = document.getElementById('uploadArea');
  imageInput = document.getElementById('imageInput');
  imagePreviews = document.getElementById('imagePreviews');
  generateAIBtn = document.getElementById('generateAIBtn');
  analyzeImageBtn = document.getElementById('analyzeImageBtn');
  useTemplateBtn = document.getElementById('useTemplateBtn');
  aiHint = document.getElementById('aiHint');
  clearFormBtn = document.getElementById('clearFormBtn');
  toast = document.getElementById('toast');
  
  // Initialize category picker
  initCategoryPicker();
  
  // Setup price input sanitization - prevent € symbol and other non-numeric chars
  setupPriceSanitization();
}

// Sanitize price string - remove currency symbols and non-numeric characters
function sanitizePriceString(value) {
  if (value === null || value === undefined) return '';
  // Remove all non-numeric characters except . and ,
  // Then replace comma with dot for decimal separator
  return String(value).replace(/[^0-9.,]/g, '').replace(',', '.');
}

// Setup price input field sanitization to prevent browser errors
function setupPriceSanitization() {
  const priceInput = document.getElementById('price');
  if (!priceInput) return;
  
  // Sanitize on paste - intercept clipboard data BEFORE browser processes it
  priceInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const cleanPrice = sanitizePriceString(pastedText);
    
    // Insert at cursor position or replace selection
    const start = priceInput.selectionStart;
    const end = priceInput.selectionEnd;
    const currentVal = priceInput.value;
    priceInput.value = currentVal.slice(0, start) + cleanPrice + currentVal.slice(end);
    priceInput.selectionStart = priceInput.selectionEnd = start + cleanPrice.length;
    
    // Trigger save to persist cleaned value
    saveFormData();
  });
  
  // Sanitize on any input (typing, autofill, programmatic changes)
  priceInput.addEventListener('input', () => {
    const raw = priceInput.value;
    const clean = sanitizePriceString(raw);
    if (raw !== clean) {
      const pos = priceInput.selectionStart - (raw.length - clean.length);
      priceInput.value = clean;
      priceInput.selectionStart = priceInput.selectionEnd = Math.max(0, pos);
    }
  });
}

function setupEventListeners() {
  // Onboarding button (only one button now)
  const startBtn = document.getElementById('onboardingStartBtn');
  if (startBtn) startBtn.addEventListener('click', hideOnboarding);

  // Onboarding language toggle (overlay covers header buttons)
  const onboardingLangToggle = document.getElementById('onboardingLangToggle');
  if (onboardingLangToggle) onboardingLangToggle.addEventListener('click', toggleLanguage);
  
  // Limit modal buttons
  const modalUpgradeBtn = document.getElementById('modalUpgradeBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  if (modalUpgradeBtn) modalUpgradeBtn.addEventListener('click', () => {
    hideLimitModal();
    if (typeof trackEvent === 'function') trackEvent('upgrade_clicked', { source: 'limit_modal' });
    window.location.href = 'upgrade.html';
  });
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideLimitModal);
  
  // Gallery modal buttons
  const galleryClose = document.getElementById('galleryClose');
  const galleryPrevBtn = document.getElementById('galleryPrev');
  const galleryNextBtn = document.getElementById('galleryNext');
  const galleryOverlay = document.getElementById('galleryModal');
  if (galleryClose) galleryClose.addEventListener('click', closeGalleryModal);
  if (galleryPrevBtn) galleryPrevBtn.addEventListener('click', galleryPrev);
  if (galleryNextBtn) galleryNextBtn.addEventListener('click', galleryNext);
  if (galleryOverlay) galleryOverlay.addEventListener('click', (e) => {
    if (e.target === galleryOverlay) closeGalleryModal();
  });
  
  // Upgrade button
  const upgradeBtn = document.getElementById('upgradeBtn');
  if (upgradeBtn) upgradeBtn.addEventListener('click', () => {
    if (typeof trackEvent === 'function') trackEvent('upgrade_clicked', { source: 'banner' });
    window.location.href = 'upgrade.html';
  });
  
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Language toggle
  document.getElementById('langToggle').addEventListener('click', toggleLanguage);
  
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
  
  // Image upload
  uploadArea.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', handleImageSelect);
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  // AI Generation
  generateAIBtn.addEventListener('click', handleGenerateAI);
  
  // AI Image Analysis
  analyzeImageBtn.addEventListener('click', handleAnalyzeImage);

  // Use Template button
  if (useTemplateBtn) {
    useTemplateBtn.addEventListener('click', handleUseTemplate);
  }

  // Platform copy buttons
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => handleCopyForPlatform(btn.dataset.platform));
  });

  // Open Vinted (writes the paste payload first)
  document.querySelectorAll('.btn-open').forEach(btn => {
    btn.addEventListener('click', handleOpenVinted);
  });

  // Clear form
  clearFormBtn.addEventListener('click', clearForm);

  // Auto-save text fields (one shared debounce; photos are saved separately, only when they change)
  const formInputs = document.querySelectorAll('#listingForm input, #listingForm textarea, #listingForm select');
  formInputs.forEach(input => {
    if (input.type === 'file') return;
    input.addEventListener('change', saveFormData);
    input.addEventListener('input', saveFormData);
  });
  
  // Reset templateApplied when title changes (indicates new listing)
  const titleInput = document.getElementById('title');
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      templateApplied = false;
    });
  }
  
  // Debug panel controls
  const debugPanelClose = document.getElementById('debugPanelClose');
  const debugClearStats = document.getElementById('debugClearStats');
  const debugShowRaw = document.getElementById('debugShowRaw');
  const debugExportStats = document.getElementById('debugExportStats');
  
  if (debugPanelClose) {
    debugPanelClose.addEventListener('click', () => {
      isAdminMode = false;
      chrome.storage.local.set({ isAdminMode: false });
      updateDebugPanel();
    });
  }
  
  if (debugClearStats) {
    debugClearStats.addEventListener('click', clearDebugStats);
  }
  
  if (debugShowRaw) {
    debugShowRaw.addEventListener('click', () => {
      const rawEl = document.getElementById('debugRawResponse');
      if (rawEl) {
        rawEl.style.display = rawEl.style.display === 'none' ? 'block' : 'none';
      }
    });
  }
  
  if (debugExportStats) {
    debugExportStats.addEventListener('click', exportDebugStats);
  }
  
  // Debug panel keyboard shortcut: Ctrl+Shift+D (DEV_MODE builds only)
  if (AP_CONFIG.DEV_MODE) {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleAdminMode();
      }
    });
  }
}

// Language toggle
function toggleLanguage() {
  const currentLang = window.i18n.getCurrentLanguage();
  const newLang = currentLang === 'nl' ? 'en' : 'nl';
  window.i18n.setLanguage(newLang);
  updateLanguageToggle();
  translateUI();
}

function updateLanguageToggle() {
  const currentLang = window.i18n.getCurrentLanguage();
  const label = currentLang === 'nl' ? '🇳🇱' : '🇬🇧';
  const title = currentLang === 'nl' ? 'Switch to English' : 'Wissel naar Nederlands';

  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.textContent = label;
    langToggle.title = title;
  }

  const onboardingLangToggle = document.getElementById('onboardingLangToggle');
  if (onboardingLangToggle) {
    onboardingLangToggle.textContent = label;
    onboardingLangToggle.title = title;
  }
}

// Theme toggle
function loadTheme() {
  chrome.storage.local.get(['theme'], (result) => {
    const theme = result.theme || 'dark';
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    }
    updateThemeToggle();
  });
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
  updateThemeToggle();
}

function updateThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const isLight = document.body.classList.contains('light-mode');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
  themeToggle.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
}

function translateUI() {
  const t = window.i18n.t;
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  
  // Update placeholders
  document.querySelectorAll('[data-placeholder]').forEach(el => {
    const key = el.dataset.placeholder;
    el.placeholder = t(key);
  });
  
  // Update AI hint based on state
  updateAnalyzeButton();
  updateTemplateButton();
}

// Load custom templates
function loadTemplates() {
  chrome.storage.local.get(['customTemplates'], (result) => {
    customTemplates = result.customTemplates || {};
    updateTemplateButton();
  });
}

// Update template button visibility (only the Vinted template is used)
function updateTemplateButton() {
  if (!useTemplateBtn) return;
  
  const hasTemplate = Boolean(customTemplates.vinted && customTemplates.vinted.trim());
  useTemplateBtn.style.display = hasTemplate ? 'flex' : 'none';
}

// Image handling
function handleImageSelect(e) {
  handleFiles(e.target.files);
  // Allow picking the same file again later
  e.target.value = '';
}

// "photo.HEIC" -> "photo.jpg" (stored photos are always JPEG)
function toJpegName(name) {
  const base = String(name || 'photo').replace(/\.[^./\\]+$/, '');
  return `${base || 'photo'}.jpg`;
}

// Shrink a photo before we keep it: longest side max IMAGE_MAX_SIDE px, JPEG quality IMAGE_JPEG_QUALITY.
// Keeps chrome.storage.local (10 MB quota) and the AI upload small. Returns a JPEG data URL.
async function compressImageBlob(blob) {
  const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    // Transparent PNGs get a white background instead of black
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY);
  } finally {
    if (bitmap.close) bitmap.close();
  }
}

async function handleFiles(files) {
  const t = window.i18n.t;
  const remainingSlots = MAX_IMAGES - uploadedImages.length;
  const filesToProcess = Array.from(files).slice(0, Math.max(0, remainingSlots));
  const isFirstUpload = uploadedImages.length === 0;

  if (files.length > remainingSlots) {
    showToast(`Max ${MAX_IMAGES} ${t('maxPhotos')}`, 'info');
  }
  if (filesToProcess.length === 0) return;

  // First photo(s) in an empty form = a new listing
  if (isFirstUpload) {
    // If form was cleared (all photos removed) and new photos are being uploaded,
    // reset all AI-filled fields to allow fresh analysis
    if (formWasCleared) {
      resetAIFields();
      formWasCleared = false;
    }
    // Text of a previous listing may never be pasted together with these new photos
    startNewListing();
    saveFormData();
  }

  let added = 0;
  // One by one, to keep memory use low with large phone photos
  for (const file of filesToProcess) {
    if (!file.type.startsWith('image/')) {
      showToast(t('onlyImages'), 'error');
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showToast(`${file.name} ${t('fileTooLarge')} (max 15 MB)`, 'error');
      continue;
    }

    let data;
    try {
      data = await compressImageBlob(file);
    } catch (error) {
      console.error('Could not read photo:', file.name, error);
      showToast(`${file.name} ${t('imageReadFailed')}`, 'error');
      continue;
    }

    if (uploadedImages.length >= MAX_IMAGES) break;
    uploadedImages.push({ name: toJpegName(file.name), data, compressed: true });
    added++;
    renderImagePreviews();
    await saveImages();
  }

  if (added === 0) return;
  if (typeof trackEvent === 'function') trackEvent('photos_uploaded', { count: uploadedImages.length });

  // AUTO-ANALYZE: first photos of a new listing are ready, start the analysis
  if (isFirstUpload && !autoAnalyzing) {
    autoAnalyzing = true;
    showToast(t('autoAnalyzing'), 'info');
    try {
      await handleAnalyzeImage();
    } finally {
      autoAnalyzing = false;
    }
  }
}

// Photos saved by version 1.0.x are uncompressed and can fill the 10 MB storage quota: shrink them once.
async function shrinkLegacyImages() {
  let changed = false;
  for (const img of uploadedImages) {
    if (img.compressed || typeof img.data !== 'string' || !img.data.startsWith('data:image/')) continue;
    try {
      const blob = await (await fetch(img.data)).blob();
      img.data = await compressImageBlob(blob);
      img.name = toJpegName(img.name);
      img.compressed = true;
      changed = true;
    } catch (error) {
      console.warn('Could not shrink saved photo:', error);
    }
  }
  if (changed) {
    renderImagePreviews();
    await saveImages();
  }
}

// Reset listing fields (called when uploading new photos after all photos were removed = new listing)
function resetAIFields() {
  document.getElementById('title').value = '';
  document.getElementById('price').value = '';
  document.getElementById('template').value = '';
  document.getElementById('condition').value = '';
  document.getElementById('tags').value = '';
  document.getElementById('additionalInfo').value = '';
  document.getElementById('quantity').value = '1';
  
  // Reset analysis data
  analysisData = { brand: '', size: '', color: '', material: '', categoryPath: '', quantity: 1, vinted: null };
  
  // Clear category picker
  clearCategorySelection();
  
  // Reset template applied flag
  templateApplied = false;
}

function renderImagePreviews() {
  imagePreviews.innerHTML = '';
  uploadedImages.forEach((img, index) => {
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.draggable = true;
    preview.dataset.index = index;
    preview.innerHTML = `
      <div class="drag-handle" title="Drag to reorder">⠿</div>
      <img src="${img.data}" alt="${img.name}" data-index="${index}">
      <div class="image-actions">
        <button type="button" class="btn-img-action btn-download" data-index="${index}" title="Download">
          ⬇️
        </button>
        <button type="button" class="btn-img-action btn-copy-base64" data-index="${index}" title="Copy Base64">
          📋
        </button>
      </div>
      <button type="button" class="remove-image" data-index="${index}">×</button>
      <span class="image-index">${index + 1}</span>
    `;
    
    // Drag events
    preview.addEventListener('dragstart', (e) => {
      preview.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index);
    });
    preview.addEventListener('dragend', () => {
      preview.classList.remove('dragging');
      document.querySelectorAll('.image-preview.drag-over-left, .image-preview.drag-over-right').forEach(el => {
        el.classList.remove('drag-over-left', 'drag-over-right');
      });
    });
    preview.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const fromIndex = parseInt(document.querySelector('.image-preview.dragging')?.dataset.index);
      const toIndex = parseInt(preview.dataset.index);
      if (fromIndex === toIndex) return;
      // Show indicator on left or right side
      preview.classList.remove('drag-over-left', 'drag-over-right');
      preview.classList.add(fromIndex < toIndex ? 'drag-over-right' : 'drag-over-left');
    });
    preview.addEventListener('dragleave', () => {
      preview.classList.remove('drag-over-left', 'drag-over-right');
    });
    preview.addEventListener('drop', (e) => {
      e.preventDefault();
      preview.classList.remove('drag-over-left', 'drag-over-right');
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = parseInt(preview.dataset.index);
      if (fromIndex === toIndex) return;
      // Reorder array
      const [moved] = uploadedImages.splice(fromIndex, 1);
      uploadedImages.splice(toIndex, 0, moved);
      renderImagePreviews();
      saveImages();
    });
    
    imagePreviews.appendChild(preview);
  });

  // Add click handler to open gallery modal
  document.querySelectorAll('.image-preview img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openGalleryModal(parseInt(e.target.dataset.index));
    });
  });

  // Add remove handlers
  document.querySelectorAll('.remove-image').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);
      uploadedImages.splice(index, 1);
      renderImagePreviews();
      saveImages();
      updateAnalyzeButton();
      
      // If all images are removed, set flag so next upload resets AI fields
      if (uploadedImages.length === 0) {
        formWasCleared = true;
      }
    });
  });
  
  // Add download handlers
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadImage(parseInt(e.currentTarget.dataset.index));
    });
  });
  
  // Add copy base64 handlers
  document.querySelectorAll('.btn-copy-base64').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyImageBase64(parseInt(e.currentTarget.dataset.index));
    });
  });
  
  updateAnalyzeButton();
}

// Gallery Modal functionality
let currentGalleryIndex = 0;

function openGalleryModal(index) {
  currentGalleryIndex = index;
  const modal = document.getElementById('galleryModal');
  if (modal) {
    updateGalleryImage();
    modal.style.display = 'flex';
    document.addEventListener('keydown', handleGalleryKeydown);
  }
}

function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.style.display = 'none';
    document.removeEventListener('keydown', handleGalleryKeydown);
  }
}

function updateGalleryImage() {
  const galleryImage = document.getElementById('galleryImage');
  const galleryCounter = document.getElementById('galleryCounter');
  if (galleryImage && uploadedImages[currentGalleryIndex]) {
    galleryImage.src = uploadedImages[currentGalleryIndex].data;
    galleryImage.alt = uploadedImages[currentGalleryIndex].name;
  }
  if (galleryCounter) {
    galleryCounter.textContent = `${currentGalleryIndex + 1} / ${uploadedImages.length}`;
  }
  // Update nav button visibility
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  if (prevBtn) prevBtn.style.visibility = currentGalleryIndex > 0 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.style.visibility = currentGalleryIndex < uploadedImages.length - 1 ? 'visible' : 'hidden';
}

function galleryPrev() {
  if (currentGalleryIndex > 0) {
    currentGalleryIndex--;
    updateGalleryImage();
  }
}

function galleryNext() {
  if (currentGalleryIndex < uploadedImages.length - 1) {
    currentGalleryIndex++;
    updateGalleryImage();
  }
}

function handleGalleryKeydown(e) {
  if (e.key === 'Escape') closeGalleryModal();
  if (e.key === 'ArrowLeft') galleryPrev();
  if (e.key === 'ArrowRight') galleryNext();
}

// Download image
function downloadImage(index) {
  const t = window.i18n.t;
  const img = uploadedImages[index];
  if (!img) return;
  
  const link = document.createElement('a');
  link.href = img.data;
  link.download = img.name || `product-image-${index + 1}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(t('imageDownloaded'), 'success');
}

// Copy image base64
function copyImageBase64(index) {
  const t = window.i18n.t;
  const img = uploadedImages[index];
  if (!img) return;
  
  navigator.clipboard.writeText(img.data).then(() => {
    showToast(t('base64Copied'), 'success');
  }).catch(() => {
    showToast('Could not copy', 'error');
  });
}

function updateAnalyzeButton() {
  const t = window.i18n.t;
  if (analyzeImageBtn && aiHint) {
    const hasImages = uploadedImages.length > 0;
    analyzeImageBtn.disabled = !hasImages;
    aiHint.textContent = hasImages ? t('aiHintReady') : t('aiHintNoPhoto');
  }
}

// AI Image Analysis (multi-image). Usage is counted on the server; we only show what it reports.
async function handleAnalyzeImage(retryCount = 0) {
  const t = window.i18n.t;
  const MAX_RETRIES = 1; // the server already retries the AI call itself
  const startTime = Date.now();
  
  // Check internet connection first
  if (!navigator.onLine) {
    showToast(t('noInternet'), 'error');
    return;
  }
  
  if (uploadedImages.length === 0) {
    showToast(t('uploadPhotoFirst'), 'error');
    return;
  }

  if (retryCount === 0 && typeof trackEvent === 'function') trackEvent('ai_analysis_started', { imageCount: uploadedImages.length });
  analyzeImageBtn.disabled = true;
  analyzeImageBtn.classList.add('loading');
  analyzeImageBtn.classList.add('auto-analyzing');
  
  if (retryCount > 0) {
    analyzeImageBtn.innerHTML = `<span class="btn-icon">🔄</span> ${t('analyzing')}`;
  } else {
    analyzeImageBtn.innerHTML = `<span class="btn-icon">🔍</span> ${t('analyzing')}`;
  }

  try {
    // Get license key for authenticated API calls
    const { licenseKey: storedKey } = await chrome.storage.local.get(['licenseKey']);
    
    if (!storedKey) {
      // No license key found - redirect to license page
      window.location.href = 'license.html';
      return;
    }
    
    // Photos are already compressed when added; the server uses at most 6
    const imagesToSend = uploadedImages.slice(0, MAX_IMAGES_FOR_AI).map(img => img.data);
    // The user's own Vinted category list (saved by the content script on Vinted), so the AI picks from exactly that list
    const { vintedCatalog } = await chrome.storage.local.get(['vintedCatalog']);
    const catalog = vintedCatalog && vintedCatalog.v === 1 && Array.isArray(vintedCatalog.nodes)
      ? { v: 1, lang: vintedCatalog.lang || '', nodes: vintedCatalog.nodes }
      : undefined;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT);
    
    let response;
    try {
      response = await fetch(AP_CONFIG.ANALYZE_IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-License-Key': storedKey,
        },
        body: JSON.stringify({
          images: imagesToSend,
          language: window.i18n.getCurrentLanguage(),
          catalog
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await readJson(response);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorCode = data.error_code || `HTTP_${response.status}`;
      
      // Record failed attempt
      recordAnalysisResult(false, null, errorCode, responseTime, data);
      if (typeof trackEvent === 'function') trackEvent('ai_analysis_failed', { errorCode, responseTime });
      
      // Monthly limit reached (nothing was counted): update the banner and show the limit modal
      if (errorCode === 'QUOTA_EXCEEDED') {
        if (data.usage) {
          await applyUsage(data.usage);
        } else {
          licenseData = { ...licenseData, canUseAI: false, usageLeft: 0 };
          updateUsageBanner();
        }
        showLimitModal();
        if (typeof trackEvent === 'function') trackEvent('limit_reached');
        return;
      }
      
      if (LICENSE_ERROR_CODES.includes(errorCode)) {
        await handleLicenseApiError();
        return;
      }
      
      // AI hiccup (nothing was counted): try once more
      if (AI_RETRYABLE_CODES.includes(errorCode) && retryCount < MAX_RETRIES) {
        showToast(t('aiRetrying'), 'info');
        await new Promise(r => setTimeout(r, errorCode === 'AI_RATE_LIMIT' ? 3000 : 1500));
        return await handleAnalyzeImage(retryCount + 1);
      }
      
      showToast(apiErrorMessage(response.status, errorCode, 'analyze'), 'error', 6000);
      return;
    }

    // One analysis was counted on the server; show the new numbers
    if (data.usage) {
      await applyUsage(data.usage);
    }

    if (data.analysis) {
      const repairedAnalysis = repairCategoryPath(data.analysis);
      applyAnalysisResults(repairedAnalysis);
      
      // Auto-reorder photos based on AI scoring
      const reordered = autoReorderPhotos(repairedAnalysis.photoOrder);
      if (reordered) {
        showToast(t('photoAnalyzedAndReordered'), 'success');
      } else {
        showToast(t('photoAnalyzed'), 'success');
      }
      
      // Record success with category path
      recordAnalysisResult(true, repairedAnalysis.suggestedTitle, null, responseTime, data, repairedAnalysis.categoryPath);
      if (typeof trackEvent === 'function') trackEvent('ai_analysis_completed', { responseTime, category: repairedAnalysis.categoryPath });

      // Fill the description too, unless the user already wrote one or uses an own template
      const hasOwnText = document.getElementById('template').value.trim()
        || (customTemplates.vinted && customTemplates.vinted.trim());
      if (!hasOwnText && document.getElementById('title').value.trim()) {
        await handleGenerateAI();
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('AI analysis error:', error);
    
    recordAnalysisResult(false, null, error.name === 'AbortError' ? 'TIMEOUT' : 'ERROR', responseTime, { error: error.message });
    
    if (error.name === 'AbortError') {
      showToast(t('analysisTimeout'), 'error');
    } else if (error instanceof TypeError) {
      // fetch() itself failed: no connection to the server
      showToast(t('licenseNetworkError'), 'error', 6000);
    } else {
      showToast(t('aiFailed'), 'error', 6000);
    }
  } finally {
    analyzeImageBtn.disabled = false;
    analyzeImageBtn.classList.remove('loading');
    analyzeImageBtn.classList.remove('auto-analyzing');
    analyzeImageBtn.innerHTML = `<span data-i18n="analyzePhoto">${window.i18n.t('analyzePhoto')}</span>`;
    updateAnalyzeButton();
  }
}

// Repair category path on client side (matches backend logic)
function repairCategoryPath(analysis) {
  if (!analysis || !analysis.category || !analysis.subcategory) return analysis;
  
  const category = analysis.category;
  let subcategory = analysis.subcategory;
  
  // Fashion categories that need "Clothing" level
  const fashionCategories = ['Women', 'Men', 'Kids', 'Dames', 'Heren', 'Kinderen'];
  const clothingTypes = [
    'Dresses', 'Jurken', 'Tops', 'T-shirts', 'Jeans', 'Trousers', 'Broeken',
    'Skirts', 'Rokken', 'Shorts', 'Jumpers', 'Sweaters', 'Jackets', 'Jassen',
    'Coats', 'Outerwear', 'Suits', 'Blazers', 'Jumpsuits', 'Activewear',
    'Swimwear', 'Lingerie', 'Nightwear', 'Mini dresses', 'Midi dresses', 'Long dresses',
    'Blouses', 'Shirts', 'Hoodies'
  ];
  
  const shoeTypes = [
    'Sneakers', 'Trainers', 'Boots', 'Heels', 'Flats', 'Sandals', 'Slippers',
    'Sports shoes', 'Formal shoes'
  ];
  
  if (fashionCategories.some(c => category.toLowerCase().includes(c.toLowerCase()))) {
    const subcatParts = subcategory.split(' > ').map(s => s.trim());
    const firstPart = subcatParts[0].toLowerCase();
    
    // Check if missing "Clothing" level
    if (firstPart !== 'clothing' && firstPart !== 'kleding' && firstPart !== 'shoes' && firstPart !== 'schoenen') {
      if (clothingTypes.some(t => firstPart.includes(t.toLowerCase()))) {
        subcategory = 'Clothing > ' + subcategory;
        console.log('Repaired path: added Clothing level');
      } else if (shoeTypes.some(t => firstPart.includes(t.toLowerCase()))) {
        subcategory = 'Shoes > ' + subcategory;
        console.log('Repaired path: added Shoes level');
      }
    }
  }
  
  return { ...analysis, subcategory };
}

// Auto-reorder photos based on AI photo scoring
// Returns true if photos were reordered, false otherwise
function autoReorderPhotos(photoOrder) {
  console.log('autoReorderPhotos called with:', JSON.stringify(photoOrder));
  if (!photoOrder || !Array.isArray(photoOrder) || photoOrder.length === 0) {
    console.log('autoReorderPhotos: no valid photoOrder');
    return false;
  }
  if (uploadedImages.length <= 1) {
    console.log('autoReorderPhotos: only 1 image, skipping');
    return false;
  }
  
  // Sort by score descending (best photo first)
  const sorted = [...photoOrder].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Build the desired order of image indices
  const desiredOrder = sorted.map(p => p.imageIndex);
  
  // Check if order actually changes
  let orderChanged = false;
  for (let i = 0; i < desiredOrder.length; i++) {
    if (desiredOrder[i] !== i) {
      orderChanged = true;
      break;
    }
  }
  
  console.log('autoReorderPhotos: desired order:', desiredOrder, 'changed:', orderChanged);
  
  if (!orderChanged) return false;
  
  // Reorder uploadedImages based on AI scoring
  const originalImages = [...uploadedImages];
  const reordered = [];
  const used = new Set();
  
  for (const entry of sorted) {
    const idx = entry.imageIndex;
    if (idx >= 0 && idx < originalImages.length && !used.has(idx)) {
      reordered.push(originalImages[idx]);
      used.add(idx);
    }
  }
  
  // Add any images not scored by AI
  for (let i = 0; i < originalImages.length; i++) {
    if (!used.has(i)) {
      reordered.push(originalImages[i]);
    }
  }
  
  uploadedImages = reordered;
  renderImagePreviews();
  saveImages();
  
  console.log('Photos auto-reordered:', sorted.map(p => `#${p.imageIndex} ${p.type}(${p.score})`).join(', '));
  return true;
}

function applyAnalysisResults(analysis) {
  const lang = window.i18n.getCurrentLanguage();
  
  // Language-aware labels
  const labels = lang === 'en' 
    ? { brand: 'Brand', size: 'Size', color: 'Color', material: 'Material', type: 'Type' }
    : { brand: 'Merk', size: 'Maat', color: 'Kleur', material: 'Materiaal', type: 'Type' };

  // Map AI condition to form values
  const conditionMap = {
    'nieuw': 'nieuw',
    'zeer_goed': 'zeer_goed',
    'goed': 'goed',
    'redelijk': 'redelijk'
  };

  // Map AI category to form dropdown values
  function mapAICategoryToDropdown(aiCategory) {
    const lower = aiCategory.toLowerCase();
    
    // Trading cards (most specific first)
    if (lower.includes('trading card') || lower.includes('booster') || lower.includes('pokemon') || lower.includes('pokémon') || lower.includes('tcg')) return 'trading_cards';
    
    // Board games
    if (lower.includes('board game') || lower.includes('puzzle') || lower.includes('tabletop')) return 'board_games';
    
    // Musical instruments
    if (lower.includes('musical') || lower.includes('instrument') || lower.includes('guitar') || lower.includes('piano')) return 'musical_instruments';
    
    // Video games & consoles
    if (lower.includes('video game') || lower.includes('console') || lower.includes('playstation') || lower.includes('xbox') || lower.includes('nintendo') || lower.includes('controller')) return 'video_games';
    
    // Mobile phones
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('iphone') || lower.includes('samsung') || lower.includes('smartphone')) return 'mobile_phones';
    
    // Computers
    if (lower.includes('computer') || lower.includes('laptop') || lower.includes('pc') || lower.includes('tablet')) return 'computers';
    
    // Audio
    if (lower.includes('audio') || lower.includes('headphone') || lower.includes('speaker') || lower.includes('earbuds')) return 'audio';
    
    // Cameras
    if (lower.includes('camera') || lower.includes('photography')) return 'cameras';
    
    // Hobbies & collectables (parent category)
    if (lower.includes('hobbies') || lower.includes('collecta') || lower.includes('collecti') || lower.includes('memorabilia') || lower.includes('coin') || lower.includes('stamp')) return 'hobbies_collectables';
    
    // Electronics (parent)
    if (lower.includes('electron') || lower.includes('device') || lower.includes('gadget')) return 'electronics';
    
    // Fashion
    if (lower.includes('women') || lower.includes('dames')) return 'women';
    if (lower.includes('men') || lower.includes('heren')) return 'men';
    if (lower.includes('kid') || lower.includes('child') || lower.includes('kinder')) return 'kids';
    if (lower.includes('shoe') || lower.includes('schoen') || lower.includes('sneaker') || lower.includes('boot')) return 'shoes';
    if (lower.includes('bag') || lower.includes('tas') || lower.includes('accessor') || lower.includes('jewelry') || lower.includes('sieraden')) return 'bags';
    if (lower.includes('clothing') || lower.includes('kleding') || lower.includes('fashion')) return 'women'; // default to women for generic clothing
    
    // Home & Living
    if (lower.includes('home') || lower.includes('living') || lower.includes('furniture') || lower.includes('meubel') || lower.includes('wonen')) return 'home_living';
    
    // Beauty
    if (lower.includes('beauty') || lower.includes('cosmetic') || lower.includes('makeup') || lower.includes('skincare')) return 'beauty';
    
    // Sports
    if (lower.includes('sport') || lower.includes('outdoor') || lower.includes('fitness') || lower.includes('gym')) return 'sports';
    
    // Books & Media
    if (lower.includes('book') || lower.includes('boek') || lower.includes('media') || lower.includes('dvd') || lower.includes('vinyl') || lower.includes('cd')) return 'books_media';
    
    // Pets
    if (lower.includes('pet') || lower.includes('huisdier') || lower.includes('dog') || lower.includes('cat')) return 'pets';
    
    return 'other';
  }

  // Apply results with visual feedback
  const fieldsUpdated = [];

  // Title
  if (analysis.suggestedTitle) {
    const titleInput = document.getElementById('title');
    if (!titleInput.value) {
      titleInput.value = analysis.suggestedTitle;
      highlightField(titleInput);
      fieldsUpdated.push('titel');
    }
  }

  // Vinted fields (category id, brand, size, condition, colours, material) for "Plakken"
  analysisData.vinted = analysis.vinted && typeof analysis.vinted === 'object' ? analysis.vinted : null;

  // Category - use the new category picker
  let detectedCategoryValue = '';
  if (analysisData.vinted && Array.isArray(analysisData.vinted.catalogPath) && analysisData.vinted.catalogPath.length) {
    // Exact Vinted category in the user's own language
    const categoryPath = analysisData.vinted.catalogPath.join(' > ');
    analysisData.categoryPath = categoryPath;
    setCategoryFromPath(categoryPath);
    detectedCategoryValue = analysisData.vinted.catalogPath.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    const pickerEl = document.getElementById('categoryPicker');
    if (pickerEl) highlightField(pickerEl);
    fieldsUpdated.push('categorie');
  } else if (analysis.category) {
    // Build category path from AI response
    const sub = (analysis.subcategory || '').trim();
    const main = analysis.category.trim();
    const categoryPath = !sub
      ? main
      : sub.toLowerCase().startsWith(main.toLowerCase() + ' >')
        ? sub
        : `${main} > ${sub}`;
    
    // Store in analysis data
    analysisData.categoryPath = categoryPath;
    
    // Update the category picker display
    setCategoryFromPath(categoryPath);
    
    // Build category value for form
    const parts = categoryPath.split(' > ').map(p => p.trim());
    detectedCategoryValue = parts.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    
    // Highlight the picker
    const pickerEl = document.getElementById('categoryPicker');
    if (pickerEl) {
      highlightField(pickerEl);
    }
    fieldsUpdated.push('categorie');
  }

  // Condition
  if (analysis.condition) {
    const conditionValue = conditionMap[analysis.condition];
    if (conditionValue) {
      const conditionSelect = document.getElementById('condition');
      conditionSelect.value = conditionValue;
      highlightField(conditionSelect);
      fieldsUpdated.push('conditie');
    }
  }

  // Tags
  if (analysis.suggestedTags && analysis.suggestedTags.length > 0) {
    const tagsInput = document.getElementById('tags');
    if (!tagsInput.value) {
      tagsInput.value = analysis.suggestedTags.join(', ');
      highlightField(tagsInput);
      fieldsUpdated.push('tags');
    }
  }

  // Store analysis data for template placeholders
  if (analysis.brand) analysisData.brand = analysis.brand;
  if (analysis.size) analysisData.size = analysis.size;
  if (analysis.color) analysisData.color = analysis.color;
  if (analysis.material) analysisData.material = analysis.material;
  
  // Handle quantity - update the quantity field
  if (analysis.quantity && analysis.quantity >= 1) {
    analysisData.quantity = analysis.quantity;
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
      quantityInput.value = analysis.quantity;
      highlightField(quantityInput);
      if (analysis.quantity > 1) {
        fieldsUpdated.push('aantal');
      }
    }
  }

  // Build additional info from detected details (with language-aware labels)
  const details = [];
  if (analysis.brand) details.push(`${labels.brand}: ${analysis.brand}`);
  if (analysis.size) details.push(`${labels.size}: ${analysis.size}`);
  if (analysis.color) details.push(`${labels.color}: ${analysis.color}`);
  
  // Only add material for clothing, shoes, bags, furniture where it's relevant
  const materialCategories = ['kleding', 'schoenen', 'tassen', 'meubels'];
  const detectedCategory = detectedCategoryValue || document.getElementById('category').value;
  if (analysis.material && materialCategories.includes(detectedCategory)) {
    details.push(`${labels.material}: ${analysis.material}`);
  }
  
  if (analysis.subcategory) details.push(`${labels.type}: ${analysis.subcategory}`);

  if (details.length > 0) {
    const additionalInfoInput = document.getElementById('additionalInfo');
    const existingInfo = additionalInfoInput.value.trim();
    const newInfo = details.join('\n');
    additionalInfoInput.value = existingInfo ? `${existingInfo}\n${newInfo}` : newInfo;
    highlightField(additionalInfoInput);
    fieldsUpdated.push('extra info');
  }

  saveFormData();
  
  console.log('AI Analysis applied:', analysis);
  console.log('Fields updated:', fieldsUpdated);
}

// Update category path display (legacy - now handled by category picker)
function updateCategoryPathDisplay(path) {
  // Now handled by category picker's selected display
  if (path) {
    setCategoryFromPath(path);
  }
}

function highlightField(element) {
  element.classList.add('ai-filled');
  setTimeout(() => {
    element.classList.remove('ai-filled');
  }, 3000);
}

// Get form data
function getFormData() {
  // Sanitize price: strip currency symbols, non-numeric chars except . and ,
  const rawPrice = document.getElementById('price').value.trim();
  const cleanPrice = String(rawPrice).replace(/[^0-9.,]/g, '').replace(',', '.');
  
  // Get quantity (default to 1)
  const quantityInput = document.getElementById('quantity');
  const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1;
  
  return {
    listingId: currentListingId,
    title: document.getElementById('title').value.trim(),
    price: cleanPrice,
    category: document.getElementById('category').value,
    condition: document.getElementById('condition').value,
    tags: document.getElementById('tags').value.trim(),
    template: document.getElementById('template').value.trim(),
    additionalInfo: document.getElementById('additionalInfo').value.trim(),
    quantity: quantity,
    // Include analysis data
    brand: analysisData.brand,
    size: analysisData.size,
    color: analysisData.color,
    material: analysisData.material,
    categoryPath: analysisData.categoryPath
  };
}

// Get condition text for templates
function getConditionText(conditionValue) {
  const lang = window.i18n.getCurrentLanguage();
  const conditionTexts = {
    nl: {
      'nieuw': 'Nieuw met labels',
      'nieuw_zonder': 'Nieuw zonder labels',
      'zeer_goed': 'Zeer goed',
      'goed': 'Goed',
      'redelijk': 'Redelijk'
    },
    en: {
      'nieuw': 'New with tags',
      'nieuw_zonder': 'New without tags',
      'zeer_goed': 'Very good',
      'goed': 'Good',
      'redelijk': 'Fair'
    }
  };
  return conditionTexts[lang]?.[conditionValue] || conditionValue;
}

// Get category text for templates
function getCategoryText(categoryValue) {
  const lang = window.i18n.getCurrentLanguage();
  const categoryTexts = {
    nl: {
      'kleding': 'Kleding',
      'schoenen': 'Schoenen',
      'tassen': 'Tassen & Accessoires',
      'elektronica': 'Elektronica',
      'speelgoed': 'Speelgoed & Spellen',
      'verzamelobjecten': 'Verzamelobjecten',
      'meubels': 'Meubels & Wonen',
      'sport': 'Sport & Outdoor',
      'boeken': 'Boeken & Media',
      'beauty': 'Beauty & Gezondheid',
      'auto': 'Auto & Motor',
      'anders': 'Anders'
    },
    en: {
      'kleding': 'Clothing',
      'schoenen': 'Shoes',
      'tassen': 'Bags & Accessories',
      'elektronica': 'Electronics',
      'speelgoed': 'Toys & Games',
      'verzamelobjecten': 'Collectibles',
      'meubels': 'Furniture & Home',
      'sport': 'Sports & Outdoor',
      'boeken': 'Books & Media',
      'beauty': 'Beauty & Health',
      'auto': 'Auto & Motor',
      'anders': 'Other'
    }
  };
  return categoryTexts[lang]?.[categoryValue] || categoryValue;
}

// Apply custom template with smart filtering
function applyTemplate(template, formData) {
  const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
  const hashTags = tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
  
  // Get values (fallback to analysisData)
  const brand = formData.brand || analysisData.brand || '';
  const size = formData.size || analysisData.size || '';
  const color = formData.color || analysisData.color || '';
  const material = formData.material || analysisData.material || '';
  
  let result = template
    .replace(/\{\{title\}\}/g, formData.title || '')
    .replace(/\{\{price\}\}/g, formData.price || '')
    .replace(/\{\{condition\}\}/g, getConditionText(formData.condition))
    .replace(/\{\{category\}\}/g, getCategoryText(formData.category))
    .replace(/\{\{tags\}\}/g, hashTags)
    .replace(/\{\{description\}\}/g, formData.template || '')
    .replace(/\{\{extraInfo\}\}/g, formData.additionalInfo || '')
    .replace(/\{\{brand\}\}/g, brand)
    .replace(/\{\{size\}\}/g, size)
    .replace(/\{\{color\}\}/g, color)
    .replace(/\{\{material\}\}/g, material);
  
  // Smart filtering: remove lines with empty placeholder values
  // Matches lines like "Merk: ", "Brand: ", "Size: ", "- Brand: " etc.
  result = result.replace(/^.*?(?:Brand|Merk|Size|Maat|Color|Kleur|Material|Materiaal):\s*$/gim, '');
  
  // Also remove list items with empty values like "- Brand: "
  result = result.replace(/^-\s*(?:Brand|Merk|Size|Maat|Color|Kleur|Material|Materiaal):\s*$/gim, '');
  
  // Clean up multiple consecutive newlines (max 2)
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  result = result.trim();
  
  return result;
}

// Handle "Use Template" button
async function handleUseTemplate() {
  const t = window.i18n.t;
  const formData = getFormData();
  
  if (!formData.title) {
    showToast(t('fillTitleFirst'), 'error');
    return;
  }

  // Only the Vinted template is used (older versions also stored templates for other sites)
  const templateToUse = (customTemplates.vinted && customTemplates.vinted.trim()) ? customTemplates.vinted : '';
  
  if (!templateToUse) {
    showToast(t('noTemplate'), 'error');
    return;
  }

  const result = applyTemplate(templateToUse, formData);
  document.getElementById('template').value = result;
  templateApplied = true; // Mark that template was applied
  saveFormData();
  
  showToast(t('templateApplied'), 'success');
}

// AI Description Generation
async function handleGenerateAI() {
  const t = window.i18n.t;
  const formData = getFormData();
  
  if (!formData.title) {
    showToast(t('fillTitleFirst'), 'error');
    return;
  }

  generateAIBtn.disabled = true;
  generateAIBtn.classList.add('loading');
  generateAIBtn.innerHTML = `<span class="btn-icon">...</span> ${t('generating')}`;

  try {
    const { licenseKey: storedKeyGen } = await chrome.storage.local.get(['licenseKey']);
    const response = await fetch(AP_CONFIG.GENERATE_LISTING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-License-Key': storedKeyGen || '',
      },
      body: JSON.stringify({
        action: 'generate_description',
        listing: formData,
        platform: 'vinted',
        language: window.i18n.getCurrentLanguage()
      })
    });

    const data = await readJson(response);

    if (!response.ok) {
      const errorCode = data.error_code || `HTTP_${response.status}`;
      if (LICENSE_ERROR_CODES.includes(errorCode)) {
        await handleLicenseApiError();
        return;
      }
      // e.g. 429 GENERATION_LIMIT: monthly limit for AI texts reached
      showToast(apiErrorMessage(response.status, errorCode, 'generate'), 'error', 6000);
      return;
    }

    if (data.description) {
      document.getElementById('template').value = data.description;
      saveFormData();
      showToast(t('descriptionGenerated'), 'success');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    showToast(error instanceof TypeError ? t('licenseNetworkError') : t('generateFailed'), 'error', 6000);
  } finally {
    generateAIBtn.disabled = false;
    generateAIBtn.classList.remove('loading');
    generateAIBtn.innerHTML = `<span data-i18n="generateAI">${t('generateAI')}</span>`;
  }
}

// Copy for specific platform
async function handleCopyForPlatform(platform) {
  const t = window.i18n.t;
  const formData = getFormData();
  const copyBtn = document.querySelector(`.btn-copy[data-platform="${platform}"]`);
  
  if (!formData.title) {
    showToast(t('fillTitleFirst'), 'error');
    return;
  }

  copyBtn.disabled = true;
  copyBtn.innerHTML = `... ${t('formatting')}`;

  try {
    let clipboardText = '';
    let pasteText = null; // text for Vinted's description field (defaults to clipboardText)
    
    // FIXED: Always prioritize existing description if it has content
    const currentDescription = formData.template || '';
    
    if (currentDescription.trim()) {
      // User has a description - USE IT DIRECTLY (no AI regeneration)
      clipboardText = currentDescription;
    } else if (customTemplates[platform] && customTemplates[platform].trim()) {
      // No description but has custom template - apply it
      clipboardText = applyTemplate(customTemplates[platform], formData);
    } else {
      // No description AND no template - only then use AI
      const { licenseKey: storedKeyPlatform } = await chrome.storage.local.get(['licenseKey']);
      const response = await fetch(AP_CONFIG.GENERATE_LISTING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-License-Key': storedKeyPlatform || '',
        },
        body: JSON.stringify({
          action: 'format_for_platform',
          listing: formData,
          platform: platform,
          language: window.i18n.getCurrentLanguage()
        })
      });

      const data = await readJson(response);

      if (!response.ok) {
        const errorCode = data.error_code || `HTTP_${response.status}`;
        if (LICENSE_ERROR_CODES.includes(errorCode)) {
          await handleLicenseApiError();
          throw userFacingError(t('licenseProblem'));
        }
        // e.g. 429 GENERATION_LIMIT: monthly limit for AI texts reached
        throw userFacingError(apiErrorMessage(response.status, errorCode, 'generate'));
      }
      
      // The clipboard gets title + description; Vinted's description field only the description
      pasteText = data.description || '';
      clipboardText = formData.title + '\n\n' + pasteText;
      if (pasteText) {
        document.getElementById('template').value = pasteText;
      }
    }
    
    // Save for content script auto-paste (this listing only, with category path for autofill)
    await writePastePayload(pasteText !== null ? pasteText : clipboardText);

    // Copy to clipboard
    await navigator.clipboard.writeText(clipboardText);
    if (typeof trackEvent === 'function') trackEvent('listing_copied', { platform });
    
    showToast(`${t('copiedFor')} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`, 'success');
    
    // Visual feedback
    copyBtn.innerHTML = `${t('copied')}!`;
    setTimeout(() => {
      copyBtn.innerHTML = `<span data-i18n="copy">${t('copy')}</span>`;
      copyBtn.disabled = false;
    }, 2000);

  } catch (error) {
    console.error('Copy error:', error);
    showToast(error.userFacing ? error.message : t('copyFailed'), 'error', 6000);
    copyBtn.innerHTML = `<span data-i18n="copy">${t('copy')}</span>`;
    copyBtn.disabled = false;
  }
}

// ============================================
// STORAGE (chrome.storage.local has a 10 MB quota)
// ============================================

let lastStorageErrorToast = 0;

// Never fail silently: a failed write (usually a full quota) gets a toast.
async function safeStorageSet(items) {
  try {
    await chrome.storage.local.set(items);
    return true;
  } catch (error) {
    console.error('Saving to chrome.storage.local failed:', error);
    if (Date.now() - lastStorageErrorToast > 5000) {
      lastStorageErrorToast = Date.now();
      showToast(window.i18n.t('storageFull'), 'error', 6000);
    }
    return false;
  }
}

function newListingId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// A new listing starts: forget the paste payload of the previous one
function startNewListing() {
  currentListingId = newListingId();
  clearPastePayload();
}

function clearPastePayload() {
  pastePayloadActive = false;
  chrome.storage.local.remove(PASTE_PAYLOAD_KEYS).catch((error) => {
    console.error('Could not clear paste payload:', error);
  });
}

// Text that goes into the Vinted description: the description field, else the Vinted template
function currentPasteText(formData) {
  if (formData.template) return formData.template;
  if (customTemplates.vinted && customTemplates.vinted.trim()) {
    return applyTemplate(customTemplates.vinted, formData);
  }
  return '';
}

function buildPastePayload(formData, formattedText) {
  const payload = {
    lastListingId: formData.listingId,
    lastTitle: formData.title,
    lastPrice: formData.price,
    lastPlatform: 'vinted',
    lastCategory: getCategoryText(formData.category),
    lastCategoryPath: formData.categoryPath || analysisData.categoryPath || '',
    lastVinted: buildVintedPayload(formData)
  };
  if (formattedText) {
    payload.lastFormattedText = formattedText;
  } else if (!pastePayloadActive) {
    payload.lastFormattedText = '';
  }
  // else: keep the text already stored for THIS listing (e.g. the AI-formatted text from "Kopieer")
  return payload;
}

// What the content script fills in on Vinted besides title, description and price.
// The condition comes from the popup (the user may have changed it), the rest from the AI analysis.
function buildVintedPayload(formData) {
  const v = analysisData.vinted;
  const statusId = VINTED_STATUS_IDS[formData.condition] || (v && v.statusId) || null;
  if (!v && !statusId) return null;
  return {
    catalogId: v && Number.isInteger(v.catalogId) ? v.catalogId : null,
    brand: (v && v.brand) || '',
    sizeCandidates: (v && Array.isArray(v.sizeCandidates)) ? v.sizeCandidates : [],
    statusId,
    colorIds: (v && Array.isArray(v.colorIds)) ? v.colorIds : [],
    materialIds: (v && Array.isArray(v.materialIds)) ? v.materialIds : []
  };
}

// Write the paste payload for the listing that is in the form right now (Kopieer and Open Vinted)
async function writePastePayload(formattedText) {
  clearTimeout(formSaveTimer);
  formSaveTimer = null;
  const formData = getFormData();
  const ok = await safeStorageSet({
    listingData: formData,
    analysisData: analysisData,
    ...buildPastePayload(formData, formattedText)
  });
  if (ok) pastePayloadActive = true;
  return ok;
}

// Text fields: debounced. Photos are NOT rewritten here (see saveImages).
function saveFormData() {
  clearTimeout(formSaveTimer);
  formSaveTimer = setTimeout(flushFormSave, FORM_SAVE_DELAY);
}

async function flushFormSave() {
  clearTimeout(formSaveTimer);
  formSaveTimer = null;
  const formData = getFormData();
  const items = { listingData: formData, analysisData: analysisData };
  // Keep an existing paste payload in sync with edits, so "Plakken" always uses the current text
  if (pastePayloadActive) {
    Object.assign(items, buildPastePayload(formData, currentPasteText(formData)));
  }
  return safeStorageSet(items);
}

// Photos: written only when they change (add, remove, reorder)
function saveImages() {
  return safeStorageSet({ savedImages: uploadedImages.slice(0, MAX_IMAGES) });
}

// Open Vinted on the country site the user last visited, with an up-to-date paste payload
async function handleOpenVinted() {
  await writePastePayload(currentPasteText(getFormData()));
  const { lastVintedOrigin } = await chrome.storage.local.get(['lastVintedOrigin']);
  const origin = AP_CONFIG.VINTED_ORIGINS.includes(lastVintedOrigin) ? lastVintedOrigin : AP_CONFIG.DEFAULT_VINTED_ORIGIN;
  chrome.tabs.create({ url: `${origin}/items/new` });
}

function loadSavedData() {
  chrome.storage.local.get(['listingData', 'savedImages', 'analysisData', 'lastListingId', 'lastTitle', 'lastFormattedText'], (result) => {
    if (result.listingData) {
      const data = result.listingData;
      document.getElementById('title').value = data.title || '';
      
      // Sanitize price: strip currency symbols (€, $, etc.) and non-numeric chars
      const rawPrice = String(data.price || '');
      const cleanPrice = rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.');
      document.getElementById('price').value = cleanPrice;
      
      document.getElementById('condition').value = data.condition || '';
      document.getElementById('tags').value = data.tags || '';
      document.getElementById('template').value = data.template || '';
      document.getElementById('additionalInfo').value = data.additionalInfo || '';
      
      // Restore category using picker
      if (data.category) {
        document.getElementById('category').value = data.category;
      }
      if (data.categoryPath) {
        setCategoryFromPath(data.categoryPath);
      }
    }
    
    // Load analysis data
    if (result.analysisData) {
      analysisData = result.analysisData;
      
      // Restore category path display
      if (analysisData.categoryPath) {
        setCategoryFromPath(analysisData.categoryPath);
      }
    }
    
    // The paste payload must belong to this listing. Anything else (older version, other listing) is stale.
    currentListingId = result.listingData?.listingId || newListingId();
    if (result.lastListingId && result.lastListingId === currentListingId) {
      pastePayloadActive = true;
    } else if (result.lastListingId || result.lastTitle || result.lastFormattedText) {
      clearPastePayload();
    }
    
    // Load saved images
    if (result.savedImages && result.savedImages.length > 0) {
      uploadedImages = result.savedImages;
      renderImagePreviews();
      shrinkLegacyImages();
    }
  });
}

function clearForm() {
  const t = window.i18n.t;
  clearTimeout(formSaveTimer);
  formSaveTimer = null;
  document.getElementById('listingForm').reset();
  uploadedImages = [];
  analysisData = { brand: '', size: '', color: '', material: '', categoryPath: '', quantity: 1, vinted: null };
  imagePreviews.innerHTML = '';
  formWasCleared = false;
  
  // Clear category picker (it schedules a save; cancel that, we remove everything below)
  clearCategorySelection();
  clearTimeout(formSaveTimer);
  formSaveTimer = null;
  
  // New, empty listing: also forget what "Plakken" would paste on Vinted
  currentListingId = newListingId();
  pastePayloadActive = false;
  chrome.storage.local.remove(['listingData', 'savedImages', 'analysisData', ...PASTE_PAYLOAD_KEYS]).catch((error) => {
    console.error('Clearing storage failed:', error);
  });
  updateAnalyzeButton();
  showToast(t('formCleared'), 'info');
}

// Toast notification
let toastTimer = null;
function showToast(message, type = 'info', duration = 3000) {
  const el = toast || document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = `toast ${type} show`;
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, duration);
}

// ============================================
// CASCADING CATEGORY PICKER
// ============================================

// Category picker state
let categoryPath = []; // Array of {key, label} objects representing current path
let currentCategoryData = null; // Current level data

// Initialize category picker
function initCategoryPicker() {
  // Load VINTED_CATEGORIES from categories.js (it should be loaded via script tag)
  if (typeof VINTED_CATEGORIES === 'undefined') {
    console.error('VINTED_CATEGORIES not loaded');
    return;
  }

  // Cache elements
  const pickerEl = document.getElementById('categoryPicker');
  const triggerEl = document.getElementById('categoryTrigger');
  const dropdownEl = document.getElementById('categoryDropdown');

  if (!pickerEl || !triggerEl || !dropdownEl) {
    console.error('Category picker elements not found');
    return;
  }

  // Initial render
  currentCategoryData = VINTED_CATEGORIES;
  renderBreadcrumb();
  renderCategoryList(VINTED_CATEGORIES);
  closeCategoryDropdown();

  // Toggle dropdown on click
  triggerEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCategoryDropdown();
  });

  // Close on outside click - but NOT when clicking inside the dropdown
  document.addEventListener('click', (e) => {
    const picker = document.getElementById('categoryPicker');
    const dropdown = document.getElementById('categoryDropdown');
    // Only close if clicking outside the entire picker (trigger + dropdown)
    if (picker && !picker.contains(e.target)) {
      closeCategoryDropdown();
    }
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCategoryDropdown();
  });

  // Setup clear button
  const clearBtn = document.getElementById('clearCategoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearCategorySelection();
      closeCategoryDropdown();
    });
  }
}

function isCategoryDropdownOpen() {
  const dropdownEl = document.getElementById('categoryDropdown');
  if (!dropdownEl) return false;
  return window.getComputedStyle(dropdownEl).display !== 'none';
}

function openCategoryDropdown() {
  const pickerEl = document.getElementById('categoryPicker');
  const dropdownEl = document.getElementById('categoryDropdown');
  if (!pickerEl || !dropdownEl) return;

  pickerEl.classList.add('open');
  dropdownEl.style.display = 'block';
}

function closeCategoryDropdown() {
  const pickerEl = document.getElementById('categoryPicker');
  const dropdownEl = document.getElementById('categoryDropdown');
  if (!pickerEl || !dropdownEl) return;

  pickerEl.classList.remove('open');
  dropdownEl.style.display = 'none';
}

function toggleCategoryDropdown() {
  if (isCategoryDropdownOpen()) {
    closeCategoryDropdown();
  } else {
    openCategoryDropdown();
  }
}


// Render category list at current level
function renderCategoryList(data) {
  const listEl = document.getElementById('categoryList');

  if (!listEl) return;

  const t = window.i18n.t;
  listEl.innerHTML = '';

  // Check if data is an array (leaf nodes) or object (has children)
  if (Array.isArray(data)) {
    if (data.length === 0) {
      // Empty array - this is a selectable category with no sub-items
      // Already selectable at parent level
      return;
    }

    // Array of strings - these are leaf nodes
    data.forEach((item) => {
      const translatedLabel = typeof translateCategory === 'function' ? translateCategory(item) : item;
      const itemEl = createCategoryItem(item, null, true, translatedLabel);
      listEl.appendChild(itemEl);
    });
  } else if (typeof data === 'object' && data !== null) {
    // Object with children
    const isRoot = categoryPath.length === 0 && data === VINTED_CATEGORIES;

    const entries = isRoot && typeof VINTED_CATEGORY_ORDER !== 'undefined' && Array.isArray(VINTED_CATEGORY_ORDER)
      ? VINTED_CATEGORY_ORDER.filter((k) => Object.prototype.hasOwnProperty.call(data, k)).map((k) => [k, data[k]])
      : Object.entries(data);

    entries.forEach(([key, value]) => {
      const hasChildren = (typeof value === 'object' && value !== null &&
        (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0));
      const translatedLabel = typeof translateCategory === 'function' ? translateCategory(key) : key;
      const itemEl = createCategoryItem(key, value, !hasChildren, translatedLabel);
      listEl.appendChild(itemEl);
    });
  }

  if (listEl.children.length === 0) {
    listEl.innerHTML = `<div class="category-empty">${t('categoryNoSub')}</div>`;
  }
}

// Create a category item element
function createCategoryItem(key, childData, isSelectable, displayLabel) {
  const item = document.createElement('div');
  item.className = 'category-item';
  const t = window.i18n.t;
  
  // Use displayLabel for UI, but keep key for data
  const label = displayLabel || key;
  
  const hasChildren = childData !== null && typeof childData === 'object' && 
    (Array.isArray(childData) ? childData.length > 0 : Object.keys(childData).length > 0);
  
  if (hasChildren) {
    item.classList.add('has-children');
  }
  
  item.innerHTML = `
    <span class="category-item-label">${label}</span>
    ${hasChildren ? '<span class="category-item-arrow">→</span>' : ''}
    ${isSelectable ? `<span class="category-item-select">${t('categorySelect')}</span>` : ''}
  `;
  
  // Store the original key for data purposes
  item.dataset.categoryKey = key;
  
  // Click handler
  item.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up and closing dropdown
    
    const clickedSelect = e.target.classList.contains('category-item-select');
    
    if (clickedSelect || !hasChildren) {
      // Select this category - use key for data, label for display
      selectCategory(key, label);
    } else {
      // Navigate into this category - use key for data, label for display
      navigateToCategory(key, childData, label);
    }
  });
  
  return item;
}

// Navigate into a subcategory
function navigateToCategory(key, data, displayLabel) {
  const label = displayLabel || key;
  categoryPath.push({ key: key, label: label });
  currentCategoryData = data;
  
  renderBreadcrumb();
  renderCategoryList(data);
}

// Render breadcrumb navigation
function renderBreadcrumb() {
  const breadcrumbEl = document.getElementById('categoryBreadcrumb');
  if (!breadcrumbEl) return;
  
  const t = window.i18n.t;
  breadcrumbEl.innerHTML = '';
  
  // Root item
  const rootItem = document.createElement('span');
  rootItem.className = 'breadcrumb-item breadcrumb-root';
  rootItem.textContent = t('category');
  rootItem.addEventListener('click', () => navigateToRoot());
  breadcrumbEl.appendChild(rootItem);
  
  // Path items
  categoryPath.forEach((item, index) => {
    // Separator
    const sep = document.createElement('span');
    sep.className = 'breadcrumb-separator';
    sep.textContent = '›';
    breadcrumbEl.appendChild(sep);
    
    // Item
    const pathItem = document.createElement('span');
    pathItem.className = 'breadcrumb-item';
    pathItem.textContent = item.label;
    pathItem.addEventListener('click', () => navigateToBreadcrumb(index));
    breadcrumbEl.appendChild(pathItem);
  });
}

// Navigate to root
function navigateToRoot() {
  categoryPath = [];
  currentCategoryData = VINTED_CATEGORIES;
  renderBreadcrumb();
  renderCategoryList(VINTED_CATEGORIES);
}

// Navigate to a specific breadcrumb
function navigateToBreadcrumb(index) {
  // Truncate path to this index
  categoryPath = categoryPath.slice(0, index + 1);
  
  // Navigate to this level
  let data = VINTED_CATEGORIES;
  for (const item of categoryPath) {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      data = data[item.key];
    }
  }
  
  currentCategoryData = data;
  renderBreadcrumb();
  renderCategoryList(data);
}

// Select a category
function selectCategory(key, displayLabel) {
  const label = displayLabel || key;
  
  // Build full path - use keys for data, labels for display
  const fullPathKeys = [...categoryPath.map(p => p.key), key];
  const fullPathLabels = [...categoryPath.map(p => p.label), label];
  const pathString = fullPathLabels.join(' > ');
  
  // Build category value (snake_case from path using keys)
  const categoryValue = fullPathKeys.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  
  // Update hidden input
  const categoryInput = document.getElementById('category');
  if (categoryInput) {
    categoryInput.value = categoryValue;
  }
  
  // Store in analysis data - use keys for matching with Vinted
  analysisData.categoryPath = fullPathKeys.join(' > ');
  // The user picked a category by hand: paste that one, not the AI's Vinted category
  if (analysisData.vinted) analysisData.vinted = { ...analysisData.vinted, catalogId: null };
  
  // Show selected display - use translated labels
  const selectedEl = document.getElementById('categorySelected');
  const selectedText = document.getElementById('selectedCategoryText');
  
  if (selectedEl && selectedText) {
    selectedText.textContent = pathString;
    selectedEl.style.display = 'flex';
  }
  
  // Update trigger text
  const trigger = document.getElementById('categoryTrigger');
  if (trigger) {
    trigger.querySelector('.trigger-text').textContent = label;
  }
  
  // Close dropdown
  closeCategoryDropdown();
  saveFormData();
  
  showToast(`${window.i18n.t('category')}: ${label}`, 'success');
}

// Clear category selection
function clearCategorySelection() {
  const categoryInput = document.getElementById('category');
  if (categoryInput) {
    categoryInput.value = '';
  }
  
  analysisData.categoryPath = '';
  if (analysisData.vinted) analysisData.vinted = { ...analysisData.vinted, catalogId: null };
  
  const selectedEl = document.getElementById('categorySelected');
  if (selectedEl) {
    selectedEl.style.display = 'none';
  }
  
  // Reset to root
  navigateToRoot();
  saveFormData();
}

// Set category from a path string (for restoring saved data or AI results)
function setCategoryFromPath(pathString) {
  if (!pathString) return;
  
  const parts = pathString.split(' > ').map(p => p.trim());
  if (parts.length === 0) return;
  
  // Build category value
  const categoryValue = parts.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  
  // Update hidden input
  const categoryInput = document.getElementById('category');
  if (categoryInput) {
    categoryInput.value = categoryValue;
  }
  
  // Show selected display
  const selectedEl = document.getElementById('categorySelected');
  const selectedText = document.getElementById('selectedCategoryText');
  
  if (selectedEl && selectedText) {
    selectedText.textContent = pathString;
    selectedEl.style.display = 'flex';
  }
  
  // Update analysis data
  analysisData.categoryPath = pathString;
}
