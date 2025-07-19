import { ExtensionPermissions, HostPermissions } from "../common/types";

function injectScript(fileName: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(fileName);
  script.type = "module"; // or 'text/javascript'
  script.onload = () => script.remove(); // Clean up
  console.log(chrome.runtime.getURL(fileName), script);
  (document.head || document.documentElement).appendChild(script);
}

function injectStyle(fileName: string) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL(fileName);
  // link.onload = () => link.remove(); // Clean up
  console.log(chrome.runtime.getURL(fileName), link);
  (document.head || document.documentElement).appendChild(link);
}

window.addEventListener("FROM_PAGE", (event: Event) => {
  const customEvent = event as CustomEvent<{
    type: string;
    hostname: string;
    payload: any;
  }>;
  const { type, hostname, payload } = customEvent.detail;

  if (type === "GET_HOST_PERMISSIONS") {
    chrome.storage.local.get("permissions", (result) => {
      const hostPermissions = result.permissions[hostname] as HostPermissions;

      window.dispatchEvent(
        new CustomEvent("FROM_EXTENSION", {
          detail: {
            type: "SEND_HOST_PERMISSIONS",
            value: hostPermissions,
          },
        })
      );
    });
  }

  if (type === "SET_HOST_PERMISSIONS") {
    chrome.storage.local.get("permissions", (result) => {
      const permissions = result.permissions as ExtensionPermissions;

      if (!permissions[hostname]) {
        permissions[hostname] = {};
      }

      console.log("permissions before", hostname, permissions);

      permissions[hostname][payload.service] = payload.data;

      console.log("permissions after", hostname, permissions);

      chrome.storage.local.set({ permissions: permissions }, () => {
        window.dispatchEvent(
          new CustomEvent("FROM_EXTENSION", {
            detail: {
              type: "SEND_HOST_PERMISSIONS",
              value: permissions[hostname],
            },
          })
        );
      });
    });
  }
});

injectStyle("./static/assets/global.css");
injectScript("./injected.js");
