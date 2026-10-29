/**
 * 豆瓣热门电影（最近热门）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/douban.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, numeric, text } from '../../http.js';

interface DoubanMovie {
  id?: string;
  title?: string;
  card_subtitle?: string;
  rating?: {
    value?: number;
    count?: number;
  };
}

interface DoubanResponse {
  items?: DoubanMovie[];
}

export const doubanHotMovies: HotboardReader = {
  id: 'douban',
  name: '豆瓣热门',
  homeUrl: 'https://movie.douban.com/',
  category: 'entertainment',
  async read() {
    const json = await fetchJson<DoubanResponse>('https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie', {
      headers: {
        referer: 'https://movie.douban.com/',
        accept: 'application/json, text/plain, */*',
      },
    });
    return (json.items ?? [])
      .map((movie): ReaderItem | null => {
        const title = text(movie.title);
        const id = text(movie.id);
        if (!title) return null;
        const score = numeric(movie.rating?.value);
        const votes = numeric(movie.rating?.count);
        const metrics = [score ? `${score} 分` : '', votes ? `${votes} 人评价` : ''].filter(Boolean);
        return {
          title,
          url: id ? `https://movie.douban.com/subject/${id}` : 'https://movie.douban.com/',
          heatLabel: metrics.length > 0 ? metrics.join(' · ') : null,
          summary: text(movie.card_subtitle) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
