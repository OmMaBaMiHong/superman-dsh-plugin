/**
 * 懂球帝（app tabs 首页资讯流，按发布时间倒序）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/dongqiudi.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, numeric, text } from '../../http.js';

interface DongqiudiArticle {
  id?: number | string;
  title?: string;
  share?: string;
  url?: string;
  category?: string;
  comments_total?: number;
  created_at?: string;
}

interface DongqiudiResponse {
  articles?: DongqiudiArticle[];
}

export const dongqiudiNews: HotboardReader = {
  id: 'dongqiudi',
  name: '懂球帝',
  homeUrl: 'https://www.dongqiudi.com/',
  category: 'entertainment',
  async read() {
    const json = await fetchJson<DongqiudiResponse>('https://api.dongqiudi.com/app/tabs/web/1.json');
    // created_at 是 "YYYY-MM-DD HH:mm:ss"，字典序倒序即时间倒序。
    const articles = [...(json.articles ?? [])].sort((a, b) => text(b.created_at).localeCompare(text(a.created_at)));
    return articles
      .map((article): ReaderItem | null => {
        const title = text(article.title);
        if (!title) return null;
        const id = article.id === undefined || article.id === null ? '' : String(article.id);
        const comments = numeric(article.comments_total);
        return {
          title,
          url: text(article.share) || text(article.url) || (id ? `https://www.dongqiudi.com/article/${id}` : 'https://www.dongqiudi.com/'),
          heatLabel: comments ? `${comments} 评论` : null,
          summary: text(article.category) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
