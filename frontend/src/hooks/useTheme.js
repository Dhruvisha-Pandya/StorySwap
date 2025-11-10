import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to manage theme state across all pages
 * Ensures theme persists across navigation
 * The HTML data-theme attribute (set by index.js) is the source of truth
 */
export function useTheme() {
  // Read theme directly from HTML attribute (set by index.js before React renders)
  // This ensures we always have the correct theme, even on navigation
  const readTheme = useCallback(() => {
    if (typeof document === "undefined") return "light";
    const htmlTheme = document.documentElement.getAttribute("data-theme");
    if (htmlTheme === "dark" || htmlTheme === "light") {
      return htmlTheme;
    }
    // Fallback: check localStorage
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      document.documentElement.setAttribute("data-theme", storedTheme);
      return storedTheme;
    }
    // Default
    const defaultTheme = "light";
    document.documentElement.setAttribute("data-theme", defaultTheme);
    localStorage.setItem("theme", defaultTheme);
    return defaultTheme;
  }, []);

  // Initialize state from HTML attribute
  const [theme, setTheme] = useState(readTheme);

  // Sync state with HTML attribute on mount
  useEffect(() => {
    // Always sync on mount to ensure we have the latest theme
    const currentTheme = readTheme();
    setTheme(currentTheme);
  }, [readTheme]);

  // Listen for theme changes from other components/tabs
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail && e.detail.theme) {
        const newTheme = e.detail.theme;
        setTheme(newTheme);
        // HTML attribute should already be set by the component that changed it
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue;
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };

    window.addEventListener("themeChange", handleThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const currentTheme = readTheme();
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    // Update HTML attribute (source of truth for CSS)
    document.documentElement.setAttribute("data-theme", newTheme);
    // Update localStorage (for persistence)
    localStorage.setItem("theme", newTheme);
    // Update state
    setTheme(newTheme);
    // Dispatch event for other components in the same tab
    window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme: newTheme } }));
  }, [readTheme]);

  return [theme, toggleTheme];
}
