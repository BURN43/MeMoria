// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Your App Title</title>
      </head>
      <body>
        {children}
        <Analytics /> {/* Integrates Vercel Analytics */}
      </body>
    </html>
  );
}
