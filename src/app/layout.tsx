import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gov Content Tracker | Intelligence Dashboard",
  description:
    "Internal research, monitoring, and content intelligence dashboard for government job and result portals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
            Gov Content Tracker · Content Intelligence & Editorial Research System
          </footer>
        </div>
      </body>
    </html>
  );
}
