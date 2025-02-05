document.addEventListener("DOMContentLoaded", () => {
  const noteSection = document.getElementById("noteSection");
  const lastSavedSection = document.getElementById("lastSavedSection");
  const noteInput = document.getElementById("noteInput");
  const saveBtn = document.getElementById("saveBtn");
  const lastSavedText = document.getElementById("lastSavedText");
  const lastSavedNote = document.getElementById("lastSavedNote");

  const API_URL = "https://ynot.lol/api";

  const autoResize = (element) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  noteInput.addEventListener("input", (event) => {
    autoResize(event.target);
  });

  noteInput.addEventListener("focus", () => {
    autoResize(noteInput);
  });

  document.addEventListener("DOMContentLoaded", async () => {
    const tab = await getCurrentTab();
    document.getElementById("currentUrl").textContent = tab.url;

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString(),
    });

    const textElement = document.getElementById("capturedText");
    if (result && result.trim()) {
      textElement.textContent = result;
    } else {
      textElement.textContent = "";
    }
  });

  // Handle click outside to close
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest("#noteSection") &&
      !noteSection.classList.contains("hidden")
    ) {
      window.close();
    }
  });

  // Handle save button
  saveBtn.addEventListener("click", async () => {
    try {
      const tab = await getCurrentTab();
      const { tempCapture } = await chrome.storage.local.get("tempCapture");

      const bookmark = {
        url: tab.url,
        highlight: tempCapture?.text || null,
        note: noteInput.value,
      };

      const response = await fetch(`${API_URL}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Show success state
      lastSavedSection.classList.remove("hidden");
      document.getElementById("savedUrl").textContent = tab.url;
      lastSavedText.style.color = "gray";
      lastSavedText.textContent = bookmark.highlight;
      lastSavedNote.textContent = bookmark.note ? bookmark.note : "";

      noteInput.value = "";
      autoResize(noteInput);

      // Clear temporary capture data
      await chrome.storage.local.remove("tempCapture");
    } catch (error) {
      console.error("Error saving bookmark:", error);
      lastSavedText.textContent = "Error saving bookmark";
      lastSavedText.style.color = "red";
      lastSavedSection.classList.remove("hidden");
    }
  });

  // Initial load
  chrome.storage.local.get(["tempCapture"], async (result) => {
    const tab = await getCurrentTab();
    document.getElementById("currentUrl").textContent = tab.url;

    if (result.tempCapture?.text) {
      document.getElementById("capturedText").textContent =
        result.tempCapture.text;
      noteInput.focus();
    }
  });
});

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
