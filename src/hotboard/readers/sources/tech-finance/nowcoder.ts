/**
 * 牛客热榜（求助 / 讨论热门）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/nowcoder.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface NowcoderItem {
  id?: number | string;
  title?: string;
  /** 74 = 动态/feed，0 = 讨论帖 */
  type?: number;
  uuid?: string;
  hotValueFromDolphin?: number;
}

interface NowcoderResponse {
  data?: { result?: NowcoderItem[] };
}

export const nowcoder: HotboardReader = {
  id: 'nowcoder',
  name: '牛客热榜',
  homeUrl: 'https://www.nowcoder.com/',
  category: 'tech',
  async read() {
    const timestamp = Date.now();
    const json = await fetchJson<NowcoderResponse>(
      `https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc?size=20&_=${timestamp}&t=`,
    );
    return (json.data?.result ?? [])
      .map((item): ReaderItem | null => {
        const title = text(item.title);
        if (!title) return null;
        const id = item.id == null ? '' : String(item.id);
        const uuid = text(item.uuid);
        let url: string | null = null;
        if (item.type === 74 && uuid) url = `https://www.nowcoder.com/feed/main/detail/${uuid}`;
        else if (item.type === 0 && id) url = `https://www.nowcoder.com/discuss/${id}`;
        const heat = typeof item.hotValueFromDolphin === 'number' ? item.hotValueFromDolphin : 0;
        return {
          title,
          url,
          heatLabel: heat > 0 ? `${heat} 热度` : null,
          heat: heat > 0 ? heat : null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
