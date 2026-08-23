"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Settings,
  History,
  Radio,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [healthStatus, setHealthStatus] = useState<string>("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus(data.status || "healthy");
      })
      .catch(() => setHealthStatus("degraded"));
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "Scan Logs", href: "/logs", icon: History },
    { name: "Source Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080c14]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3.5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <div className="h-full w-full bg-[#0b101e] rounded-[11px] flex items-center justify-center">
                  <Zap className="h-4 w-4 text-indigo-400 fill-indigo-400/20 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                    Gov Content Tracker
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                    Pro
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Content Intelligence & Publishing Monitor
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* System Status Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08] text-xs">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  healthStatus === "healthy" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  healthStatus === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="text-slate-400 font-medium">System:</span>
            <span
              className={`font-semibold capitalize ${
                healthStatus === "healthy" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {healthStatus}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
