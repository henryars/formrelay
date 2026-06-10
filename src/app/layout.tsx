import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FormRelay",
  description: "Universal form backend for static, no-code, and AI-built websites.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full scroll-smooth antialiased ${plusJakartaSans.variable}`}>
      <body className="min-h-full" style={{ fontFamily: "var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
