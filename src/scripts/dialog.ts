// injected.ts

import { PERMISSION_SCOPES, PERMISSION_STATUS } from "../common/constants";
import { HostPermissions, ServicePermission } from "../common/types";

async function injectModalHtml(
  onPermissionChoice: (data: ServicePermission) => void,
  hostPermissions: HostPermissions
): Promise<void> {
  if (document.getElementById("micro-permission-modal")) return;

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
  };

  // Create the modal
  const modal = document.createElement("div");
  modal.id = "micro-permission-modal";
  Object.assign(modal.style, styles.modal);

  // Create the dialog container
  const dialogContainer = document.createElement("div");
  Object.assign(dialogContainer.style, styles.container);

  // Create heading
  const heading = document.createElement("h3");
  Object.assign(heading.style, styles.heading);
  heading.textContent = "This site is requesting access";
  dialogContainer.appendChild(heading);

  // Create permission text
  const permissionText = document.createElement("p");
  permissionText.id = "micro-permission-text";
  Object.assign(permissionText.style, styles.text);
  permissionText.textContent = "Permission: [placeholder]";
  dialogContainer.appendChild(permissionText);

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  Object.assign(buttonsContainer.style, styles.buttonsContainer);

  // Create allow button
  const allowButton = document.createElement("button");
  allowButton.id = "allow-btn";
  Object.assign(allowButton.style, { ...styles.button, ...styles.allowButton });
  allowButton.textContent = "Allow";
  allowButton.addEventListener("click", () => {
    modal.remove();
    onPermissionChoice({
      status: PERMISSION_STATUS.ALLOWED,
      scope: PERMISSION_SCOPES.TAB,
    });
  });
  buttonsContainer.appendChild(allowButton);

  // Create deny button
  const denyButton = document.createElement("button");
  denyButton.id = "deny-btn";
  Object.assign(denyButton.style, { ...styles.button, ...styles.denyButton });
  denyButton.textContent = "Deny";
  denyButton.addEventListener("click", () => {
    modal.remove();
    onPermissionChoice({
      status: PERMISSION_STATUS.DENIED,
      scope: null,
    });
  });
  buttonsContainer.appendChild(denyButton);

  // Assemble the components
  dialogContainer.appendChild(buttonsContainer);
  modal.appendChild(dialogContainer);
  document.body.appendChild(modal);
}

export function showPermissionModal(
  permissionType: string,
  hostPermissions: HostPermissions
): Promise<ServicePermission> {
  return new Promise((resolve) => {
    injectModalHtml(resolve, hostPermissions).then(() => {
      const text = document.getElementById("micro-permission-text");
      if (text) text.textContent = `Permission: ${permissionType}`;
    });
  });
}
