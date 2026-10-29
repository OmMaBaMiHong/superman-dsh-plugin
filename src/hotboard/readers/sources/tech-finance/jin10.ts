/**
 * 金十数据快讯。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/jin10.ts
 *
 * 数据源是 flash_newest.js：内容形如 `var newest = [...]`，去掉变量声明后按 JSON 解析。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchText } from '../../http.js';

interface Jin10Item {
  id?: string;
  time?: string;
  important?: number;
  channel?: number[];
  data?: {
    title?: string | null;
    content?: string | null;
    lock?: boolean;
  };
}

export const jin10: HotboardReader = {
  id: 'jin10',
  name: '金十数据',
  homeUrl: 'https://www.jin10.com/',
  category: 'finance',
  async read() {
    const raw = await fetchText(`https://www.jin10.com/flash_newest.js?t=${Date.now()}`);
    const jsonStr = raw
      .replace(/^\uFEFF/, '')
      .replace(/^var\s+newest\s*=\s*/, '')
      .replace(/;*$/, '')
      .trim();
    const data = JSON.parse(jsonStr) as Jin10Item[];
    return data
      .filter(item => (item.data?.title || item.data?.content) && !item.channel?.includes(5))
      .map((item): ReaderItem | null => {
        const rawText = (item.data?.title || item.data?.content || '').replace(/<\/?b>/g, '').trim();
        if (!rawText) return null;
        const matched = /^【([^】]*)】(.*)$/.exec(rawText);
        const title = (matched?.[1] ?? rawText).trim();
        if (!title) return null;
        const desc = (matched?.[2] ?? '').trim();
        const id = item.id ?? '';
        return {
          title,
          url: id ? `https://flash.jin10.com/detail/${id}` : 'https://www.jin10.com/',
          heatLabel: item.important ? '✰ 重要' : null,
          summary: desc || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
