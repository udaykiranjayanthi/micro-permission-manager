import {
  HostPermissions,
  LocationSettings,
  PermissionData,
  VideoSettings,
} from "../common/types";
import { PERMISSION_NAMES, PERMISSION_STATUS } from "../common/constants";
import { showPermissionModal } from "../dialog";
import { createImageStream, getFakeLocation } from "../common/utils";

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
        const stream = await createImageStream(currentVideoSettings);
        return stream;
      }

      return original(...args);
    },
    configurable: false,
    writable: false,
  });
}

export function overrideGeolocation(): void {
  const original = navigator.geolocation.getCurrentPosition.bind(
    navigator.geolocation
  );

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
        console.log(location);
        successCallback(location);
        return;
      }

      return original(...args);
    },
    configurable: false,
    writable: false,
  });
}

// // Override geolocation API
// const originalGeolocation = navigator.geolocation;
// Object.defineProperty(navigator, "geolocation", {
//   value: {
//     getCurrentPosition: function (
//       successCallback: PositionCallback,
//       errorCallback?: PositionErrorCallback,
//       options?: PositionOptions
//     ) {
//       const hostPermissions = getHostPermissions();
//       if (hostPermissions?.geolocation?.status === "denied") {
//         errorCallback?.({
//           code: 1,
//           message: "User denied Geolocation",
//         } as GeolocationPositionError);
//         return;
//       }

//       if (currentLocationSettings?.fakeLocation) {
//         const coords =
//           currentLocationSettings.config?.type === "random"
//             ? {
//                 latitude: Math.random() * 180 - 90,
//                 longitude: Math.random() * 360 - 180,
//                 accuracy: 100,
//               }
//             : {
//                 latitude: currentLocationSettings.config?.latitude || 0,
//                 longitude: currentLocationSettings.config?.longitude || 0,
//                 accuracy: 100,
//               };

//         successCallback({
//           coords: {
//             ...coords,
//             altitude: null,
//             altitudeAccuracy: null,
//             heading: null,
//             speed: null,
//           },
//           timestamp: Date.now(),
//         } as GeolocationPosition);
//         return;
//       }

//       return originalGeolocation.getCurrentPosition(
//         successCallback,
//         errorCallback,
//         options
//       );
//     },
//     watchPosition: function (
//       successCallback: PositionCallback,
//       errorCallback?: PositionErrorCallback,
//       options?: PositionOptions
//     ) {
//       const hostPermissions = getHostPermissions();
//       if (hostPermissions?.geolocation?.status === "denied") {
//         errorCallback?.({
//           code: 1,
//           message: "User denied Geolocation",
//         } as GeolocationPositionError);
//         return;
//       }

//       if (currentLocationSettings?.fakeLocation) {
//         const intervalId = setInterval(() => {
//           const coords =
//             currentLocationSettings.config?.type === "random"
//               ? {
//                   latitude: Math.random() * 180 - 90,
//                   longitude: Math.random() * 360 - 180,
//                   accuracy: 100,
//                 }
//               : {
//                   latitude: currentLocationSettings.config?.latitude || 0,
//                   longitude: currentLocationSettings.config?.longitude || 0,
//                   accuracy: 100,
//                 };

//           successCallback({
//             coords: {
//               ...coords,
//               altitude: null,
//               altitudeAccuracy: null,
//               heading: null,
//               speed: null,
//             },
//             timestamp: Date.now(),
//           } as GeolocationPosition);
//         }, 1000);

//         return intervalId;
//       }

//       return originalGeolocation.watchPosition(
//         successCallback,
//         errorCallback,
//         options
//       );
//     },
//     clearWatch: originalGeolocation.clearWatch,
//   },
// });

// // Override getUserMedia API
// const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
// Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
//   value: async function (constraints: MediaStreamConstraints) {
//     const hostPermissions = getHostPermissions();
//     if (hostPermissions?.camera?.status === "denied") {
//       throw new Error("Permission denied");
//     }

//     if (currentVideoSettings?.fakeVideo && constraints.video) {
//       const canvas = document.createElement("canvas");
//       canvas.width = 640;
//       canvas.height = 480;
//       const ctx = canvas.getContext("2d");

//       if (currentVideoSettings.config?.type === "text") {
//         // Create text overlay
//         ctx!.fillStyle = "#000000";
//         ctx!.fillRect(0, 0, canvas.width, canvas.height);
//         ctx!.fillStyle = "#ffffff";
//         ctx!.font = "24px Arial";
//         ctx!.textAlign = "center";
//         ctx!.fillText(
//           currentVideoSettings.config?.text || "Fake Camera",
//           canvas.width / 2,
//           canvas.height / 2
//         );
//       } else if (
//         currentVideoSettings.config?.type === "image" &&
//         currentVideoSettings.config?.imageUrl
//       ) {
//         // Load and draw image
//         const img = new Image();
//         img.crossOrigin = "anonymous";
//         img.src = currentVideoSettings.config.imageUrl;
//         await new Promise((resolve) => {
//           img.onload = resolve;
//           img.onerror = resolve;
//         });
//         ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
//       }

//       // Create video stream from canvas
//       const stream = canvas.captureStream(30);
//       return stream;
//     }

//     return originalGetUserMedia.call(this, constraints);
//   },
// });

overrideMedia();
overrideGeolocation();
