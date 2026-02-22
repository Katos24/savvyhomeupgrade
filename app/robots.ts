import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/onboarding/"],
    },
    sitemap: "https://lead2project.com/sitemap.xml",
  };
}