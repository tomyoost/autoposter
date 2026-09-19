# Autoposter for Vinted

Chrome-extensie (map `chrome-extension/`) + landingspagina (React/Vite) + backend op Supabase.

## Setup

1. Maak een gratis project op supabase.com. Noteer de project-ID (staat in de URL).
2. Vervang overal `JOUW_PROJECT_ID` door die ID (zoek/vervang in VS Code: `chrome-extension/*.js` en `supabase/config.toml`).
3. Maak een Gemini API-key op aistudio.google.com.
4. Backend deployen:
   ```
   npx supabase login
   npx supabase link --project-ref JOUW_PROJECT_ID
   npx supabase db push
   npx supabase secrets set GEMINI_API_KEY=jouw_key
   npx supabase functions deploy
   ```
5. Kopieer `.env.example` naar `.env` en vul de waarden in (Supabase → Project Settings → API).
6. Gumroad: zet de ping-URL op `https://JOUW_PROJECT_ID.supabase.co/functions/v1/gumroad-webhook`.
7. Landingspagina: `npm install && npm run dev`. Deployen via Vercel of Netlify (koppel de GitHub-repo).
8. Extensie testen: `chrome://extensions` → Developer mode → Load unpacked → map `chrome-extension`.
