import { PERMISSION_SCOPES, PERMISSION_STATUS } from "./constants";
import {
  ExtensionPermissions,
  DomainPermissions,
  PermissionData,
  LocationSettings,
  VideoSettings,
} from "./types";

type UpdateHostPermissionsParams = {
  hostname: string;
  sessionId: string;
  tabId: string;
  service: string;
  scope: string;
  status: string;
};

export const updateHostPermissions = async ({
  hostname,
  sessionId,
  tabId,
  service,
  scope,
  status,
}: UpdateHostPermissionsParams) => {
  const result = await chrome.storage.local.get("permissions");
  const permissions = result.permissions as ExtensionPermissions;

  if (!permissions?.[hostname]) {
    permissions[hostname] = {};
  }

  if (!permissions[hostname][service]) {
    permissions[hostname][service] = {};
  }

  if (scope === PERMISSION_SCOPES.TAB) {
    if (!permissions[hostname][service].tab) {
      permissions[hostname][service].tab = {};
    }

    permissions[hostname][service].tab[tabId] = {
      status,
      scope,
      tabId,
      sessionId,
    };
  } else if (scope === PERMISSION_SCOPES.SESSION) {
    if (!permissions[hostname][service].session) {
      permissions[hostname][service].session = {};
    }

    permissions[hostname][service].session[sessionId] = {
      status,
      scope,
      sessionId,
    };
  } else if (scope === PERMISSION_SCOPES.DOMAIN) {
    if (status === PERMISSION_STATUS.DENIED) {
      delete permissions[hostname][service].tab;
      delete permissions[hostname][service].session;
    }

    permissions[hostname][service].domain = {
      status,
      scope,
      domain: hostname,
    };
  }

  await chrome.storage.local.set({ permissions: permissions });
};

type GetHostPermissionsParams = {
  hostname: string;
  sessionId: string;
  tabId: string;
};

export const getHostPermissions = async ({
  hostname,
  sessionId,
  tabId,
}: GetHostPermissionsParams) => {
  const result = await chrome.storage.local.get("permissions");
  const domainPermissions = result.permissions?.[hostname] as DomainPermissions;

  const output: Record<string, PermissionData> = {};

  if (!domainPermissions) {
    return output;
  }

  Object.entries(domainPermissions).forEach(([service, servicePermission]) => {
    if (servicePermission?.tab?.[tabId]) {
      output[service] = servicePermission.tab[tabId];
    } else if (servicePermission?.session?.[sessionId]) {
      output[service] = servicePermission.session[sessionId];
    } else if (servicePermission?.domain) {
      output[service] = servicePermission.domain;
    }
  });

  return output;
};

export const resetAllPermissions = async () => {
  await chrome.storage.local.set({ permissions: {} });
};

export const getTheme = async () => {
  const result = await chrome.storage.local.get("theme");
  return result.theme as string;
};

export const updateTheme = async (theme: string) => {
  await chrome.storage.local.set({ theme });
};

export const getEnabled = async () => {
  const result = await chrome.storage.local.get("enabled");
  return result.enabled as boolean;
};

export const updateEnabled = async (enabled: boolean) => {
  await chrome.storage.local.set({ enabled });
};

export const getSessionId = async () => {
  return (await chrome.storage.session.get("sessionId")).sessionId;
};

export const getCurrentTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

