import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument", // This creates a CSS variable
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta", // This creates a CSS variable
});

export const metadata: Metadata = {
  title: "EduBridge AI",
  description: "AI-powered study abroad advisor for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
