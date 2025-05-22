'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import './fonts.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use a ref to track mounted state to avoid re-renders
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted state after component mounts
    setMounted(true);
    
    // Remove any extension-added classes from body
    const body = document.querySelector('body');
    if (body) {
      // Store the original class name
      const originalClassName = body.className;
      // Filter out any classes that might be added by extensions
      const cleanClassName = originalClassName
        .split(' ')
        .filter(cls => !cls.includes('vsc-') && cls !== '')
        .join(' ');
      
      // Only update if there's a difference to avoid unnecessary re-renders
      if (originalClassName !== cleanClassName) {
        body.className = cleanClassName;
      }
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      {/* Use suppressHydrationWarning on body as well */}
      <body suppressHydrationWarning className={mounted ? '' : 'preload'}>
        {children}
      </body>
    </html>
  )
}
