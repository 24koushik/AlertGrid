import React, { useEffect, useState } from "react";
import { Newspaper, AlertCircle, ExternalLink } from "lucide-react";
import api from "../../services/api";

export function LiveNews({ communityName }: { communityName: string }) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Build a query prioritizing the community location + disaster keywords
        const query = `${communityName} disaster OR weather OR emergency OR climate`;
        const res = await api.get(
          `/external/news?query=${encodeURIComponent(query)}`,
        );
        setNews(res.data.news);
        setError("");
      } catch (err: any) {
        if (err.response?.status === 503) {
          setError("Live news unavailable — API not configured.");
        } else {
          setError("Live news temporarily unavailable.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (communityName) fetchNews();
  }, [communityName]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-4 space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-16 bg-slate-100 rounded w-full"></div>
        <div className="h-16 bg-slate-100 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-4 flex items-start space-x-3 text-slate-500">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-4 text-center text-slate-500 text-sm">
        No recent local emergency news found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
        <Newspaper className="w-4 h-4 mr-2" />
        Local Emergency News
      </h3>
      <div className="space-y-4">
        {news.map((article, idx) => (
          <a
            key={idx}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 line-clamp-2 pr-4">
                {article.title}
              </h4>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
            </div>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <span>{article.source}</span>
              <span className="mx-1">•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
