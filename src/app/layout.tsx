import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
