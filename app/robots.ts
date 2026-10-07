import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Logged-in app, account flows and one-off pages: nothing here for search results.
      disallow: [
        "/api/",
        "/admin/",
        "/onboarding/",
        "/dashboard",
        "/bookkeeper",
        "/accept-invite",
        "/forgot-password",
        "/reset-password",
        "/pay",
        "/upload",
        "/success",
        "/subscribe",
        "/qr",
      ],
    },
    sitemap: "https://lead2project.com/sitemap.xml",
  };
}