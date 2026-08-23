import { CategoryConfig } from "./types";

// Standard default keyword rules for government jobs and results
export const DEFAULT_CATEGORY_KEYWORDS: Record<string, string[]> = {
  "admit-card": [
    "admit card",
    "hall ticket",
    "call letter",
    "प्रवेश पत्र",
    "admit-card",
    "exam city",
    "exam center",
    "pre exam admit",
  ],
  result: [
    "result",
    "score card",
    "scorecard",
    "merit list",
    "cut off",
    "cutoff",
    "selection list",
    "परिणाम",
    "marks list",
    "rank list",
  ],
  "answer-key": [
    "answer key",
    "response sheet",
    "answer sheet",
    "key objection",
    "उत्तर कुंजी",
    "provisional answer key",
    "final answer key",
  ],
  "latest-jobs": [
    "recruitment",
    "vacancy",
    "online form",
    "apply online",
    "bharti",
    "भर्ती",
    "notification",
    "job",
    "apprentice",
    "officer",
    "constable",
    "clerk",
    "inspector",
    "post",
    "posts",
  ],
  admission: [
    "admission",
    "entrance exam",
    "counselling",
    "counseling",
    "allotment",
    "seat allotment",
    "प्रवेश",
  ],
  syllabus: [
    "syllabus",
    "exam pattern",
    "curriculum",
    "पाठ्यक्रम",
  ],
  scholarship: [
    "scholarship",
    "छात्रवृत्ति",
    "fellowship",
  ],
};

/**
 * Detects the most accurate category for a discovered post based on URL, title, and metadata.
 */
export function detectCategory(
  url: string,
  title: string,
  configuredCategories: CategoryConfig[],
  contextCategorySlug?: string
): CategoryConfig | null {
  if (configuredCategories.length === 0) return null;

  // 1. If explicitly collected from a specific non-other category archive page, match that category
  if (contextCategorySlug && contextCategorySlug.toLowerCase() !== "other") {
    const directMatch = configuredCategories.find(
      (c) => c.slug.toLowerCase() === contextCategorySlug.toLowerCase() && c.enabled
    );
    if (directMatch) return directMatch;
  }

  // 2. Priority 2: Check URL path patterns
  const lowerUrl = url.toLowerCase();
  for (const cat of configuredCategories) {
    if (!cat.enabled || cat.slug === "other") continue;
    if (
      lowerUrl.includes(`/${cat.slug}/`) ||
      lowerUrl.includes(`category/${cat.slug}`) ||
      lowerUrl.includes(`/${cat.slug}-`) ||
      lowerUrl.includes(`/${cat.slug}.`)
    ) {
      return cat;
    }
  }

  // 3. Priority 3: Match title keywords against sorted categories (ordered by priority)
  const sortedCats = [...configuredCategories]
    .filter((c) => c.enabled && c.slug !== "other")
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));

  const lowerTitle = title.toLowerCase();

  for (const cat of sortedCats) {
    // Check custom keywords if provided, else default keywords
    const keywords =
      cat.keywords && cat.keywords.length > 0
        ? cat.keywords
        : DEFAULT_CATEGORY_KEYWORDS[cat.slug] || [];

    for (const kw of keywords) {
      if (lowerTitle.includes(kw.toLowerCase())) {
        return cat;
      }
    }
  }

  // 4. Fallback to "other" category or lowest priority category
  const otherCat = configuredCategories.find((c) => c.slug === "other" && c.enabled);
  if (otherCat) return otherCat;

  return configuredCategories[0] || null;
}
