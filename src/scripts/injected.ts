import { HostPermissions, PermissionData } from "../common/types";
import { PERMISSION_NAMES, PERMISSION_STATUS } from "../common/constants";
import { showPermissionModal } from "./dialog";

const hostname = window.location.hostname;
let sessionId = "";
let tabId = "";
let hostPermissions: HostPermissions = {};

window.postMessage({ type: "GET_TAB_ID_FROM_EXTENSION" }, "*");
window.postMessage({ type: "GET_SESSION_ID_FROM_EXTENSION" }, "*");

window.addEventListener("message", (event) => {
  if (event.data?.type === "TAB_ID_RESPONSE") {
    tabId = event.data.tabId;
  }
  if (event.data?.type === "SESSION_ID_RESPONSE") {
    sessionId = event.data.sessionId;
  }

  if (
    (event.data?.type === "TAB_ID_RESPONSE" ||
      event.data?.type === "SESSION_ID_RESPONSE") &&
    tabId &&
    sessionId
  ) {
    window.dispatchEvent(
      new CustomEvent("FROM_PAGE", {
        detail: {
          type: "GET_HOST_PERMISSIONS",
          hostname,
          tabId,
          sessionId,
        },
      })
    );
  }
});

const setPermission = (service: string, data: PermissionData) => {
  window.dispatchEvent(
    new CustomEvent("FROM_PAGE", {
      detail: {
        type: "SET_HOST_PERMISSIONS",
        hostname,
        tabId,
        sessionId,
        payload: { service, data },
      },
    })
  );
};

// Create a function to get the latest hostPermissions
function getHostPermissions(): HostPermissions {
  return hostPermissions;
}

export function overrideMedia(
  setPermission: (service: string, data: PermissionData) => void
): void {
  const original = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
  );

  Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
    value: async (...args: Parameters<MediaDevices["getUserMedia"]>) => {
      // Get the latest hostPermissions at call time
      const currentPermissions = getHostPermissions();

      // audio
      const audioConstraints = args[0]?.audio;
      // video
      const videoConstraints = args[0]?.video;

      if (
        audioConstraints &&
        currentPermissions[PERMISSION_NAMES.MICROPHONE]?.status !==
          PERMISSION_STATUS.ALLOWED
      ) {
        const response = await showPermissionModal(PERMISSION_NAMES.MICROPHONE);

        setPermission(PERMISSION_NAMES.MICROPHONE, {
          status: response.status,
          scope: response.scope,
        });

        if (response.status === PERMISSION_STATUS.DENIED) {
          return;
        }
      }

      if (
        videoConstraints &&
        currentPermissions[PERMISSION_NAMES.CAMERA]?.status !==
          PERMISSION_STATUS.ALLOWED
      ) {
        const response = await showPermissionModal(PERMISSION_NAMES.CAMERA);

        setPermission(PERMISSION_NAMES.CAMERA, {
          status: response.status,
          scope: response.scope,
        });

        if (response.status === PERMISSION_STATUS.DENIED) {
          return;
        }
      }

      return original(...args);
    },
    configurable: false,
    writable: false,
  });
}

export function overrideGeolocation(
  setPermission: (service: string, data: PermissionData) => void
): void {
  const original = navigator.geolocation.getCurrentPosition.bind(
    navigator.geolocation
  );

  Object.defineProperty(navigator.geolocation, "getCurrentPosition", {
    value: async (...args: Parameters<Geolocation["getCurrentPosition"]>) => {
      // Get the latest hostPermissions at call time
      const currentPermissions = getHostPermissions();

      if (
        currentPermissions[PERMISSION_NAMES.GEOLOCATION]?.status !==
        PERMISSION_STATUS.ALLOWED
      ) {
        const response = await showPermissionModal(
          PERMISSION_NAMES.GEOLOCATION
        );

        setPermission(PERMISSION_NAMES.GEOLOCATION, {
          status: response.status,
          scope: response.scope,
        });

        if (response.status === PERMISSION_STATUS.DENIED) {
          return;
        }
      }

      return original(...args);
    },
    configurable: false,
    writable: false,
  });
}

window.addEventListener("FROM_EXTENSION", (event: Event) => {
  const customEvent = event as CustomEvent<{ type: string; value: any }>;

  if (customEvent.detail.type === "HOST_PERMISSIONS_RESPONSE") {
    hostPermissions = (customEvent.detail.value as HostPermissions) ?? {};
  }
});

overrideMedia(setPermission);
overrideGeolocation(setPermission);
