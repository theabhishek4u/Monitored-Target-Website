import * as cheerio from "cheerio";
import { parse, parseISO, isValid } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { ExtractedDateInfo, DateSource, DateConfidence } from "./types";
import { DEFAULT_TIMEZONE } from "../timezone";

const MONTH_NAMES: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
  // Hindi transliterated / common month names
  जनवरी: 0, फरवरी: 1, मार्च: 2, अप्रैल: 3, मई: 4, जून: 5,
  जुलाई: 6, अगस्त: 7, सितम्बर: 8, अक्टूबर: 9, नवम्बर: 10, दिसम्बर: 11
};

/**
 * Extracts published date from HTML using multi-layered heuristic pipeline
 */
export function extractPublishedDate(
  $: cheerio.CheerioAPI,
  elementContext?: cheerio.Cheerio<any>,
  pageHtml?: string,
  timeZone = DEFAULT_TIMEZONE
): ExtractedDateInfo {
  // 1. Check JSON-LD
  try {
    const scripts = $("script[type='application/ld+json']");
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = $(scripts[i]).html();
      if (!scriptContent) continue;
      try {
        const json = JSON.parse(scriptContent.trim());
        const data = Array.isArray(json) ? json : [json];
        for (const item of data) {
          const dateStr =
            item.datePublished ||
            item.dateCreated ||
            item.uploadDate ||
            item?.["@graph"]?.find?.((g: Record<string, unknown>) => g.datePublished)?.datePublished;
          if (dateStr) {
            const parsed = parseIsoOrGeneralDate(dateStr, timeZone);
            if (parsed) {
              return {
                date: parsed,
                source: "json_ld",
                confidence: "high",
                rawText: dateStr,
              };
            }
          }
        }
      } catch {
        // Skip invalid JSON-LD
      }
    }
  } catch {
    // Continue to next method
  }

  // 2. Check OpenGraph and Meta tags
  const metaSelectors = [
    "meta[property='article:published_time']",
    "meta[name='article:published_time']",
    "meta[property='og:published_time']",
    "meta[name='publish-date']",
    "meta[name='pubdate']",
    "meta[name='date']",
    "meta[name='parsely-pub-date']",
    "meta[itemprop='datePublished']",
  ];

  for (const selector of metaSelectors) {
    const content = $(selector).attr("content");
    if (content) {
      const parsed = parseIsoOrGeneralDate(content, timeZone);
      if (parsed) {
        return {
          date: parsed,
          source: "meta",
          confidence: "high",
          rawText: content,
        };
      }
    }
  }

  // 3. Check HTML <time> tags in context or page
  const searchScope = elementContext || $("body");
  const timeElements = searchScope.find("time");
  for (let i = 0; i < timeElements.length; i++) {
    const timeEl = $(timeElements[i]);
    const datetime = timeEl.attr("datetime") || timeEl.attr("pubdate") || timeEl.text();
    if (datetime) {
      const parsed = parseIsoOrGeneralDate(datetime.trim(), timeZone);
      if (parsed) {
        return {
          date: parsed,
          source: "time_element",
          confidence: "high",
          rawText: datetime,
        };
      }
    }
  }

  // 4. Check visible text patterns (e.g. within post card or element)
  const contextText = elementContext ? elementContext.text() : (pageHtml ? $("body").text() : "");
  if (contextText) {
    const regexMatch = findDateInText(contextText, timeZone);
    if (regexMatch) {
      return {
        date: regexMatch.date,
        source: "visible_html",
        confidence: "medium",
        rawText: regexMatch.rawText,
      };
    }
  }

  // 5. Fallback: current detected timestamp
  const now = new Date();
  return {
    date: now,
    source: "detected_at",
    confidence: "low",
    rawText: now.toISOString(),
  };
}

/**
 * Parses ISO date string or common date patterns
 */
export function parseIsoOrGeneralDate(dateStr: string, timeZone = DEFAULT_TIMEZONE): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  // Try direct ISO parse
  try {
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) {
      return isoDate;
    }
  } catch {}

  // Try standard JS Date constructor
  try {
    const jsDate = new Date(dateStr);
    if (isValid(jsDate) && !isNaN(jsDate.getTime())) {
      return jsDate;
    }
  } catch {}

  // Try regex matcher
  const match = findDateInText(dateStr, timeZone);
  return match ? match.date : null;
}

/**
 * Scans a text snippet for common Indian & international date representations
 */
function findDateInText(text: string, timeZone = DEFAULT_TIMEZONE): { date: Date; rawText: string } | null {
  // Common patterns:
  // 1) DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = text.match(/\b([0-3]?\d)[\/\-\.]([0-1]?\d)[\/\-\.](20\d{2})\b/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      const constructed = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return { date: constructed, rawText: dmyMatch[0] };
    }
  }

  // 2) YYYY-MM-DD
  const ymdMatch = text.match(/\b(20\d{2})[\/\-\.]([0-1]?\d)[\/\-\.]([0-3]?\d)\b/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      const constructed = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return { date: constructed, rawText: ymdMatch[0] };
    }
  }

  // 3) DD Month YYYY (e.g. 23 August 2026, 23 Aug 2026, 23 अगस्त 2026)
  const monthRegex = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितम्बर|अक्टूबर|नवम्बर|दिसम्बर)/i;
  const dMonthYMatch = text.match(new RegExp(`\\b([0-3]?\\d)\\s+(${monthRegex.source})\\s+(20\\d{2})\\b`, "i"));
  if (dMonthYMatch) {
    const day = parseInt(dMonthYMatch[1], 10);
    const monthName = dMonthYMatch[2].toLowerCase();
    const year = parseInt(dMonthYMatch[3], 10);
    const month = MONTH_NAMES[monthName];
    if (month !== undefined && day >= 1 && day <= 31) {
      const constructed = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return { date: constructed, rawText: dMonthYMatch[0] };
    }
  }

  // 4) Month DD, YYYY (e.g. August 23, 2026)
  const monthDYMatch = text.match(new RegExp(`\\b(${monthRegex.source})\\s+([0-3]?\\d),?\\s+(20\\d{2})\\b`, "i"));
  if (monthDYMatch) {
    const monthName = monthDYMatch[1].toLowerCase();
    const day = parseInt(monthDYMatch[2], 10);
    const year = parseInt(monthDYMatch[3], 10);
    const month = MONTH_NAMES[monthName];
    if (month !== undefined && day >= 1 && day <= 31) {
      const constructed = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return { date: constructed, rawText: monthDYMatch[0] };
    }
  }

  return null;
}
