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
  title: "Chomperz Basecamp",
  description: "Chomperz Web2.5 idle game prototype",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
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
