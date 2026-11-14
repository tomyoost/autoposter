// Autoposter Analytics - Lightweight event tracking (needs config.js loaded first)

// Queue events and send in background (fire-and-forget, never blocks UI)
function trackEvent(eventName, extra = {}) {
  chrome.storage.local.get(['licenseKey', 'licenseData'], (result) => {
    const payload = {
      event: eventName,
      license_key: result.licenseKey || null,
      tier: result.licenseData?.tier || 'free',
      platform: extra.platform || null,
      metadata: {
        ...extra,
        version: chrome.runtime.getManifest?.()?.version || 'unknown',
        timestamp: Date.now(),
      },
    };

    // Fire and forget - never await, never block
    fetch(AP_CONFIG.TRACK_EVENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}); // silently ignore errors
  });
}
