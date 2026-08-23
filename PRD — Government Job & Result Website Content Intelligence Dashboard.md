# Product Requirements Document (PRD)

## Product Name

**Government Website Content Intelligence Dashboard**

### Internal Short Name

**Gov Content Tracker**

### Product Type

Web-based content monitoring, scraping, categorization, and analytics dashboard.

### Primary Purpose

The purpose of this application is to monitor a selected government-job/result-information website, detect newly published posts, categorize those posts, store the discovered post metadata in a database, and provide a date-wise and category-wise analytics dashboard.

The system will help the website owner understand:

- How many posts were published today
- How many posts were published yesterday
- How many posts were published during the last 7 days
- How many posts were published during the last 30 days
- Which categories are receiving the most updates
- Which individual posts were published
- Which posts are newly discovered
- Which categories are currently active
- Which new topics/posts may require corresponding coverage on the user's own website

The application is an **internal research and monitoring tool**, not a content-republishing system.

---

# 1. PRODUCT VISION

Build a clean, fast, reliable web dashboard that monitors a target website and turns its publicly visible post information into structured analytics.

The core workflow should be:

```text
Target Website
      ↓
Scraper
      ↓
Discover Posts
      ↓
Extract Metadata
      ↓
Detect Category
      ↓
Deduplicate
      ↓
Store in Database
      ↓
Analytics Engine
      ↓
Dashboard
```

The user should be able to open the dashboard and immediately understand:

> "What was published today, what was published yesterday, what categories were active, and what happened during the last 30 days?"

---

# 2. PRIMARY USER

The primary user is the owner/operator of a government-job information website.

The tool is intended for internal editorial research.

The user wants to monitor another publicly accessible website to identify publishing trends and new topics.

The user is not expected to be a programmer.

The interface must therefore be simple:

```text
SCAN TODAY
SCAN LAST 30 DAYS
```

with clear results and statistics.

---

# 3. CORE PRODUCT REQUIREMENTS

The application must provide:

1. Target website configuration
2. Category configuration
3. Scraping engine
4. Incremental scanning
5. 30-day historical scanning
6. Post discovery
7. Duplicate detection
8. Date extraction
9. Category detection
10. Database storage
11. Today's dashboard
12. Yesterday's dashboard
13. Last 7 days dashboard
14. Last 30 days dashboard
15. Category-wise statistics
16. Date-wise statistics
17. Clickable source URLs
18. New-post highlighting
19. Scan history
20. Error logging
21. Manual re-scan
22. Pagination
23. Search/filter
24. Export capability
25. Responsive dashboard

---

# 4. IMPORTANT DATA POLICY

The system should primarily store **metadata**, not reproduce the full article content.

For each discovered post, store:

- Post title
- Source URL
- Category
- Published date
- Detected date
- First discovered timestamp
- Last checked timestamp
- Source website
- Unique identifier/hash
- Status

Do not unnecessarily store or reproduce the full article body.

The dashboard should primarily provide:

> "This post exists on the source website."

and allow the user to open the original source page.

---

# 5. TARGET WEBSITE

The application must support configuring one or more target websites.

Version 1 may support one target website.

The target website should be configurable from the admin settings.

Example:

```text
Target Website:
https://example.com
```

Do not hard-code the source website throughout the application.

---

# 6. SOURCE WEBSITE CONFIGURATION

Create an admin configuration interface.

Fields:

### Source Name

Example:

```text
Government Result Website
```

### Base URL

```text
https://example.com
```

### Homepage URL

```text
https://example.com/
```

### Category URLs

Example:

```text
Latest Jobs
https://example.com/category/latest-jobs/

Admit Card
https://example.com/category/admit-card/

Result
https://example.com/category/result/

Answer Key
https://example.com/category/answer-key/

Syllabus
https://example.com/category/syllabus/

Admission
https://example.com/category/admission/
```

The actual URLs must be configurable.

---

# 7. CATEGORY SYSTEM

The dashboard must organize discovered posts into categories.

Example categories:

- Latest Jobs
- Government Jobs
- Railway Jobs
- SSC
- Banking
- Admit Card
- Results
- Answer Key
- Syllabus
- Admission
- Scholarship
- State Government Jobs
- Other

The administrator must be able to:

- Create category
- Edit category
- Disable category
- Delete category
- Change category order
- Configure category URL
- Configure category detection rules

---

# 8. CATEGORY DETECTION

Category detection should support multiple methods.

## Priority 1 — Source Category

If the source website exposes a reliable category URL or category metadata, use that.

## Priority 2 — URL Pattern

