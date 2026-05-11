import type { Metadata } from "next";
import "./globals.css";
import AuthInit from "@/components/AuthInit";

export const metadata: Metadata = {
  title: "BuildTrack AI",
  description: "AI-Powered Construction Management Platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-mesh fade-grid">
        <AuthInit />
        {children}
      </body>
    </html>
  );
}
