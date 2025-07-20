import { PERMISSION_SCOPES, PERMISSION_STATUS } from "./constants";
import {
  ExtensionPermissions,
  DomainPermissions,
  PermissionData,
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
  console.log(
    "update host permissions",
    hostname,
    sessionId,
    tabId,
    service,
    scope,
    status
  );
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

export const getSessionId = async () => {
  return (await chrome.storage.session.get("sessionId")).sessionId;
};

export const getCurrentTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};
