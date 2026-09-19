

# Plan: Drag-and-Drop Foto Herordening + Verbeterde AI Detectie

## 1. Drag-and-Drop Foto Herordening

Gebruikers kunnen foto's slepen om de volgorde te veranderen (bijv. de beste foto links zetten).

**Wat er verandert:**
- Elke foto-thumbnail krijgt een "drag handle" (sleepbaar icoon)
- Je kunt foto's slepen naar een andere positie
- De nieuwe volgorde wordt opgeslagen en gebruikt bij het uploaden naar marktplaatsen
- Werkt ook op mobiel (touch events)

**Technische aanpak:**
- Voeg HTML5 drag-and-drop toe aan `renderImagePreviews()` in `popup.js`
- `dragstart`, `dragover`, `dragend` events op elke `.image-preview`
- Bij `drop`: verplaats het item in de `uploadedImages` array en render opnieuw
- Visuele feedback: placeholder/highlight waar de foto zal landen
- CSS styling in `popup.css` voor drag states (opacity, border)

## 2. Verbeterde AI Label/Tag Detectie

Het huidige probleem: de AI leest "Aullie" in plaats van "Henrietta", en "EU36" in plaats van "AU6/US2 = EU34". Dit komt door:
- Beeldcompressie die kleine tekst onleesbaar maakt
- Het model (gemini-2.5-flash) dat minder sterk is in OCR

**Wat er verandert:**

### A. Hogere beeldkwaliteit naar AI
- Verhoog `maxWidth` van 1400 naar **1800px** in `compressImageForAI()`
- Verhoog JPEG quality van 0.85 naar **0.92**
- Dit behoudt meer detail op labels en tags

### B. Sterker AI model voor analyse
- Upgrade van `google/gemini-2.5-flash` naar `google/gemini-2.5-pro` in de edge function
- Dit model is significant beter in het lezen van kleine tekst op fysieke labels
- Iets langzamer (2-3 sec extra) maar veel nauwkeuriger

### C. Verbeterde prompt instructies
- Extra nadruk op het EXACT lezen van productnamen van tags (niet raden)
- Specifieke instructie: "The hang tag has the EXACT product name printed on it - read it character by character"
- Verduidelijking dat de barcode-sticker de meest betrouwbare bron is voor productnaam en maat

## Betrokken bestanden

| Bestand | Wijziging |
|---------|-----------|
| `chrome-extension/popup.js` | Drag-and-drop logica in `renderImagePreviews()`, hogere compressiekwaliteit |
| `chrome-extension/popup.css` | Drag-and-drop styling (handles, hover states, drop zones) |
| `supabase/functions/analyze-image/index.ts` | Upgrade naar gemini-2.5-pro, verbeterde prompt |

## Over automatisch foto's arrangeren (idee voor later)

Goed idee! De AI zou foto's kunnen scoren op basis van:
- "Hero shot" (volledig product zichtbaar) als eerste
- Label/tag foto's als 2e of 3e
- Detail shots daarna

Dit is een aparte feature die later kan worden toegevoegd zonder de huidige wijzigingen te beinvloeden.

