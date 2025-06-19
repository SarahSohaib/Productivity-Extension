const statusText = document.getElementById("status");
let timerInterval = null;

// Utility: Start countdown display
function updateCountdown(endTime) {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      statusText.innerText = "✅ Focus complete!";
      clearInterval(timerInterval);
      chrome.storage.local.set({ isFocusMode: false, focusEndTime: null });
      return;
    }

    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    statusText.innerText = `⏳ ${mins}:${secs} remaining`;
  }, 1000);
}

// Start button
document.getElementById("startBtn").addEventListener("click", () => {
  const duration = parseInt(document.getElementById("duration").value);
  const endTime = Date.now() + duration * 60000;

  chrome.runtime.sendMessage({
    type: "TOGGLE_FOCUS_MODE",
    enabled: true,
    duration: duration
  }, (res) => {
    if (res.success) {
      chrome.storage.local.set({
        isFocusMode: true,
        isPaused: false,
        focusEndTime: endTime
      });
      updateCountdown(endTime);
    }
  });
});

// Stop button
document.getElementById("stopBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "TOGGLE_FOCUS_MODE",
    enabled: false
  }, (res) => {
    if (res.success) {
      chrome.storage.local.set({
        isFocusMode: false,
        isPaused: false,
        focusEndTime: null,
        remainingTime: null
      });
      clearInterval(timerInterval);
      statusText.innerText = "❌ Focus mode stopped.";
    }
  });
});

// Pause button
document.getElementById("pauseBtn")?.addEventListener("click", () => {
  chrome.storage.local.get(["focusEndTime"], (data) => {
    const remaining = Math.max(0, data.focusEndTime - Date.now());
    chrome.storage.local.set({
      isPaused: true,
      remainingTime: remaining,
      focusEndTime: null
    });
    clearInterval(timerInterval);
    statusText.innerText = "⏸️ Paused";
  });
});

// Resume button
document.getElementById("resumeBtn")?.addEventListener("click", () => {
  chrome.storage.local.get(["remainingTime"], (data) => {
    const newEndTime = Date.now() + data.remainingTime;
    chrome.storage.local.set({
      isPaused: false,
      focusEndTime: newEndTime,
      remainingTime: null
    });
    updateCountdown(newEndTime);
  });
});

// On load
chrome.storage.local.get(["isFocusMode", "focusEndTime", "isPaused", "remainingTime"], (data) => {
  if (data.isPaused) {
    statusText.innerText = "⏸️ Paused";
  } else if (data.isFocusMode && data.focusEndTime) {
    updateCountdown(data.focusEndTime);
  } else {
    statusText.innerText = "🔓 Focus mode is OFF";
  }
});
