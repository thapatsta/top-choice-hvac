import type { MetadataRoute } from "next";
import { services } from "@/data/services";
import { blogOutlines } from "@/data/blog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/service-area`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${site.url}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${site.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${site.url}/rebates`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/promotions`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/financing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/get-quote`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/emergency-service`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${site.url}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogOutlines.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
