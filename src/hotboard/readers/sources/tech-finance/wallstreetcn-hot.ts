/**
 * 华尔街见闻热榜。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/wallstreetcn.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface WallstreetcnItem {
  id?: number;
  title?: string;
  content_short?: string;
  content_text?: string;
  uri?: string;
  pageviews?: number;
  display_time?: number;
}

interface WallstreetcnHotResponse {
  data?: { day_items?: WallstreetcnItem[] };
}

export const wallstreetcnHot: HotboardReader = {
  id: 'wallstreetcn-hot',
  name: '华尔街见闻热榜',
  homeUrl: 'https://wallstreetcn.com/',
  category: 'finance',
  async read() {
    const json = await fetchJson<WallstreetcnHotResponse>(
      'https://api-one.wallstcn.com/apiv1/content/articles/hot?period=all',
    );
    return (json.data?.day_items ?? [])
      .map((item): ReaderItem | null => {
        const title = text(item.title) || text(item.content_short) || text(item.content_text);
        if (!title) return null;
        const uri = text(item.uri);
        const pageviews = typeof item.pageviews === 'number' ? item.pageviews : 0;
        return {
          title,
          url: uri || (item.id ? `https://wallstreetcn.com/articles/${item.id}` : 'https://wallstreetcn.com/'),
          heatLabel: pageviews > 0 ? `${pageviews} 阅读` : null,
          heat: pageviews > 0 ? pageviews : null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
