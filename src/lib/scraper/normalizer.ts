import crypto from "crypto";

// Known tracking/marketing query parameters to strip
const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "ref",
  "source",
  "_ga",
  "v",
  "timestamp",
]);

/**
 * Normalizes a URL to prevent duplicate posts caused by URL variances.
 * - Resolves relative URLs against baseUrl
 * - Lowercases scheme & host
 * - Removes tracking query parameters
 * - Canonicalizes trailing slashes
 * - Removes URL fragment (#anchor)
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string {
  try {
    let urlObj: URL;
    if (baseUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      urlObj = new URL(rawUrl, baseUrl);
    } else {
      urlObj = new URL(rawUrl);
    }

    // Only keep http and https
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return "";
    }

    urlObj.protocol = urlObj.protocol.toLowerCase();
    urlObj.hostname = urlObj.hostname.toLowerCase();
    urlObj.hash = ""; // remove anchors

    // Filter query parameters
    const searchParams = new URLSearchParams(urlObj.search);
    const cleanedParams = new URLSearchParams();

    searchParams.forEach((value, key) => {
      if (!TRACKING_PARAMS.has(key.toLowerCase())) {
        cleanedParams.append(key, value);
      }
    });

    const queryStr = cleanedParams.toString();
    urlObj.search = queryStr ? `?${queryStr}` : "";

    // Normalize pathname trailing slash (remove trailing slash except for root '/')
    let pathname = urlObj.pathname.replace(/\/+$/, "");
    if (pathname === "") pathname = "/";
    urlObj.pathname = pathname;

    return urlObj.toString();
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Generates a deterministic SHA-256 hash of the normalized URL for database uniqueness indexing.
 */
export function generateUrlHash(url: string): string {
  return crypto.createHash("sha256").update(url.trim()).digest("hex");
}

/**
 * Cleans and normalizes post title text.
 */
export function normalizeTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(/\s+/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .trim();
}
