"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

/* ============================================================
   THEME REGISTRY — add a new company style here + a CSS block in resume.css
   ============================================================ */
export const THEMES = [
  { id: "claude", label: "Claude" },
  { id: "notion", label: "Notion" },
  { id: "openai", label: "OpenAI" },
  { id: "wispr", label: "Wispr" },
  { id: "netflix", label: "Netflix" },
  { id: "plain", label: "Plain" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

type ResumeThemeCtx = { theme: ThemeId; setTheme: (t: ThemeId) => void };

const ResumeThemeContext = createContext<ResumeThemeCtx | null>(null);

export function useResumeTheme(): ResumeThemeCtx {
  const ctx = useContext(ResumeThemeContext);
  if (!ctx) {
    throw new Error("useResumeTheme must be used within a ResumeThemeProvider");
  }
  return ctx;
}

/**
 * Owns the selected company "Style" for the whole /resume section.
 *
 * This provider lives in resume/layout.tsx, which the App Router keeps mounted
 * while navigating between the role variants (/resume, /resume/design,
 * /resume/ai). Because the layout never unmounts on those switches, the chosen
 * style persists with no reset or flash when the role changes.
 */
export function ResumeThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>("claude");
  // Embedded previews (?embed=1) share this origin's localStorage, so they must
  // not read or write the visitor's saved style — they just honor ?theme=.
  const embedRef = useRef(false);

  // Load the saved (or ?theme=) style once, and mark <html> for resume styling.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    embedRef.current = params.get("embed") === "1";
    let saved: ThemeId = "claude";
    // A ?theme= override (used by the server-side PDF render and embeds) wins
    // over the persisted choice so the render matches the picked style.
    const urlTheme = params.get("theme");
    if (urlTheme && THEMES.some((t) => t.id === urlTheme)) {
      saved = urlTheme as ThemeId;
    } else if (!embedRef.current) {
      try {
        const stored = localStorage.getItem("resume-theme");
        if (stored && THEMES.some((t) => t.id === stored)) saved = stored as ThemeId;
      } catch {
        /* localStorage unavailable */
      }
    }
    setTheme(saved);
    document.documentElement.setAttribute("data-resume", "");
    return () => {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-resume");
    };
  }, []);

  // Reflect the active style on <html>, and persist it (unless embedded).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (embedRef.current) return;
    try {
      localStorage.setItem("resume-theme", theme);
    } catch {
      /* localStorage unavailable */
    }
  }, [theme]);

  return (
    <ResumeThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ResumeThemeContext.Provider>
  );
}
