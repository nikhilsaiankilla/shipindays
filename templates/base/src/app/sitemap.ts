/**
 * SHIPINDAYS — SITEMAP
 *
 * Next.js auto-serves this at /sitemap.xml
 * Add new static routes to STATIC_ROUTES below.
 * For blog posts or dynamic pages, fetch them in the dynamic section.
 */

import type { MetadataRoute } from "next";
import { SITE } from "@/src/lib/seo";

// Static routes
// Add every public page here.
// priority: 1.0 = most important (home), 0.5 = standard, 0.3 = low priority
// changeFrequency: how often Google should re-crawl
const STATIC_ROUTES: MetadataRoute.Sitemap = [
    {
        url: SITE.url,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1.0,
    },
    {
        url: `${SITE.url}/privacy`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
    },
    {
        url: `${SITE.url}/terms`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
    },
    // Add new static pages here
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Dynamic routes (e.g. blog posts)
    // Uncomment and adapt once you have a blog or docs section.
    //
    // const posts = await getAllPosts();
    // const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    //   url:             `${SITE.url}/blog/${post.slug}`,
    //   lastModified:    new Date(post.updatedAt),
    //   changeFrequency: "monthly",
    //   priority:        0.7,
    // }));
    //
    // return [...STATIC_ROUTES, ...blogRoutes];

    return STATIC_ROUTES;
}