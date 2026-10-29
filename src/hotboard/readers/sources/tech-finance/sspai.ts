/**
 * 少数派热门文章。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/sspai.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface SspaiResponse {
  data?: Array<{ id?: number; title?: string }>;
}

export const sspai: HotboardReader = {
  id: 'sspai',
  name: '少数派',
  homeUrl: 'https://sspai.com/',
  category: 'tech',
  async read() {
    const limit = 30;
    const url =
      'https://sspai.com/api/v1/article/tag/page/get' +
      `?limit=${limit}&offset=0&created_at=${Date.now()}` +
      `&tag=${encodeURIComponent('热门文章')}&released=false`;
    const json = await fetchJson<SspaiResponse>(url);
    return (json.data ?? [])
      .map((item): ReaderItem | null => {
        const title = text(item.title);
        if (!title) return null;
        const id = typeof item.id === 'number' ? item.id : 0;
        return {
          title,
          url: id ? `https://sspai.com/post/${id}` : 'https://sspai.com/',
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