Example:

```text
/category/admit-card/
```

→ Admit Card

## Priority 3 — HTML Metadata

Read category information from the page if reliably available.

## Priority 4 — Keyword Rules

Example:

```text
"admit card"
"hall ticket"
" प्रवेश पत्र "
```

→ Admit Card

Example:

```text
"result"
"score card"
"merit list"
```

→ Result

Example:

```text
"recruitment"
"vacancy"
"online form"
"apply online"
```

→ Jobs

The system must allow rules to be changed without modifying source code.

---

# 9. CATEGORY PRIORITY

If a post matches multiple categories, use a configurable priority system.

Example:

```text
Admit Card
Result
Answer Key
Latest Jobs
Admission
Syllabus
Other
```

Do not assign multiple categories unless multi-category mode is explicitly enabled.

Version 1 should use one primary category per post.

---

# 10. SCRAPING MODES

The application must support two primary scanning modes.

## Mode A — Scan Today

Purpose:

Find only posts that appear to have been published today.

User clicks:

```text
SCAN TODAY
```

The scraper should:

1. Visit configured source/category pages.
2. Discover current posts.
3. Extract metadata.
4. Identify today's posts.
5. Check whether each post already exists in the database.
6. Insert only new posts.
7. Update existing records only when necessary.
8. Mark newly discovered posts.
9. Display results immediately.

Previously stored posts must not be duplicated.

---

# 11. Mode B — Scan Last 30 Days

User clicks:

```text
SCAN LAST 30 DAYS
```

The system should discover posts from approximately the last 30 days and populate the historical database.

This should be used for:

- Initial setup
- Backfilling missing data
- Repairing gaps
- Rebuilding a source category

After the initial 30-day scan, normal daily operation should use incremental scanning.

---

# 12. INCREMENTAL SCRAPING

This is a critical requirement.

The system must NOT download and insert all posts again every day.

Example:

### Day 1

Database:

```text
Post A
Post B
Post C
```

### Day 2

Source contains:

```text
Post A
Post B
Post C
Post D
Post E
```

The system should identify:

```text
Existing:
A
B
C

New:
D
E
```

Only D and E should be inserted as new records.

A, B and C must not be duplicated.

---

# 13. DUPLICATE DETECTION

The primary duplicate identifier should be:

```text
Normalized Source URL
```

Example:

```text
https://example.com/job-123/
```

Normalize:

- trailing slash
- tracking parameters
- URL encoding
- unnecessary query parameters

Store a normalized URL.

Create a unique database constraint/index on:

```text
source_url_hash
```

Secondary fallback identifiers may include:

```text
source URL
+
normalized title
+
published date
```

Do not rely only on title because different posts may have similar titles.

---

# 14. POST DISCOVERY

The scraper should discover posts from:

1. Category archive pages
2. Pagination
3. Sitemap where available
4. RSS/feed where available
5. Source search/index pages if necessary

Preferred discovery order:

```text
Sitemap / RSS
        ↓
Category archive
        ↓
Pagination
        ↓
Individual post
```

Use the most reliable available source.

---

# 15. SITEMAP SUPPORT

If the source website exposes:

```text
/sitemap.xml
```

or a sitemap index, support sitemap discovery.

If a sitemap contains post URLs, use those URLs for discovery.

Do not assume a specific sitemap plugin or URL structure.

Detect the sitemap automatically where possible.

---

# 16. RSS SUPPORT

If the target website exposes RSS feeds, support RSS as an optional fast-discovery mechanism.

RSS can help detect newly published posts quickly.

However, the system should still validate the individual source page before inserting a post.

---

# 17. CATEGORY PAGE SCRAPING

For each configured category:

```text
Category URL
      ↓
Fetch HTML
      ↓
Extract post links
      ↓
Normalize URLs
      ↓
Check database
      ↓
Fetch only required new pages
      ↓
Extract metadata
```

Do not fetch full post pages unnecessarily if the post already exists and has not changed.

---

# 18. PAGINATION

Support category pagination.

Example:

```text
/category/jobs/page/2/
/category/jobs/page/3/
```

The scraper should stop when:

- there are no more posts
- the page is outside the required date range
- the scraper reaches a configured maximum page limit
- no new URLs are discovered

Avoid infinite pagination loops.

---

# 19. DATE EXTRACTION

Published date is one of the most important fields.

The system should attempt date extraction in this order:

1. JSON-LD `datePublished`
2. OpenGraph/meta data where appropriate
3. `<time datetime="">`
4. visible published date
5. RSS publication date
6. sitemap metadata if available
7. fallback detected timestamp

