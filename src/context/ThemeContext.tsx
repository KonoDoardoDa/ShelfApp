import React, { useEffect, useState } from "react";
import { ThemeContext, type Theme } from "./theme-context";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("shelfapp-theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    // Verificar preferência do sistema operacional
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  });

  useEffect(() => {
    // Aplicar no elemento <html>
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    // Aplicar também no <body> para garantir herança total
    document.body.setAttribute("data-theme", theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);

    localStorage.setItem("shelfapp-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
