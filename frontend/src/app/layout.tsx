import type { Metadata } from "next";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodScale FAQ Navigator",
  description: "Banking-style FAQ navigation widget for MoodScale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
