# Autoposter for Vinted

Chrome-extensie die met AI een Vinted-advertentie voorbereidt en invult. Drie onderdelen:

| Map | Wat | Waar het draait |
|---|---|---|
| `chrome-extension/` | De extensie (Manifest V3) | Chrome Web Store |
| `supabase/` | Serverfuncties en database | Supabase-project `ydihejkkjjvqjjqnhfak` (EU, Ierland) |
| `src/` | Landingspagina en privacyverklaring (React/Vite) | GitHub Pages: https://tomyoost.github.io/autoposter/ |

## Hoe een licentie werkt

1. De klant koopt of haalt gratis een licentie op Gumroad (`tomyoost.gumroad.com`). Op het product staan **licentiesleutels aan**, dus Gumroad mailt de sleutel zelf en zet hem in de Gumroad-bibliotheek van de klant.
2. De klant plakt de sleutel in de extensie.
3. `verify-license` controleert de sleutel bij Gumroad (`api.gumroad.com/v2/licenses/verify`) en onthoudt de uitkomst 6 uur in de tabel `licenses`. Terugbetaald, chargeback of beëindigd abonnement betekent: niet meer geldig.
4. `analyze-image` en `generate-listing` tellen het gebruik op de server (`reserve_usage`), en geven het terug als de AI-aanroep mislukt.

Welk Gumroad-product welk abonnement geeft staat in de tabel `gumroad_products` (kolom `variant_tiers` kijkt naar de naam van de gekozen tier, bijvoorbeeld "Pro"). Een nieuw product toevoegen:

```sql
insert into public.gumroad_products (product_id, name, default_tier)
values ('<product-id van Gumroad>', 'Autoposter for Vinted – Gratis', 'free');
```

Handmatige sleutels (voor tests of creators) staan in `licenses` met `source = 'manual'`.

De functie `gumroad-webhook` is uitgeschakeld: stel in Gumroad geen ping-URL in.

## AI-model

Het model staat in de tabel `app_settings` en is te wisselen zonder nieuwe versie:
`ai_model_analyze`, `ai_model_text`, `ai_model_fallback` (wordt gebruikt als het eerste model niet antwoordt) en `ai_reasoning_effort`.
De Gemini-sleutel staat als geheim `GEMINI_API_KEY` in Supabase.

## Werken aan de code

- **Serverfuncties live zetten**: `supabase functions deploy <naam> --project-ref ydihejkkjjvqjjqnhfak --use-api --no-verify-jwt`
- **Database**: nieuwe migraties in `supabase/migrations/`.
- **Extensie testen**: `chrome://extensions` → Ontwikkelaarsmodus → Uitgepakte extensie laden → map `chrome-extension`. Alle adressen staan in `chrome-extension/config.js`.
- **Extensie inpakken voor de Web Store**: zip de inhoud van `chrome-extension/` (zonder `README.md`).
- **Landingspagina**: `npm ci && npm run dev`. Bij een push naar `main` bouwt en publiceert `.github/workflows/pages.yml` de site op GitHub Pages. Links, prijzen en contactgegevens staan in `src/config/site.ts`.

Er zijn geen geheimen nodig in deze repository: de extensie praat alleen met de openbare functie-adressen.
