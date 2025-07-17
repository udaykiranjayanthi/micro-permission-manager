import { useState } from "react";
import MicroPermissionPrompter from "./components/MicroPermissionPrompter";
import "./styles/common.scss";

const App = () => {
  // Theme toggle (for demo purposes)
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div
      className="app-container"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Permission Manager Extension</h1>
        <button className="button outlined" onClick={toggleTheme}>
          Switch to {theme === "light" ? "Dark" : "Light"} Theme
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <MicroPermissionPrompter />
      </div>
    </div>
  );
};

export default App;
