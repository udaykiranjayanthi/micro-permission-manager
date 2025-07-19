import {
  CONFIG,
  PERMISSION_SCOPES,
  PERMISSION_STATUS,
} from "../common/constants";
import { HostPermissions } from "../common/types";
import { getHostPermissions, updateHostPermissions } from "../common/utils";

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
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;

    const url = new URL(tabs[0].url ?? "");
    const hostname = url.hostname;

    currentTabSpan.textContent = hostname;

    const hostPermissions = (await getHostPermissions({ hostname })) ?? {};

    renderPermissions(hostPermissions);
    setupEventListeners(hostname);
  }

  // Render permissions list
  function renderPermissions(hostPermissions: HostPermissions): void {
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

  // Setup event listeners
  function setupEventListeners(hostname: string): void {
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
          handleAllow(hostname, permissionName);
        } else if (action === "revoke" && permissionName) {
          handleRevoke(hostname, permissionName);
        }
      });
    });
  }

  // Handler functions
  function handleAllow(hostname: string, permissionName: string): void {
    updateHostPermissions({
      hostname,
      service: permissionName,
      data: {
        status: PERMISSION_STATUS.ALLOWED,
        scope: PERMISSION_SCOPES.TAB,
      },
    }).then(() => {
      initApp();
    });
  }

  function handleRevoke(hostname: string, permissionName: string): void {
    updateHostPermissions({
      hostname,
      service: permissionName,
      data: {
        status: PERMISSION_STATUS.DENIED,
        scope: null,
      },
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
    themeToggleBtn.textContent = currentTheme === "light" ? "🌑" : "🌕";
  }

  // Initialize the application
  initApp();
});