export const getFakeLocation = (
  locationSettings: LocationSettings
): GeolocationPosition => {
  let longitude = locationSettings.config?.longitude || 0;
  let latitude = locationSettings.config?.latitude || 0;

  if (locationSettings.config?.type === "random") {
    const randomCityCoordinates = [
      { city: "Delhi", lat: 28.6138952, lng: 77.2090057 },
      { city: "Mumbai", lat: 19.0760905, lng: 72.8774267 },
      { city: "Bangalore", lat: 12.9715987, lng: 77.5945627 },
      { city: "Chennai", lat: 13.0826802, lng: 80.2707184 },
      { city: "Hyderabad", lat: 17.385044, lng: 78.486671 },
      { city: "Kolkata", lat: 22.572645, lng: 88.3638926 },
    ];
    const randomCity =
      randomCityCoordinates[
        Math.floor(Math.random() * randomCityCoordinates.length)
      ];

    longitude = randomCity.lng;
    latitude = randomCity.lat;
  }

  return {
    coords: {
      latitude,
      longitude,
      accuracy: 80,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => "",
    },
    timestamp: Date.now(),
    toJSON: () => "",
  };
};

const renderImageOnCanvas = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  imageUrl: string,
  mirrorVideo: boolean
) => {
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });

  // Calculate image aspect ratio
  const imgAspect = img.width / img.height;
  const canvasAspect = canvas.width / canvas.height;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgAspect > canvasAspect) {
    // Image is wider than canvas — scale by height
    drawHeight = canvas.height;
    drawWidth = img.width * (canvas.height / img.height);
  } else {
    // Image is taller than canvas — scale by width
    drawWidth = canvas.width;
    drawHeight = img.height * (canvas.width / img.width);
  }

  // Center the image
  offsetX = (canvas.width - drawWidth) / 2;
  offsetY = (canvas.height - drawHeight) / 2;

  if (mirrorVideo) {
    // Flip horizontally
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(img, -offsetX - drawWidth, offsetY, drawWidth, drawHeight);
    ctx.restore();
  } else {
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
};

const renderTextOnCanvas = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  mirrorVideo: boolean
) => {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mirrorVideo) {
    // Flip horizontally
    ctx.save(); // Save current context state
    ctx.scale(-1, 1); // Flip horizontally
    ctx.translate(-canvas.width, 0); // Move origin back into visible area
  }

  // Draw your content
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "90px Inter";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.restore(); // Restore context state (unflipped)
};

export const createVideoStream = async (
  getVideoSettings: () => VideoSettings | null
): Promise<MediaStream> => {
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  let previousSettings = "";

  if (ctx) {
    const renderCurrentStream = (settings: VideoSettings | null) => {
      // image url
      if (settings?.config?.type === "image-url" && settings.config.imageUrl) {
        renderImageOnCanvas(
          ctx,
          canvas,
          settings.config.imageUrl,
          settings.mirrorVideo
        );
      }
      // uploaded image
      if (
        settings?.config?.type === "image-upload" &&
        settings.config.imageData
      ) {
        renderImageOnCanvas(
          ctx,
          canvas,
          settings.config.imageData,
          settings.mirrorVideo
        );
      }
      // text
      if (settings?.config?.type === "text") {
        renderTextOnCanvas(
          ctx,
          canvas,
          settings.config?.text || "PLACEHOLDER",
          settings.mirrorVideo
        );
      }
    };

    setInterval(() => {
      const currentVideoSettings = getVideoSettings();

      // render only if settings changes
      if (JSON.stringify(currentVideoSettings) !== previousSettings) {
        renderCurrentStream(currentVideoSettings);
        previousSettings = JSON.stringify(currentVideoSettings);
      }
    }, 100);
  }

  return canvas.captureStream(10);
};

export const getVideoSettings = async (): Promise<VideoSettings> => {
  const result = await chrome.storage.local.get("videoSettings");
  return result.videoSettings as VideoSettings;
};

export const updateVideoSettings = async (
  settings: VideoSettings
): Promise<void> => {
  await chrome.storage.local.set({
    videoSettings: settings,
  });
};

export const getLocationSettings = async (): Promise<LocationSettings> => {
  const result = await chrome.storage.local.get("locationSettings");
  return result.locationSettings as LocationSettings;
};

export const updateLocationSettings = async (
  settings: LocationSettings
): Promise<void> => {
  await chrome.storage.local.set({
    locationSettings: settings,
  });
};
