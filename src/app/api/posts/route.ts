import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getTodayBounds,
  getYesterdayBounds,
  getLastNDaysBounds,
  formatDateInTimezone,
  formatOnlyDate,
} from "@/lib/timezone";
import { parseISO, isValid } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const dateRange = searchParams.get("dateRange") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const newOnly = searchParams.get("newOnly") === "true";
    const sort = searchParams.get("sort") || "newest";

    const whereClause: any = { isActive: true };

    // Search query
    if (search) {
      whereClause.title = { contains: search };
    }

    // Category filter
    if (category && category !== "all") {
      whereClause.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    // New only filter
    if (newOnly) {
      whereClause.isNew = true;
    }

    // Date range filtering
    if (dateRange === "today") {
      const today = getTodayBounds();
      whereClause.publishedAt = { gte: today.start, lte: today.end };
    } else if (dateRange === "yesterday") {
      const yesterday = getYesterdayBounds();
      whereClause.publishedAt = { gte: yesterday.start, lte: yesterday.end };
    } else if (dateRange === "7days") {
      const last7 = getLastNDaysBounds(7);
      whereClause.publishedAt = { gte: last7.start, lte: last7.end };
    } else if (dateRange === "30days") {
      const last30 = getLastNDaysBounds(30);
      whereClause.publishedAt = { gte: last30.start, lte: last30.end };
    } else if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      if (isValid(start) && isValid(end)) {
        whereClause.publishedAt = { gte: start, lte: end };
      }
    }

    // Sorting
    let orderBy: any = { publishedAt: "desc" };
    if (sort === "oldest") {
      orderBy = { publishedAt: "asc" };
    } else if (sort === "detected_desc") {
      orderBy = { detectedAt: "desc" };
    } else if (sort === "title_asc") {
      orderBy = { title: "asc" };
    }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where: whereClause }),
      prisma.post.findMany({
        where: whereClause,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          source: { select: { id: true, name: true, baseUrl: true } },
        },
      }),
    ]);

    const formattedPosts = posts.map((p, idx) => ({
      id: p.id,
      index: (page - 1) * limit + idx + 1,
      title: p.title,
      sourceUrl: p.sourceUrl,
      category: p.category.name,
      categorySlug: p.category.slug,
      publishedAt: p.publishedAt,
      publishedDateFormatted: formatOnlyDate(p.publishedAt),
      detectedAt: p.detectedAt,
      detectedDateFormatted: formatDateInTimezone(p.detectedAt),
      dateSource: p.dateSource,
      dateConfidence: p.dateConfidence,
      isNew: p.isNew,
      sourceName: p.source.name,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