Store both:

```text
published_at
detected_at
```

These are different concepts.

---

# 20. DATE CONFIDENCE

Add:

```text
date_source
```

Possible values:

```text
json_ld
meta
time_element
visible_html
rss
sitemap
detected_at
```

Also add:

```text
date_confidence
```

Example:

```text
high
medium
low
```

This makes debugging easier.

---

# 21. TIMEZONE

Use the configured application timezone.

Default:

```text
Asia/Kolkata
```

Do not rely blindly on the server's timezone.

All date comparisons such as:

```text
today
yesterday
last 30 days
```

must use the configured timezone.

---

# 22. TODAY LOGIC

If the current date is:

```text
2026-08-23
```

Today's posts mean:

```text
2026-08-23 00:00:00
to
2026-08-23 23:59:59
```

in the configured timezone.

Do not use UTC date blindly.

---

# 23. YESTERDAY LOGIC

Yesterday should be calculated based on application timezone.

Example:

```text
Today:
23 August

Yesterday:
22 August
```

---

# 24. LAST 30 DAYS LOGIC

The dashboard should support:

```text
Last 30 calendar days
```

The exact date boundaries must be timezone-aware.

Include a configurable date range selector in future versions.

---

# 25. DATABASE

Use PostgreSQL if using Supabase.

Recommended architecture:

```text
Frontend
    ↓
Backend
    ↓
PostgreSQL / Supabase
```

Do not expose database credentials to the browser.

---

# 26. DATABASE TABLE: POSTS

Create:

```text
posts
```

Suggested schema:

```text
id
source_id
source_url
source_url_hash
title
category_id
published_at
detected_at
first_seen_at
last_checked_at
date_source
date_confidence
is_new
is_active
created_at
updated_at
```

---

# 27. DATABASE TABLE: CATEGORIES

```text
categories
```

Fields:

```text
id
name
slug
source_url
priority
enabled
created_at
updated_at
```

---

# 28. DATABASE TABLE: SOURCES

For future multi-source support:

```text
sources
```

Fields:

```text
id
name
base_url
enabled
scrape_config
created_at
updated_at
```

Version 1 can have one source.

Design the schema so multiple sources can be added later.

---

# 29. DATABASE TABLE: SCAN RUNS

Create:

```text
scan_runs
```

Fields:

```text
id
source_id
scan_type
started_at
completed_at
status
categories_scanned
pages_scanned
posts_discovered
new_posts
existing_posts
failed_posts
error_count
duration_ms
error_summary
```

Possible scan types:

```text
today
last_30_days
category
manual
```

---

# 30. DATABASE TABLE: SCAN ERRORS

Create:

```text
scan_errors
```

Fields:

```text
id
scan_run_id
url
error_type
error_message
http_status
created_at
```

Never expose internal errors to normal dashboard users unless the user is an administrator.

---

# 31. DASHBOARD

The main dashboard should be visually clean and data-driven.

Top section:

```text
Government Content Intelligence

Source:
Government Result Website

Last Scan:
Today, 06:15 AM

Status:
Healthy
```

---

# 32. SUMMARY CARDS

Show:

```text
TODAY
24 Posts
```

```text
YESTERDAY
31 Posts
```

```text
LAST 7 DAYS
186 Posts
```

```text
LAST 30 DAYS
824 Posts
```

These numbers must come from the database.

Never hard-code them.

---

# 33. CATEGORY SUMMARY

Show category cards/table:

```text
Category              Today     30 Days
----------------------------------------
Latest Jobs              8         218
Admit Card               4         103
Result                   6         186
Answer Key               2          71
Syllabus                 1          54
Admission                3         112
Other                    0          80
```

Allow sorting by:

- Today
- Yesterday
- 7 Days
- 30 Days

---

# 34. CATEGORY CLICK

When the user clicks:

```text
Latest Jobs
```

show all relevant posts.

Example:

```text
Latest Jobs

Today: 8
Yesterday: 11
Last 7 Days: 61
Last 30 Days: 218
```

Then list:

```text
1. Railway Recruitment...
   23 Aug 2026
   [Open Source Post]

2. SSC Recruitment...
   23 Aug 2026
   [Open Source Post]

3. Banking Recruitment...
   22 Aug 2026
   [Open Source Post]
```

Newest first.

---

# 35. POST LIST

Each post row should contain:

```text
#
Title
Category
Published Date
Detected Date
Status
Source
```

Example:

```text
01
RRC Apprentice Recruitment 2026

Latest Jobs
23 Aug 2026
New
[Open]
```

---

