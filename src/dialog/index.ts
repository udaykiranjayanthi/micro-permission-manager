function injectModalHtml(onPermissionChoice: (allowed: boolean) => void): void {
  if (document.getElementById("micro-permission-modal")) return;

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
    onPermissionChoice(true);
  });
  buttonsContainer.appendChild(allowButton);

  // Create deny button
  const denyButton = document.createElement("button");
  denyButton.id = "deny-btn";
  denyButton.className = "modal-button deny";
  denyButton.textContent = "Deny";
  denyButton.addEventListener("click", () => {
    modal.remove();
    onPermissionChoice(false);
  });
  buttonsContainer.appendChild(denyButton);

  // Assemble the components
  dialogContainer.appendChild(buttonsContainer);
  modal.appendChild(dialogContainer);
  document.body.appendChild(modal);
}

export function showPermissionModal(permissionType: string): Promise<boolean> {
  return new Promise((resolve) => {
    injectModalHtml(resolve);
    const text = document.getElementById("micro-permission-text");
    if (text) text.textContent = `Permission: ${permissionType}`;
  });
}
