function injectModalHtml(onPermissionChoice: (allowed: boolean) => void): void {
  if (document.getElementById("micro-permission-modal")) return;

  const modal = document.createElement("div");
  modal.id = "micro-permission-modal";
  modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
    `;

  // Create the dialog container
  const dialogContainer = document.createElement("div");
  dialogContainer.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    font-family: sans-serif;
    text-align: center;
  `;

  // Create heading
  const heading = document.createElement("h3");
  heading.style.marginTop = "0";
  heading.textContent = "This site is requesting access";
  dialogContainer.appendChild(heading);

  // Create permission text
  const permissionText = document.createElement("p");
  permissionText.id = "micro-permission-text";
  permissionText.textContent = "Permission: [placeholder]";
  dialogContainer.appendChild(permissionText);

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.marginTop = "20px";

  // Create allow button
  const allowButton = document.createElement("button");
  allowButton.id = "allow-btn";
  allowButton.textContent = "Allow";
  allowButton.addEventListener("click", () => {
    modal.remove();
    onPermissionChoice(true);
  });
  buttonsContainer.appendChild(allowButton);

  // Create deny button
  const denyButton = document.createElement("button");
  denyButton.id = "deny-btn";
  denyButton.style.marginLeft = "10px";
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
