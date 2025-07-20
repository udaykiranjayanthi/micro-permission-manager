import {
  CONFIG,
  PERMISSION_SCOPES,
  PERMISSION_STATUS,
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

    console.log(hostname, tabId, sessionId);

    currentTabSpan.textContent = hostname;

    const hostPermissions =
      (await getHostPermissions({ hostname, tabId, sessionId })) ?? {};

    console.log("hostPermissions", hostPermissions);

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
        <button 
          class="button ${
            permission.status === PERMISSION_STATUS.ALLOWED ? "revoke" : "allow"
          }"
          data-action="${
            permission.status === PERMISSION_STATUS.ALLOWED ? "revoke" : "allow"
          }"
          data-permission="${key}"
        >
          ${
            permission.status === PERMISSION_STATUS.ALLOWED ? "Revoke" : "Allow"
          }
        </button>
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
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", function (this: HTMLButtonElement) {
        const action = this.getAttribute("data-action");
        const permissionName = this.getAttribute("data-permission");

        if (action === "allow" && permissionName) {
          handleAllow(hostname, tabId, sessionId, permissionName);
        } else if (action === "revoke" && permissionName) {
          handleRevoke(hostname, tabId, sessionId, permissionName);
        }
      });
    });
  }

  // Handler functions
  function handleAllow(
    hostname: string,
    tabId: string,
    sessionId: string,
    permissionName: string
  ): void {
    updateHostPermissions({
      hostname,
      tabId,
      sessionId,
      service: permissionName,
      status: PERMISSION_STATUS.ALLOWED,
      scope: PERMISSION_SCOPES.TAB,
    }).then(() => {
      initApp();
    });
  }

  function handleRevoke(
    hostname: string,
    tabId: string,
    sessionId: string,
    permissionName: string
  ): void {
    updateHostPermissions({
      hostname,
      tabId,
      sessionId,
      service: permissionName,
      status: PERMISSION_STATUS.DENIED,
      scope: PERMISSION_SCOPES.DOMAIN,
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
