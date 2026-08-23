"use client";

import { useState } from "react";
import { Folder, ArrowUpDown, ChevronRight, Check, Briefcase, FileCheck, Award, Key, BookOpen, GraduationCap, Layers } from "lucide-react";

export interface CategoryStat {
  id: string;
  name: string;
  slug: string;
  priority: number;
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
  total: number;
}

interface Props {
  categories: CategoryStat[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

type SortColumn = "priority" | "name" | "today" | "yesterday" | "last7Days" | "last30Days" | "total";

export default function CategorySummaryTable({
  categories,
  selectedCategory,
  onSelectCategory,
}: Props) {
  const [sortBy, setSortBy] = useState<SortColumn>("today");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(false);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "latest-jobs":
        return <Briefcase className="h-3.5 w-3.5 text-indigo-400" />;
      case "admit-card":
        return <FileCheck className="h-3.5 w-3.5 text-amber-400" />;
      case "result":
        return <Award className="h-3.5 w-3.5 text-emerald-400" />;
      case "answer-key":
        return <Key className="h-3.5 w-3.5 text-cyan-400" />;
      case "syllabus":
        return <BookOpen className="h-3.5 w-3.5 text-purple-400" />;
      case "admission":
        return <GraduationCap className="h-3.5 w-3.5 text-pink-400" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (typeof valA === "string") {
      return sortAsc
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }

    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Folder className="h-4 w-4 text-indigo-400" />
              </div>
              <span>Category Publishing Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any category row to filter real-time posts feed
            </p>
          </div>

          {selectedCategory !== "all" && (
            <button
              onClick={() => onSelectCategory("all")}
              className="text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/30 px-3 py-1 rounded-full border border-indigo-500/30 transition-colors self-start sm:self-auto"
            >
              Reset Filter (Show All)
            </button>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-950/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-900/60">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("today")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Today</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("yesterday")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Yesterday</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("last7Days")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors hidden sm:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>7 Days</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("last30Days")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>30 Days</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sortedCategories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;

                return (
                  <tr
                    key={cat.id}
                    onClick={() => onSelectCategory(isSelected ? "all" : cat.slug)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-600/20 text-white font-medium shadow-inner"
                        : "hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-md bg-slate-900 border border-white/[0.06]">
                          {getCategoryIcon(cat.slug)}
                        </div>
                        <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                          cat.today > 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-slate-500 font-normal"
                        }`}
                      >
                        {cat.today}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-300">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md ${
                          cat.yesterday > 0
                            ? "bg-cyan-500/10 text-cyan-300 font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        {cat.yesterday}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-400 hidden sm:table-cell">
                      {cat.last7Days}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-bold text-indigo-300">
                      {cat.last30Days}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div
                        className={`h-6 w-6 mx-auto rounded-lg flex items-center justify-center text-xs transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                            : "text-slate-500 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
