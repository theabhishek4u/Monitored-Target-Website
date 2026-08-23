import { prisma } from "../db";
import { GenericGovAdapter } from "./adapters/genericGovAdapter";
import {
  ScanOptions,
  ScanResult,
  CategoryConfig,
  ScraperSourceConfig,
  DiscoveredPostMeta,
  DateSource,
  DateConfidence,
} from "./types";
import { getTodayBounds, getLastNDaysBounds } from "../timezone";

export class ScraperEngine {
  public static async runScan(options: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();

    // 1. Fetch Source & Categories
    const source = await prisma.source.findUnique({
      where: { id: options.sourceId },
      include: {
        categories: {
          where: { enabled: true },
          orderBy: { priority: "asc" },
        },
      },
    });

    if (!source) {
      throw new Error(`Source not found: ${options.sourceId}`);
    }

    // 2. Create ScanRun record
    const scanRun = await prisma.scanRun.create({
      data: {
        sourceId: source.id,
        scanType: options.scanType,
        status: "running",
      },
    });

    const parsedCategories: CategoryConfig[] = source.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      sourceUrl: c.sourceUrl,
      priority: c.priority,
      keywords: c.keywords ? c.keywords.split(",").map((k) => k.trim()) : undefined,
      enabled: c.enabled,
    }));

    let targetCategories = parsedCategories;
    if (options.categorySlug) {
      targetCategories = parsedCategories.filter(
        (c) => c.slug === options.categorySlug
      );
    }

    const sourceConfig: ScraperSourceConfig = {
      id: source.id,
      name: source.name,
      baseUrl: source.baseUrl,
      homepageUrl: source.homepageUrl,
      maxPagesPerCategory: options.scanType === "today" ? 1 : 2,
      requestDelayMs: 250,
    };

    const adapter = new GenericGovAdapter(sourceConfig);

    let categoriesScanned = 0;
    let pagesScanned = 0;
    let postsDiscovered = 0;
    let newPosts = 0;
    let existingPosts = 0;
    let failedPosts = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Date cutoff calculation
    let cutoffDate: Date | undefined;
    if (options.scanType === "today") {
      const today = getTodayBounds();
      cutoffDate = today.start;
    } else if (options.scanType === "last_30_days") {
      const bounds = getLastNDaysBounds(options.daysLimit || 30);
      cutoffDate = bounds.start;
    }

    // Iterate through categories
    for (const category of targetCategories) {
      try {
        categoriesScanned++;

        const discovered = await adapter.scrapeCategoryPosts(
          category,
          parsedCategories,
          {
            maxPages: options.scanType === "today" ? 1 : 2,
            onPageScanned: () => {
              pagesScanned++;
            },
          }
        );

        // Limit posts to process per category (e.g. top 25 for today, top 50 for 30-day)
        const itemsToProcess = discovered.slice(
          0,
          options.scanType === "today" ? 20 : 40
        );

        postsDiscovered += itemsToProcess.length;

        // Process items with exact date verification
        for (const item of itemsToProcess) {
          try {
            const dbCategory =
              source.categories.find(
                (c) => c.slug === item.categorySlug || c.name === item.categoryName
              ) || source.categories[0];

            if (!dbCategory) continue;

            const existing = await prisma.post.findUnique({
              where: { sourceUrlHash: item.urlHash },
            });

            let finalPublishedAt = item.publishedAt;
            let finalDateSource = item.dateSource;
            let finalDateConfidence = item.dateConfidence;

            // If we don't have high confidence date yet, fetch exact post page details
            if (!existing || existing.dateConfidence !== "high") {
              const details = await adapter.fetchPostDetails(item.normalizedUrl);
              if (details.publishedAt) {
                finalPublishedAt = details.publishedAt;
                finalDateSource = details.dateSource || "meta";
                finalDateConfidence = details.dateConfidence || "high";
              }
            } else {
              finalPublishedAt = existing.publishedAt;
              finalDateSource = existing.dateSource as DateSource;
              finalDateConfidence = existing.dateConfidence as DateConfidence;
            }

            // Apply date filters
            if (options.scanType === "today" && cutoffDate) {
              if (finalPublishedAt < cutoffDate) {
                continue; // Not published today
              }
            } else if (options.scanType === "last_30_days" && cutoffDate) {
              if (finalPublishedAt < cutoffDate) {
                // Post is older than 30 days
                continue;
              }
            }

            if (existing) {
              existingPosts++;
              await prisma.post.update({
                where: { id: existing.id },
                data: {
                  categoryId: dbCategory.id,
                  publishedAt: finalPublishedAt,
                  dateSource: finalDateSource,
                  dateConfidence: finalDateConfidence,
                  lastCheckedAt: new Date(),
                },
              });
            } else {
              await prisma.post.create({
                data: {
                  sourceId: source.id,
                  categoryId: dbCategory.id,
                  title: item.title,
                  sourceUrl: item.normalizedUrl,
                  sourceUrlHash: item.urlHash,
                  publishedAt: finalPublishedAt,
                  detectedAt: new Date(),
                  firstSeenAt: new Date(),
                  lastCheckedAt: new Date(),
                  dateSource: finalDateSource,
                  dateConfidence: finalDateConfidence,
                  isNew: true,
                  isActive: true,
                },
              });
              newPosts++;
            }
          } catch (err: any) {
            failedPosts++;
            if (!err.message?.includes("Unique constraint")) {
              errorCount++;
              await prisma.scanError.create({
                data: {
                  scanRunId: scanRun.id,
                  url: item.normalizedUrl,
                  errorType: "POST_INSERT_ERROR",
                  errorMessage: err.message || "Failed to process post",
                },
              });
            }
          }
        }
      } catch (err: any) {
        errorCount++;
        errors.push(`Category ${category.name}: ${err.message}`);
        await prisma.scanError.create({
          data: {
            scanRunId: scanRun.id,
            url: category.sourceUrl,
            errorType: "CATEGORY_SCRAPE_ERROR",
            errorMessage: err.message || "Failed to scrape category",
          },
        });
      }
    }

    const durationMs = Date.now() - startTime;

    await prisma.scanRun.update({
      where: { id: scanRun.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        categoriesScanned,
        pagesScanned,
        postsDiscovered,
        newPosts,
        existingPosts,
        failedPosts,
        errorCount,
        durationMs,
        errorSummary: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    return {
      scanRunId: scanRun.id,
      status: "completed",
      categoriesScanned,
      pagesScanned,
      postsDiscovered,
      newPosts,
      existingPosts,
      failedPosts,
      errorCount,
      durationMs,
      errorSummary: errors.length > 0 ? errors.join("; ") : undefined,
    };
  }
}
