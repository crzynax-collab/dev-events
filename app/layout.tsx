import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/lightrays";
import Navbar from "@/components/navbar";

const SchibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-Schibsted-Grotesk",
  subsets: ["latin"],
});

const MartianMono = Martian_Mono({
  variable: "--font-Martian-Mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dev event",
  description: "the hub for every dev event you mustn't miss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${SchibstedGrotesk.variable} ${MartianMono.variable} min-h-screen antialiased`}
      >
<Navbar />

<div className="absolute inset-0 top-0 z-[-1] min-h-screen">
  <LightRays
    raysOrigin="top-center"
    raysColor="#00ffff"
    raysSpeed={0.5}
    lightSpread={0.8}
    rayLength={1.4}
    followMouse={true}
    mouseInfluence={0.02}
    noiseAmount={0}
    distortion={0.01}
    
  />
  </div>
  <main>
        {children}
        </main>
      </body>
    </html>
  );
}
