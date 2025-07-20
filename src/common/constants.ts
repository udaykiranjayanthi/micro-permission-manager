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
