"use client";
import { ResumeThemeProvider } from "./ThemeContext";

// Wraps every /resume route (product, design, ai). The App Router keeps this
// layout mounted while switching between role variants, so the selected company
// "Style" held by the provider survives the change instead of resetting.
export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <ResumeThemeProvider>{children}</ResumeThemeProvider>;
}
