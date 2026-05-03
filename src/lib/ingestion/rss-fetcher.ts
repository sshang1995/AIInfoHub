import Parser from "rss-parser";

export interface RssItem {
  title: string;
  url: string;
  publishedAt: Date;
  rawText: string;
  externalId?: string;
}

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "AIInfoHub/1.0 (https://aiinfohub.dev)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

export async function fetchRssFeed(rssUrl: string): Promise<RssItem[]> {
  const feed = await parser.parseURL(rssUrl);

  return feed.items
    .filter((item) => item.link && item.title)
    .map((item) => ({
      title: (item.title ?? "").trim(),
      url: (item.link ?? "").trim(),
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      rawText: stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? ""),
      externalId: item.guid ?? item.link,
    }));
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
