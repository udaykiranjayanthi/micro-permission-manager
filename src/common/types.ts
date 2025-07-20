export type ServicePermission = {
  tab?: {
    [tabId: string]: {
      status: string;
      scope: string;
      tabId: string;
      sessionId: string;
    };
  };
  session?: {
    [sessionId: string]: {
      status: string;
      scope: string;
      sessionId: string;
    };
  };
  domain?: {
    status: string;
    scope: string;
    domain: string;
  };
};

export type PermissionData = {
  status: string;
  scope: string;
};

export type DomainPermissions = Record<string, ServicePermission>;

export type ExtensionPermissions = Record<string, DomainPermissions>;

export type HostPermissions = Record<string, PermissionData>;
