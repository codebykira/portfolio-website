'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import './fonts.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={!mounted ? 'preload' : ''}>
        {children}
      </body>
    </html>
  )
}
