import { getHostPermissions, updateHostPermissions } from "../common/utils";

function injectScript(fileName: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(fileName);
  script.type = "module"; // or 'text/javascript'
  script.onload = () => script.remove(); // Clean up
  console.log(chrome.runtime.getURL(fileName), script);
  (document.head || document.documentElement).appendChild(script);
}

window.addEventListener("FROM_PAGE", (event: Event) => {
  const customEvent = event as CustomEvent<{
    type: string;
    hostname: string;
    payload: any;
  }>;
  const { type, hostname, payload } = customEvent.detail;

  if (type === "GET_HOST_PERMISSIONS") {
    getHostPermissions({
      hostname,
    }).then((hostPermissions) => {
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
    const { service, data } = payload;

    updateHostPermissions({
      hostname,
      service,
      data,
    }).then(() => {
      getHostPermissions({
        hostname,
      }).then((hostPermissions) => {
        window.dispatchEvent(
          new CustomEvent("FROM_EXTENSION", {
            detail: {
              type: "SEND_HOST_PERMISSIONS",
              value: hostPermissions,
            },
          })
        );
      });
    });
  }
});

injectScript("./injected.js");
