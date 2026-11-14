# Autoposter - Chrome Extension

A Chrome Extension (Manifest V3) for Vinted: AI reads your photos and fills in the title, description and category; you set the price. A "Paste" button on the Vinted sell page fills in the form.

## Features

- **Single Listing Creation**: Fill out one form to create a listing
- **Image Upload**: Support for 1-10 images with drag & drop
- **AI Description Generation**: Generate descriptions using AI
- **AI Photo Analysis**: Automatically extract product info from photos
- **Auto-Save**: Form data is saved automatically
- **Clean UI**: Modern dark theme interface

## Installation

### Option 1: Load Unpacked (Development)

1. Download/clone this folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. The extension will appear in your toolbar

### Option 2: ZIP File

1. ZIP all files in this folder (manifest.json, popup.*, background.js, icons/)
2. In Chrome: `chrome://extensions/` → Developer mode → "Load unpacked"
3. Select the extracted folder

## Usage

### Creating a Listing

1. Click the Autoposter icon in your Chrome toolbar
2. Upload photos (AI will automatically analyze them)
3. Review and edit the auto-filled fields:
   - **Title**: Name of your item
   - **Price**: Selling price in EUR
   - **Category**: Auto-detected or select from dropdown
   - **Condition**: Item condition
   - **Tags**: Comma-separated keywords
   - **Description**: Auto-generated or custom
4. Click "Copy" for your target platform
5. Click "Open" to go to the marketplace
6. Paste your listing!

### AI Photo Analysis

1. Upload a photo
2. AI automatically analyzes and fills form fields
3. Review and edit as needed

### AI Description Generation

1. Fill in basic info (at least title)
2. Click "Generate AI Description"
3. The AI will generate a description based on your input
4. Review and edit as needed

## File Structure

```
chrome-extension/
├── manifest.json      # Extension configuration
├── config.js          # AP_CONFIG: server URLs, Gumroad links, tier limits, DEV_MODE (load first!)
├── license-api.js     # verify-license helpers (popup, license, upgrade pages)
├── _locales/          # name + description for Chrome and the Web Store (en, nl)
├── popup.html         # Popup UI
├── popup.css          # Styles
├── popup.js           # Form handling & API calls
├── background.js      # Service worker
├── content.js         # Auto-paste functionality
├── content.css        # Auto-paste button styles
├── categories.js      # Category mappings
├── i18n.js           # Internationalization
├── settings.html      # Settings page
├── settings.js        # Settings functionality
├── settings.css       # Settings styles
├── license.html       # Beta license page
├── license.js         # License validation
├── license.css        # License page styles
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Permissions

- `storage`: Save form data and photos locally
- Host access to the 10 Vinted country sites (www.vinted.nl, .com, .fr, .de, .be, .es, .it, .pl, .pt, .co.uk) for the Paste button

Set `DEV_MODE: true` in `config.js` only for local debugging (debug panel via Ctrl+Shift+D, verbose logs and a debug button on Vinted). It must be `false` in every store build.

## Troubleshooting

**Extension not loading?**
- Ensure Developer mode is enabled
- Check for errors in the manifest.json

**Images not uploading?**
- Check file size (max 15 MB per photo; photos are compressed to max 1600 px JPEG when added)
- Ensure files are valid images (JPG, PNG, etc.)

**AI features not working?**
- Check browser console for detailed errors

## Development

To modify the extension:
1. Edit the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Autoposter card
4. Changes will be applied

## License

MIT License
