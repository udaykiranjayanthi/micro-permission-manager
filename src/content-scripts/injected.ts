(function overrideGeolocation(): void {
  const original = navigator.geolocation.getCurrentPosition.bind(
    navigator.geolocation
  );

  Object.defineProperty(navigator.geolocation, "getCurrentPosition", {
    value: (...args: Parameters<Geolocation["getCurrentPosition"]>) => {
      console.log("Intercepted geolocation request");
      // You can add permission prompt logic here
      return original(...args);
    },
    configurable: false,
    writable: false,
  });

  console.log("Geolocation override injected.");
  alert("System hacked");
})();
