// injected.ts

import { PERMISSION_SCOPES, PERMISSION_STATUS } from "../common/constants";
import { HostPermissions, ServicePermission } from "../common/types";

// Ask for data from extension
function getExtensionStorageValue(key: string): Promise<any> {
  return new Promise((resolve) => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data?.type === "EXTENSION_DATA_RESPONSE" &&
        event.data.key === key
      ) {
        window.removeEventListener("message", handleMessage);
        resolve(event.data.value);
      }
    }

    window.addEventListener("message", handleMessage);

    window.postMessage({ type: "GET_EXTENSION_DATA", key }, "*");
  });
}

function injectModalHtml(
  onPermissionChoice: (data: ServicePermission) => void,
  hostPermissions: HostPermissions
): void {
  if (document.getElementById("micro-permission-modal")) return;

  // // Example usage
  // getExtensionStorageValue("permissions").then((value) => {
  //   console.log("Received from extension storage:", value);
  // });

  // Create the modal
  const modal = document.createElement("div");
  modal.id = "micro-permission-modal";
  modal.className = "micro-permission-modal";

  // Create the dialog container
  const dialogContainer = document.createElement("div");
  dialogContainer.className = "modal-container";

  // Create heading
  const heading = document.createElement("h3");
  heading.className = "modal-heading";
  heading.textContent = "This site is requesting access";
  dialogContainer.appendChild(heading);

  // Create permission text
  const permissionText = document.createElement("p");
  permissionText.id = "micro-permission-text";
  permissionText.className = "modal-text";
  permissionText.textContent = "Permission: [placeholder]";
  dialogContainer.appendChild(permissionText);

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "modal-buttons";

  // Create allow button
  const allowButton = document.createElement("button");
  allowButton.id = "allow-btn";
  allowButton.className = "modal-button allow";
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
  denyButton.className = "modal-button deny";
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
    injectModalHtml(resolve, hostPermissions);
    const text = document.getElementById("micro-permission-text");
    if (text) text.textContent = `Permission: ${permissionType}`;
  });
}
