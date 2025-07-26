import {
  getHostPermissions,
  getTheme,
  updateHostPermissions,
  getLocationSettings,
  getVideoSettings,
} from "../common/utils";

function injectScript(fileName: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(fileName);
  script.type = "module"; // or 'text/javascript'
  script.onload = () => script.remove(); // Clean up
  (document.head || document.documentElement).prepend(script);
}

function injectCss(fileName: string) {
  const style = document.createElement("link");
  style.id = "__permission_manager_styles__";
  style.rel = "stylesheet";
  style.type = "text/css";
  style.href = chrome.runtime.getURL(fileName);
  document.head.appendChild(style);
}

// Listen for theme change and notify dialog
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.theme?.newValue) {
    const newTheme = changes.theme.newValue;

    window.postMessage(
      {
        type: "THEME_RESPONSE",
        theme: newTheme,
      },
      "*"
    );
  }

  if (changes.videoSettings?.newValue) {
    const newVideoSettings = changes.videoSettings.newValue;

    window.postMessage(
      {
        type: "VIDEO_SETTINGS_RESPONSE",
        videoSettings: newVideoSettings,
      },
      "*"
    );
  }
});

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const { type, hostname, tabId, sessionId } = event.data;

  if (type === "GET_TAB_ID_FROM_EXTENSION") {
    chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB_ID" }, (response) => {
      window.postMessage(
        { type: "TAB_ID_RESPONSE", tabId: response.tabId },
        "*"
      );
    });
  }

  if (type === "GET_SESSION_ID_FROM_EXTENSION") {
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

  if (type === "GET_THEME_FROM_EXTENSION") {
    getTheme().then((theme) => {
      window.postMessage(
        {
          type: "THEME_RESPONSE",
          theme,
        },
        "*"
      );
    });
  }

  if (type === "GET_HOST_PERMISSIONS_FROM_EXTENSION") {
    getHostPermissions({
      hostname,
      tabId,
      sessionId,
    }).then((hostPermissions) => {
      window.postMessage(
        {
          type: "HOST_PERMISSIONS_RESPONSE",
          hostPermissions,
        },
        "*"
      );
    });
  }

  if (type === "GET_LOCATION_SETTINGS_FROM_EXTENSION") {
    getLocationSettings().then((locationSettings) => {
      window.postMessage(
        {
          type: "LOCATION_SETTINGS_RESPONSE",
          locationSettings,
        },
        "*"
      );
    });
  }

  if (type === "GET_VIDEO_SETTINGS_FROM_EXTENSION") {
    getVideoSettings().then((videoSettings) => {
      window.postMessage(
        {
          type: "VIDEO_SETTINGS_RESPONSE",
          videoSettings,
        },
        "*"
      );
    });
  }

  if (type === "SET_HOST_PERMISSIONS_TO_EXTENSION") {
    const {
      service,
      data: { status, scope },
    } = event.data.payload;

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
        window.postMessage(
          {
            type: "HOST_PERMISSIONS_RESPONSE",
            hostPermissions,
          },
          "*"
        );
      });
    });
  }
});

chrome.storage.local.get(["enabled"], (result) => {
  const enabled = result.enabled !== false; // default true
  if (enabled) {
    injectScript("./injected.js");
    injectCss("./static/css/injected.css");
  }
});
