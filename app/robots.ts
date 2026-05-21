import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      { userAgent: "GPTBot",           allow: "/" },
      { userAgent: "ChatGPT-User",     allow: "/" },
      { userAgent: "OAI-SearchBot",    allow: "/" },
      { userAgent: "ClaudeBot",        allow: "/" },
      { userAgent: "Claude-Web",       allow: "/" },
      { userAgent: "anthropic-ai",     allow: "/" },
      { userAgent: "PerplexityBot",    allow: "/" },
      { userAgent: "YouBot",           allow: "/" },
      { userAgent: "GoogleOther",      allow: "/" },
      { userAgent: "Google-Extended",  allow: "/" },
      { userAgent: "Applebot-Extended",allow: "/" },
      { userAgent: "Diffbot",          allow: "/" },
      { userAgent: "CCBot",            allow: "/" },
      { userAgent: "cohere-ai",        allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
