import { THEME } from "../common/constants";
import { LocalState } from "../common/types";

chrome.runtime.onInstalled.addListener(() => {
  const defaultState: LocalState = {
    enabled: true,
    theme: THEME.DARK,
    permissions: {},
    locationSettings: {
      fakeLocation: false,
    },
    videoSettings: {
      mirrorVideo: false,
      fakeVideo: false,
      config: null,
    },
  };
  chrome.storage.local.set(defaultState);

  initializeSessionId();
});

chrome.runtime.onStartup.addListener(() => {
  initializeSessionId();
});

function initializeSessionId() {
  chrome.storage.session.get("sessionId", (result) => {
    if (!result.sessionId) {
      const newSessionId = crypto.randomUUID();
      chrome.storage.session.set({ sessionId: newSessionId }, () => {});
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_CURRENT_TAB_ID") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tabId: tabs[0]?.id });
    });
    return true; // IMPORTANT: keeps the message channel open for async response
  }

  if (message.type === "GET_CURRENT_SESSION_ID") {
    chrome.storage.session.get("sessionId", (result) => {
      sendResponse({ sessionId: result.sessionId });
    });
    return true; // IMPORTANT: keeps the message channel open for async response
  }
});
