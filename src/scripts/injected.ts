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

function overrideMedia(): void {
  const original = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
  );

  Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
    value: (...args: Parameters<MediaDevices["getUserMedia"]>) => {
      console.log("Intercepted media request");

      showPermissionModal("Media").then((allowed) => {
        if (!allowed) {
          return;
        }
        return original(...args);
      });
    },
    configurable: false,
    writable: false,
  });

  console.log("Media override injected.");
}

overrideMedia();
