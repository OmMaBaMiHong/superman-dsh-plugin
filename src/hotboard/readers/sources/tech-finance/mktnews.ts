/**
 * MKTNews 实时快讯。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/mktnews.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson } from '../../http.js';

interface MktnewsReport {
  id?: string;
  time?: string;
  important?: number;
  data?: {
    title?: string;
    content?: string;
  };
}

interface MktnewsResponse {
  status?: number;
  data?: MktnewsReport[];
}

export const mktnews: HotboardReader = {
  id: 'mktnews',
  name: 'MKTNews',
  homeUrl: 'https://mktnews.net/',
  category: 'finance',
  async read() {
    const json = await fetchJson<MktnewsResponse>('https://api.mktnews.net/api/flash?type=0&limit=50', {
      headers: {
        origin: 'https://mktnews.net',
        referer: 'https://mktnews.net/',
      },
    });
    return (json.data ?? [])
      .slice()
      .sort((a, b) => new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime())
      .map((item): ReaderItem | null => {
        const content = item.data?.content ?? '';
        const title =
          item.data?.title || /^【([^】]*)】(.*)$/.exec(content)?.[1] || content.split('\n')[0] || '';
        const trimmed = title.trim();
        if (!trimmed) return null;
        return {
          title: trimmed,
          url: item.id ? `https://mktnews.net/flashDetail.html?id=${item.id}` : 'https://mktnews.net/',
          heatLabel: item.important === 1 ? '重要' : null,
          summary: content ? content.trim().slice(0, 200) : null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