# 36. NEW POST INDICATOR

Newly discovered posts should show:

```text
NEW
```

or a small badge.

Example:

```text
NEW · Railway Apprentice Recruitment 2026
```

The badge should disappear after the user has viewed the post or after an appropriate configurable period.

---

# 37. DATE-WISE VIEW

Provide:

```text
Date
Total Posts
Latest Jobs
Admit Card
Result
Answer Key
Admission
Other
```

Example:

```text
23 Aug 2026     24
22 Aug 2026     31
21 Aug 2026     27
20 Aug 2026     35
...
```

Clicking a date should show all posts from that date.

---

# 38. CALENDAR VIEW

Optional but recommended.

Provide a calendar/date selector.

When the user selects:

```text
23 August 2026
```

show:

```text
Total Posts: 24
```

and category breakdown.

---

# 39. CHARTS

Use charts for:

### Posts per day

Line/bar chart:

```text
Date → Number of Posts
```

### Category distribution

Bar chart:

```text
Latest Jobs
Result
Admit Card
...
```

Do not overuse charts.

The data table remains the primary source of information.

---

# 40. FILTERS

Dashboard filters:

```text
Date Range
Category
Search Title
New Only
Source
```

Date presets:

```text
Today
Yesterday
Last 7 Days
Last 30 Days
Custom
```

---

# 41. SEARCH

Provide a title search:

```text
Search posts...
```

Example:

```text
Railway
```

returns all matching stored posts.

---

# 42. SOURCE POST LINK

Every stored post must have:

```text
Open Source
```

button.

It should open the original source URL in a new browser tab.

The URL must come directly from the database.

---

# 43. SORTING

Default:

```text
Newest first
```

Supported sorting:

```text
Published date descending
Published date ascending
Detected date descending
Title A-Z
Category
```

---

# 44. PAGINATION

Do not load thousands of posts at once.

Use:

```text
20 / 50 / 100
```

items per page.

Support pagination.

---

# 45. SCAN BUTTONS

Primary buttons:

```text
SCAN TODAY
```

```text
SCAN LAST 30 DAYS
```

Optional:

```text
SCAN SELECTED CATEGORY
```

---

# 46. SCAN TODAY BEHAVIOR

When clicked:

```text
User clicks SCAN TODAY
        ↓
Create scan_run
        ↓
Fetch category pages
        ↓
Discover URLs
        ↓
Extract dates
        ↓
Ignore posts outside today
        ↓
Check database
        ↓
Insert only new posts
        ↓
Update scan statistics
        ↓
Display results
```

The UI should show live/progress status if possible.

---

# 47. SCAN LAST 30 DAYS BEHAVIOR

When clicked:

```text
Create scan_run
        ↓
Scan configured categories
        ↓
Follow pagination
        ↓
Stop when posts are older than required range
        ↓
Extract metadata
        ↓
Deduplicate
        ↓
Insert missing posts
        ↓
Update existing records if needed
        ↓
Finish
```

---

# 48. SMART EARLY STOP

For a 30-day scan, if a category is sorted newest-first and the scraper reaches posts older than 30 days, it should stop scanning deeper pages for that category.

This reduces:

- HTTP requests
- server load
- scan time
- duplicate processing

However, this optimization must only be used if the source ordering is reliably newest-first.

---

# 49. REQUEST MANAGEMENT

The scraper must be polite and controlled.

Implement:

- timeout
- retry
- delay between requests
- concurrency limit
- user-agent identification
- error handling

Do not launch hundreds of simultaneous requests.

Respect applicable website terms, robots.txt, and rate limits.

---

# 50. HTTP CLIENT

Recommended backend technology:

```text
Node.js
```

Use a robust HTTP client such as:

```text
Axios
```

or native `fetch`.

For simple HTML parsing:

```text
Cheerio
```

---

# 51. JAVASCRIPT / TYPESCRIPT

Use:

```text
TypeScript
```

for backend and frontend code.

This improves:

- type safety
- maintainability
- refactoring
- API contracts
- debugging

---

# 52. FRONTEND FRAMEWORK

Recommended:

```text
Next.js
```

Use the App Router.

Use:

```text
TypeScript
+
Tailwind CSS
```

for the dashboard UI.

---

# 53. BACKEND

Use:

```text
Next.js server-side API
```

for version 1.

No separate Express server is required unless the project later needs one.

Architecture:

```text
Next.js
├── Frontend
├── Server/API
├── Scraper services
└── Database layer
```

---

# 54. DATABASE

Recommended:

```text
Supabase PostgreSQL
```

Benefits:

