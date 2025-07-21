import {
  CONFIG,
  PERMISSION_SCOPES,
  PERMISSION_STATUS,
  BUTTONS_CONFIG,
} from "../common/constants";
import { HostPermissions } from "../common/types";
import {
  getCurrentTab,
  getHostPermissions,
  getSessionId,
  updateHostPermissions,
} from "../common/utils";

// Main application code
document.addEventListener("DOMContentLoaded", function () {
  // ThemeToggle component functionality
  let currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);

  // Get DOM elements
  const themeToggleBtn = document.getElementById(
    "theme-toggle"
  ) as HTMLButtonElement;
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
    // Theme toggle
    themeToggleBtn.addEventListener("click", () => {
      toggleTheme();
    });

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
    console.log("Clear All clicked");
  }

  function toggleTheme(): void {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggleBtn.textContent = currentTheme === "light" ? "🌘" : "🌖";
  }

  // Initialize the application
  initApp();
});
