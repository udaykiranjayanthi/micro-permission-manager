import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function Dialog() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

export function showModal() {
  // Prevent duplicates
  if (document.getElementById("__react-modal-root__")) return;

  const container = document.createElement("div");
  container.id = "__react-modal-root__";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<Dialog />);
}
