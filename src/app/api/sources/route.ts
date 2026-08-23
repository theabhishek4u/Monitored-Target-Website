import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      include: {
        categories: { orderBy: { priority: "asc" } },
        _count: { select: { posts: true, scanRuns: true } },
      },
    });

    return NextResponse.json({ sources });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, baseUrl, homepageUrl, scrapeConfig, enabled } = body;

    const source = await prisma.source.update({
      where: { id },
      data: {
        name,
        baseUrl,
        homepageUrl,
        scrapeConfig: typeof scrapeConfig === "string" ? scrapeConfig : JSON.stringify(scrapeConfig),
        enabled,
      },
    });

    return NextResponse.json({ source });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update source" },
      { status: 500 }
    );
  }
}
