/**
 * 爱奇艺热播榜（v7 频道卡片 hot_ranklist）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/iqiyi.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface IqiyiVideo {
  entity_id?: number | string;
  title?: string;
  page_url?: string;
  desc?: string;
  description?: string;
  showDate?: string;
}

interface IqiyiResponse {
  code?: number;
  items?: Array<{
    video?: Array<{ data?: IqiyiVideo[] }>;
  }>;
}

// device 参数是必需的，缺了接口直接报错。
const ENDPOINT =
  'https://mesh.if.iqiyi.com/portal/lw/v7/channel/card/videoTab?channelName=recommend' +
  '&data_source=v7_rec_sec_hot_rank_list&tempId=85&count=30&block_id=hot_ranklist' +
  '&device=14a4b5ba98e790dce6dc07482447cf48&from=webapp';

export const iqiyiHotRank: HotboardReader = {
  id: 'iqiyi',
  name: '爱奇艺热播榜',
  homeUrl: 'https://www.iqiyi.com/',
  category: 'entertainment',
  async read() {
    const json = await fetchJson<IqiyiResponse>(ENDPOINT, {
      headers: { referer: 'https://www.iqiyi.com' },
    });
    const videos = json.items?.[0]?.video?.[0]?.data ?? [];
    return videos
      .map((video): ReaderItem | null => {
        const title = text(video.title);
        if (!title) return null;
        return {
          title,
          url: text(video.page_url) || 'https://www.iqiyi.com/',
          heatLabel: null,
          summary: text(video.desc) || text(video.description) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
