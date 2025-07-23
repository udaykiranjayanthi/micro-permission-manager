import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BUTTONS_CONFIG, CONFIG } from "../common/constants";
import { PermissionData } from "../common/types";
import "./dialog.scss";

interface DialogProps {
  permissionType: string;
  onClose: (data: PermissionData & { service: string }) => void;
}

function Dialog({ permissionType, onClose }: DialogProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Request theme from extension
    window.postMessage({ type: "GET_THEME_FROM_EXTENSION" }, "*");

    // Listen for theme response
    const handleTheme = (event: MessageEvent) => {
      if (event.data?.type === "THEME_RESPONSE") {
        setTheme(event.data.theme ?? "dark");
      }
    };

    window.addEventListener("message", handleTheme);
    return () => window.removeEventListener("message", handleTheme);
  }, []);

  const handlePermissionClick = (status: string, scope: string) => {
    onClose({
      status,
      scope,
      service: permissionType,
    });
  };

  return (
    <div id="__permission_manager_modal__" data-theme={theme}>
      <div className="container">
        <h2 className="heading">
          {CONFIG[permissionType].emoji} Permission Request
        </h2>
        <p className="text">
          {CONFIG[permissionType].name} is requesting permission to access this
          website.
        </p>

        <div className="permission-item" data-theme={theme}>
          <span>{CONFIG[permissionType].name}</span>
        </div>

        <div className="buttons-container">
          {Object.entries(BUTTONS_CONFIG).map(([action, config]) => (
            <button
              key={action}
              className={`button ${config.className}`}
              onClick={() => handlePermissionClick(config.status, config.scope)}
            >
              {config.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function showModal(
  permissionType: string
): Promise<PermissionData & { service: string }> {
  return new Promise((resolve) => {
    console.log("trigger show modal");
    // Prevent duplicates
    if (document.getElementById("__permission_manager_modal__")) {
      resolve({ status: "DENIED", scope: "tab", service: permissionType });
      return;
    }

    const container = document.createElement("div");
    container.id = "__react-modal-root__";
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <Dialog
        permissionType={permissionType}
        onClose={(data) => {
          // Clean up
          root.unmount();
          container.remove();
          resolve(data);
        }}
      />
    );
  });
}
