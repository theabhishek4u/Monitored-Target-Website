import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET() {
  const status: Record<string, string> = {
    application: "healthy",
    database: "unknown",
    scraper: "ready",
    source: "unknown",
  };

  try {
    // 1. Check DB
    await prisma.$queryRaw`SELECT 1`;
    status.database = "healthy";
  } catch (err: any) {
    status.database = `unhealthy (${err.message})`;
  }

  try {
    // 2. Check source website connectivity
    const source = await prisma.source.findFirst({ where: { enabled: true } });
    if (source) {
      const resp = await axios.get(source.baseUrl, {
        timeout: 5000,
        headers: { "User-Agent": "Mozilla/5.0 GovContentTracker/1.0" },
      });
      status.source = resp.status >= 200 && resp.status < 400 ? "reachable" : `status_${resp.status}`;
    } else {
      status.source = "no_source_configured";
    }
  } catch (err: any) {
    status.source = `unreachable (${err.message})`;
  }

  const isAllHealthy = status.application === "healthy" && status.database === "healthy";

  return NextResponse.json({
    status: isAllHealthy ? "healthy" : "degraded",
    services: status,
    timestamp: new Date().toISOString(),
  });
}
