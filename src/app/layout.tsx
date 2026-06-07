import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormRelay",
  description: "Universal form backend for static, no-code, and AI-built websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
