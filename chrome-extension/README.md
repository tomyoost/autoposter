# Autoposter - Chrome Extension

A Chrome Extension (Manifest V3) that lets you create one listing and automatically post it across multiple marketplaces.

## Features

- **Single Listing Creation**: Fill out one form to create a listing
- **Multi-Marketplace Support**: Vinted (more coming soon)
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

- `activeTab`: Access current tab URL
- `scripting`: For auto-fill features
- `storage`: Save form data locally

## Troubleshooting

**Extension not loading?**
- Ensure Developer mode is enabled
- Check for errors in the manifest.json

**Images not uploading?**
- Check file size (max 1MB per image)
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
