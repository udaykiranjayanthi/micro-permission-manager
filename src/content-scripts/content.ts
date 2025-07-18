function injectScript(fileName: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(fileName);
  script.type = "module"; // or 'text/javascript'
  script.onload = () => script.remove(); // Clean up
  console.log(chrome.runtime.getURL(fileName), script);
  (document.head || document.documentElement).appendChild(script);
}

console.log("Trying to inject script");
injectScript("injected.js");
