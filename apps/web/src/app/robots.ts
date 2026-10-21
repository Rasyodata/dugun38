import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL ?? process.env.RENDER_EXTERNAL_URL ?? "https://dugun38.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/hesabim", "/firma-paneli", "/admin", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
