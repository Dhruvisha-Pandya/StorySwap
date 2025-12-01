import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  // Read + normalize theme (may set defaults)
  const readTheme = useCallback(() => {
    if (typeof document === "undefined") return "light";

    const html = document.documentElement;
    const attrTheme = html.getAttribute("data-theme");

    // 1. Check HTML attribute
    if (attrTheme === "light" || attrTheme === "dark") {
      return attrTheme;
    }

    // 2. Check localStorage
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      html.setAttribute("data-theme", stored);
      return stored;
    }

    // 3. Default → light
    const defaultTheme = "light";
    html.setAttribute("data-theme", defaultTheme);
    localStorage.setItem("theme", defaultTheme);

    return defaultTheme;
  }, []);

  // Initialize properly (function form avoids storing the function)
  const [theme, setTheme] = useState(() => readTheme());

  // Sync theme on mount
  useEffect(() => {
    const current = readTheme();
    setTheme(current);
  }, [readTheme]);

  // Sync theme across tabs & custom themeChange event
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail?.theme) {
        const newTheme = e.detail.theme;
        setTheme(newTheme);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue;
        document.documentElement.setAttribute("data-theme", newTheme);
        setTheme(newTheme);
      }
    };

    window.addEventListener("themeChange", handleThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const current = readTheme();
    const newTheme = current === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);

    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { theme: newTheme } })
    );
  }, [readTheme]);

  return [theme, toggleTheme];
}
