import {
  ExtensionPermissions,
  HostPermissions,
  ServicePermission,
} from "./types";

type UpdateHostPermissionsParams = {
  hostname: string;
  service: string;
  data: ServicePermission;
};

export const updateHostPermissions = async ({
  hostname,
  service,
  data,
}: UpdateHostPermissionsParams) => {
  console.log("update host permissions", hostname, service, data);
  const result = await chrome.storage.local.get("permissions");
  const permissions = result.permissions as ExtensionPermissions;

  if (!permissions?.[hostname]) {
    permissions[hostname] = {};
  }

  permissions[hostname][service] = data;

  await chrome.storage.local.set({ permissions: permissions });
};

type GetHostPermissionsParams = {
  hostname: string;
};

export const getHostPermissions = async ({
  hostname,
}: GetHostPermissionsParams) => {
  const result = await chrome.storage.local.get("permissions");
  const hostPermissions = result.permissions?.[hostname] as HostPermissions;

  return hostPermissions;
};
