/**
 * 澎湃新闻热榜。
 * 解析逻辑移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/thepaper.ts。
 */
import type { HotboardReader, ReaderItem } from '../types.js';
import { fetchJson, text } from '../http.js';

interface ThePaperResponse {
  data?: {
    hotNews?: Array<{ contId?: string; name?: string; pubTimeLong?: string }>;
  };
}

export const thepaperHotNews: HotboardReader = {
  id: 'thepaper',
  name: '澎湃新闻热榜',
  homeUrl: 'https://www.thepaper.cn/',
  category: 'china',
  async read() {
    const json = await fetchJson<ThePaperResponse>('https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar');
    return (json.data?.hotNews ?? [])
      .map((news): ReaderItem | null => {
        const title = text(news.name);
        const contId = text(news.contId);
        if (!title) return null;
        return {
          title,
          url: contId ? `https://www.thepaper.cn/newsDetail_forward_${contId}` : 'https://www.thepaper.cn/',
          heatLabel: null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
