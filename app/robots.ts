import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/auth", "/account"],
      },
    ],
    sitemap: "https://www.davidsonsdesign.com/sitemap.xml",
  };
}
