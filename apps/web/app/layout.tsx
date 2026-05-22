import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/client-components/store-provider";
import { SessionProvider } from "@/components/session-provider";
import { ToastProvider } from "@/components/toast/toast-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Fraunces — used sparingly for editorial hero moments (italic display).
// Variable font: omit `weight` so all weights are available via font-weight CSS,
// and enable the SOFT + opsz axes for editorial character on italics.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "CanvUs — Collaborative Canvas",
  description: "Real-time collaborative canvas for teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${fraunces.variable} antialiased`}
      >
        <ToastProvider>
          <SessionProvider>
            <StoreProvider>
              {children}
            </StoreProvider>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
