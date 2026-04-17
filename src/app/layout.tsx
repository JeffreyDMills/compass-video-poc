import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compass Video Studio",
  description: "AI-Powered Listing Video Generation — Compass International Holdings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">{children}</body>
    </html>
  );
}

