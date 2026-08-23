"use client";

import { useState } from "react";
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Globe2,
  TrendingUp,
} from "lucide-react";

interface LastScanInfo {
  id: string;
  scanType: string;
  status: string;
  formattedTime: string;
  newPosts: number;
  postsDiscovered: number;
  durationSeconds: number;
}

interface SourceInfo {
  id: string;
  name: string;
  baseUrl: string;
  homepageUrl: string;
}

interface Props {
  source: SourceInfo | null;
  lastScan: LastScanInfo | null;
  onScanCompleted: () => void;
}

export default function ScanControlBar({ source, lastScan, onScanCompleted }: Props) {
  const [isScanningToday, setIsScanningToday] = useState(false);
  const [isScanning30Days, setIsScanning30Days] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [scanStats, setScanStats] = useState<{
    newPosts?: number;
    discovered?: number;
    duration?: number;
  } | null>(null);

  const handleScanToday = async () => {
    if (isScanningToday || isScanning30Days) return;
    setIsScanningToday(true);
    setStatusMessage("Scanning today's updates from source categories with exact date verification...");
    setScanStats(null);

    try {
      const res = await fetch("/api/scan/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: source?.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Scan failed");
      }

      setStatusMessage(
        `Today's scan completed! Found ${data.result?.newPosts ?? 0} new posts.`
      );
      setScanStats({
        newPosts: data.result?.newPosts,
        discovered: data.result?.postsDiscovered,
        duration: Math.round((data.result?.durationMs || 0) / 1000),
      });
      onScanCompleted();
    } catch (err: any) {
      setStatusMessage(`Scan failed: ${err.message}`);
    } finally {
      setIsScanningToday(false);
    }
  };

  const handleScan30Days = async () => {
    if (isScanningToday || isScanning30Days) return;
    if (
      !confirm(
        "Run 30-Day Historical Scan? This will scan historical category archives and verify exact published dates."
      )
    )
      return;

    setIsScanning30Days(true);
    setStatusMessage("Running 30-day historical scan across all categories and pagination...");
    setScanStats(null);

    try {
      const res = await fetch("/api/scan/30-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: source?.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "30-day scan failed");
      }

      setStatusMessage(
        `30-day scan completed! Discovered ${data.result?.postsDiscovered || 0} posts (${
          data.result?.newPosts || 0
        } new).`
      );
      setScanStats({
        newPosts: data.result?.newPosts,
        discovered: data.result?.postsDiscovered,
        duration: Math.round((data.result?.durationMs || 0) / 1000),
      });
      onScanCompleted();
    } catch (err: any) {
      setStatusMessage(`30-day scan error: ${err.message}`);
    } finally {
      setIsScanning30Days(false);
    }
  };

  const isAnyScanning = isScanningToday || isScanning30Days;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 backdrop-blur-xl shadow-2xl">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Source Information Card */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <Globe2 className="h-6 w-6 text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monitored Source Portal
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {source ? source.name : "No Target Configured"}
              </h2>

              {source && (
                <a
                  href={source.baseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm group"
                >
                  <span className="font-mono text-[11px]">{source.baseUrl.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </a>
              )}
            </div>

            {lastScan && (
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  Last scanned:{" "}
                  <strong className="text-slate-300 font-semibold">{lastScan.formattedTime}</strong>
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3" />
                  +{lastScan.newPosts} new posts discovered
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scan Actions Button Group */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleScanToday}
            disabled={isAnyScanning}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-200 shadow-lg ${
              isScanningToday
                ? "bg-indigo-700 text-white cursor-wait opacity-90"
                : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-95"
            } disabled:opacity-50`}
          >
            <RotateCw className={`h-4 w-4 ${isScanningToday ? "animate-spin" : ""}`} />
            <span>{isScanningToday ? "Scanning Today..." : "Scan Today"}</span>
          </button>

          <button
            onClick={handleScan30Days}
            disabled={isAnyScanning}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-200 border ${
              isScanning30Days
                ? "bg-purple-950/80 border-purple-500 text-purple-200 cursor-wait"
                : "bg-slate-900 hover:bg-slate-800/90 border-white/[0.12] hover:border-purple-500/50 text-slate-200 hover:text-white shadow-md hover:scale-[1.02] active:scale-95"
            } disabled:opacity-50`}
          >
            <Sparkles
              className={`h-4 w-4 text-purple-400 ${isScanning30Days ? "animate-pulse" : ""}`}
            />
            <span>{isScanning30Days ? "Scanning 30 Days..." : "Scan Last 30 Days"}</span>
          </button>
        </div>
      </div>

      {/* Live Scanning Progress Banner */}
      {(statusMessage || isAnyScanning) && (
        <div
          className={`mt-4 px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-300 ${
            isAnyScanning
              ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-200"
              : statusMessage?.includes("failed") || statusMessage?.includes("error")
              ? "bg-rose-950/60 border-rose-500/40 text-rose-200"
              : "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isAnyScanning ? (
              <RotateCw className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
            ) : statusMessage?.includes("failed") ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-medium">{statusMessage}</span>
          </div>

          {scanStats && (
            <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
              <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                Discovered: <strong>{scanStats.discovered}</strong>
              </span>
              <span className="bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                New: +{scanStats.newPosts}
              </span>
              <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                Duration: <strong>{scanStats.duration}s</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
