import { useEffect, useState } from "react";

const ThemeToggle: React.FC = () => {
  // Theme toggle (for demo purposes)
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <button className="button outlined" onClick={toggleTheme}>
      {theme === "light" ? "🌑" : "🌕"}
    </button>
  );
};

export default ThemeToggle;
