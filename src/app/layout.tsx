import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Hi, I'm Kira Cheung",
  description: "Check out my work, writing, and story.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/girl.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="font-sans antialiased">{children}</body>
      <Analytics />
    </html>
  );
}
