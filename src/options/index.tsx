import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { THEME } from "../common/constants";
import { Switch } from "../common/components/Switch/Switch";
import {
  getEnabled,
  getTheme,
  getLocationSettings,
  getVideoSettings,
  updateEnabled,
  updateTheme,
  updateLocationSettings,
  updateVideoSettings,
} from "../common/utils";
import styles from "./options.module.scss";
import { LocationSettings, VideoSettings } from "../common/types";

const Options: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>(THEME.DARK);
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    fakeLocation: false,
  });
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    fakeVideo: false,
    mirrorVideo: true,
    config: null,
  });

  useEffect(() => {
    const init = async () => {
      // Get enabled state
      getEnabled().then((enabled) => setEnabled(enabled));

      // Get theme
      getTheme().then((theme) => {
        setTheme(theme);
        document.documentElement.setAttribute("data-theme", theme);
      });

      // Get location settings
      getLocationSettings().then((locationSettings) =>
        setLocationSettings(locationSettings)
      );

      // Get video settings
      getVideoSettings().then((videoSettings) =>
        setVideoSettings(videoSettings)
      );
    };

    init();
  }, []);

  const handleEnabledChange = async (enabled: boolean) => {
    await updateEnabled(enabled);
    setEnabled(enabled);
  };

  const handleThemeChange = async (theme: string) => {
    await updateTheme(theme);
    setTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const handleLocationSettingsChange = async (
    locationSettings: LocationSettings
  ) => {
    await updateLocationSettings(locationSettings);
    setLocationSettings(locationSettings);
  };

  const handleVideoSettingsChange = async (videoSettings: VideoSettings) => {
    await updateVideoSettings(videoSettings);
    setVideoSettings(videoSettings);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/static/assets/icon-128.png" alt="Extension icon" />
        <div className={styles.headerText}>
          <h1>Permission Manager</h1>
          <p>
            Control and customize your browser permissions with enhanced privacy
            features.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>General Settings</h2>
        <div className={styles.setting}>
          <div className={styles.settingHead}>
            <div className={styles.settingInfo}>
              <h3>Extension Status</h3>
              <p>Enable or disable all permission management features</p>
            </div>
            <div className={styles.settingControl}>
              <Switch
                id="extension-status"
                checked={enabled}
                onChange={(e) => handleEnabledChange(e.target.checked)}
                label={enabled ? "Enabled" : "Disabled"}
              />
            </div>
          </div>
        </div>

        <div className={styles.setting}>
          <div className={styles.settingHead}>
            <div className={styles.settingInfo}>
              <h3>Theme</h3>
              <p>Choose between light and dark theme</p>
            </div>
            <div className={styles.settingControl}>
              <Switch
                id="theme-switch"
                checked={theme === THEME.DARK}
                onChange={(e) =>
                  handleThemeChange(e.target.checked ? THEME.DARK : THEME.LIGHT)
                }
                label={theme === THEME.DARK ? "Dark" : "Light"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Location Settings</h2>
        <div className={styles.setting}>
          <div className={styles.settingHead}>
            <div className={styles.settingInfo}>
              <h3>Fake Location</h3>
              <p>
                Spoof your location when websites request geolocation access
              </p>
            </div>
            <div className={styles.settingControl}>
              <Switch
                id="fake-location"
                checked={locationSettings.fakeLocation}
                onChange={(e) =>
                  handleLocationSettingsChange({
                    ...locationSettings,
                    fakeLocation: e.target.checked,
                    config: {
                      type: "random",
                    },
                  })
                }
                label={locationSettings.fakeLocation ? "Enabled" : "Disabled"}
              />
            </div>
          </div>

          {locationSettings.fakeLocation && (
            <div className={styles.configContainer}>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    checked={locationSettings?.config?.type === "random"}
                    onChange={() =>
                      handleLocationSettingsChange({
                        ...locationSettings,
                        config: { type: "random" },
                      })
                    }
                  />
                  Random Location
                </label>
                <label>
                  <input
                    type="radio"
                    checked={locationSettings?.config?.type === "static"}
                    onChange={() =>
                      handleLocationSettingsChange({
                        ...locationSettings,
                        config: { type: "static", latitude: 0, longitude: 0 },
                      })
                    }
                  />
                  Custom Location
                </label>
              </div>
              {locationSettings?.config?.type === "static" && (
                <div className={styles.coordinates}>
                  <div className={styles.inputGroup}>
                    <label>Latitude</label>
                    <input
                      type="number"
                      value={locationSettings?.config?.latitude}
                      onChange={(e) =>
                        handleLocationSettingsChange({
                          ...locationSettings,
                          config: {
                            ...locationSettings.config!,
                            latitude: parseFloat(e.target.value),
                          },
                        })
                      }
                      min="-90"
                      max="90"
                      step="0.000001"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Longitude</label>
                    <input
                      type="number"
                      value={locationSettings?.config?.longitude}
                      onChange={(e) =>
                        handleLocationSettingsChange({
                          ...locationSettings,
                          config: {
                            ...locationSettings.config!,
                            longitude: parseFloat(e.target.value),
                          },
                        })
                      }
                      min="-180"
                      max="180"
                      step="0.000001"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Video Settings</h2>
        <div className={styles.setting}>
          <div className={styles.settingHead}>
            <div className={styles.settingInfo}>
              <h3>Fake Video Stream</h3>
              <p>
                Use a custom video stream when websites request camera access
              </p>
            </div>
            <div className={styles.settingControl}>
              <Switch
                id="fake-video"
                checked={videoSettings.fakeVideo}
                onChange={(e) =>
                  handleVideoSettingsChange({
                    ...videoSettings,
                    fakeVideo: e.target.checked,
                    config: {
                      type: "text",
                    },
                  })
                }
                label={videoSettings.fakeVideo ? "Enabled" : "Disabled"}
              />
            </div>
          </div>

          {videoSettings.fakeVideo && (
            <div className={styles.configContainer}>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    checked={videoSettings?.config?.type === "text"}
                    onChange={() =>
                      handleVideoSettingsChange({
                        ...videoSettings,
                        config: {
                          ...videoSettings.config,
                          type: "text" as const,
                        },
                      })
                    }
                  />
                  Text Overlay
                </label>
                <label>
                  <input
                    type="radio"
                    checked={videoSettings?.config?.type === "image-url"}
                    onChange={() =>
                      handleVideoSettingsChange({
                        ...videoSettings,
                        config: {
                          ...videoSettings.config,
                          type: "image-url" as const,
                        },
                      })
                    }
                  />
                  Image URL
                </label>
                <label>
                  <input
                    type="radio"
                    checked={videoSettings?.config?.type === "image-upload"}
                    onChange={() =>
                      handleVideoSettingsChange({
                        ...videoSettings,
                        config: {
                          ...videoSettings.config,
                          type: "image-upload" as const,
                        },
                      })
                    }
                  />
                  Upload Image
                </label>
              </div>
              {videoSettings?.config?.type && (
                <div className={styles.inputGroup}>
                  <label>
                    {videoSettings?.config?.type === "text"
                      ? "Display Text"
                      : videoSettings?.config?.type === "image-url"
                      ? "Image URL"
                      : "Choose Image"}
                  </label>
                  {videoSettings?.config?.type === "text" ? (
                    <input
                      type="text"
                      value={videoSettings?.config?.text || ""}
                      onChange={(e) =>
                        handleVideoSettingsChange({
                          ...videoSettings,
                          config: {
                            ...videoSettings.config!,
                            text: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter display text"
                    />
                  ) : videoSettings?.config?.type === "image-url" ? (
                    <input
                      type="text"
                      value={videoSettings?.config?.imageUrl || ""}
                      onChange={(e) =>
                        handleVideoSettingsChange({
                          ...videoSettings,
                          config: {
                            ...videoSettings.config!,
                            imageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter image URL"
                    />
                  ) : (
                    <div className={styles.fileInput}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleVideoSettingsChange({
                                ...videoSettings,
                                config: {
                                  ...videoSettings.config!,
                                  imageData: reader.result as string,
                                  imageFileName: file.name,
                                },
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {videoSettings?.config?.imageFileName && (
                        <span className={styles.fileName}>
                          {videoSettings.config.imageFileName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.setting}>
          <div className={styles.settingHead}>
            <div className={styles.settingInfo}>
              <h3>Mirror Video</h3>
              <p>Mirror the fake video feed horizontally</p>
            </div>
            <div className={styles.settingControl}>
              <Switch
                id="mirror-video"
                checked={videoSettings.mirrorVideo}
                onChange={(e) =>
                  handleVideoSettingsChange({
                    ...videoSettings,
                    mirrorVideo: e.target.checked,
                  })
                }
                label={videoSettings.mirrorVideo ? "Enabled" : "Disabled"}
              />
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          © 2025 Permission Manager. Created by{" "}
          <a
            href="https://www.linkedin.com/in/uday-kiran-jayanthi/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Uday Kiran Jayanthi
          </a>
        </p>
      </footer>
    </div>
  );
};

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  );
}
