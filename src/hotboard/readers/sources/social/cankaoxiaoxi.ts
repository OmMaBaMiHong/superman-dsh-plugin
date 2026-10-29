/**
 * 参考消息（中国 / 观点 / 国际三个频道的 JSON 列表合并）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/cankaoxiaoxi.ts
 *
 * 三个频道各自可能失败，用 allSettled 做到单频道降级，不拖垮整条渠道。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface CankaoEntry {
  data?: {
    id?: string;
    title?: string;
    url?: string;
    publishTime?: string;
    channelName?: string;
  };
}

interface CankaoResponse {
  list?: CankaoEntry[];
}

const CHANNELS = ['zhongguo', 'guandian', 'gj'] as const;
const BASE = 'http://china.cankaoxiaoxi.com/json/channel';
const HOME_URL = 'http://www.cankaoxiaoxi.com/';

export const cankaoxiaoxiNews: HotboardReader = {
  id: 'cankaoxiaoxi',
  name: '参考消息',
  homeUrl: HOME_URL,
  category: 'world',
  async read() {
    const settled = await Promise.allSettled(
      CHANNELS.map((channel) => fetchJson<CankaoResponse>(`${BASE}/${channel}/list.json`)),
    );
    const rows = settled.flatMap((result) => (result.status === 'fulfilled' ? (result.value.list ?? []) : []));
    const seen = new Set<string>();
    const sorted: Array<{ item: ReaderItem; time: string }> = [];
    for (const entry of rows) {
      const data = entry.data;
      const title = text(data?.title);
      const url = text(data?.url);
      // 频道间会互相转载同一篇文章，按 url 去重。
      if (!title || !url || seen.has(url)) continue;
      seen.add(url);
      sorted.push({
        item: {
          title,
          url,
          heatLabel: null,
          summary: text(data?.channelName) || null,
        },
        time: text(data?.publishTime),
      });
    }
    // publishTime 是 "YYYY-MM-DD HH:mm:ss"，字典序倒序即时间倒序。
    return sorted.sort((a, b) => b.time.localeCompare(a.time)).map((row) => row.item);
  },
};
