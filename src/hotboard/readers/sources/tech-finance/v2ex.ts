/**
 * V2EX 热帖（分享创造 / 创意 / 程序员 / 分享发现 四个节点的最新帖）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/v2ex.ts
 *
 * 原实现用 JSON Feed；若 feed 不可用则降级到 v2ex 公开热门主题接口。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface JsonFeed {
  items?: Array<{
    id?: string;
    title?: string;
    url?: string;
    date_modified?: string;
    date_published?: string;
  }>;
}

interface HotTopic {
  id?: number;
  title?: string;
  url?: string;
}

const FEED_NODES = ['create', 'ideas', 'programmer', 'share'] as const;

export const v2ex: HotboardReader = {
  id: 'v2ex',
  name: 'V2EX热帖',
  homeUrl: 'https://www.v2ex.com/',
  category: 'tech',
  async read() {
    const feeds = await Promise.all(
      FEED_NODES.map(node => fetchJson<JsonFeed>(`https://www.v2ex.com/feed/${node}.json`)),
    );
    const merged = feeds.flatMap(feed => feed.items ?? []);
    if (merged.length > 0) {
      return merged
        .sort((m, n) => {
          const mDate = m.date_modified ?? m.date_published ?? '';
          const nDate = n.date_modified ?? n.date_published ?? '';
          return nDate.localeCompare(mDate);
        })
        .map((item): ReaderItem | null => {
          const title = text(item.title);
          if (!title) return null;
          return {
            title,
            url: text(item.url) || null,
          } satisfies ReaderItem;
        })
        .filter((item): item is ReaderItem => item !== null);
    }
    const hot = await fetchJson<HotTopic[]>('https://www.v2ex.com/api/topics/hot.json');
    return (hot ?? [])
      .map((item): ReaderItem | null => {
        const title = text(item.title);
        if (!title) return null;
        return {
          title,
          url: text(item.url) || (item.id ? `https://www.v2ex.com/t/${item.id}` : null),
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
