import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getTodayBounds,
  getYesterdayBounds,
  getLastNDaysBounds,
  formatDateInTimezone,
} from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = getTodayBounds();
    const yesterday = getYesterdayBounds();
    const last7Days = getLastNDaysBounds(7);
    const last30Days = getLastNDaysBounds(30);

    // Fetch active source
    const source = await prisma.source.findFirst({
      where: { enabled: true },
      include: {
        categories: {
          where: { enabled: true },
          orderBy: { priority: "asc" },
        },
      },
    });

    if (!source) {
      return NextResponse.json({
        hasSource: false,
        summary: {
          todayCount: 0,
          yesterdayCount: 0,
          last7DaysCount: 0,
          last30DaysCount: 0,
        },
        categories: [],
        lastScan: null,
      });
    }

    // 1. Total counts based on publishedAt
    const [todayCount, yesterdayCount, last7DaysCount, last30DaysCount, totalPostsCount] =
      await Promise.all([
        prisma.post.count({
          where: {
            sourceId: source.id,
            publishedAt: { gte: today.start, lte: today.end },
          },
        }),
        prisma.post.count({
          where: {
            sourceId: source.id,
            publishedAt: { gte: yesterday.start, lte: yesterday.end },
          },
        }),
        prisma.post.count({
          where: {
            sourceId: source.id,
            publishedAt: { gte: last7Days.start, lte: last7Days.end },
          },
        }),
        prisma.post.count({
          where: {
            sourceId: source.id,
            publishedAt: { gte: last30Days.start, lte: last30Days.end },
          },
        }),
        prisma.post.count({
          where: { sourceId: source.id },
        }),
      ]);

    // 2. Category-wise breakdown (Today vs 30 Days)
    const categoryStats = await Promise.all(
      source.categories.map(async (cat) => {
        const [catToday, catYesterday, cat7Days, cat30Days, catTotal] = await Promise.all([
          prisma.post.count({
            where: {
              categoryId: cat.id,
              publishedAt: { gte: today.start, lte: today.end },
            },
          }),
          prisma.post.count({
            where: {
              categoryId: cat.id,
              publishedAt: { gte: yesterday.start, lte: yesterday.end },
            },
          }),
          prisma.post.count({
            where: {
              categoryId: cat.id,
              publishedAt: { gte: last7Days.start, lte: last7Days.end },
            },
          }),
          prisma.post.count({
            where: {
              categoryId: cat.id,
              publishedAt: { gte: last30Days.start, lte: last30Days.end },
            },
          }),
          prisma.post.count({
            where: { categoryId: cat.id },
          }),
        ]);

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          priority: cat.priority,
          today: catToday,
          yesterday: catYesterday,
          last7Days: cat7Days,
          last30Days: cat30Days,
          total: catTotal,
        };
      })
    );

    // 3. Last Scan Run
    const lastScan = await prisma.scanRun.findFirst({
      where: { sourceId: source.id },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({
      hasSource: true,
      source: {
        id: source.id,
        name: source.name,
        baseUrl: source.baseUrl,
        homepageUrl: source.homepageUrl,
      },
      summary: {
        todayCount,
        yesterdayCount,
        last7DaysCount,
        last30DaysCount,
        totalPostsCount,
        todayFormatted: today.displayDate,
        yesterdayFormatted: yesterday.displayDate,
      },
      categories: categoryStats,
      lastScan: lastScan
        ? {
            id: lastScan.id,
            scanType: lastScan.scanType,
            status: lastScan.status,
            startedAt: lastScan.startedAt,
            completedAt: lastScan.completedAt,
            formattedTime: formatDateInTimezone(lastScan.startedAt),
            newPosts: lastScan.newPosts,
            postsDiscovered: lastScan.postsDiscovered,
            durationSeconds: Math.round(lastScan.durationMs / 1000),
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
