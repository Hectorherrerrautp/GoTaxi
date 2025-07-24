import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gotaxi",
  description: "vive la experiencia de viajar con GoTaxi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* MapLibre GL JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js"
          strategy="beforeInteractive"
        />
        {/* MapLibre Geocoder */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@maplibre/maplibre-gl-geocoder@1.7.0/dist/maplibre-gl-geocoder.js"
          strategy="beforeInteractive"
        />
        {/* AWS Location UMD helpers */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@aws/amazon-location-utilities-auth-helper@1"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@aws/amazon-location-client@1.2"
          strategy="beforeInteractive"
        />
        {/* AWS utils.js for GeoPlaces global */}
        <Script
          src="/utils.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
