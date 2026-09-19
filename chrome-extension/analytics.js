// Autoposter Analytics - Lightweight event tracking
const TRACK_URL = 'https://JOUW_PROJECT_ID.supabase.co/functions/v1/track-event';

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
    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}); // silently ignore errors
  });
}
