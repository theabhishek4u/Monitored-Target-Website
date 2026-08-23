import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ScraperEngine } from "@/lib/scraper/scraperEngine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let sourceId = body.sourceId;

    if (!sourceId) {
      const activeSource = await prisma.source.findFirst({
        where: { enabled: true },
      });
      if (!activeSource) {
        return NextResponse.json(
          { error: "No active target source configured" },
          { status: 400 }
        );
      }
      sourceId = activeSource.id;
    }

    // Check if scan already running
    const runningScan = await prisma.scanRun.findFirst({
      where: { sourceId, status: "running" },
    });

    if (runningScan) {
      const diffMs = Date.now() - new Date(runningScan.startedAt).getTime();
      if (diffMs < 5 * 60 * 1000) {
        return NextResponse.json(
          { error: "A scan is already in progress.", scanRunId: runningScan.id },
          { status: 409 }
        );
      } else {
        await prisma.scanRun.update({
          where: { id: runningScan.id },
          data: { status: "failed", errorSummary: "Timed out" },
        });
      }
    }

    // Run 30-Day Scan
    const result = await ScraperEngine.runScan({
      sourceId,
      scanType: "last_30_days",
      daysLimit: 30,
      maxPages: 8,
    });

    return NextResponse.json({
      success: true,
      message: "30-day historical scan completed successfully",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to execute 30-day scan" },
      { status: 500 }
    );
  }
}
