import "./globals.css";
import "./fonts.css";
import { Inter, Inter_Tight } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} ${interTight.variable}`}>
        {children}
      </body>
    </html>
  );
}
