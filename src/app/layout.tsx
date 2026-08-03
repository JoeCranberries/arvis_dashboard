import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SettingsProvider from "@/components/SettingsProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arvi's Dashboard",
  description: "Admin dashboard template — dark/light, built with Next.js + Tailwind.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <ThemeProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
