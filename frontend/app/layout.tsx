// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        <Analytics />      {/* Integrates Vercel Analytics */}
        <SpeedInsights />  {/* Integrates Vercel Speed Insights */}
      </body>
    </html>
  );
}
