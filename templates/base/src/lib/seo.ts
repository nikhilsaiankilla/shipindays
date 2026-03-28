/**
 * Centralised SEO configuration and helpers.
 *
 * TEMPLATE NOTE:
 * Replace the SITE config values below with your own domain,
 * brand name, and defaults after cloning this project.
 *
 * This file powers metadata across the entire app.
 */

import type { Metadata } from "next";

/**
 * Global SEO defaults.
 *
 * ⚠️ IMPORTANT:
 * Update these values after cloning:
 * - url
 * - name
 * - title
 * - description
 * - twitterHandle
 */
const SITE = {
    /** 
     * Your production domain (no trailing slash)
     * Example: "https://yourapp.com"
     */
    url: "https://shipindays.nikhilsai.in", // ← replace with your domain

    /** 
     * Your product / company name
     */
    name: "Shipindays", // ← replace with your app name

    /** 
     * Default homepage title
     */
    title: "Shipindays — Ship Your Startup in Days, Not Weeks", // ← customize for your product

    /** 
     * Default meta description (keep under ~160 chars)
     */
    description:
        "The ultimate open-source Next.js SaaS engine. Clone once, configure your providers, and go live with auth, payments, emails, and SEO in minutes.", // ← rewrite for your product

    /** 
     * Default Open Graph image (recommended: 1200×630)
     * Place your image in /public and update path if needed
     */
    ogImage: "/og-default.png",

    /** 
     * Your Twitter/X handle (include @)
     */
    twitterHandle: "@itzznikhilsai", // ← replace with your handle

    /** Separator used in titles */
    titleSeparator: " | ",

    /** Default locale */
    locale: "en_US",

    /**
     * Optional keywords (not critical for SEO, safe to customize or remove)
     */
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

/**
 * Props accepted by buildMetadata().
 */
export interface SEOProps {
    /** Page-specific title (appended to site name) */
    title?: string;

    /** Page-specific description */
    description?: string;

    /**
     * Canonical path relative to root (e.g. "/privacy", "/blog/post")
     */
    path?: string;

    /**
     * OG image (absolute or root-relative)
     */
    image?: string;

    /** Extra keywords for this page */
    keywords?: string[];

    /**
     * Prevent indexing (use for dashboard, auth pages, etc.)
     */
    noIndex?: boolean;
}

/**
 * Core metadata builder used across the app.
 */
export function buildMetadata(props: SEOProps = {}): Metadata {
    const {
        title,
        description = SITE.description,
        path = "",
        image = SITE.ogImage,
        keywords = [],
        noIndex = false,
    } = props;

    const resolvedTitle = title
        ? `${title}${SITE.titleSeparator}${SITE.name}`
        : SITE.title;

    /**
     * Construct canonical + image URLs.
     * Uses SITE.url as the base domain.
     */
    const canonicalUrl = `${SITE.url}${path}`;
    const imageUrl = image.startsWith("http") ? image : `${SITE.url}${image}`;

    const allKeywords = Array.from(new Set([...SITE.keywords, ...keywords]));

    return {
        title: resolvedTitle,
        description,
        keywords: allKeywords,

        /**
         * TEMPLATE NOTE:
         * Update author/creator info to your own identity or company.
         */
        authors: [{ name: "Nikhil Sai Ankilla", url: "https://nikhilsai.in" }], // ← replace
        creator: "Nikhil Sai Ankilla", // ← replace
        publisher: SITE.name,

        alternates: {
            canonical: canonicalUrl,
        },

        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true, googleBot: { index: true, follow: true } },

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

        twitter: {
            card: "summary_large_image",
            title: resolvedTitle,
            description,
            site: SITE.twitterHandle,
            creator: SITE.twitterHandle,
            images: [imageUrl],
        },

        applicationName: SITE.name,

        metadataBase: new URL(SITE.url),
    };
}

/**
 * Extended metadata builder for blog/article pages.
 */
export interface ArticleSEOProps extends SEOProps {
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
}

export function buildArticleMetadata(props: ArticleSEOProps): Metadata {
    const { publishedTime, modifiedTime, tags = [], ...rest } = props;

    const base = buildMetadata({
        ...rest,
        keywords: [...(rest.keywords ?? []), ...tags],
    });

    return {
        ...base,
        openGraph: {
            ...base.openGraph,
            type: "article",
            publishedTime,
            modifiedTime,
            tags,

            /**
             * TEMPLATE NOTE:
             * Replace with your own author profile or organization URL.
             */
            authors: ["https://nikhilsai.in"], // ← replace
        },
    };
}

/**
 * Export SITE config for reuse (e.g. sitemap, feeds)
 */
export { SITE };