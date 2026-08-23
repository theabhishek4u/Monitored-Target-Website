import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getTodayBounds,
  getYesterdayBounds,
  getLastNDaysBounds,
  formatOnlyDate,
  formatDateInTimezone,
} from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const formatType = searchParams.get("format") || "csv";
    const category = searchParams.get("category");
    const dateRange = searchParams.get("dateRange") || "all";
    const search = searchParams.get("search")?.trim();

    const whereClause: any = { isActive: true };

    if (search) {
      whereClause.title = { contains: search };
    }

    if (category && category !== "all") {
      whereClause.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

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
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        source: { select: { name: true } },
      },
    });

    if (formatType === "json") {
      return new NextResponse(JSON.stringify(posts, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="gov_posts_${Date.now()}.json"`,
        },
      });
    }

    // Generate CSV
    const headers = [
      "Title",
      "Category",
      "Published Date",
      "Detected Date",
      "Source URL",
      "Status",
      "Date Confidence",
    ];

    const rows = posts.map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category.name}"`,
      `"${formatOnlyDate(p.publishedAt)}"`,
      `"${formatDateInTimezone(p.detectedAt)}"`,
      `"${p.sourceUrl}"`,
      `"${p.isNew ? "New" : "Existing"}"`,
      `"${p.dateConfidence}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gov_posts_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export data" },
      { status: 500 }
    );
  }
}
