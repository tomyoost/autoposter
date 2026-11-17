// Autoposter - Background Service Worker
// Manifest V3 compatible

// AP_CONFIG and trackEvent (classic service worker: importScripts shares one global scope)
importScripts('config.js', 'analytics.js');

// Welcome page in a tab: after installing, and for users coming from 1.0.x (their old key no longer works)
function openWelcomePage(isUpdate) {
  const url = chrome.runtime.getURL(`license.html?welcome=1${isUpdate ? '&update=1' : ''}`);
  // Right at browser start there may be no window yet: try again a moment later
  chrome.tabs.create({ url }).catch(() => {
    setTimeout(() => chrome.tabs.create({ url }).catch(() => {}), 2000);
  });
}

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    trackEvent('extension_installed');
    openWelcomePage(false);
    
    // Set default settings
    chrome.storage.local.set({
      settings: {
        autoFillEnabled: false,
        defaultMarketplaces: []
      }
    });
  } else if (details.reason === 'update') {
    if (/^1\.0\./.test(details.previousVersion || '')) openWelcomePage(true);
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  switch (request.action) {
    // DEV-RELOAD-BEGIN (alleen de uitgepakte ontwikkelversie; de bouwstap haalt dit blok uit de zip voor de Web Store)
    case 'devReload':
      chrome.management.getSelf((self) => {
        if (self && self.installType === 'development') chrome.runtime.reload();
      });
      return false;

    // Testhulp: laadt foto's in een popup-tabblad, dat ze precies zo verwerkt als de popup (analyse, beschrijving, Kopieer)
    case 'devLoadListing':
      chrome.management.getSelf(async (self) => {
        if (!self || self.installType !== 'development' || !Array.isArray(request.images) || !request.images.length) return;
        await chrome.storage.local.set({ devTestImages: request.images.slice(0, 10), devTestStatus: { state: 'queued', at: Date.now() } });
        if (['auto', 'women', 'men', 'kids'].includes(request.audience)) await chrome.storage.local.set({ audience: request.audience });
        // Eigen klein venster (zichtbaar, niet gefocust): een achtergrondtabblad wordt door Chrome of een
        // tab-slaapprogramma stilgezet en dan blijft de test hangen (17-11-2026).
        chrome.windows.create({ url: chrome.runtime.getURL('popup.html?devtest=1'), type: 'popup', focused: false, width: 440, height: 720, left: 20, top: 20 });
      });
      return false;
    // DEV-RELOAD-END

    case 'trackEvent':
      // From the content script on Vinted (only event names and counts)
      if (typeof request.event === 'string') trackEvent(request.event, request.extra || {});
      sendResponse({ ok: true });
      return false;

    case 'getCurrentTab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ tab: tabs[0] });
      });
      return true;
    
    case 'getSettings':
      chrome.storage.local.get(['settings'], (result) => {
        sendResponse({ settings: result.settings || {} });
      });
      return true;
    
    case 'saveSettings':
      chrome.storage.local.set({ settings: request.settings }, () => {
        sendResponse({ success: true });
      });
      return true;
    
    case 'clearData':
      chrome.storage.local.remove(['autoPostProData'], () => {
        sendResponse({ success: true });
      });
      return true;
    
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
  
  return false;
});

