console.log("runnning in the background");

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ permissions: [] });
});
