/**
 * 稀土掘金热榜。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/juejin.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface JuejinResponse {
  data?: Array<{
    content?: { title?: string; content_id?: string };
  }>;
}

export const juejin: HotboardReader = {
  id: 'juejin',
  name: '稀土掘金',
  homeUrl: 'https://juejin.cn/',
  category: 'tech',
  async read() {
    const json = await fetchJson<JuejinResponse>(
      'https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot&spider=0',
    );
    return (json.data ?? [])
      .map((item): ReaderItem | null => {
        const title = text(item.content?.title);
        if (!title) return null;
        const contentId = text(item.content?.content_id);
        return {
          title,
          url: contentId ? `https://juejin.cn/post/${contentId}` : 'https://juejin.cn/',
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
