chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "captureText",
    title: "Capture Selected Text",
    contexts: ["selection"]
  });
});

async function captureContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Inject content script to get selected text
  const [{result}] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.getSelection().toString()
  });

  const capturedData = {
    text: result || "",
    url: tab.url,
    timestamp: new Date().toISOString()
  };

  // Store temporary capture data and open popup
  await chrome.storage.local.set({ tempCapture: capturedData });
  chrome.action.openPopup();
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "captureText") {
    const capturedData = {
      text: info.selectionText,
      url: tab.url,
      timestamp: new Date().toISOString()
    };

    await chrome.storage.local.set({ tempCapture: capturedData });
    chrome.action.openPopup();
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-text") {
    captureContent();
  }
}); 