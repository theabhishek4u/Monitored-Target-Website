import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getLastNDaysBounds,
  DEFAULT_TIMEZONE,
} from "@/lib/timezone";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const source = await prisma.source.findFirst({
      where: { enabled: true },
      include: {
        categories: { where: { enabled: true }, orderBy: { priority: "asc" } },
      },
    });

    if (!source) {
      return NextResponse.json({ dates: [], categories: [] });
    }

    const zonedNow = toZonedTime(new Date(), DEFAULT_TIMEZONE);
    const dateStats = [];

    // Query daily counts
    for (let i = 0; i < days; i++) {
      const targetDayZoned = subDays(zonedNow, i);
      const dayStart = fromZonedTime(startOfDay(targetDayZoned), DEFAULT_TIMEZONE);
      const dayEnd = fromZonedTime(endOfDay(targetDayZoned), DEFAULT_TIMEZONE);
      const dateKey = format(targetDayZoned, "yyyy-MM-dd");
      const displayDate = format(targetDayZoned, "dd MMM yyyy");

      const posts = await prisma.post.findMany({
        where: {
          sourceId: source.id,
          publishedAt: { gte: dayStart, lte: dayEnd },
        },
        select: { categoryId: true },
      });

      const total = posts.length;
      const categoryCounts: Record<string, number> = {};

      for (const cat of source.categories) {
        categoryCounts[cat.slug] = 0;
      }

      for (const post of posts) {
        const cat = source.categories.find((c) => c.id === post.categoryId);
        if (cat) {
          categoryCounts[cat.slug] = (categoryCounts[cat.slug] || 0) + 1;
        }
      }

      dateStats.push({
        date: dateKey,
        displayDate,
        total,
        categories: categoryCounts,
      });
    }

    return NextResponse.json({
      dates: dateStats,
      categories: source.categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
