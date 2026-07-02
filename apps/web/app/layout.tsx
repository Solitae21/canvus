import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/client-components/store-provider";
import { SessionProvider } from "@/components/session-provider";
import { ToastProvider } from "@/components/toast/toast-provider";
import { ReduxToastBridge } from "@/redux/client-components/redux-toast-bridge";

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
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ToastProvider>
          <SessionProvider>
            <StoreProvider>
              <ReduxToastBridge />
              {children}
            </StoreProvider>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
