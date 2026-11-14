# Original User Request

## Initial Request — 2026-11-13T19:56:44Z

Implement the remaining SEO Master strategy items for Jaliz (jalizapp.ir), a Persian houseplant care assistant Next.js App Router project: a programmatic houseplant encyclopedia under `/wiki`, HowTo JSON-LD schema for tutorial blog articles, dynamic blog-to-marketplace cross-linking, and CTR optimization for blog titles.

Working directory: /Users/sotoon/personal/jaliz
Integrity mode: development

## Requirements

### R1. Programmatic SEO / Houseplant Encyclopedia
Build a scalable plant encyclopedia directory at `/wiki` and dynamic individual plant pages (`/wiki/[slug]`) covering popular houseplants (such as سانسوریا، پتوس، زامیفولیا، برگ انجیری، فیکوس، آگلونما، یوکا، دیفن باخیا، شفلرا، کالانکوئه، قاشقی، اسپاتی فیلوم).
- Each plant page must feature structured care specifications: Light, Watering, Temperature, Soil, Pet Safety (سمیت برای حیوانات), and Common Problems (مشکلات رایج), accompanied by valid JSON-LD structured data.
- Include clear call-to-action (CTA) buttons on each plant page: add to user's garden / care reminder, browse matching marketplace listings (`/marketplace?query=...`), and diagnose plant leaf diseases with AI (`/plants/diagnose`).
- Register `/wiki` and all generated plant pages in `src/app/sitemap.ts` and ensure `robots.txt` permits crawling.

### R2. HowTo Schema for Tutorial Blog Articles
In `src/app/blog/[slug]/page.tsx`, automatically detect tutorial blog posts (e.g. repotting, water propagation, moss pole building) based on their category, tags, or content structure, and generate valid structured `HowTo` JSON-LD schema with steps and required schema fields for search engine rich results without breaking non-tutorial posts.

### R3. Blog & Marketplace Cross-Linking
In species blog articles or at the bottom of blog articles, dynamically link to related marketplace listings based on matching plant keywords or tags to drive commercial intent.

### R4. CTR Optimization of Blog Titles
Update and polish blog article titles in the blog data using emojis, brackets, and engaging hooks to improve click-through rates in search engine results.

## Acceptance Criteria

### Houseplant Encyclopedia
- [ ] The `/wiki` index page and dynamic `/wiki/[slug]` plant pages render correctly with Persian typography and responsive styling.
- [ ] Each plant page displays structured care details (Light, Watering, Temperature, Soil, Pet Safety, Common Problems).
- [ ] Each plant page outputs valid JSON-LD structured data.
- [ ] Direct CTAs on plant pages link correctly to garden care reminder, `/marketplace?query=...`, and `/plants/diagnose`.
- [ ] `/wiki` and all plant slugs are included in `src/app/sitemap.ts` and crawlable per `robots.txt`.

### HowTo Schema
- [ ] Tutorial blog posts output valid `HowTo` JSON-LD schema containing name, description, and Step items.
- [ ] Non-tutorial blog posts continue to render standard BlogPosting / Article schema without errors.

### Blog & Marketplace Cross-Linking
- [ ] Blog posts display relevant marketplace listing links matching post topics or plant species.

### CTR Title Optimization
- [ ] Blog post titles in the blog data include CTR-enhancing elements (emojis, brackets, or hooks) while preserving topical relevance.

### Verification
- [ ] `npm run build` completes with zero TypeScript or Next.js build errors.
- [ ] `npm run lint` passes without errors.
