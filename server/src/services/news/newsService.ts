import { redisService } from "../redisService";

export class NewsService {
  async getNews(query: string) {
    const safeQuery = query
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
    const cacheKey = `news:${safeQuery}`;

    const cached = await redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      // Optional fallback if no API key is provided
      return [];
    }

    try {
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&apikey=${apiKey}&max=5`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (!res.ok) throw new Error("GNews API error");

      const data = await res.json();
      const articles = data.articles.map((a: any) => ({
        title: a.title,
        source: a.source.name,
        publishedAt: a.publishedAt,
        url: a.url,
        description: a.description,
        image: a.image,
      }));

      await redisService.set(cacheKey, JSON.stringify(articles), 3600);
      return articles;
    } catch (error: any) {
      console.error("News API Error:", error.message);
      return []; // graceful fallback
    }
  }
}

export const newsService = new NewsService();
