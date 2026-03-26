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
    sitemap: "https://www.qorthe.com/sitemap.xml",
  };
}
