import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function Popup() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
