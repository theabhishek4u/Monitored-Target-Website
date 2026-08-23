"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ExternalLink,
  Download,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";

export interface PostItem {
  id: string;
  index: number;
  title: string;
  sourceUrl: string;
  category: string;
  categorySlug: string;
  publishedAt: string;
  publishedDateFormatted: string;
  detectedAt: string;
  detectedDateFormatted: string;
  dateSource: string;
  dateConfidence: string;
  isNew: boolean;
  sourceName: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  activeCategoryFilter: string;
  activeDatePreset: string;
  activeDateFilter: string | null;
  categories: CategoryOption[];
  onCategoryChange: (slug: string) => void;
  onDatePresetChange: (preset: string) => void;
}

export default function PostListTable({
  activeCategoryFilter,
  activeDatePreset,
  activeDateFilter,
  categories,
  onCategoryChange,
  onDatePresetChange,
}: Props) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [newOnly, setNewOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (activeCategoryFilter && activeCategoryFilter !== "all") {
        params.set("category", activeCategoryFilter);
      }
      if (newOnly) params.set("newOnly", "true");

      if (activeDateFilter) {
        params.set("startDate", `${activeDateFilter}T00:00:00.000Z`);
        params.set("endDate", `${activeDateFilter}T23:59:59.999Z`);
      } else if (activeDatePreset && activeDatePreset !== "all") {
        params.set("dateRange", activeDatePreset);
      }

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.posts) {
        setPosts(data.posts);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    page,
    limit,
    debouncedSearch,
    activeCategoryFilter,
    activeDatePreset,
    activeDateFilter,
    newOnly,
    sort,
  ]);

  const handleExport = (format: "csv" | "json") => {
    const params = new URLSearchParams({ format });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (activeCategoryFilter && activeCategoryFilter !== "all") {
      params.set("category", activeCategoryFilter);
    }
    if (activeDatePreset && activeDatePreset !== "all") {
      params.set("dateRange", activeDatePreset);
    }

    window.open(`/api/export?${params.toString()}`, "_blank");
  };

  const getCategoryBadgeClass = (slug: string) => {
    switch (slug) {
      case "latest-jobs":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "admit-card":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "result":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "answer-key":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "syllabus":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "admission":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header with Title & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Discovered Post Intelligence</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-white/[0.08]">
                {totalCount.toLocaleString()} Posts
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verified feed of discovered posts, published dates, and original source pages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/[0.08] hover:border-white/[0.15] text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/[0.08] hover:border-white/[0.15] text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <FileJson className="h-3.5 w-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Modern Filter Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, exam, or keyword..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <select
            value={activeCategoryFilter}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950/70 border border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Preset Dropdown */}
        <div>
          <select
            value={activeDatePreset}
            onChange={(e) => {
              onDatePresetChange(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950/70 border border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Published Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Sort & NEW Only Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-3 py-2 bg-slate-950/70 border border-white/[0.08] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="detected_desc">Recently Detected</option>
            <option value="title_asc">Title A-Z</option>
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-300 select-none bg-slate-950/70 px-3 py-2 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-colors">
            <input
              type="checkbox"
              checked={newOnly}
              onChange={(e) => {
                setNewOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded bg-slate-900 border-white/[0.1] text-emerald-500 focus:ring-0"
            />
            <span className="text-[11px] uppercase tracking-wider">NEW</span>
          </label>
        </div>
      </div>

      {/* Discovered Posts Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-950/40">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-900/60">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-4">Post Title</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Published Date</th>
              <th className="py-3 px-3 hidden lg:table-cell">Detected At</th>
              <th className="py-3 px-3 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                    <span className="text-xs font-medium text-slate-300">Loading intelligence feed...</span>
                  </div>
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <p className="text-base font-bold text-slate-300">No Posts Match Filter</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try clearing or adjusting your search keywords, category, or date range.
                  </p>
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-3 text-center text-xs font-mono text-slate-500 font-medium">
                    {post.index}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      {post.isNew && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse-subtle">
                          <Sparkles className="h-2.5 w-2.5" />
                          NEW
                        </span>
                      )}
                      <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug text-xs sm:text-sm">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getCategoryBadgeClass(
                        post.categorySlug
                      )}`}
                    >
                      {post.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-200 text-xs font-mono font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{post.publishedDateFormatted}</span>
                      {post.dateConfidence === "high" && (
                        <span
                          title="Verified exact date"
                          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs font-mono hidden lg:table-cell whitespace-nowrap">
                    {post.detectedDateFormatted}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all shadow-sm"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(1);
            }}
            className="bg-slate-950/80 border border-white/[0.08] rounded-lg px-2.5 py-1 text-slate-300 font-mono text-xs focus:outline-none"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2 font-mono">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/[0.08] hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/[0.08] hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
