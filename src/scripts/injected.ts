import {
  HostPermissions,
  LocationSettings,
  PermissionData,
  VideoSettings,
} from "../common/types";
import { PERMISSION_NAMES, PERMISSION_STATUS } from "../common/constants";
import { showPermissionModal } from "../dialog";
import { createVideoStream, getFakeLocation } from "../common/utils";

const hostname = window.location.hostname;
let sessionId = "";
let tabId = "";
let hostPermissions: HostPermissions = {};
let locationSettings: LocationSettings | null = null;
let videoSettings: VideoSettings | null = null;

window.postMessage({ type: "GET_TAB_ID_FROM_EXTENSION" }, "*");
window.postMessage({ type: "GET_SESSION_ID_FROM_EXTENSION" }, "*");
window.postMessage({ type: "GET_LOCATION_SETTINGS_FROM_EXTENSION" }, "*");
window.postMessage({ type: "GET_VIDEO_SETTINGS_FROM_EXTENSION" }, "*");

window.addEventListener("message", (event) => {
  const { type } = event.data;

  if (type === "TAB_ID_RESPONSE") {
    tabId = event.data.tabId;
  }
  if (type === "SESSION_ID_RESPONSE") {
    sessionId = event.data.sessionId;
  }
  if (type === "HOST_PERMISSIONS_RESPONSE") {
    hostPermissions = (event.data.hostPermissions as HostPermissions) ?? {};
  }
  if (type === "LOCATION_SETTINGS_RESPONSE") {
    locationSettings = event.data.locationSettings;
  }
  if (type === "VIDEO_SETTINGS_RESPONSE") {
    videoSettings = event.data.videoSettings;
  }

  if (
    (type === "TAB_ID_RESPONSE" || type === "SESSION_ID_RESPONSE") &&
    tabId &&
    sessionId
  ) {
    window.postMessage(
      {
        type: "GET_HOST_PERMISSIONS_FROM_EXTENSION",
        hostname,
        tabId,
        sessionId,
      },
      "*"
    );
  }
});

const setPermission = (service: string, data: PermissionData) => {
  window.postMessage(
    {
      type: "SET_HOST_PERMISSIONS_TO_EXTENSION",
      hostname,
      tabId,
      sessionId,
      payload: { service, data },
    },
    "*"
  );
};

function getHostPermissions(): HostPermissions {
  return hostPermissions;
}

function getLocationSettings(): LocationSettings | null {
  return locationSettings;
}

function getVideoSettings(): VideoSettings | null {
  return videoSettings;
}

export function overrideMedia(): void {
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
          throw new Error("User denied Microphone");
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
          throw new Error("User denied Camera");
        }
      }

      const currentVideoSettings = getVideoSettings();

      if (videoConstraints && currentVideoSettings?.fakeVideo) {
        const stream = await createVideoStream(getVideoSettings);
        return stream;
      }

      return original(...args);
    },
    configurable: false,
    writable: false,
  });
}

export function overrideGeolocation(): void {
  const originalGetCurrentPosition =
    navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);

  Object.defineProperty(navigator.geolocation, "getCurrentPosition", {
    value: async (...args: Parameters<Geolocation["getCurrentPosition"]>) => {
      // Get the latest hostPermissions at call time
      const currentPermissions = getHostPermissions();
      const [successCallback, errorCallback] = args;

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
          errorCallback?.({
            code: 1,
            message: "User denied Geolocation",
          } as GeolocationPositionError);
          return;
        }
      }

      const currentLocationSettings = getLocationSettings();

      if (currentLocationSettings?.fakeLocation) {
        const location = getFakeLocation(currentLocationSettings);
        successCallback(location);
        return;
      }

      return originalGetCurrentPosition(...args);
    },
    configurable: false,
    writable: false,
  });

  const originalWatchPosition = navigator.geolocation.watchPosition.bind(
    navigator.geolocation
  );

  Object.defineProperty(navigator.geolocation, "watchPosition", {
    value: async (...args: Parameters<Geolocation["watchPosition"]>) => {
      // Get the latest hostPermissions at call time
      const currentPermissions = getHostPermissions();
      const [successCallback, errorCallback] = args;

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
          errorCallback?.({
            code: 1,
            message: "User denied Geolocation",
          } as GeolocationPositionError);
          return;
        }
      }

      const currentLocationSettings = getLocationSettings();

      if (currentLocationSettings?.fakeLocation) {
        const location = getFakeLocation(currentLocationSettings);

        const intervalId = setInterval(() => {
          successCallback(location);
        }, 10000);

        return intervalId;
      }

      return originalWatchPosition(...args);
    },
    configurable: false,
    writable: false,
  });

  Object.defineProperty(navigator.geolocation, "clearWatch", {
    value: function (watchId: number) {
      clearInterval(watchId);
    },
    configurable: false,
    writable: false,
  });
}

overrideGeolocation();
overrideMedia();
