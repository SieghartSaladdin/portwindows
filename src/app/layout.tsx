import type { Metadata, Viewport } from "next";
import { Architects_Daughter, Caveat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const architects = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-architects",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteTitle = "Aura OS | Interactive Doodle Portfolio";
const siteDescription =
  "An interactive, hand-drawn desktop OS portfolio. Browse projects, experience and skills, run terminal commands, and chat with the built-in AI companion.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Aura OS",
  },
  description: siteDescription,
  applicationName: "Aura OS",
  keywords: ["portfolio", "developer", "frontend", "Next.js", "React", "interactive desktop"],
  openGraph: {
    type: "website",
    url: "/",
    title: siteTitle,
    description: siteDescription,
    siteName: "Aura OS",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fefce8" },
    { media: "(prefers-color-scheme: dark)", color: "#181716" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-wallpaper="default"
      suppressHydrationWarning
      className={`${architects.variable} ${caveat.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased overflow-hidden bg-paper text-fg font-doodle">
        {children}
      </body>
    </html>
  );
}
