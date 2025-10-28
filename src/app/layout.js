// layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/cursor.css";
import "../styles/scrollbar.css";

import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "2LYP Computations",
  description: "made by @siddhumanoj1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Identity Services script for Google login */}
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
