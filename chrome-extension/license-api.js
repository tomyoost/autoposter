// Autoposter - license helpers shared by popup, license and upgrade pages.
// Follows the verify-license API contract (extension 1.1.0). Needs config.js loaded first.

// Only a 200 answer with valid:false and one of these codes means "this key is bad".
// That is the only case in which the extension may forget a stored key.
const LICENSE_REJECT_CODES = Object.freeze(['INVALID_LICENSE', 'LICENSE_INACTIVE', 'LICENSE_EXPIRED', 'BAD_FORMAT']);

// Gumroad keys look like XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX. Manual keys use other formats,
// so we never reject a key client-side; the server decides.
function normalizeLicenseKey(raw) {
  return String(raw || '').trim().toUpperCase();
}

// POST verify-license. Never throws: status 0 means no answer (offline, DNS, CORS, timeout).
async function verifyLicenseKey(licenseKey, { refresh = false } = {}) {
  try {
    const response = await fetch(AP_CONFIG.VERIFY_LICENSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, refresh })
    });
    let data = {};
    try {
      data = (await response.json()) || {};
    } catch {
      data = {};
    }
    return { status: response.status, data };
  } catch {
    return { status: 0, data: {} };
  }
}

function isLicenseValid(result) {
  return result.status === 200 && result.data.valid === true;
}

function isLicenseRejected(result) {
  return result.status === 200 &&
    result.data.valid === false &&
    LICENSE_REJECT_CODES.includes(result.data.error_code);
}

// Shape stored in chrome.storage.local.licenseData (also used for the `usage` object of analyze-image).
function licenseDataFromResponse(data, previous = {}) {
  const tier = data.tier || previous.tier || 'free';
  const fallbackLimit = AP_CONFIG.TIER_LIMITS[tier] ?? AP_CONFIG.TIER_LIMITS.free;
  return {
    ...previous,
    tier,
    usageCount: typeof data.usageCount === 'number' ? data.usageCount : (previous.usageCount || 0),
    usageLimit: typeof data.usageLimit === 'number' ? data.usageLimit : (previous.usageLimit ?? fallbackLimit),
    usageLeft: typeof data.usageLeft === 'number' ? data.usageLeft : (previous.usageLeft ?? fallbackLimit),
    canUseAI: typeof data.canUseAI === 'boolean' ? data.canUseAI : (previous.canUseAI ?? true),
    expiresAt: 'expiresAt' in data ? (data.expiresAt || null) : (previous.expiresAt || null),
    lastChecked: Date.now()
  };
}

// Human message for a failed check, in the current UI language.
function licenseErrorMessage(result, t) {
  if (result.status === 0) return t('licenseNetworkError');
  switch (result.data.error_code) {
    case 'INVALID_LICENSE': return t('licenseErrInvalid');
    case 'LICENSE_INACTIVE': return t('licenseErrInactive');
    case 'LICENSE_EXPIRED': return t('licenseErrExpired');
    case 'BAD_FORMAT': return t('licenseErrFormat');
    case 'NO_LICENSE': return t('licenseErrEmpty');
    case 'VERIFY_UNAVAILABLE': return t('licenseErrUnavailable');
    default:
      return result.status >= 500 ? t('licenseErrUnavailable') : t('licenseInvalid');
  }
}

// Activate (or re-check after an upgrade): forces a fresh Gumroad check and stores the key on success.
async function activateLicenseKey(rawKey) {
  const licenseKey = normalizeLicenseKey(rawKey);
  const result = await verifyLicenseKey(licenseKey, { refresh: true });
  if (!isLicenseValid(result)) {
    return { ok: false, result };
  }
  const licenseData = licenseDataFromResponse(result.data);
  await chrome.storage.local.set({ licenseKey, licenseValidated: true, licenseData });
  await chrome.storage.local.remove(['licenseNotice']);
  return { ok: true, licenseKey, licenseData, result };
}
