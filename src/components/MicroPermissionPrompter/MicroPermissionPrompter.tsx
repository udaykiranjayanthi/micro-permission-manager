import React, { useState } from "react";
import styles from "./MicroPermissionPrompter.module.scss";

interface MicroPermissionPrompterProps {}

const MicroPermissionPrompter: React.FC<
  MicroPermissionPrompterProps
> = ({}) => {
  // Sample data for the MicroPermissionPrompter component
  const currentTab = "meet.example.com";
  const [permissions, setPermissions] = useState([
    { name: "Microphone", status: "allowed" as const, scope: "This Tab" },
    { name: "Camera", status: "denied" as const },
  ]);

  // Handler functions
  const handleAllow = (permissionName: string) => {
    setPermissions(
      permissions.map((permission) =>
        permission.name === permissionName
          ? { ...permission, status: "allowed" as const, scope: "This Tab" }
          : permission
      )
    );
  };

  const handleRevoke = (permissionName: string) => {
    setPermissions(
      permissions.map((permission) =>
        permission.name === permissionName
          ? { ...permission, status: "denied" as const, scope: undefined }
          : permission
      )
    );
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleViewHistory = () => {
    console.log("View History clicked");
  };

  const handleClearAll = () => {
    setPermissions(
      permissions.map((permission) => ({
        ...permission,
        status: "denied" as const,
        scope: undefined,
      }))
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Micro‑Permission Prompter</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.tabInfo}>Current Tab: {currentTab}</div>

        {permissions.map((permission) => (
          <div key={permission.name} className={styles.permissionItem}>
            <div className={styles.permissionName}>
              {permission.name}:
              <span
                className={`${styles.status} ${
                  permission.status === "allowed"
                    ? styles.allowed
                    : styles.denied
                }`}
              >
                {permission.status === "allowed"
                  ? `Allowed${permission.scope ? ` (${permission.scope})` : ""}`
                  : "Denied"}
              </span>
            </div>
            <button
              className={`${styles.button} ${
                permission.status === "allowed" ? styles.revoke : styles.allow
              }`}
              onClick={() =>
                permission.status === "allowed"
                  ? handleRevoke(permission.name)
                  : handleAllow(permission.name)
              }
            >
              {permission.status === "allowed" ? "Revoke" : "Allow"}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.footer}>
        <div className={styles.footerItem} onClick={handleSettings}>
          <span className={styles.icon}>⚙️</span> Settings
        </div>
        <div className={styles.footerItem} onClick={handleViewHistory}>
          <span className={styles.icon}>📜</span> View History
        </div>
        <div className={styles.footerItem} onClick={handleClearAll}>
          <span className={styles.icon}>🧹</span> Clear All Permissions
        </div>
      </div>
    </div>
  );
};

export default MicroPermissionPrompter;
