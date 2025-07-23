import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  CONFIG,
  PERMISSION_SCOPES,
  PERMISSION_STATUS,
  BUTTONS_CONFIG,
  THEME,
} from "../common/constants";
import { HostPermissions } from "../common/types";
import {
  getCurrentTab,
  getHostPermissions,
  getSessionId,
  resetAllPermissions,
  updateHostPermissions,
} from "../common/utils";
import styles from "./popup.module.scss";
import Button from "../common/components/Button/Button";

interface PermissionItemProps {
  name: string;
  status: string;
  scope: string;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  name,
  status,
  scope,
}) => (
  <div className={styles.permissionItem}>
    <div className={styles.permissionName}>
      <span>
        {CONFIG[name].emoji} {CONFIG[name].name}
      </span>
      <span className={`${styles.status} ${styles[status.toLowerCase()]}`}>
        {status === PERMISSION_STATUS.ALLOWED ? `Allowed (${scope})` : "Denied"}
      </span>
    </div>
  </div>
);

function Popup() {
  const [enabled, setEnabled] = useState(true);
  const [theme, setTheme] = useState(THEME.DARK);
  const [currentTab, setCurrentTab] = useState<string>("");
  const [permissions, setPermissions] = useState<HostPermissions>({});
  const [tabId, setTabId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");

  useEffect(() => {
    // Initialize app
    const init = async () => {
      // Get enabled state
      chrome.storage.local.get(["enabled"], (result) => {
        setEnabled(result.enabled !== false);
      });

      // Get theme
      chrome.storage.local.get(["theme"], (result) => {
        const currentTheme = result.theme || THEME.DARK;
        setTheme(currentTheme);
        document.documentElement.setAttribute("data-theme", currentTheme);
      });

      // Get current tab and permissions
      const tab = await getCurrentTab();
      if (!tab?.url) return;

      const url = new URL(tab.url);
      const currentHostname = url.hostname;
      setHostname(currentHostname);
      setCurrentTab(currentHostname);

      const currentTabId = await getCurrentTab().then(
        (tab) => tab?.id?.toString() || ""
      );
      setTabId(currentTabId);

      const currentSessionId = await getSessionId();
      setSessionId(currentSessionId);

      const hostPermissions = await getHostPermissions({
        hostname: currentHostname,
        tabId: currentTabId,
        sessionId: currentSessionId,
      });
      if (hostPermissions) setPermissions(hostPermissions);
    };

    init();
  }, []);

  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnabled = e.target.checked;
    chrome.storage.local.set({ enabled: newEnabled });
    setEnabled(newEnabled);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = e.target.checked ? THEME.DARK : THEME.LIGHT;
    chrome.storage.local.set({ theme: newTheme });
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handlePermissionClick = async (
    service: string,
    status: string,
    scope: string
  ) => {
    await updateHostPermissions({
      hostname,
      tabId,
      sessionId,
      service,
      status,
      scope,
    });
    const updatedPermissions = await getHostPermissions({
      hostname,
      tabId,
      sessionId,
    });
    if (updatedPermissions) setPermissions(updatedPermissions);
  };

  const handleSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  const handleViewHistory = () => {
    chrome.tabs.create({ url: "history.html" });
  };

  const handleClearAll = async () => {
    await resetAllPermissions();
    const updatedPermissions = await getHostPermissions({
      hostname,
      tabId,
      sessionId,
    });
    if (updatedPermissions) setPermissions(updatedPermissions);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Permission Manager</h2>
        <div className={styles.switches}>
          <div className={styles.switchGroup}>
            <label htmlFor="status-switch">
              {enabled ? "Enabled" : "Disabled"}
            </label>
            <label className={styles.switch}>
              <input
                type="checkbox"
                id="status-switch"
                checked={enabled}
                onChange={handleEnabledChange}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.switchGroup}>
            <label htmlFor="theme-switch">
              {theme === THEME.DARK ? "Dark" : "Light"}
            </label>
            <label className={styles.switch}>
              <input
                type="checkbox"
                id="theme-switch"
                checked={theme === THEME.DARK}
                onChange={handleThemeChange}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>

      {enabled && (
        <>
          <div className={styles.content}>
            <div className={styles.tabInfo}>
              Current tab: <span id="current-tab">{currentTab}</span>
            </div>
            <div id="permissions-container">
              {Object.entries(permissions).length > 0 ? (
                Object.entries(permissions).map(([name, { status, scope }]) => (
                  <div key={name}>
                    <PermissionItem
                      key={name}
                      name={name}
                      status={status}
                      scope={scope}
                    />
                    <div className={styles.buttonsContainer}>
                      {Object.entries(BUTTONS_CONFIG).map(
                        ([action, config]) => (
                          <Button
                            key={action}
                            variant={config.variant}
                            color={config.color}
                            size="small"
                            onClick={() =>
                              handlePermissionClick(
                                name,
                                config.status,
                                config.scope
                              )
                            }
                          >
                            {config.text}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noPermissions}>
                  No permissions requested yet
                </div>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <Button variant="text" onClick={handleSettings}>
              Settings
            </Button>
            <Button variant="text" onClick={handleViewHistory}>
              View History
            </Button>
            <Button variant="text" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
