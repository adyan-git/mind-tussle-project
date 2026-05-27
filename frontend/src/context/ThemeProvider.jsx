import React, { useEffect } from "react";
import { ThemeContext } from "./ThemeContextProvider";

/** Applies the single premium dark theme — no user switching. */
export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", "premium");
        localStorage.removeItem("activeCustomTheme");
        localStorage.removeItem("customThemeId");
        root.removeAttribute("style");
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: "premium", changeTheme: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
};
