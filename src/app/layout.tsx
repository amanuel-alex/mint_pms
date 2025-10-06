import { GeistSans, GeistMono } from "geist/font";
import React from "react";
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata = {
  title: "MinT",
  description: "Project Management System",
  icons: {
    icon: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