- PostgreSQL
- easy dashboard
- managed database
- authentication available later
- backups
- scalable
- API access
- future analytics

The browser must never receive the Supabase service-role key.

---

# 55. AUTHENTICATION

Because this is an internal tool, add authentication.

Version 1 can use:

```text
Email + Password
```

or Supabase Auth.

The dashboard must not be publicly accessible.

Only authenticated users should access:

- scan controls
- source configuration
- post database
- logs
- analytics

---

# 56. AUTHORIZATION

Create roles:

```text
Admin
Viewer
```

Admin:

- configure source
- scan
- delete data
- modify categories
- export data

Viewer:

- view dashboard
- search
- view posts
- view analytics

---

# 57. API SECURITY

All sensitive operations must be server-side.

Never expose:

```text
database password
Supabase service role key
scraper credentials
```

to the browser.

---

# 58. API ROUTES

Suggested routes:

```text
GET  /api/dashboard/summary

GET  /api/dashboard/categories

GET  /api/posts

GET  /api/posts/[id]

GET  /api/categories

POST /api/scan/today

POST /api/scan/30-days

POST /api/scan/category

GET  /api/scans

GET  /api/scans/[id]

GET  /api/health
```

---

# 59. SCAN JOB ARCHITECTURE

Do not perform a very large 30-day scrape inside a normal browser request if it can take a long time.

Use background jobs.

Architecture:

```text
User
 ↓
POST /api/scan/30-days
 ↓
Create Scan Job
 ↓
Background Worker
 ↓
Scraper
 ↓
Database
 ↓
Job Status
 ↓
Dashboard polls/subscribes
```

The UI should show:

```text
Scanning...

Category: Latest Jobs
Page: 4
Posts discovered: 86
New posts: 17
```

---

# 60. SCAN STATUS

Possible states:

```text
queued
running
completed
failed
cancelled
```

---

# 61. RETRY SYSTEM

If a particular page fails:

```text
Retry up to 2–3 times
```

with backoff.

If it continues failing:

```text
Log error
Continue scanning other pages/categories
```

Do not allow one failed URL to stop the entire scan.

---

# 62. SCAN SUMMARY

After scanning show:

```text
Scan Completed

Categories scanned: 7
Pages scanned: 38
Posts discovered: 142
New posts: 27
Existing posts: 115
Failed pages: 2
Duration: 38 seconds
```

---

# 63. DATA FRESHNESS

Show:

```text
Last Scan:
23 Aug 2026, 06:20 AM
```

and:

```text
Data coverage:
Last 30 days
```

---

# 64. AUTOMATIC SCANNING

Version 1 should primarily support manual scanning.

Future version:

```text
Automatic Daily Scan
```

Example:

```text
Every day at 8:00 AM
```

The system runs:

```text
SCAN TODAY
```

automatically.

---

# 65. MANUAL SCAN CONTROL

Allow:

```text
Run Now
Cancel
Retry Failed
```

Do not run multiple identical scans simultaneously.

If a scan is already running:

```text
A scan is already in progress.
```

---

# 66. DATA RETENTION

Default:

```text
30 days
```

However, recommended architecture should allow storing more than 30 days.

Add configuration:

```text
Retention:
30 days
60 days
90 days
1 year
Unlimited
```

The dashboard can default to 30 days.

---

# 67. DATA EXPORT

Provide:

```text
Export CSV
```

Filters should apply to exports.

Example columns:

```text
Title
Category
Published Date
Detected Date
Source URL
Status
```

---

# 68. OPTIONAL JSON EXPORT

Also allow:

```text
Export JSON
```

for future integrations.

---

# 69. DASHBOARD LAYOUT

Recommended structure:

```text
┌──────────────────────────────────────────────┐
│ Government Content Intelligence              │
│ Source: Government Result Website             │
├──────────────────────────────────────────────┤
│                                              │
│ [SCAN TODAY] [SCAN 30 DAYS] [LAST SCAN]      │
│                                              │
├──────────┬──────────┬──────────┬─────────────┤
│ TODAY    │ YESTERDAY│ 7 DAYS   │ 30 DAYS     │
│ 24       │ 31       │ 186      │ 824         │
├──────────┴──────────┴──────────┴─────────────┤
│                                              │
│ Posts by Category                            │
│                                              │
│ Latest Jobs       8 today      218 / 30 days │
│ Results           6 today      186 / 30 days │
│ Admit Card        4 today      103 / 30 days │
│ Answer Key        2 today       71 / 30 days │
│                                              │
├──────────────────────────────────────────────┤
│ Posts by Date                                │
│                                              │
│ 23 Aug 2026     24                           │
│ 22 Aug 2026     31                           │
│ 21 Aug 2026     27                           │
│ ...                                          │
├──────────────────────────────────────────────┤
│ Latest Discovered Posts                      │
│                                              │
│ NEW  Railway Apprentice Recruitment          │
│      Latest Jobs · 23 Aug 2026 [OPEN]        │
│                                              │
│ NEW  SSC Recruitment                         │
│      Latest Jobs · 23 Aug 2026 [OPEN]        │
└──────────────────────────────────────────────┘
```

