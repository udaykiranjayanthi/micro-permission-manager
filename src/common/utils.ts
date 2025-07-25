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

export const generateRandomCoordinates = () => {
  // Generate random coordinates within reasonable bounds
  const latitude = Math.random() * 180 - 90; // -90 to 90
  const longitude = Math.random() * 360 - 180; // -180 to 180
  return { latitude, longitude };
};

export const createTextCanvas = (text: string): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  return canvas;
};

export const createImageStream = async (
  imageUrl: string
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  return canvas;
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
