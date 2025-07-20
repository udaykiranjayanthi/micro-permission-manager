import { PERMISSION_NAMES, PERMISSION_STATUS } from "../common/constants";
import { HostPermissions, PermissionData } from "../common/types";
import { showPermissionModal } from "./dialog";
import { getSessionId } from "../common/utils";

const hostname = window.location.hostname;
let sessionId = "";
let tabId = "";
let hostPermissions: HostPermissions = {};

console.log("injected", hostname, tabId, sessionId);

window.postMessage({ type: "GET_TAB_ID_FROM_EXTENSION" }, "*");
window.postMessage({ type: "GET_SESSION_ID_FROM_EXTENSION" }, "*");

window.addEventListener("message", (event) => {
  if (event.data?.type === "TAB_ID_RESPONSE") {
    tabId = event.data.tabId;
    console.log("Tab ID from extension:", tabId);
  }
  if (event.data?.type === "SESSION_ID_RESPONSE") {
    sessionId = event.data.sessionId;
    console.log("Session ID from extension:", sessionId);
  }

  window.dispatchEvent(
    new CustomEvent("tabSessionReady", {
      detail: {
        tabId,
        sessionId,
      },
    })
  );
});

function waitForTabAndSessionId(): Promise<{
  tabId: number;
  sessionId: string;
}> {
  return new Promise((resolve) => {
    function listener(event: Event) {
      const customEvent = event as CustomEvent<{
        tabId: number;
        sessionId: string;
      }>;
      if (customEvent?.detail?.tabId && customEvent?.detail?.sessionId) {
        window.removeEventListener("tabSessionReady", listener);
        resolve({
          tabId: customEvent.detail.tabId,
          sessionId: customEvent.detail.sessionId,
        });
      }
    }

    window.addEventListener("tabSessionReady", listener);
  });
}

const setPermission = (service: string, data: PermissionData) => {
  console.log("setting permission", service, data, hostname, tabId, sessionId);
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

window.addEventListener("FROM_EXTENSION", (event: Event) => {
  const customEvent = event as CustomEvent<{ type: string; value: any }>;

  if (customEvent.detail.type === "HOST_PERMISSIONS_RESPONSE") {
    hostPermissions = (customEvent.detail.value as HostPermissions) ?? {};
  }
});

function overrideMedia(): void {
  const original = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
  );

  Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
    value: async (...args: Parameters<MediaDevices["getUserMedia"]>) => {
      // audio
      const audioConstraints = args[0]?.audio;
      // video
      const videoConstraints = args[0]?.video;

      console.log("host permissions", hostPermissions);

      if (
        audioConstraints &&
        hostPermissions[PERMISSION_NAMES.MICROPHONE]?.status !==
          PERMISSION_STATUS.ALLOWED
      ) {
        const response = await showPermissionModal(
          PERMISSION_NAMES.MICROPHONE,
          hostPermissions
        );

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
        hostPermissions[PERMISSION_NAMES.CAMERA]?.status !==
          PERMISSION_STATUS.ALLOWED
      ) {
        const response = await showPermissionModal(
          PERMISSION_NAMES.CAMERA,
          hostPermissions
        );

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

function overrideGeolocation(): void {
  const original = navigator.geolocation.getCurrentPosition.bind(
    navigator.geolocation
  );

  Object.defineProperty(navigator.geolocation, "getCurrentPosition", {
    value: async (...args: Parameters<Geolocation["getCurrentPosition"]>) => {
      console.log("host permissions", hostPermissions);
      if (
        hostPermissions[PERMISSION_NAMES.GEOLOCATION]?.status !==
        PERMISSION_STATUS.ALLOWED
      ) {
        const response = await showPermissionModal(
          PERMISSION_NAMES.GEOLOCATION,
          hostPermissions
        );

        console.log("calling set permission", response);

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

(async () => {
  const { tabId, sessionId } = await waitForTabAndSessionId();

  // Now safely proceed using tabId and sessionId
  console.log("Both received:", tabId, sessionId);
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

  overrideMedia();
  overrideGeolocation();
})();
