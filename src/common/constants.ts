export const PERMISSION_NAMES = {
  GEOLOCATION: "geolocation",
  MICROPHONE: "microphone",
  CAMERA: "camera",
  NOTIFICATIONS: "notifications",
};

export const PERMISSION_SCOPES = {
  TAB: "TAB",
  SESSION: "SESSION",
  DOMAIN: "DOMAIN",
};

export const PERMISSION_STATUS = {
  ALLOWED: "allowed",
  DENIED: "denied",
};

export const CONFIG = {
  [PERMISSION_NAMES.GEOLOCATION]: {
    name: "Geolocation",
    emoji: "📍",
    description: "Allow websites to access your location",
  },
  [PERMISSION_NAMES.MICROPHONE]: {
    name: "Microphone",
    emoji: "🎤",
    description: "Allow websites to access your microphone",
  },
  [PERMISSION_NAMES.CAMERA]: {
    name: "Camera",
    emoji: "📸",
    description: "Allow websites to access your camera",
  },
  [PERMISSION_NAMES.NOTIFICATIONS]: {
    name: "Notifications",
    emoji: "🔔",
    description: "Allow websites to send you notifications",
  },
};

interface ButtonConfig {
  text: string;
  className: string;
  status: string;
  scope: string;
}

interface ButtonsConfig {
  allowForTab: ButtonConfig;
  allowForSession: ButtonConfig;
  allowAlways: ButtonConfig;
  deny: ButtonConfig;
}

// Define the button configurations
export const BUTTONS_CONFIG: ButtonsConfig = {
  allowForTab: {
    text: "Allow for this tab",
    className: "allowTab",
    status: PERMISSION_STATUS.ALLOWED,
    scope: PERMISSION_SCOPES.TAB,
  },
  allowForSession: {
    text: "Allow for this session",
    className: "allowSession",
    status: PERMISSION_STATUS.ALLOWED,
    scope: PERMISSION_SCOPES.SESSION,
  },
  allowAlways: {
    text: "Allow always",
    className: "allowAlways",
    status: PERMISSION_STATUS.ALLOWED,
    scope: PERMISSION_SCOPES.DOMAIN,
  },
  deny: {
    text: "Deny",
    className: "deny",
    status: PERMISSION_STATUS.DENIED,
    scope: PERMISSION_SCOPES.DOMAIN,
  },
};

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
};
