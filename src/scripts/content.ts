import {
  getHostPermissions,
  getTheme,
  updateHostPermissions,
} from "../common/utils";

function injectScript(fileName: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(fileName);
  script.type = "module"; // or 'text/javascript'
  script.onload = () => script.remove(); // Clean up
  (document.head || document.documentElement).prepend(script);
}

// Listen for theme change and notify dialog
chrome.storage.local.onChanged.addListener((changes) => {
  console.log("theme changed", changes);
  if (changes.theme?.newValue) {
    const newTheme = changes.theme.newValue;

    window.dispatchEvent(
      new CustomEvent("FROM_EXTENSION", {
        detail: {
          type: "THEME_RESPONSE",
          value: newTheme,
        },
      })
    );
  }
});

window.addEventListener("FROM_PAGE", (event: Event) => {
  const customEvent = event as CustomEvent<{
    type: string;
    hostname: string;
    tabId: string;
    sessionId: string;
    payload: any;
  }>;
  const { type, hostname, tabId, sessionId, payload } = customEvent.detail;

  if (type === "GET_HOST_PERMISSIONS") {
    getHostPermissions({
      hostname,
      tabId,
      sessionId,
    }).then((hostPermissions) => {
      window.dispatchEvent(
        new CustomEvent("FROM_EXTENSION", {
          detail: {
            type: "HOST_PERMISSIONS_RESPONSE",
            value: hostPermissions,
          },
        })
      );
    });
  }

  if (type === "SET_HOST_PERMISSIONS") {
    const {
      service,
      data: { status, scope },
    } = payload;

    updateHostPermissions({
      hostname,
      tabId,
      sessionId,
      service,
      status,
      scope,
    }).then(() => {
      getHostPermissions({
        hostname,
        tabId,
        sessionId,
      }).then((hostPermissions) => {
        window.dispatchEvent(
          new CustomEvent("FROM_EXTENSION", {
            detail: {
              type: "HOST_PERMISSIONS_RESPONSE",
              value: hostPermissions,
            },
          })
        );
      });
    });
  }

  if (type === "GET_THEME") {
    getTheme().then((hostPermissions) => {
      window.dispatchEvent(
        new CustomEvent("FROM_EXTENSION", {
          detail: {
            type: "THEME_RESPONSE",
            value: hostPermissions,
          },
        })
      );
    });
  }
});

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "GET_TAB_ID_FROM_EXTENSION") {
    chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB_ID" }, (response) => {
      window.postMessage(
        { type: "TAB_ID_RESPONSE", tabId: response.tabId },
        "*"
      );
    });
  }

  if (event.data?.type === "GET_SESSION_ID_FROM_EXTENSION") {
    chrome.runtime.sendMessage(
      { type: "GET_CURRENT_SESSION_ID" },
      (response) => {
        window.postMessage(
          { type: "SESSION_ID_RESPONSE", sessionId: response.sessionId },
          "*"
        );
      }
    );
  }
});

chrome.storage.local.get(["enabled"], (result) => {
  const enabled = result.enabled !== false; // default true
  if (enabled) {
    injectScript("./injected.js");
  }
});
