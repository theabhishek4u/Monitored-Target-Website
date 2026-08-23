export type DateSource =
  | "json_ld"
  | "meta"
  | "time_element"
  | "visible_html"
  | "rss"
  | "sitemap"
  | "detected_at";

export type DateConfidence = "high" | "medium" | "low";

export interface ExtractedDateInfo {
  date: Date;
  source: DateSource;
  confidence: DateConfidence;
  rawText?: string;
}

export interface DiscoveredPostMeta {
  title: string;
  url: string;
  normalizedUrl: string;
  urlHash: string;
  categorySlug?: string;
  categoryName?: string;
  publishedAt: Date;
  dateSource: DateSource;
  dateConfidence: DateConfidence;
  isNew?: boolean;
}

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  sourceUrl: string;
  priority: number;
  keywords?: string[];
  enabled: boolean;
}

export interface ScraperSourceConfig {
  id: string;
  name: string;
  baseUrl: string;
  homepageUrl: string;
  allowedDomains?: string[];
  requestDelayMs?: number;
  maxRetries?: number;
  maxPagesPerCategory?: number;
  customSelectors?: {
    postLink?: string;
    postTitle?: string;
    date?: string;
    paginationNext?: string;
  };
}

export interface ScanOptions {
  sourceId: string;
  scanType: "today" | "last_30_days" | "category" | "manual";
  categorySlug?: string;
  daysLimit?: number; // 1 for today, 30 for 30 days
  maxPages?: number;
  onProgress?: (progress: ScanProgress) => void;
}

export interface ScanProgress {
  scanRunId: string;
  stage: "discovering" | "parsing" | "saving" | "completed" | "failed";
  currentCategory?: string;
  currentPage?: number;
  pagesScanned: number;
  postsDiscovered: number;
  newPosts: number;
  existingPosts: number;
  errorCount: number;
  message?: string;
}

export interface ScanResult {
  scanRunId: string;
  status: "completed" | "failed";
  categoriesScanned: number;
  pagesScanned: number;
  postsDiscovered: number;
  newPosts: number;
  existingPosts: number;
  failedPosts: number;
  errorCount: number;
  durationMs: number;
  errorSummary?: string;
}
