import {
  CONFIG,
  PERMISSION_SCOPES,
  PERMISSION_STATUS,
  BUTTONS_CONFIG,
  THEME,
} from "../common/constants";
import { HostPermissions } from "../common/types";
import {
  getCurrentTab,
  getHostPermissions,
  getSessionId,
  resetAllPermissions,
  updateHostPermissions,
} from "../common/utils";

// Main application code
document.addEventListener("DOMContentLoaded", function () {
  const statusSwitch = document.getElementById(
    "status-switch"
  ) as HTMLInputElement;
  const statusLabel = document.getElementById("status-label") as HTMLDivElement;
  const contentDiv = document.getElementById("content") as HTMLDivElement;
  const footerDiv = document.getElementById("footer") as HTMLDivElement;

  async function setEnabledStateUI(enabled: boolean) {
    if (statusSwitch) statusSwitch.checked = enabled;
    if (statusLabel) {
      if (enabled) {
        statusLabel.textContent = "Enabled";
        if (contentDiv) contentDiv.style.display = "";
        if (footerDiv) footerDiv.style.display = "";
      } else {
        statusLabel.textContent = "Disabled";
        if (contentDiv) contentDiv.style.display = "none";
        if (footerDiv) footerDiv.style.display = "none";
      }
    }
  }

  // Check storage on load
  chrome.storage.local.get(["enabled"], (result) => {
    const enabled = result.enabled !== false; // default true
    setEnabledStateUI(enabled);
  });

  // Switch event
  if (statusSwitch) {
    statusSwitch.addEventListener("change", (e) => {
      const enabled = statusSwitch.checked;
      chrome.storage.local.set({ enabled });
      setEnabledStateUI(enabled);
    });
  }

  // ThemeToggle component functionality
  const themeSwitch = document.getElementById(
    "theme-switch"
  ) as HTMLInputElement;
  const themeLabel = document.getElementById("theme-label") as HTMLInputElement;
  function setTheme(theme: string) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeSwitch) themeSwitch.checked = theme === THEME.DARK;
    if (themeLabel)
      themeLabel.textContent = theme === THEME.DARK ? "Dark" : "Light";
  }
  // On load, get theme from chrome.storage.local
  chrome.storage.local.get(["theme"], (result) => {
    const theme = result.theme || THEME.DARK;
    setTheme(theme);
  });

  // Theme switch event
  if (themeSwitch) {
    themeSwitch.addEventListener("change", () => {
      const next = themeSwitch.checked ? THEME.DARK : THEME.LIGHT;
      chrome.storage.local.set({ theme: next }, () => setTheme(next));
    });
  }

  const currentTabSpan = document.getElementById(
    "current-tab"
  ) as HTMLSpanElement;
  const permissionsContainer = document.getElementById(
    "permissions-container"
  ) as HTMLDivElement;
  const settingsBtn = document.getElementById("settings") as HTMLDivElement;
  const viewHistoryBtn = document.getElementById(
    "view-history"
  ) as HTMLDivElement;
  const clearAllBtn = document.getElementById("clear-all") as HTMLDivElement;

  // Initialize the app
  async function initApp(): Promise<void> {
    // Get current tab and permissions
    const tab = await getCurrentTab();
    if (!tab) return;

    const url = new URL(tab.url ?? "");
    const hostname = url.hostname;
    const tabId = tab.id?.toString() ?? "";
    const sessionId = await getSessionId();

    currentTabSpan.textContent = hostname;

    const hostPermissions =
      (await getHostPermissions({ hostname, tabId, sessionId })) ?? {};

    renderPermissions(hostPermissions);
    setupEventListeners(hostname, tabId, sessionId);
  }

  // Render permissions list
  function renderPermissions(hostPermissions: HostPermissions): void {
    if (!Object.keys(hostPermissions).length) {
      permissionsContainer.innerHTML = `<div class="noPermissions">
      This tab has no permissions.
    </div>`;
    } else {
      permissionsContainer.innerHTML = Object.entries(hostPermissions)
        .map(
          ([key, permission]) => `
      <div class="permissionItem">
        <div class="permissionName">
          ${CONFIG[key].emoji} ${CONFIG[key].name}:
          <span class="status ${
            permission.status === PERMISSION_STATUS.ALLOWED
              ? "allowed"
              : "denied"
          }">
            ${
              permission.status === PERMISSION_STATUS.ALLOWED
                ? `Allowed${permission.scope ? ` (${permission.scope})` : ""}`
                : "Denied"
            }
          </span>
        </div>
        ${`<div class="buttons-container">
            ${Object.entries(BUTTONS_CONFIG)
              .map(
                ([
                  action,
                  config,
                ]) => `<button class="button ${config.className}" data-status="${config.status}" data-permission="${key}" data-scope="${config.scope}">
                ${config.text}
              </button>`
              )
              .join("")}
          </div>`}
      </div>
    `
        )
        .join("");
    }
  }

  // Setup event listeners
  function setupEventListeners(
    hostname: string,
    tabId: string,
    sessionId: string
  ): void {
    // Footer buttons
    settingsBtn.addEventListener("click", handleSettings);
    viewHistoryBtn.addEventListener("click", handleViewHistory);
    clearAllBtn.addEventListener("click", () => handleClearAll());

    // Permission buttons
    document.querySelectorAll("[data-status]").forEach((button) => {
      button.addEventListener("click", function (this: HTMLButtonElement) {
        const status = this.getAttribute("data-status");
        const permissionName = this.getAttribute("data-permission");
        const scope = this.getAttribute("data-scope");

        if (!status || !permissionName || !scope) return;

        handleClick(hostname, tabId, sessionId, permissionName, status, scope);
      });
    });
  }

  // Handler functions
  function handleClick(
    hostname: string,
    tabId: string,
    sessionId: string,
    permissionName: string,
    status: string,
    scope: string
  ): void {
    updateHostPermissions({
      hostname,
      tabId,
      sessionId,
      service: permissionName,
      status: status,
      scope: scope,
    }).then(() => {
      initApp();
    });
  }

  function handleSettings(): void {
    console.log("Settings clicked");
  }

  function handleViewHistory(): void {
    console.log("View History clicked");
  }

  function handleClearAll(): void {
    resetAllPermissions().then(() => {
      initApp();
    });
  }
  // Initialize the application
  initApp();
});
