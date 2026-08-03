import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alex Mercer | Windows 11 Pro Portfolio",
  description: "An interactive portfolio website mimicking the Windows 11 Pro desktop UI, built with Next.js, Tailwind CSS, Framer Motion, and Zustand.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden select-none bg-[#0f0f12] text-white font-doodle">
        {children}
      </body>
    </html>
  );
}
