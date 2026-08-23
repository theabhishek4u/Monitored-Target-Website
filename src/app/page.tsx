"use client";

import { useEffect, useState } from "react";
import SummaryCards from "@/components/SummaryCards";
import ScanControlBar from "@/components/ScanControlBar";
import CategorySummaryTable, { CategoryStat } from "@/components/CategorySummaryTable";
import DateTimelineView from "@/components/DateTimelineView";
import PostListTable from "@/components/PostListTable";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [dateStats, setDateStats] = useState<any[]>([]);

  // Filter States
  const [activeDatePreset, setActiveDatePreset] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch Dashboard Summary & Stats
  const loadDashboard = async () => {
    try {
      const [summaryRes, statsRes] = await Promise.all([
        fetch("/api/dashboard/summary"),
        fetch("/api/dashboard/stats?days=30"),
      ]);

      const summaryJson = await summaryRes.json();
      const statsJson = await statsRes.json();

      setSummaryData(summaryJson);
      setDateStats(statsJson.dates || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Handle Quick Filter clicks from summary cards
  const handleSummaryFilterSelect = (filterId: string) => {
    setActiveDatePreset(filterId);
    setSelectedDate(null);
  };

  // Handle Date timeline click
  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    if (date) {
      setActiveDatePreset("all");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Scan Control Header */}
      <ScanControlBar
        source={summaryData?.source || null}
        lastScan={summaryData?.lastScan || null}
        onScanCompleted={loadDashboard}
      />

      {/* Summary Stat Cards */}
      <SummaryCards
        summary={
          summaryData?.summary || {
            todayCount: 0,
            yesterdayCount: 0,
            last7DaysCount: 0,
            last30DaysCount: 0,
            totalPostsCount: 0,
          }
        }
        activeFilter={activeDatePreset}
        onSelectFilter={handleSummaryFilterSelect}
      />

      {/* Two Column Layout: Category Breakdown & Date Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySummaryTable
          categories={summaryData?.categories || []}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <DateTimelineView
          dateStats={dateStats}
          categories={summaryData?.categories || []}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      </div>

      {/* Discovered Post Intelligence Feed */}
      <PostListTable
        activeCategoryFilter={selectedCategory}
        activeDatePreset={activeDatePreset}
        activeDateFilter={selectedDate}
        categories={summaryData?.categories || []}
        onCategoryChange={setSelectedCategory}
        onDatePresetChange={(preset) => {
          setActiveDatePreset(preset);
          setSelectedDate(null);
        }}
      />
    </div>
  );
}
