"use client";

import { useEffect, useState } from "react";
import { History, RefreshCw, CheckCircle, AlertTriangle, Clock, AlertCircle } from "lucide-react";

interface ScanRun {
  id: string;
  sourceName: string;
  scanType: string;
  status: string;
  formattedStartedAt: string;
  categoriesScanned: number;
  pagesScanned: number;
  postsDiscovered: number;
  newPosts: number;
  existingPosts: number;
  failedPosts: number;
  errorCount: number;
  durationSeconds: number;
  errorSummary?: string;
  recentErrors?: Array<{
    id: string;
    url: string;
    errorType: string;
    errorMessage: string;
  }>;
}

export default function LogsPage() {
  const [scans, setScans] = useState<ScanRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scans?limit=25");
      const data = await res.json();
      if (res.ok) {
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error("Failed to fetch scan logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="h-6 w-6 text-indigo-400" />
            Scan Run History & Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit trail of automated and manual scraping runs, discovery metrics, and error logs
          </p>
        </div>

        <button
          onClick={fetchScans}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Scans List */}
      <div className="space-y-4">
        {loading && scans.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-400 mb-2" />
            <span>Loading scan logs...</span>
          </div>
        ) : scans.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Clock className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No Scan Runs Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;SCAN TODAY&quot; or &quot;SCAN LAST 30 DAYS&quot; on the dashboard to trigger your first scan.
            </p>
          </div>
        ) : (
          scans.map((scan) => (
            <div
              key={scan.id}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      scan.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : scan.status === "running"
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {scan.status === "completed" ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : scan.status === "running" ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5" />
                    )}
                    {scan.status}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    Scan Type:{" "}
                    <span className="capitalize text-indigo-400 font-bold">
                      {scan.scanType.replace("_", " ")}
                    </span>
                  </span>

                  <span className="text-xs text-slate-400">· {scan.sourceName}</span>
                </div>

                <div className="text-xs text-slate-400">
                  <span>Started: {scan.formattedStartedAt}</span>
                  {" · "}
                  <span>Duration: {scan.durationSeconds}s</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 my-3 text-xs">
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">Categories</span>
                  <span className="font-bold text-slate-200 text-sm">{scan.categoriesScanned}</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">Pages Scanned</span>
                  <span className="font-bold text-slate-200 text-sm">{scan.pagesScanned}</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">Discovered</span>
                  <span className="font-bold text-slate-200 text-sm">{scan.postsDiscovered}</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">New Posts</span>
                  <span className="font-bold text-emerald-400 text-sm">+{scan.newPosts}</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">Existing</span>
                  <span className="font-bold text-slate-300 text-sm">{scan.existingPosts}</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block">Errors</span>
                  <span
                    className={`font-bold text-sm ${
                      scan.errorCount > 0 ? "text-rose-400" : "text-slate-400"
                    }`}
                  >
                    {scan.errorCount}
                  </span>
                </div>
              </div>

              {/* Error messages if any */}
              {scan.recentErrors && scan.recentErrors.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs">
                  <span className="font-bold text-rose-300 block mb-1">Recent Errors:</span>
                  <ul className="space-y-1 text-rose-200/90 font-mono text-[11px]">
                    {scan.recentErrors.map((err) => (
                      <li key={err.id} className="truncate">
                        [{err.errorType}] {err.errorMessage} - {err.url}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
