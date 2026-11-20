import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://repairdesk.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/login", "/register", "/track/"],
        disallow: [
          "/dashboard/",
          "/repairs/",
          "/inventory/",
          "/customers/",
          "/payments/",
          "/technician/",
          "/staff/",
          "/settings/",
          "/reports/",
          "/estimates/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
