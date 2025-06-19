document.body.innerHTML = `
  <div style="
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: black; color: white; font-size: 24px;
    display: flex; align-items: center; justify-content: center;
    z-index: 999999;
    font-family: sans-serif;">
    🚫 Focus Mode is ON<br><br>
    “Discipline is choosing between what you want now and what you want most.”
  </div>
`;
chrome.storage.local.get(["focusEndTime"], (data) => {
  const endTime = data.focusEndTime;
  const remaining = endTime ? Math.max(0, endTime - Date.now()) : 0;
  const minutes = Math.ceil(remaining / 60000);

  document.body.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: black; color: white;
      display: flex; align-items: center; justify-content: center;
      z-index: 999999;
      font-size: 24px;
      font-family: sans-serif; text-align: center;">
      🚫 <strong>Blocked!</strong><br><br>
      Focus mode ends in ${minutes} minute${minutes === 1 ? "" : "s"}.
    </div>
  `;
});
