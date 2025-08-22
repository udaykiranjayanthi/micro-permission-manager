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

export type LocationSettings = {
  fakeLocation: boolean;
  config?: {
    type: "static" | "random";
    latitude?: number;
    longitude?: number;
  };
};

export type VideoSettings = {
  fakeVideo: boolean;
  mirrorVideo: boolean;
  config: {
    type: "text" | "image-url" | "image-upload";
    text?: string;
    imageUrl?: string;
    imageData?: string;
  } | null;
};

export type LocalState = {
  enabled: boolean;
  theme: string;
  permissions: ExtensionPermissions;
  locationSettings: LocationSettings;
  videoSettings: VideoSettings;
};
