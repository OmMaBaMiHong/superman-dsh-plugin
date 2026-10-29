/**
 * 凤凰网热点（首页 allData.hotNews1）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/ifeng.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchText, text } from '../../http.js';

interface IfengHotNews {
  url?: string;
  title?: string;
  newsTime?: string;
}

interface IfengData {
  hotNews1?: IfengHotNews[];
}

const ALL_DATA_PATTERN = /var\s+allData\s*=\s*(\{[\s\S]*?\});/;

export const ifengHotNews: HotboardReader = {
  id: 'ifeng',
  name: '凤凰网热点',
  homeUrl: 'https://www.ifeng.com/',
  category: 'china',
  async read() {
    const html = await fetchText('https://www.ifeng.com/');
    const matched = ALL_DATA_PATTERN.exec(html);
    if (!matched?.[1]) throw new Error('凤凰网首页未找到 allData');
    const data = JSON.parse(matched[1]) as IfengData;
    return (data.hotNews1 ?? [])
      .map((news): ReaderItem | null => {
        const title = text(news.title);
        const url = text(news.url);
        if (!title || !url) return null;
        return {
          title,
          url,
          heatLabel: null,
          summary: text(news.newsTime) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
