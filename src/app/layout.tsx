import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-nunito",
});

const APP_NAME = "ChomperZ";
const APP_TITLE = "ChomperZ Idle";
const APP_DESCRIPTION = "ChomperZ Web2.5 idle game — farm Z-Coins, sync NFTs, explore the map.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_TITLE,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/images/chomper.jpg", type: "image/jpeg" }],
    apple: [{ url: "/images/chomper.jpg", type: "image/jpeg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#141514",
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
