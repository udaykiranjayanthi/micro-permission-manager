import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import {
  CONFIG,
  PERMISSION_SCOPES,
  PERMISSION_STATUS,
} from "../../common/constants";
import ThemeToggle from "./ThemeToggle";

type Permission = {
  key: string;
  name: string;
  emoji: string;
  status: string;
  scope?: string;
};

interface ShowPermissionsProps {}

const ShowPermissions: React.FC<ShowPermissionsProps> = ({}) => {
  // Sample data for the ShowPermissions component
  const currentTab = window.location.host;
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    // Fetch permissions from storage
    const storedPermissions: Permission[] = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );
    if (storedPermissions.length > 0) {
      setPermissions(storedPermissions);
    } else {
      const defaultPermissions: Permission[] = Object.entries(CONFIG).map(
        ([key, permission]) => ({
          key,
          name: permission.name,
          emoji: permission.emoji,
          status: PERMISSION_STATUS.DENIED,
        })
      );
      setPermissions(defaultPermissions);
    }
  }, []);

  useEffect(() => {
    // Sync permissions to storage
    if (permissions.length > 0) {
      localStorage.setItem("permissions", JSON.stringify(permissions));
    }
  }, [permissions]);

  // Handler functions
  const handleAllow = (permissionName: string) => {
    setPermissions(
      permissions.map((permission) =>
        permission.name === permissionName
          ? {
              ...permission,
              status: PERMISSION_STATUS.ALLOWED,
              scope: PERMISSION_SCOPES.TAB,
            }
          : permission
      )
    );
  };

  const handleRevoke = (permissionName: string) => {
    setPermissions(
      permissions.map((permission) =>
        permission.name === permissionName
          ? {
              ...permission,
              status: PERMISSION_STATUS.DENIED,
              scope: undefined,
            }
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
        status: PERMISSION_STATUS.DENIED,
        scope: undefined,
      }))
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Permission Manager Extension</h2>
        <ThemeToggle />
      </div>

      <div className={styles.content}>
        <div className={styles.tabInfo}>Current Tab: {currentTab}</div>

        {permissions.map((permission) => (
          <div key={permission.key} className={styles.permissionItem}>
            <div className={styles.permissionName}>
              {permission.emoji} {permission.name}:
              <span
                className={`${styles.status} ${
                  permission.status === PERMISSION_STATUS.ALLOWED
                    ? styles.allowed
                    : styles.denied
                }`}
              >
                {permission.status === PERMISSION_STATUS.ALLOWED
                  ? `Allowed${permission.scope ? ` (${permission.scope})` : ""}`
                  : "Denied"}
              </span>
            </div>
            <button
              className={`${styles.button} ${
                permission.status === PERMISSION_STATUS.ALLOWED
                  ? styles.revoke
                  : styles.allow
              }`}
              onClick={() =>
                permission.status === PERMISSION_STATUS.ALLOWED
                  ? handleRevoke(permission.name)
                  : handleAllow(permission.name)
              }
            >
              {permission.status === PERMISSION_STATUS.ALLOWED
                ? "Revoke"
                : "Allow"}
            </button>
          </div>
        ))}
      </div>

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

export default ShowPermissions;
