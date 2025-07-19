export type ServicePermission = {
  status: string;
  scope: string | null;
};

export type HostPermissions = Record<string, ServicePermission>;

export type ExtensionPermissions = Record<string, HostPermissions>;
