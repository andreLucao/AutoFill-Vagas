// Background service worker para a extensão

// Listener para quando a extensão é instalada
chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoFill Vagas instalada com sucesso!');
  
  // Definir configurações padrão
  chrome.storage.sync.get(['autoFillEnabled'], (data) => {
    if (data.autoFillEnabled === undefined) {
      chrome.storage.sync.set({ autoFillEnabled: true });
    }
  });
});

// Listener para mensagens de outros scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    // Pode adicionar lógica adicional aqui no futuro
    sendResponse({ success: true });
  }
});