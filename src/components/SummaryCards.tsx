"use client";

import { Calendar, TrendingUp, Clock, Archive, Sparkles } from "lucide-react";

interface SummaryData {
  todayCount: number;
  yesterdayCount: number;
  last7DaysCount: number;
  last30DaysCount: number;
  totalPostsCount: number;
  todayFormatted?: string;
  yesterdayFormatted?: string;
}

interface Props {
  summary: SummaryData;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function SummaryCards({ summary, activeFilter, onSelectFilter }: Props) {
  const cards = [
    {
      id: "today",
      title: "TODAY",
      subtitle: summary.todayFormatted || "Published Today",
      count: summary.todayCount,
      icon: Clock,
      gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
      accentBg: "bg-indigo-500",
      accentText: "text-indigo-400",
      borderGlow: "border-indigo-500/40 shadow-indigo-500/10",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      id: "yesterday",
      title: "YESTERDAY",
      subtitle: summary.yesterdayFormatted || "Published Yesterday",
      count: summary.yesterdayCount,
      icon: Calendar,
      gradient: "from-cyan-500/20 via-teal-500/10 to-transparent",
      accentBg: "bg-cyan-500",
      accentText: "text-cyan-400",
      borderGlow: "border-cyan-500/40 shadow-cyan-500/10",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "7days",
      title: "LAST 7 DAYS",
      subtitle: "Weekly Publishing Cadence",
      count: summary.last7DaysCount,
      icon: TrendingUp,
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
      accentBg: "bg-emerald-500",
      accentText: "text-emerald-400",
      borderGlow: "border-emerald-500/40 shadow-emerald-500/10",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "30days",
      title: "LAST 30 DAYS",
      subtitle: "Total Monthly Volume",
      count: summary.last30DaysCount,
      icon: Archive,
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      accentBg: "bg-purple-500",
      accentText: "text-purple-400",
      borderGlow: "border-purple-500/40 shadow-purple-500/10",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(isSelected ? "all" : card.id)}
            className={`text-left relative overflow-hidden rounded-2xl p-5 border backdrop-blur-xl transition-all duration-200 group ${
              isSelected
                ? `bg-slate-800/90 ${card.borderGlow} shadow-xl scale-[1.02] ring-1 ring-white/[0.15]`
                : "bg-slate-900/60 border-white/[0.07] hover:border-white/[0.15] hover:bg-slate-800/60 hover:-translate-y-0.5"
            }`}
          >
            {/* Ambient Radial Glow */}
            <div
              className={`absolute top-0 right-0 -mr-10 -mt-10 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${card.accentBg}`}
            />

            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
                {card.title}
              </span>
              <div
                className={`p-2.5 rounded-xl border ${card.iconBg} shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white group-hover:text-slate-100 font-mono">
                {card.count.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Posts
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 truncate">
                {card.subtitle}
              </span>

              {isSelected && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Active
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
