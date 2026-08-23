import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import { DiscoveredPostMeta, ScraperSourceConfig, CategoryConfig, DateSource, DateConfidence } from "../types";
import { normalizeUrl, generateUrlHash, normalizeTitle } from "../normalizer";
import { extractPublishedDate, parseIsoOrGeneralDate } from "../dateParser";
import { detectCategory } from "../categoryDetector";
import { DEFAULT_TIMEZONE } from "../../timezone";

export class GenericGovAdapter {
  private client: AxiosInstance;
  private config: ScraperSourceConfig;

  constructor(config: ScraperSourceConfig) {
    this.config = config;
    this.client = axios.create({
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 GovContentTracker/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
      },
    });
  }

  private async delay(ms?: number) {
    const waitTime = ms ?? (this.config.requestDelayMs || 250);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  public async fetchHtml(url: string, retries = 2): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.delay();
        const response = await this.client.get(url);
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await this.delay(600 * (attempt + 1));
      }
    }
    throw new Error(`Failed to fetch HTML from ${url}`);
  }

  /**
   * Fetches an individual post page to extract its exact publication date and metadata
   */
  public async fetchPostDetails(url: string): Promise<{
    title?: string;
    publishedAt?: Date;
    dateSource?: DateSource;
    dateConfidence?: DateConfidence;
  }> {
    try {
      const html = await this.fetchHtml(url);
      const $ = cheerio.load(html);

      // 1. Meta article:published_time / og:updated_time / article:modified_time
      const metaPub =
        $("meta[property='article:published_time']").attr("content") ||
        $("meta[name='article:published_time']").attr("content") ||
        $("meta[property='og:updated_time']").attr("content") ||
        $("meta[property='article:modified_time']").attr("content");

      if (metaPub) {
        const d = parseIsoOrGeneralDate(metaPub, DEFAULT_TIMEZONE);
        if (d) {
          return {
            publishedAt: d,
            dateSource: "meta",
            dateConfidence: "high",
          };
        }
      }

      // 2. Visible table row: "Post Date / Update : 22 August 2026 | 09:15 PM"
      let textDate: Date | null = null;
      $("tr, p, div, span").each((_, el) => {
        if (textDate) return;
        const text = $(el).text().trim();
        if (
          text.includes("Post Date") ||
          text.includes("Update :") ||
          text.includes("Posted on")
        ) {
          const match = text.match(
            /([0-3]?\d)\s+([A-Za-z]+|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितम्बर|अक्टूबर|नवम्बर|दिसम्बर)\s+(20\d{2})/i
          );
          if (match) {
            const d = parseIsoOrGeneralDate(
              `${match[1]} ${match[2]} ${match[3]}`,
              DEFAULT_TIMEZONE
            );
            if (d) textDate = d;
          }
        }
      });

      if (textDate) {
        return {
          publishedAt: textDate,
          dateSource: "visible_html",
          dateConfidence: "high",
        };
      }

      // 3. Fallback to general date parser
      const fallback = extractPublishedDate($, undefined, html, DEFAULT_TIMEZONE);
      return {
        publishedAt: fallback.date,
        dateSource: fallback.source,
        dateConfidence: fallback.confidence,
      };
    } catch {
      return {};
    }
  }

  /**
   * Scrapes candidate post links from category archives
   */
  public async scrapeCategoryPosts(
    category: CategoryConfig,
    allCategories: CategoryConfig[],
    options: {
      cutoffDate?: Date;
      maxPages?: number;
      onPageScanned?: (pageNumber: number, postsFound: number) => void;
    } = {}
  ): Promise<DiscoveredPostMeta[]> {
    const posts: DiscoveredPostMeta[] = [];
    const visitedUrls = new Set<string>();
    const maxPages = options.maxPages || 1;

    let currentUrl = category.sourceUrl;
    let pageNum = 1;

    while (currentUrl && pageNum <= maxPages) {
      try {
        const html = await this.fetchHtml(currentUrl);
        const $ = cheerio.load(html);

        let pageFoundPosts = 0;

        // Structured listing items
        const candidateItems = $(
          "ul.sarkari-quick-list li, #post ul li, .post ul li, div[id='post'] ul li, article, .post-item, .entry, .card, .job-item"
        );

        candidateItems.each((_, el) => {
          const $el = $(el);
          const anchor = $el.is("a") ? $el : $el.find("a").first();
          const href = anchor.attr("href");
          if (!href) return;

          let rawTitle = anchor.text() || $el.text();
          const title = normalizeTitle(rawTitle);
          if (!title || title.length < 8) return;

          const normalized = normalizeUrl(href, this.config.baseUrl);
          if (!normalized || visitedUrls.has(normalized)) return;
          if (this.isNonPostUrl(normalized)) return;

          visitedUrls.add(normalized);

          const matchedCategory = detectCategory(
            normalized,
            title,
            allCategories,
            category.slug
          );

          posts.push({
            title,
            url: href,
            normalizedUrl: normalized,
            urlHash: generateUrlHash(normalized),
            categorySlug: matchedCategory?.slug || category.slug,
            categoryName: matchedCategory?.name || category.name,
            publishedAt: new Date(),
            dateSource: "detected_at",
            dateConfidence: "low",
          });

          pageFoundPosts++;
        });

        // Fallback: If structured containers missed items, scan anchor tags
        if (pageFoundPosts === 0) {
          $("a[href]").each((_, el) => {
            const anchor = $(el);
            const href = anchor.attr("href");
            if (!href) return;

            const title = normalizeTitle(anchor.text());
            if (!title || title.length < 12) return;

            const normalized = normalizeUrl(href, this.config.baseUrl);
            if (!normalized || visitedUrls.has(normalized)) return;
            if (this.isNonPostUrl(normalized)) return;

            const lowerHref = href.toLowerCase();
            const lowerTitle = title.toLowerCase();
            const isPostLike =
              lowerHref.includes("202") ||
              lowerHref.includes("job") ||
              lowerHref.includes("result") ||
              lowerHref.includes("admit") ||
              lowerTitle.includes("online form") ||
              lowerTitle.includes("recruitment") ||
              lowerTitle.includes("result") ||
              lowerTitle.includes("admit card");

            if (!isPostLike) return;

            visitedUrls.add(normalized);

            const matchedCategory = detectCategory(
              normalized,
              title,
              allCategories,
              category.slug
            );

            posts.push({
              title,
              url: href,
              normalizedUrl: normalized,
              urlHash: generateUrlHash(normalized),
              categorySlug: matchedCategory?.slug || category.slug,
              categoryName: matchedCategory?.name || category.name,
              publishedAt: new Date(),
              dateSource: "detected_at",
              dateConfidence: "low",
            });

            pageFoundPosts++;
          });
        }

        if (options.onPageScanned) {
          options.onPageScanned(pageNum, pageFoundPosts);
        }

        // Check next page
        const nextLink = $(
          "a.next, .pagination .next a, a[rel='next'], a:contains('Next »')"
        ).first();

        const nextHref = nextLink.attr("href");
        if (nextHref && nextHref !== currentUrl) {
          currentUrl = normalizeUrl(nextHref, this.config.baseUrl);
          pageNum++;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    return posts;
  }

  private isNonPostUrl(url: string): boolean {
    const lower = url.toLowerCase();
    const blacklist = [
      "/about-us",
      "/contact-us",
      "/privacy-policy",
      "/terms",
      "/disclaimer",
      "/sitemap",
      "/feed",
      "/wp-admin",
      "/wp-login",
      "/cdn-cgi",
      "/category/",
      "/latestjob/",
      "/admitcard/",
      "/result/",
      "/answerkey/",
      "/syllabus/",
      "/admission/",
      "#",
      "javascript:",
      "mailto:",
      "tel:",
    ];

    if (blacklist.some((b) => lower.endsWith(b) || lower.endsWith(b + "/"))) return true;

    try {
      const u = new URL(url);
      if (u.pathname === "/" || u.pathname === "") return true;
    } catch {}

    return false;
  }
}
