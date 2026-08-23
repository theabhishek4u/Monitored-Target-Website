import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDateInTimezone } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") || "15", 10)));

    const scans = await prisma.scanRun.findMany({
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        source: { select: { name: true } },
        errors: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });

    const formattedScans = scans.map((s) => ({
      id: s.id,
      sourceName: s.source.name,
      scanType: s.scanType,
      status: s.status,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      formattedStartedAt: formatDateInTimezone(s.startedAt),
      categoriesScanned: s.categoriesScanned,
      pagesScanned: s.pagesScanned,
      postsDiscovered: s.postsDiscovered,
      newPosts: s.newPosts,
      existingPosts: s.existingPosts,
      failedPosts: s.failedPosts,
      errorCount: s.errorCount,
      durationSeconds: Math.round(s.durationMs / 1000),
      errorSummary: s.errorSummary,
      recentErrors: s.errors,
    }));

    return NextResponse.json({ scans: formattedScans });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch scan runs" },
      { status: 500 }
    );
  }
}
