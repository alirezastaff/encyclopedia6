# SSE Encyclopedia Core

This plugin is the WordPress backend for the existing Next.js encyclopedia. It owns the `sse_article` post type, article taxonomies, private reading data, highlights, private notes, and the `/wp-json/sse/v1/` API.

## Installation

1. Copy this directory to `wp-content/plugins/`.
2. Activate it from the WordPress dashboard.
3. Visit Settings > Permalinks and save once.
4. Install/configure Polylang Pro or WPML for the `en` and `fa` article translations.
5. Activate the SSE Encyclopedia theme.

Activation creates tables but never deletes them. Deactivation only flushes rewrite rules. The existing Next.js project remains the source of truth until migration is explicitly cut over.

## API authentication

The frontend uses WordPress REST cookie authentication and the `wp_rest` nonce. Every private route checks the logged-in WordPress user before reading or mutating data.

## Country Explorer content

The WordPress dashboard now includes a **Country Explorer** content section. Create a **Country Profile**, set its three-letter ISO A3 code (for example `USA`), add a short snapshot in the details box, and write the full country article in the main editor. Published profiles are available to the Next.js frontend at `/wp-json/sse/v1/countries`.

Set `NEXT_PUBLIC_WORDPRESS_URL` in the Next.js environment when WordPress is hosted on a different origin. When it is omitted, the frontend tries the same origin and keeps its local fallback profiles available.

The Country Profile editor includes independent English and Persian titles, summaries, and full articles; ISO A3 identity, optional Persian country name, map visibility/status, coordinates, publication toggles, translation status, editor/reviewer metadata, indicator JSON, and source JSON. The public endpoint accepts `?locale=en` or `?locale=fa` and only returns profiles published for that language.

## Impact Calculator administration

The WordPress dashboard includes an **Impact Calculator** menu with four areas:

- **Settings:** bilingual titles, currency codes, number locales, and displayed formulas. The default Persian currency is IRR and the English currency is USD; no automatic exchange-rate conversion is performed.
- **Variables:** bilingual labels, help text, units, defaults, minimum/maximum validation, required state, and enabled state for budgets, outputs, proxies, and attribution adjustments.
- **Scenarios:** reusable English and Persian input sets stored as private `Impact Scenario` entries.
- **Reports:** saved calculation snapshots with language, scenario reference, investment, net value, social/environmental/economic breakdown, adjustment factor, ratio, and source assumptions.

Activate or update the plugin, then open **Impact Calculator** in the WordPress dashboard. Settings and variables are stored in WordPress options; scenarios and reports use private post types and are not public-facing.

## Encyclopedia editorial panel

The dashboard also includes an **SSE Encyclopedia** menu for editorial management:

- **Dashboard:** entry counts by language, recent changes, and translation/review items needing attention.
- **Entries:** bilingual English/Persian title, description, and full-content editors, with archive page, author, and translation-group metadata.
- **Workflow:** translation status, review status, reviewer, and review date for each entry.
- **Related content:** related entry slugs and references stored with the article.
- **Parts and sections:** manage the `sse_part` taxonomy used by the archive hierarchy.
- **Entry list tools:** language filtering and columns for language, part, page, translation status, and review status.

## Case Studies

The dashboard includes a bilingual **Case Studies** content section. Each case study is one shared record with English and Persian titles, locations, category labels, summaries, types, full editors, independent publication toggles, and a separate PDF attachment for each language. PDFs are selected from the WordPress Media Library and are exposed through the public endpoint only when that language is published.

The public API is available at `/wp-json/sse/v1/case-studies?locale=en` or `?locale=fa`. The Next.js Case Studies Hub uses this endpoint when `NEXT_PUBLIC_WORDPRESS_URL` is configured and keeps its local sample records as a migration fallback.

The panel stores editorial fields as post metadata on `sse_article`. The record's selected language is synchronized to the regular WordPress title, excerpt, and content so the existing theme and REST consumers continue to work. Keep the same translation-group ID on the English and Persian records when they represent one entry.

## Homepage administration

The **SSE Encyclopedia > Homepage** screen manages the public `/fa` and `/en` pages independently. It includes brand text, navigation, hero copy and buttons, search panel labels, numbered highlights, the translation-project introduction, translator/researcher text, goals and activities, feature cards, and footer links. Repeatable groups are edited as JSON rows with an `enabled` flag so items can be added, removed, reordered, or hidden without changing the Next.js code.

The frontend reads the published content from `/wp-json/sse/v1/homepage?locale=fa` or `?locale=en`. If WordPress is unavailable or the option has not been configured, the built-in defaults in `lib/homepage.ts` keep both pages available.
