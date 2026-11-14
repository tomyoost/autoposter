// Autoposter - central configuration.
// Loaded first on every extension page (popup, license, upgrade, settings) and
// before content.js on Vinted. This is the ONLY place with server and shop URLs.
// Classic scripts share one global scope, so never redeclare these names elsewhere.

const AP_CONFIG = (() => {
  const SUPABASE_URL = 'https://ydihejkkjjvqjjqnhfak.supabase.co';
  const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

  return Object.freeze({
    SUPABASE_URL,
    VERIFY_LICENSE_URL: `${FUNCTIONS_URL}/verify-license`,
    ANALYZE_IMAGE_URL: `${FUNCTIONS_URL}/analyze-image`,
    GENERATE_LISTING_URL: `${FUNCTIONS_URL}/generate-listing`,
    TRACK_EVENT_URL: `${FUNCTIONS_URL}/track-event`,

    GUMROAD: Object.freeze({
      // One membership product with Starter and Pro tiers; the buyer picks the tier there.
      BUY_URL: 'https://tomyoost.gumroad.com/l/autoposter-starter',
      FREE_URL: 'https://tomyoost.gumroad.com/l/autoposter-gratis',
      LIBRARY_URL: 'https://app.gumroad.com/library'
    }),

    // "Autoposter - Vinted Beta Feedback" Google Form, used for contact and feedback.
    FEEDBACK_URL: 'https://forms.gle/qgcvXNHsqoaGqoSY8',

    // AI photo analyses per month, for display only (-1 = unlimited). The server enforces the real limits.
    TIER_LIMITS: Object.freeze({ free: 3, starter: 50, pro: -1 }),

    // Vinted sites the extension works on (same list as host_permissions in manifest.json).
    VINTED_ORIGINS: Object.freeze([
      'https://www.vinted.nl', 'https://www.vinted.com', 'https://www.vinted.fr',
      'https://www.vinted.de', 'https://www.vinted.be', 'https://www.vinted.es',
      'https://www.vinted.it', 'https://www.vinted.pl', 'https://www.vinted.pt',
      'https://www.vinted.co.uk'
    ]),
    // Fallback when we don't know which Vinted country site the user uses.
    DEFAULT_VINTED_ORIGIN: 'https://www.vinted.nl',

    // true = admin/debug panel (Ctrl+Shift+D), Vinted debug button and verbose console logging.
    // Must be false in every build that goes to the Chrome Web Store.
    DEV_MODE: false
  });
})();
