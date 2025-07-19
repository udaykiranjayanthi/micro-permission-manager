import {
  CONFIG,
  PERMISSION_NAMES,
  PERMISSION_STATUS,
} from "../common/constants";
import { HostPermissions, ServicePermission } from "../common/types";
import { showPermissionModal } from "./dialog";

// (function overrideGeolocation(): void {
//   const original = navigator.geolocation.getCurrentPosition.bind(
//     navigator.geolocation
//   );

//   Object.defineProperty(navigator.geolocation, "getCurrentPosition", {
//     value: (...args: Parameters<Geolocation["getCurrentPosition"]>) => {
//       console.log("Intercepted geolocation request");
//       // You can add permission prompt logic here
//       return original(...args);
//     },
//     configurable: false,
//     writable: false,
//   });

//   console.log("Geolocation override injected.");
// })();

const hostname = window.location.hostname;
let hostPermissions: HostPermissions = {};

window.dispatchEvent(
  new CustomEvent("FROM_PAGE", {
    detail: {
      type: "GET_HOST_PERMISSIONS",
      hostname,
    },
  })
);

const setPermission = (service: string, data: ServicePermission) => {
  window.dispatchEvent(
    new CustomEvent("FROM_PAGE", {
      detail: {
        type: "SET_HOST_PERMISSIONS",
        hostname,
        payload: { service, data },
      },
    })
  );
};

window.addEventListener("FROM_EXTENSION", (event: Event) => {
  const customEvent = event as CustomEvent<{ type: string; value: any }>;

  if (customEvent.detail.type === "HOST_PERMISSIONS") {
    console.log("Storage value received:", customEvent.detail.value);
    hostPermissions = customEvent.detail.value as HostPermissions;
  }
});

function overrideMedia(): void {
  const original = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
  );

  Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
    value: async (...args: Parameters<MediaDevices["getUserMedia"]>) => {
      console.log("Intercepted media request", args);

      // audio
      const audioConstraints = args[0]?.audio;
      // video
      const videoConstraints = args[0]?.video;

      if (audioConstraints && hostPermissions) {
        console.log(hostPermissions[PERMISSION_NAMES.MICROPHONE]);

        const response = await showPermissionModal(
          CONFIG[PERMISSION_NAMES.MICROPHONE].name,
          hostPermissions
        );

        console.log("setting permission", response);

        setPermission(PERMISSION_NAMES.MICROPHONE, {
          status: response.status,
          scope: response.scope,
        });

        if (response.status === PERMISSION_STATUS.DENIED) {
          return;
        }

        return original(...args);
      }

      if (videoConstraints && hostPermissions) {
        console.log(hostPermissions[PERMISSION_NAMES.CAMERA]);

        const response = await showPermissionModal(
          CONFIG[PERMISSION_NAMES.CAMERA].name,
          hostPermissions
        );

        console.log("setting permission", response);
        setPermission(PERMISSION_NAMES.CAMERA, {
          status: response.status,
          scope: response.scope,
        });

        if (response.status === PERMISSION_STATUS.DENIED) {
          return;
        }

        return original(...args);
      }

      console.log("final return");

      return original(...args);
    },
    configurable: false,
    writable: false,
  });

  console.log("Media override injected.");
}

overrideMedia();
