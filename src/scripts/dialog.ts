import { v4 as uuidv4 } from "uuid";
import {
  CONFIG,
  PERMISSION_SCOPES,
  PERMISSION_STATUS,
} from "../common/constants";
import { HostPermissions, ServicePermission } from "../common/types";

// Interface for permission request with resolver
interface PermissionRequest {
  id: string;
  type: string;
  resolver: (data: ServicePermission) => void;
}

// Store active permission requests
const activePermissionRequests: PermissionRequest[] = [];

async function injectModalHtml(
  permissionType: string,
  onPermissionChoice: (data: ServicePermission) => void,
  hostPermissions: HostPermissions
): Promise<void> {
  // Get theme from storage
  const theme = "dark";
  const isDarkTheme = theme === "dark";

  // Define theme-dependent styles
  const styles = {
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "999999",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    },
    container: {
      background: isDarkTheme ? "#2c2c2e" : "#ffffff",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "100%",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
      color: isDarkTheme ? "#f5f5f7" : "#1d1d1f",
      border: `1px solid ${isDarkTheme ? "#3a3a3c" : "#d2d2d7"}`,
    },
    heading: {
      marginTop: "0",
      fontSize: "16px",
      fontWeight: "600",
      color: isDarkTheme ? "#f5f5f7" : "#1d1d1f",
    },
    text: {
      margin: "12px 0",
      color: isDarkTheme ? "#f5f5f7" : "#1d1d1f",
      fontSize: "14px",
    },
    buttonsContainer: {
      marginTop: "20px",
      display: "flex",
      justifyContent: "center",
    },
    button: {
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.15s ease",
      border: "none",
      outline: "none",
    },
    allowButton: {
      backgroundColor: isDarkTheme ? "#30d158" : "#34c759",
      color: "white",
    },
    denyButton: {
      backgroundColor: isDarkTheme ? "#ff453a" : "#ff3b30",
      color: "white",
      marginLeft: "10px",
    },
    permissionItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 12px",
      borderRadius: "6px",
      backgroundColor: isDarkTheme
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
    },
  };

  // Check if modal already exists
  let modal = document.getElementById(
    "micro-permission-modal"
  ) as HTMLDivElement;
  let dialogContainer: HTMLDivElement;
  let permissionsContainer: HTMLDivElement;

  // Create or get existing modal
  if (!modal) {
    // Create the modal
    modal = document.createElement("div");
    modal.id = "micro-permission-modal";
    Object.assign(modal.style, styles.modal);

    // Create the dialog container
    dialogContainer = document.createElement("div");
    Object.assign(dialogContainer.style, styles.container);

    // Create heading
    const heading = document.createElement("h3");
    Object.assign(heading.style, styles.heading);
    heading.textContent = "This site is requesting access";
    dialogContainer.appendChild(heading);

    // Create permissions container
    permissionsContainer = document.createElement("div");
    permissionsContainer.id = "permissions-container";
    Object.assign(permissionsContainer.style, {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      marginTop: "16px",
    });
    dialogContainer.appendChild(permissionsContainer);

    // Assemble the components
    modal.appendChild(dialogContainer);
    document.body.appendChild(modal);
  } else {
    // Get existing permissions container
    permissionsContainer = document.getElementById(
      "permissions-container"
    ) as HTMLDivElement;
  }

  // Generate a unique ID for this permission request
  const requestId = `permission-${uuidv4()}`;

  // Create permission item container
  const permissionItem = document.createElement("div");
  permissionItem.id = requestId;
  Object.assign(permissionItem.style, styles.permissionItem);

  // Create permission text
  const permissionText = document.createElement("div");
  Object.assign(permissionText.style, {
    ...styles.text,
    margin: "0",
    textAlign: "left",
  });
  permissionText.textContent = `${CONFIG[permissionType].emoji} ${CONFIG[permissionType].name}`;
  permissionItem.appendChild(permissionText);

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  Object.assign(buttonsContainer.style, {
    display: "flex",
    gap: "8px",
  });

  // Create allow button
  const allowButton = document.createElement("button");
  Object.assign(allowButton.style, { ...styles.button, ...styles.allowButton });
  allowButton.textContent = "Allow";
  allowButton.addEventListener("click", () => {
    // Remove only this permission item
    permissionItem.remove();

    // Resolve this specific permission request
    onPermissionChoice({
      status: PERMISSION_STATUS.ALLOWED,
      scope: PERMISSION_SCOPES.TAB,
    });

    // Remove from active requests
    const index = activePermissionRequests.findIndex(
      (req) => req.id === requestId
    );
    if (index !== -1) {
      activePermissionRequests.splice(index, 1);
    }

    // If no more permissions, remove the modal
    if (permissionsContainer.children.length === 0) {
      modal.remove();
    }
  });
  buttonsContainer.appendChild(allowButton);

  // Create deny button
  const denyButton = document.createElement("button");
  Object.assign(denyButton.style, { ...styles.button, ...styles.denyButton });
  denyButton.textContent = "Deny";
  denyButton.addEventListener("click", () => {
    // Remove only this permission item
    permissionItem.remove();

    // Resolve this specific permission request
    onPermissionChoice({
      status: PERMISSION_STATUS.DENIED,
      scope: null,
    });

    // Remove from active requests
    const index = activePermissionRequests.findIndex(
      (req) => req.id === requestId
    );
    if (index !== -1) {
      activePermissionRequests.splice(index, 1);
    }

    // If no more permissions, remove the modal
    if (permissionsContainer.children.length === 0) {
      modal.remove();
    }
  });
  buttonsContainer.appendChild(denyButton);

  // Assemble the permission item
  permissionItem.appendChild(buttonsContainer);
  permissionsContainer.appendChild(permissionItem);

  // Add to active requests
  activePermissionRequests.push({
    id: requestId,
    type: permissionType,
    resolver: onPermissionChoice,
  });
}

export function showPermissionModal(
  permissionType: string,
  hostPermissions: HostPermissions
): Promise<ServicePermission> {
  return new Promise((resolve) => {
    injectModalHtml(permissionType, resolve, hostPermissions);
  });
}
