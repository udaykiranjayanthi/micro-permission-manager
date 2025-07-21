import { v4 as uuidv4 } from "uuid";
import { BUTTONS_CONFIG, CONFIG } from "../common/constants";
import { PermissionData } from "../common/types";

// Interface for permission request with resolver
interface PermissionRequest {
  id: string;
  type: string;
  resolver: (data: PermissionData) => void;
}

// Store active permission requests
const activePermissionRequests: PermissionRequest[] = [];
let theme = "dark";

window.dispatchEvent(
  new CustomEvent("FROM_PAGE", {
    detail: {
      type: "GET_THEME",
    },
  })
);

window.addEventListener("FROM_EXTENSION", (event: Event) => {
  const customEvent = event as CustomEvent<{ type: string; value: any }>;
  if (customEvent.detail.type === "THEME_RESPONSE") {
    theme = (customEvent.detail.value as string) ?? {};
  }
});

async function injectModalHtml(
  permissionType: string,
  onPermissionChoice: (data: PermissionData) => void
): Promise<void> {
  // Get theme from storage
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
      fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif",
    },
    container: {
      background: isDarkTheme
        ? `linear-gradient(to bottom, #020917, #101725)`
        : `linear-gradient(to bottom, #f0f0f0, #e0e0e0)`,
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "100%",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      color: isDarkTheme ? "#fff" : "#333",
      border: `1px solid ${isDarkTheme ? "#3a3a3c" : "#d2d2d7"}`,
    },
    heading: {
      marginTop: "0",
      fontSize: "16px",
      fontWeight: "600",
    },
    text: {
      margin: "12px 0",
      fontSize: "14px",
    },
    buttonsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    button: {
      padding: "4px 12px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s",
      backgroundColor: "transparent",
      fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif",
    },
    permissionItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px",
      borderRadius: "6px",
      backgroundColor: isDarkTheme
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.3)",
    },
    allowForTab: {
      backgroundColor: isDarkTheme ? "#30d158" : "#34c759",
      color: "white",
    },
    allowForSession: {
      border: isDarkTheme ? "1px solid #5ac8fa" : "1px solid #5ac8fa",
      color: "#5ac8fa",
    },
    allowAlways: {
      border: isDarkTheme ? "1px solid #007aff" : "1px solid #007aff",
      color: "#007aff",
    },
    deny: {
      border: isDarkTheme ? "1px solid #ff453a" : "1px solid #ff3b30",
      color: "#ff3b30",
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
    heading.textContent = `🔈 ${window.location.hostname} is requesting access to ...`;
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
  Object.assign(buttonsContainer.style, styles.buttonsContainer);

  // Add buttons

  Object.entries(BUTTONS_CONFIG).forEach(([scope, buttonConfig]) => {
    const button = document.createElement("button");
    Object.assign(button.style, {
      ...styles.button,
      ...(styles as any)[scope],
    });
    button.textContent = buttonConfig.text;
    button.addEventListener("click", () => {
      // Remove only this permission item
      permissionItem.remove();

      // Resolve this specific permission request
      onPermissionChoice({
        status: buttonConfig.status,
        scope: buttonConfig.scope,
      });

      // If no more permissions, remove the modal
      if (permissionsContainer.children.length === 0) {
        modal.remove();
      }
    });
    buttonsContainer.appendChild(button);
  });

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
  permissionType: string
): Promise<PermissionData> {
  return new Promise((resolve) => {
    injectModalHtml(permissionType, resolve);
  });
}
