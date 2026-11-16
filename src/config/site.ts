// Central place for links, plans and contact details used on the site.
// Change values here; the landing page and the privacy policy read from this file.

export const PRODUCT_NAME = "Autoposter for Vinted";

// Chrome Web Store listing. Leave empty until the listing is live: the site then shows
// "Binnenkort in de Chrome Web Store" instead of an install button.
export const CHROME_WEB_STORE_URL = "";

export const GUMROAD_BUY_URL = "https://tomyoost.gumroad.com/l/autoposter-starter";
export const GUMROAD_FREE_URL = "https://tomyoost.gumroad.com/l/autoposter-gratis";
export const GUMROAD_LIBRARY_URL = "https://app.gumroad.com/library";

// Controller (verwerkingsverantwoordelijke) and contact details for the privacy policy.
// Empty fields are not shown. Fill in fullName, kvk and email when available.
export const CONTROLLER = {
  nameNl: "Tomy, maker van Autoposter for Vinted",
  nameEn: "Tomy, maker of Autoposter for Vinted",
  fullName: "",
  kvk: "",
  address: "",
  email: "",
  contactFormUrl: "https://forms.gle/qgcvXNHsqoaGqoSY8",
};

// Zet op true zodra in Google AI Studio facturering aan staat voor de Gemini-sleutel van de Autoposter
// (dan gebruikt Google de foto's niet meer om zijn producten te verbeteren). De privacyverklaring past zich aan.
export const GEMINI_PAID_TIER = true;

export const PRIVACY_LAST_UPDATED = { nl: "16 november 2026", en: "16 November 2026" };

export const VINTED_DOMAINS = [
  "vinted.nl",
  "vinted.be",
  "vinted.de",
  "vinted.fr",
  "vinted.es",
  "vinted.it",
  "vinted.pl",
  "vinted.pt",
  "vinted.com",
  "vinted.co.uk",
];

export type Plan = {
  name: string;
  price: string;
  period?: string;
  analyses: string;
  cta: string;
  href: string;
};

export const PLANS: Plan[] = [
  {
    name: "Gratis",
    price: "€0",
    analyses: "3 AI-analyses per maand",
    cta: "Gratis sleutel ophalen",
    href: GUMROAD_FREE_URL,
  },
  {
    name: "Starter",
    price: "€9,99",
    period: "per maand",
    analyses: "50 AI-analyses per maand",
    cta: "Kies Starter",
    href: GUMROAD_BUY_URL,
  },
  {
    name: "Pro",
    price: "€19,99",
    period: "per maand",
    analyses: "Onbeperkt AI-analyses",
    cta: "Kies Pro",
    href: GUMROAD_BUY_URL,
  },
];

// Builds a URL for a file in public/ that also works when the site is served from a sub-path.
export const publicAsset = (file: string) => `${import.meta.env.BASE_URL}${file.replace(/^\//, "")}`;
