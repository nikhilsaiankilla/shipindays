/**
 * SHIPINDAYS — ROBOTS
 *
 * Next.js auto-serves this at /robots.txt
 * Blocks crawlers from private/auth routes, allows everything else.
 */

import type { MetadataRoute } from "next";
import { SITE } from "@/src/lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // Add private routes to block here
                disallow: [
                    "/dashboard",
                    "/settings",
                    "/api/",
                ],
            },
        ],
        sitemap: `${SITE.url}/sitemap.xml`,
    };
}