import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/theme-provider"
import ConnectManager from "@/components/ConnectManager"
import MatchmakingProvider from "@/components/MatchmakingProvider"
import GameStateRestoration from "@/components/GameStateRestoration"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tac2oe",
  description: "Creating TIC TAC TOE with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh h-dvh`}
      >
        <ConnectManager />
        <GameStateRestoration />
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
                <MatchmakingProvider>
                    {children}
                </MatchmakingProvider>
            </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
