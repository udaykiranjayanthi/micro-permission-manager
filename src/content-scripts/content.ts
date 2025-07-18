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
  (document.head || document.documentElement).appendChild(link);
}

injectStyle("./assets/global.css");
injectScript("injected.js");
