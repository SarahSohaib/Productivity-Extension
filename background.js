let isFocusMode = false;
let blockUntil = null;

const blockedSites = [
  "*://*.instagram.com/*",
  "*://*.netflix.com/*",
  "*://*.x.com/*"
];

// Toggle focus mode on/off
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "TOGGLE_FOCUS_MODE") {
    isFocusMode = request.enabled;
    console.log("Focus Mode: ", isFocusMode);

    if (isFocusMode && request.duration) {
      const duration = parseInt(request.duration);
      blockUntil = Date.now() + duration * 60000;

      chrome.alarms.create("unblockSites", {
        delayInMinutes: duration
      });
    }

    sendResponse({ success: true });
  }
});

// Unblock when time's up
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "unblockSites") {
    isFocusMode = false;
    blockUntil = null;
    console.log("Focus mode ended. Distractions unblocked.");
  }
});

// Intercept tab updates to check if blocked
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isFocusMode || !blockUntil || Date.now() > blockUntil) return;

  const url = tab.url;
  if (url && isBlocked(url)) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  }
});

function isBlocked(url) {
  return blockedSites.some(site => new RegExp(site.replace(/\*/g, ".*")).test(url));
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "TOGGLE_FOCUS_MODE") {
    if (request.enabled) {
      const duration = parseInt(request.duration);
      const endTime = Date.now() + duration * 60000;

      chrome.alarms.create("unblockSites", {
        when: endTime
      });

      chrome.storage.local.set({
        isFocusMode: true,
        focusEndTime: endTime
      });

      sendResponse({ success: true, endTime });
    } else {
      chrome.alarms.clear("unblockSites");
      chrome.storage.local.set({
        isFocusMode: false,
        focusEndTime: null
      });
      sendResponse({ success: true, message: "Focus mode stopped" });
    }
  }
});
