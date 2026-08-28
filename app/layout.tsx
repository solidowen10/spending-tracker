import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lürúee tools | Spending Tracker",
  description: "Track your spending, set limits, stay on budget.",

  icons: {
    icon: "https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png",
    apple: "https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
