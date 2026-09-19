// Autoposter - Background Service Worker
// Manifest V3 compatible

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Autoposter installed successfully!');
    
    // Set default settings
    chrome.storage.local.set({
      settings: {
        autoFillEnabled: false,
        defaultMarketplaces: []
      }
    });
  } else if (details.reason === 'update') {
    console.log('Autoposter updated to version:', chrome.runtime.getManifest().version);
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request.action);
  
  switch (request.action) {
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

console.log('Autoposter background service worker started');
