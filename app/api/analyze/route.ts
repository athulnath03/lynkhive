/**
 * app/api/analyze/route.ts
 *
 * Server-side URL metadata extractor.
 * Fetches the target URL and parses OG / meta tags.
 *
 * ⚠️  LIMITATION: Many sites (Twitter, LinkedIn, some GitHub pages) block
 * server-side scraping or return bot-detection pages. When that happens,
 * we return empty strings and let the user fill manually.
 */

import { NextRequest, NextResponse } from "next/server";
import { UrlMeta } from "@/types";

function extractMeta(html: string, url: string): UrlMeta {
  // Helper: pull first regex match
  const get = (patterns: RegExp[]): string => {
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
    }
    return "";
  };

  const title = get([
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  const description = get([
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);

  const { hostname } = new URL(url);
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

  return { title, description, favicon };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    // Validate URL
    let parsed: URL;
    try { parsed = new URL(url); } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch with browser-like headers to reduce bot-blocking
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LynkHive/1.0; +https://lynkhive.dev)",
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json<UrlMeta>({ title: "", description: "", favicon: "" });
    }

    // Only parse text/html
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json<UrlMeta>({ title: parsed.hostname, description: "", favicon: "" });
    }

    // Read first 50KB only — title/meta are always in <head>
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      let bytes = 0;
      while (bytes < 50_000) {
        const { done, value } = await reader.read();
        if (done) break;
        html += new TextDecoder().decode(value);
        bytes += value.length;
      }
      reader.cancel();
    }

    const meta = extractMeta(html, url);
    return NextResponse.json<UrlMeta>(meta);
  } catch (err) {
    // Network error, abort, or parse failure — return empty so user can fill manually
    return NextResponse.json<UrlMeta>({ title: "", description: "", favicon: "" });
  }
}
