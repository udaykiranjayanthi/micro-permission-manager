import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BUTTONS_CONFIG, CONFIG } from "../common/constants";
import { PermissionData } from "../common/types";
import { v4 as uuidv4 } from "uuid";
import styles from "./dialog.module.scss";
import Button from "../common/components/Button/Button";

interface PermissionRequest {
  id: string;
  type: string;
  resolver: (data: PermissionData & { service: string }) => void;
}

interface DialogProps {
  onClose?: () => void;
}

interface PermissionItemProps {
  permissionType: string;
  onPermissionChoice: (data: PermissionData & { service: string }) => void;
}

// Store active permission requests
const activePermissionRequests: PermissionRequest[] = [];

function PermissionItem({
  permissionType,
  onPermissionChoice,
}: PermissionItemProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Request theme from extension
    window.postMessage({ type: "GET_THEME_FROM_EXTENSION" }, "*");

    const handleThemeResponse = (event: MessageEvent) => {
      if (event.data?.type === "THEME_RESPONSE") {
        setTheme(event.data.theme === "light" ? "light" : "dark");
      }
    };

    window.addEventListener("message", handleThemeResponse);
    return () => window.removeEventListener("message", handleThemeResponse);
  }, []);

  return (
    <div className={styles.permissionItem}>
      <div className={styles.permissionName}>
        <span role="img" aria-label="emoji">
          {CONFIG[permissionType]?.emoji}
        </span>{" "}
        {CONFIG[permissionType]?.name}
      </div>
      <div className={styles.buttonsContainer}>
        {Object.entries(BUTTONS_CONFIG).map(([key, button]) => (
          <Button
            key={key}
            variant={button.variant}
            color={button.color}
            size="small"
            fullWidth
            onClick={() =>
              onPermissionChoice({
                service: permissionType,
                status: button.status,
                scope: button.scope,
              })
            }
          >
            {button.text}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Dialog({ onClose }: DialogProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [permissionRequests, setPermissionRequests] = useState<
    PermissionRequest[]
  >([]);

  // Keep local state in sync with global requests
  useEffect(() => {
    setPermissionRequests([...activePermissionRequests]);
  }, [activePermissionRequests]);

  useEffect(() => {
    // Request theme from extension
    window.postMessage({ type: "GET_THEME_FROM_EXTENSION" }, "*");

    const handleThemeResponse = (event: MessageEvent) => {
      if (event.data?.type === "THEME_RESPONSE") {
        setTheme(event.data.theme === "light" ? "light" : "dark");
      }
    };

    window.addEventListener("message", handleThemeResponse);
    return () => window.removeEventListener("message", handleThemeResponse);
  }, []);

  const handlePermissionChoice = (
    requestId: string,
    data: PermissionData & { service: string }
  ) => {
    // Find and resolve the permission request
    const request = activePermissionRequests.find(
      (req) => req.id === requestId
    );
    if (request) {
      request.resolver(data);
      // Remove the resolved request
      const index = activePermissionRequests.findIndex(
        (req) => req.id === requestId
      );
      if (index !== -1) {
        activePermissionRequests.splice(index, 1);
        setPermissionRequests([...activePermissionRequests]);
      }
    }

    // If no more requests, close the modal
    if (activePermissionRequests.length === 0 && onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.modal} data-theme={theme}>
      <div className={styles.container}>
        <p className={styles.heading}>
          <span className={styles.hostname}>{window.location.hostname}</span> is
          requesting permission for{" "}
        </p>
        {permissionRequests.map((request) => (
          <PermissionItem
            key={request.id}
            permissionType={request.type}
            onPermissionChoice={(data) =>
              handlePermissionChoice(request.id, data)
            }
          />
        ))}
      </div>
    </div>
  );
}

let modalRoot: ReactDOM.Root | null = null;
let modalContainer: HTMLElement | null = null;

export function showPermissionModal(
  permissionType: string
): Promise<PermissionData & { service: string }> {
  return new Promise((resolve) => {
    const requestId = uuidv4();
    activePermissionRequests.push({
      id: requestId,
      type: permissionType,
      resolver: resolve,
    });

    // If root doesn't exist, create it
    if (!document.getElementById("__react-modal-root__")) {
      modalContainer = document.createElement("div");
      modalContainer.id = "__react-modal-root__";
      document.body.appendChild(modalContainer);

      modalRoot = ReactDOM.createRoot(modalContainer);
      modalRoot.render(
        <Dialog
          onClose={() => {
            // Clean up
            if (modalRoot) {
              modalRoot.unmount();
              modalRoot = null;
            }
            if (modalContainer) {
              modalContainer.remove();
              modalContainer = null;
            }
          }}
        />
      );
    }
  });
}
