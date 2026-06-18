import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "ChomperZ Idle",
  description: "ChomperZ Web2.5 idle game",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#1a1a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
