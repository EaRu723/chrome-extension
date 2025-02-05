chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: "captureText",
      title: "Share highlight",
      contexts: ["selection"],
    });
  } catch (error) {
    console.error("Context menu creation failed:", error);
  }
});

chrome.cookies.get(
  { url: "https://ynot.lol/", name: "session" },
  function (cookie) {
    if (cookie) {
      console.log("Cookie value:", cookie.value);
    } else {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
      console.log("Not authenticated!");
    }
  }
);

async function captureContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject content script to get selected text
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.getSelection().toString(),
  });

  const capturedData = {
    text: result || "",
    url: tab.url,
    timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
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
