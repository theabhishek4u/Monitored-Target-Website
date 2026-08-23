import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { priority: "asc" },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, sourceUrl, priority, keywords, enabled } = body;

    const source = await prisma.source.findFirst();
    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        sourceId: source.id,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
        sourceUrl,
        priority: parseInt(priority || "10", 10),
        keywords: keywords || "",
        enabled: enabled ?? true,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, sourceUrl, priority, keywords, enabled } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        sourceUrl,
        priority: parseInt(priority || "10", 10),
        keywords,
        enabled,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}
