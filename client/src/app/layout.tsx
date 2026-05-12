import type { Metadata } from "next";
import "./globals.css";
import AuthInit from "@/components/AuthInit";

export const metadata: Metadata = {
  title: "BuildTrack AI | Enterprise Construction Intelligence",
  description: "AI-powered construction management for global teams, real-time delivery control, and executive operations."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-mesh fade-grid antialiased">
        <AuthInit />
        {children}
      </body>
    </html>
  );
}
