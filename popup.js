document.addEventListener('DOMContentLoaded', () => {
  const noteSection = document.getElementById('noteSection');
  const lastSavedSection = document.getElementById('lastSavedSection');
  const textElement = document.getElementById('capturedText');
  const noteInput = document.getElementById('noteInput');
  const saveBtn = document.getElementById('saveBtn');
  const lastSavedText = document.getElementById('lastSavedText');
  const lastSavedNote = document.getElementById('lastSavedNote');

  // Handle click outside to close
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#noteSection') && !noteSection.classList.contains('hidden')) {
      window.close();
    }
  });

  // Handle save button
  saveBtn.addEventListener('click', async () => {
    const tab = await getCurrentTab();
    const { tempCapture } = await chrome.storage.local.get('tempCapture');
    
    const bookmark = {
      url: tab.url,
      note: noteInput.value,
      highlight: tempCapture?.text || ''
    };

    // Create CSV content
    const csvContent = [
      ['URL', 'Note', 'Highlight'],
      [bookmark.url, bookmark.note, bookmark.highlight]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmark-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    // Show success state
    noteSection.classList.add('hidden');
    lastSavedSection.classList.remove('hidden');
    lastSavedText.textContent = bookmark.highlight;
    lastSavedNote.textContent = bookmark.note ? `Note: ${bookmark.note}` : '';
    
    // Close popup after 1.5 seconds
    setTimeout(() => window.close(), 1500);
  });

  // Initial load
  chrome.storage.local.get(['tempCapture'], (result) => {
    if (result.tempCapture) {
      textElement.textContent = result.tempCapture.text;
      noteSection.classList.remove('hidden');
      noteInput.focus();
    }
  });
});

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
} 