import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lürú | spending tracker",
  description: "Track your spending, set limits, stay on budget.",

  icons: {
    icon: "https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png",
    apple: "https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — loaded via <link> so the build doesn't need network access */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
