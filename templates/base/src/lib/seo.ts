/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                  SHIPINDAYS CENTRALISED SEO                      ║
 * ║                                                                  ║
 * ║  Usage (any page or layout):                                     ║
 * ║                                                                  ║
 * ║  // 1. Use site defaults (home page)                             ║
 * ║  export const metadata = buildMetadata();                        ║
 * ║                                                                  ║
 * ║  // 2. Override specific fields (any other page)                 ║
 * ║  export const metadata = buildMetadata({                         ║
 * ║    title:       "Privacy Policy",                                ║
 * ║    description: "How we handle your data.",                      ║
 * ║    path:        "/privacy",                                      ║
 * ║  });                                                             ║
 * ║                                                                  ║
 * ║  // 3. Blog / dynamic routes                                     ║
 * ║  export async function generateMetadata({ params }) {            ║
 * ║    return buildMetadata({                                        ║
 * ║      title:       post.title,                                    ║
 * ║      description: post.excerpt,                                  ║
 * ║      path:        `/blog/${params.slug}`,                        ║
 * ║      image:       post.coverImage,                               ║
 * ║    });                                                           ║
 * ║  }                                                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { Metadata } from "next";

// SITE-WIDE DEFAULTS
//
// Edit these once — they propagate to every page that calls buildMetadata()
// without overriding that field.
const SITE = {
    /** Canonical base URL — no trailing slash */
    url: "https://shipindays.nikhilsai.in",

    /** Site / brand name shown after the page title separator */
    name: "Shipindays",

    /** Default <title> used on the home page */
    title: "Shipindays — Ship Your Startup in Days, Not Weeks",

    /** Default meta description (keep under 160 chars for Google) */
    description:
        "The ultimate open-source Next.js SaaS engine. Clone once, configure your providers, and go live with auth, payments, emails, and SEO in minutes.",

    /** Default OG / Twitter card image (1200×630 recommended) */
    ogImage: "/og-default.png",

    /** Twitter handle (with @) */
    twitterHandle: "@itzznikhilsai",

    /** Separator between page title and site name, e.g. "Privacy Policy | Shipindays" */
    titleSeparator: " | ",

    /** Primary locale */
    locale: "en_US",

    /** Keywords relevant across the whole site */
    keywords: [
        "SaaS boilerplate",
        "Next.js starter",
        "open source SaaS",
        "ship in days",
        "Supabase starter",
        "Stripe starter",
        "Next.js 15",
        "SaaS engine",
        "shipindays",
    ],
} as const;

// TYPES
export interface SEOProps {
    /**
     * Page-specific title.
     * - On the home page, omit this — SITE.title is used as-is.
     * - On any other page, this becomes: "<title> | Shipindays"
     */
    title?: string;

    /** Page-specific description. Falls back to SITE.description. */
    description?: string;

    /**
     * Canonical path relative to the site root, e.g. "/privacy" or "/blog/my-post".
     * Used to build the full canonical URL and OG url.
     * Defaults to "" (home page).
     */
    path?: string;

    /**
     * Absolute URL or root-relative path to the OG image.
     * Falls back to SITE.ogImage.
     * Recommended size: 1200×630px.
     */
    image?: string;

    /**
     * Extra keywords merged with the site-wide keyword list.
     * Useful for blog posts or feature-specific pages.
     */
    keywords?: string[];

    /**
     * Set to true for pages you never want indexed (e.g. /dashboard, /settings).
     * Adds noindex, nofollow robots directives.
     */
    noIndex?: boolean;
}

// buildMetadata()
//
// The single function you call from every page/layout.
// Returns a fully-typed Next.js Metadata object.
export function buildMetadata(props: SEOProps = {}): Metadata {
    const {
        title,
        description = SITE.description,
        path = "",
        image = SITE.ogImage,
        keywords = [],
        noIndex = false,
    } = props;

    // Build the final <title> string
    // - Home page (no title prop): use SITE.title verbatim
    // - All other pages: "Page Title | Shipindays"
    const resolvedTitle = title
        ? `${title}${SITE.titleSeparator}${SITE.name}`
        : SITE.title;

    // Build absolute URLs
    const canonicalUrl = `${SITE.url}${path}`;
    const imageUrl = image.startsWith("http") ? image : `${SITE.url}${image}`;

    // Merge keyword lists (deduplicated)
    const allKeywords = Array.from(new Set([...SITE.keywords, ...keywords]));

    return {
        // Basic
        title: resolvedTitle,
        description,
        keywords: allKeywords,
        authors: [{ name: "Nikhil Sai Ankilla", url: "https://nikhilsai.in" }],
        creator: "Nikhil Sai Ankilla",
        publisher: SITE.name,

        // Canonical
        alternates: {
            canonical: canonicalUrl,
        },

        // Robots
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true, googleBot: { index: true, follow: true } },

        // Open Graph
        openGraph: {
            title: resolvedTitle,
            description,
            url: canonicalUrl,
            siteName: SITE.name,
            locale: SITE.locale,
            type: "website",
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: resolvedTitle,
                },
            ],
        },

        // Twitter / X Card
        twitter: {
            card: "summary_large_image",
            title: resolvedTitle,
            description,
            site: SITE.twitterHandle,
            creator: SITE.twitterHandle,
            images: [imageUrl],
        },

        // App / PWA manifest
        applicationName: SITE.name,
        metadataBase: new URL(SITE.url),

        // Verification tokens
        // Uncomment and fill in after verifying in each platform's console.
        // verification: {
        //   google:  "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
        //   yandex:  "YOUR_YANDEX_VERIFICATION_TOKEN",
        // },
    };
}

// buildArticleMetadata()
//
// Convenience wrapper for blog posts and docs pages.
// Extends buildMetadata() with article-specific OG fields.
//
// Usage:
//   export async function generateMetadata({ params }) {
//     return buildArticleMetadata({
//       title:         post.title,
//       description:   post.excerpt,
//       path:          `/blog/${params.slug}`,
//       image:         post.coverImage,
//       publishedTime: post.publishedAt,   // ISO 8601
//       modifiedTime:  post.updatedAt,     // ISO 8601
//       tags:          post.tags,
//     });
//   }
export interface ArticleSEOProps extends SEOProps {
    /** ISO 8601 publish date, e.g. "2025-03-01T00:00:00Z" */
    publishedTime?: string;
    /** ISO 8601 last-modified date */
    modifiedTime?: string;
    /** Article tags / categories */
    tags?: string[];
}

export function buildArticleMetadata(props: ArticleSEOProps): Metadata {
    const { publishedTime, modifiedTime, tags = [], ...rest } = props;

    const base = buildMetadata({ ...rest, keywords: [...(rest.keywords ?? []), ...tags] });

    return {
        ...base,
        openGraph: {
            ...base.openGraph,
            type: "article",
            publishedTime,
            modifiedTime,
            tags,
            authors: ["https://nikhilsai.in"], // replace with your social 
        },
    };
}

// RE-EXPORT SITE CONFIG
// Useful if you need SITE.url or SITE.name elsewhere (e.g. sitemap.ts).
export { SITE }