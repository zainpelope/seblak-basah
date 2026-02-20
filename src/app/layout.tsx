import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Seblak Smart — Manajemen Keuangan",
  description: "Sistem manajemen keuangan untuk Seblak Basah & Seblak Kering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