---

# 70. RESPONSIVE DESIGN

Must work on:

- Desktop
- Laptop
- Tablet
- Mobile

The dashboard should not require horizontal scrolling on mobile.

---

# 71. VISUAL DESIGN

Use a professional SaaS-style dashboard.

Recommended:

- White background
- Dark text
- Subtle borders
- Rounded cards
- Clear typography
- Compact tables
- Green success states
- Red errors
- Blue/neutral information states

Avoid excessive animations.

The application is an analytics tool, not a marketing website.

---

# 72. ERROR STATES

Examples:

### Source unavailable

```text
Unable to reach the source website.
Please try again later.
```

### No posts found

```text
No new posts were found for today.
```

### Scan failure

```text
The scan could not be completed.
Check the scan log for details.
```

### Authentication error

```text
Your session has expired. Please log in again.
```

---

# 73. EMPTY STATES

If today has zero posts:

```text
No posts discovered today.

Run another scan or check the source configuration.
```

---

# 74. OBSERVABILITY

Maintain:

- scan logs
- scraper errors
- request counts
- duration
- new post counts
- duplicate counts
- category counts

Admin should be able to inspect scan history.

---

# 75. HEALTH CHECK

Create:

```text
/api/health
```

Check:

```text
Application
Database
Authentication
Scraper
Source Website
```

Dashboard status:

```text
Application     Healthy
Database        Healthy
Source          Reachable
Scraper         Ready
```

---

# 76. SCRAPER ADAPTER ARCHITECTURE

Do not build scraping logic directly into the dashboard API.

Create:

```text
ScraperEngine
```

and:

```text
SourceAdapter
```

Architecture:

```text
Scan Controller
      ↓
Scraper Engine
      ↓
Source Adapter
      ↓
Parser
      ↓
Normalizer
      ↓
Database
```

This makes it possible to add another source later.

---

# 77. SOURCE ADAPTER

Create a configurable adapter for the initial target website.

It should contain:

- category selectors
- post link selector
- title selector
- date selector
- pagination logic
- category mapping

Do not scatter selectors across the application.

Keep them centralized.

---

# 78. PARSER

The parser should receive HTML and return structured data:

```json
{
  "title": "...",
  "url": "...",
  "publishedAt": "...",
  "category": "...",
  "dateSource": "json_ld"
}
```

The parser should not directly write to the database.

---

# 79. NORMALIZATION

Normalize:

- URLs
- whitespace
- dates
- titles
- category names

before database insertion.

---

# 80. DATA VALIDATION

Before insertion:

```text
title must exist
URL must be valid
published date must be parseable or fallback used
category must be valid or "Other"
```

Invalid records should be logged, not crash the scan.

---

# 81. DUPLICATE INSERT PROTECTION

Even if two scraper processes discover the same post simultaneously, the database must prevent duplicate insertion through a unique constraint.

Application-level duplicate checking alone is not enough.

Use both:

```text
Application check
+
Database unique constraint
```

---

# 82. PERFORMANCE

Do not:

- load all 30-day posts into memory
- request every source page repeatedly
- run unlimited concurrent HTTP requests
- scan all historical pages during daily scans

Use:

- pagination
- incremental discovery
- caching
- database indexes
- early stopping
- controlled concurrency

---

# 83. DATABASE INDEXES

At minimum index:

```text
source_url_hash
published_at
category_id
detected_at
created_at
```

For frequent date/category queries use composite indexes where appropriate.

Example:

```text
(category_id, published_at)
```

---

# 84. SEARCH PERFORMANCE

Title search should use database-supported search/indexing.

Do not retrieve all rows into JavaScript and filter them client-side.

Filtering must happen server-side.

---

# 85. SECURITY

Implement:

- secure authentication
- CSRF protection
- server-side authorization
- parameter validation
- SQL injection protection
- XSS protection
- rate limiting
- secure cookies/session handling
- secret management
- secure headers where appropriate

---

# 86. SCRAPER SAFETY

The scraper must only access configured target domains.

