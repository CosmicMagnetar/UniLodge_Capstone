import type { Metadata } from "next";
import "./globals.css";
import RootLayoutContent from "@/components/RootLayoutContent";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "UniLodge - AI Booking",
  description: "Campus accommodation with AI assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </ToastProvider>
      </body>
    </html>
  );
}
