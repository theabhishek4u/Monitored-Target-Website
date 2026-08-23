"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";

interface DateStat {
  date: string;
  displayDate: string;
  total: number;
  categories: Record<string, number>;
}

interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  dateStats: DateStat[];
  categories: CategoryRef[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function DateTimelineView({
  dateStats,
  categories,
  selectedDate,
  onSelectDate,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const displayList = expanded ? dateStats : dateStats.slice(0, 6);
  const maxTotal = Math.max(...dateStats.map((d) => d.total), 1);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <CalendarDays className="h-4 w-4 text-cyan-400" />
              </div>
              <span>Date Publishing Timeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily publishing cadence and category breakdown
            </p>
          </div>

          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="text-[11px] font-bold text-cyan-300 hover:text-white bg-cyan-600/20 hover:bg-cyan-600/30 px-3 py-1 rounded-full border border-cyan-500/30 transition-colors self-start sm:self-auto"
            >
              Reset Date Filter
            </button>
          )}
        </div>

        {/* Timeline Table */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-950/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-900/60">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 w-32 hidden md:table-cell text-center">Volume Share</th>
                {categories.slice(0, 3).map((c) => (
                  <th key={c.slug} className="py-3 px-3 text-right hidden sm:table-cell">
                    {c.name}
                  </th>
                ))}
                <th className="py-3 px-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {displayList.map((row) => {
                const isSelected = selectedDate === row.date;
                const percentage = Math.round((row.total / maxTotal) * 100);

                return (
                  <tr
                    key={row.date}
                    onClick={() => onSelectDate(isSelected ? null : row.date)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "bg-cyan-600/20 text-white font-medium shadow-inner"
                        : "hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <td className="py-3 px-3.5 font-semibold text-slate-200 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            row.total > 0 ? "bg-cyan-400" : "bg-slate-600"
                          }`}
                        />
                        <span>{row.displayDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          row.total > 0
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : "text-slate-500 font-normal"
                        }`}
                      >
                        {row.total}
                      </span>
                    </td>
                    {/* Visual Volume Bar */}
                    <td className="py-3 px-3 hidden md:table-cell">
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.05]">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </td>
                    {categories.slice(0, 3).map((c) => (
                      <td
                        key={c.slug}
                        className="py-3 px-3 text-right text-slate-400 font-mono text-xs hidden sm:table-cell"
                      >
                        {row.categories[c.slug] || 0}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-center">
                      <button
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all ${
                          isSelected
                            ? "bg-cyan-600 border-cyan-500 text-white shadow-sm"
                            : "bg-slate-900 border-white/[0.08] text-slate-400 hover:text-white"
                        }`}
                      >
                        {isSelected ? "Active" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dateStats.length > 6 && (
        <div className="mt-3.5 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-4 py-1.5 rounded-xl transition-colors border border-white/[0.06]"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Show Less (6 Days)</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Show Full 30-Day Timeline ({dateStats.length} Days)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