Do not allow arbitrary user-supplied URLs to become unrestricted server-side fetch targets.

This prevents SSRF vulnerabilities.

---

# 87. DOMAIN ALLOWLIST

Configure:

```text
Allowed Source Domains
```

Only requests to those domains should be permitted.

---

# 88. ROBOTS AND TERMS

The scraper should check and respect applicable:

- robots.txt
- rate limits
- website terms
- access restrictions

Do not bypass CAPTCHA, authentication, paywalls, or other technical access controls.

The tool is intended for publicly accessible content.

---

# 89. NO CONTENT REWRITING

The application should not automatically copy entire source articles.

Store metadata and provide the original URL.

This keeps the product focused on monitoring and analytics.

---

# 90. TESTING STRATEGY

Test:

### Unit tests

- URL normalization
- date parsing
- category matching
- duplicate detection
- date range logic

### Integration tests

- scraper
- database
- API
- authentication

### End-to-end tests

- login
- scan
- results
- category click
- post opening
- filters

---

# 91. CRITICAL TEST CASES

### Test 1 — New post

Source has new post.

Expected:

```text
Inserted once
```

### Test 2 — Existing post

Same URL scanned again.

Expected:

```text
No duplicate
```

### Test 3 — Updated post

Same URL but title/date changes.

Expected:

```text
Existing record updated where appropriate
```

### Test 4 — Today scan

Post from yesterday.

Expected:

```text
Not inserted as today's new post
```

### Test 5 — 30-day scan

Post from 20 days ago.

Expected:

```text
Included
```

### Test 6 — Old post

Post from 45 days ago.

Expected:

```text
Excluded from 30-day scan
```

### Test 7 — Category

Post belongs to Admit Card.

Expected:

```text
Admit Card
```

### Test 8 — Missing category

Expected:

```text
Other
```

### Test 9 — Missing date

Use fallback:

```text
detected_at
```

and mark low confidence.

### Test 10 — Source failure

One category fails.

Expected:

```text
Other categories continue scanning.
```

---

# 92. ACCEPTANCE CRITERIA

The product is considered complete only when:

- User can log in.
- User can configure the target source.
- User can configure categories.
- User can run Scan Today.
- User can run Scan Last 30 Days.
- Only new posts are inserted during incremental scans.
- Duplicate URLs never create duplicate records.
- Posts are categorized.
- Dates are extracted.
- Today count works.
- Yesterday count works.
- 7-day count works.
- 30-day count works.
- Category counts work.
- Date-wise counts work.
- Posts appear newest-first.
- Post titles are clickable.
- Source URLs open correctly.
- Scan history works.
- Errors are logged.
- Failed pages do not crash the complete scan.
- Dashboard is responsive.
- Authentication works.
- Database credentials remain server-side.
- Scraper does not make uncontrolled requests.
- CSV export works.
- Application can be deployed to production.

---

# 93. FUTURE FEATURES

Do not implement these unless explicitly requested, but architect for them.

## Multiple Source Websites

```text
Source A
Source B
Source C
```

## Competitor Comparison

```text
Source A: 24 posts
Source B: 31 posts
My Website: 18 posts
```

## Content Gap Analysis

Identify topics published by monitored sources but not covered on the user's website.

## Automated Alerts

```text
New Railway vacancy detected
```

## Telegram/Email/WhatsApp notifications

## AI-powered category detection

## AI-powered title/topic clustering

## Trending topic detection

## State-wise analysis

## Department-wise analysis

## Historical 6-month / 1-year analytics

---

# 94. FUTURE CONTENT GAP FEATURE

A future version can compare:

```text
Monitored Source
        ↓
New Post
        ↓
Check user's own website
        ↓
Matching post exists?
      /     \
    YES      NO
     ↓        ↓
Covered    Content Gap
```

Example:

```text
New source post:
Railway Apprentice Recruitment 2026

Your website:
No matching post found

Status:
CONTENT GAP
```

This would become a powerful editorial intelligence feature.

---

# 95. RECOMMENDED TECH STACK

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

## Backend

```text
Next.js Server/API
TypeScript
```

## Scraping

```text
Axios or Fetch
Cheerio
```

Optional later:

```text
Playwright
```

only when JavaScript-rendered pages genuinely require a browser.

## Database

```text
Supabase PostgreSQL
```

## Authentication

```text
Supabase Auth
```

## Hosting

Suitable options include:

```text
Vercel
```

for the Next.js application and:

```text
Supabase
```

for the database.

The scraper architecture should be designed carefully for serverless execution limits; if scraping jobs become large, move the worker to a persistent/background execution environment.

