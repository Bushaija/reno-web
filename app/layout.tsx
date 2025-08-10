import type { Metadata } from "next";
import QueryProvider from "@/providers/query-provider";
import ModalProvider from "@/providers/modal-context";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RBC-Rwanda",
  description: "RBC-Rwanda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-gray-950`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
