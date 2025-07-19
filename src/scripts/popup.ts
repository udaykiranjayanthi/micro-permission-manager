// Constants from src/common/constants.ts
export const PERMISSION_NAMES = {
  GEOLOCATION: "geolocation",
  MICROPHONE: "microphone",
  CAMERA: "camera",
  NOTIFICATIONS: "notifications",
};

export const PERMISSION_SCOPES = {
  TAB: "TAB",
  SESSION: "SESSION",
  ALWAYS: "ALWAYS",
  DENY: "DENY",
};

export const PERMISSION_STATUS = {
  ALLOWED: "allowed",
  DENIED: "denied",
};

export const CONFIG = {
  [PERMISSION_NAMES.GEOLOCATION]: {
    name: "Geolocation",
    emoji: "📍",
    description: "Allow websites to access your location",
  },
  [PERMISSION_NAMES.MICROPHONE]: {
    name: "Microphone",
    emoji: "🎤",
    description: "Allow websites to access your microphone",
  },
  [PERMISSION_NAMES.CAMERA]: {
    name: "Camera",
    emoji: "📸",
    description: "Allow websites to access your camera",
  },
  [PERMISSION_NAMES.NOTIFICATIONS]: {
    name: "Notifications",
    emoji: "🔔",
    description: "Allow websites to send you notifications",
  },
};

// Define types for permissions
type Permission = {
  key: string;
  name: string;
  emoji: string;
  status: string;
  scope?: string;
};

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
  function initApp(): void {
    // Get current tab and permissions
    const currentTab = window.location.host;
    currentTabSpan.textContent = currentTab;

    let permissions: Permission[] = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );

    if (permissions.length === 0) {
      permissions = Object.entries(CONFIG).map(
        ([key, permission]: [
          string,
          { name: string; emoji: string; description: string }
        ]) => ({
          key,
          name: permission.name,
          emoji: permission.emoji,
          status: PERMISSION_STATUS.DENIED,
        })
      );
      localStorage.setItem("permissions", JSON.stringify(permissions));
    }

    renderPermissions(permissions);
    setupEventListeners(permissions);
  }

  // Render permissions list
  function renderPermissions(permissions: Permission[]): void {
    permissionsContainer.innerHTML = permissions
      .map(
        (permission) => `
      <div class="permissionItem">
        <div class="permissionName">
          ${permission.emoji} ${permission.name}:
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
          data-permission="${permission.name}"
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
  function setupEventListeners(permissions: Permission[]): void {
    // Theme toggle
    themeToggleBtn.addEventListener("click", () => {
      toggleTheme();
    });

    // Footer buttons
    settingsBtn.addEventListener("click", handleSettings);
    viewHistoryBtn.addEventListener("click", handleViewHistory);
    clearAllBtn.addEventListener("click", () => handleClearAll(permissions));

    // Permission buttons
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", function (this: HTMLButtonElement) {
        const action = this.getAttribute("data-action");
        const permissionName = this.getAttribute("data-permission");

        if (action === "allow" && permissionName) {
          handleAllow(permissionName, permissions);
        } else if (action === "revoke" && permissionName) {
          handleRevoke(permissionName, permissions);
        }
      });
    });
  }

  // Handler functions
  function handleAllow(
    permissionName: string,
    permissions: Permission[]
  ): void {
    const updatedPermissions = permissions.map((permission) =>
      permission.name === permissionName
        ? {
            ...permission,
            status: PERMISSION_STATUS.ALLOWED,
            scope: PERMISSION_SCOPES.TAB,
          }
        : permission
    );
    localStorage.setItem("permissions", JSON.stringify(updatedPermissions));
    renderPermissions(updatedPermissions);
    setupEventListeners(updatedPermissions);
  }

  function handleRevoke(
    permissionName: string,
    permissions: Permission[]
  ): void {
    const updatedPermissions = permissions.map((permission) =>
      permission.name === permissionName
        ? {
            ...permission,
            status: PERMISSION_STATUS.DENIED,
            scope: undefined,
          }
        : permission
    );
    localStorage.setItem("permissions", JSON.stringify(updatedPermissions));
    renderPermissions(updatedPermissions);
    setupEventListeners(updatedPermissions);
  }

  function handleSettings(): void {
    console.log("Settings clicked");
  }

  function handleViewHistory(): void {
    console.log("View History clicked");
  }

  function handleClearAll(permissions: Permission[]): void {
    const updatedPermissions = permissions.map((permission) => ({
      ...permission,
      status: PERMISSION_STATUS.DENIED,
      scope: undefined,
    }));
    localStorage.setItem("permissions", JSON.stringify(updatedPermissions));
    renderPermissions(updatedPermissions);
    setupEventListeners(updatedPermissions);
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