---

# 96. WHY THIS STACK

This stack is recommended because it gives:

- fast development
- TypeScript end-to-end
- easy dashboard development
- PostgreSQL reliability
- managed authentication
- scalable architecture
- easy future AI integration
- clean separation between UI and scraper
- easy deployment

Do not introduce unnecessary technologies.

Version 1 should remain simple.

---

# 97. FINAL SYSTEM ARCHITECTURE

```text
                    ┌───────────────────────┐
                    │      USER / ADMIN     │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │      Next.js UI       │
                    │                       │
                    │ Dashboard             │
                    │ Categories            │
                    │ Posts                 │
                    │ Scan Controls         │
                    │ Analytics             │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    Next.js API        │
                    └───────────┬───────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
          ┌────────────┐ ┌────────────┐ ┌─────────────┐
          │ Scraper    │ │ Analytics  │ │ Auth        │
          │ Engine     │ │ Engine     │ │             │
          └─────┬──────┘ └─────┬──────┘ └─────────────┘
                │              │
                ▼              │
        ┌──────────────┐       │
        │ Source       │       │
        │ Adapter      │       │
        └──────┬───────┘       │
               │               │
               ▼               │
        ┌──────────────┐       │
        │ Parser       │       │
        └──────┬───────┘       │
               │               │
               ▼               │
        ┌──────────────┐       │
        │ Normalizer   │       │
        └──────┬───────┘       │
               │               │
               ▼               │
        ┌──────────────┐       │
        │ Dedup Engine │       │
        └──────┬───────┘       │
               │               │
               └───────┬───────┘
                       ▼
             ┌────────────────────┐
             │ Supabase PostgreSQL│
             │                    │
             │ Sources            │
             │ Categories         │
             │ Posts              │
             │ Scan Runs          │
             │ Scan Errors        │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Analytics Engine   │
             │                    │
             │ Today              │
             │ Yesterday          │
             │ 7 Days             │
             │ 30 Days            │
             │ Category Stats     │
             │ Date Stats         │
             └─────────┬──────────┘
                       │
                       ▼
                 Dashboard
```

---

# 98. MOST IMPORTANT BUSINESS LOGIC

The core business logic is:

```text
SCAN TODAY
    ↓
Discover current source posts
    ↓
Extract published dates
    ↓
Keep today's posts
    ↓
Normalize URL
    ↓
Check database
    ↓
If URL exists:
    Do not create duplicate
    Update check timestamp

If URL does not exist:
    Create new post record
    Mark as NEW
    Assign category
```

For 30-day scanning:

```text
SCAN LAST 30 DAYS
    ↓
Discover historical posts
    ↓
Keep posts within 30-day range
    ↓
Normalize
    ↓
Deduplicate
    ↓
Insert missing records
    ↓
Update existing records
```

---

# 99. GOLDEN RULES

The implementation must follow these rules:

### Rule 1

Never duplicate a post.

### Rule 2

The source URL is the primary identity of a post.

### Rule 3

Published date and detected date must remain separate.

### Rule 4

Today's scan must prioritize new content.

### Rule 5

30-day analytics must come from the database.

### Rule 6

The dashboard must never depend on re-scraping everything just to display historical statistics.

### Rule 7

A failed page must not stop the entire scan.

### Rule 8

Do not expose database secrets.

### Rule 9

Do not make uncontrolled scraping requests.

### Rule 10

Do not copy entire articles unnecessarily.

### Rule 11

All dashboard numbers must be generated from real database records.

### Rule 12

The system must be designed so another source website can be added later.

---

# 100. FINAL DEFINITION OF DONE

The final application should feel like a professional internal SaaS dashboard.

The user should be able to:

```text
Login
  ↓
Open Dashboard
  ↓
See today's statistics
  ↓
Click SCAN TODAY
  ↓
Wait for scan
  ↓
See newly discovered posts
  ↓
See category-wise counts
  ↓
Click a category
  ↓
See all posts
  ↓
Click a post
  ↓
Open original source
```

And for historical analysis:

```text
Open Dashboard
  ↓
Select Last 30 Days
  ↓
See total posts
  ↓
See category breakdown
  ↓
See date-wise breakdown
  ↓
Click any date
  ↓
See all posts from that date
```

The system should provide a reliable answer to:

> **"What did the monitored website publish today, yesterday, and during the last 30 days, and which categories were most active?"**

The architecture must also provide a foundation for a future:

**Content Gap & Editorial Intelligence System**

that can identify which newly published topics are not yet covered on the user's own website.