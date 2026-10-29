/**
 * B 站：热搜 / 热门视频 / 排行榜。
 * 解析逻辑移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/bilibili.ts。
 */
import type { HotboardReader, ReaderItem } from '../types.js';
import { fetchJson, numeric, text } from '../http.js';

interface HotWordResponse {
  code?: number;
  list?: Array<{ keyword?: string; show_name?: string; heat_score?: number }>;
}

interface VideoItem {
  bvid?: string;
  title?: string;
  desc?: string;
  owner?: { name?: string };
  stat?: { view?: number; like?: number };
}

interface VideoResponse {
  code?: number;
  data?: { list?: VideoItem[] };
}

function toVideoItems(json: VideoResponse): ReaderItem[] {
  const list = json.data?.list ?? [];
  return list
    .map((video, index): ReaderItem | null => {
      const title = text(video.title);
      if (!title) return null;
      const bvid = text(video.bvid);
      const view = numeric(video.stat?.view);
      const like = numeric(video.stat?.like);
      const owner = text(video.owner?.name);
      const metrics = [owner, view ? `${view} 播放` : '', like ? `${like} 赞` : ''].filter(Boolean);
      return {
        title,
        url: bvid ? `https://www.bilibili.com/video/${bvid}` : `https://www.bilibili.com/v/popular/all`,
        heatLabel: metrics.length > 0 ? metrics.join(' · ') : `第 ${index + 1} 名`,
        summary: text(video.desc) || null,
      } satisfies ReaderItem;
    })
    .filter((item): item is ReaderItem => item !== null);
}

export const bilibiliHotSearch: HotboardReader = {
  id: 'bilibili-hot-search',
  name: '哔哩哔哩热搜',
  homeUrl: 'https://s.search.bilibili.com/main/hotword',
  category: 'china',
  async read() {
    const json = await fetchJson<HotWordResponse>('https://s.search.bilibili.com/main/hotword?limit=30', {
      headers: { referer: 'https://www.bilibili.com/' },
    });
    return (json.list ?? [])
      .map((word): ReaderItem | null => {
        const title = text(word.show_name) || text(word.keyword);
        if (!title) return null;
        const keyword = text(word.keyword) || title;
        return {
          title,
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`,
          heatLabel: numeric(word.heat_score) ? String(word.heat_score) : null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};

export const bilibiliHotVideo: HotboardReader = {
  id: 'bilibili-hot-video',
  name: '哔哩哔哩热门视频',
  homeUrl: 'https://www.bilibili.com/v/popular/all',
  category: 'entertainment',
  async read() {
    const json = await fetchJson<VideoResponse>('https://api.bilibili.com/x/web-interface/popular', {
      headers: { referer: 'https://www.bilibili.com/' },
    });
    return toVideoItems(json);
  },
};

export const bilibiliRanking: HotboardReader = {
  id: 'bilibili-ranking',
  name: '哔哩哔哩排行榜',
  homeUrl: 'https://www.bilibili.com/v/popular/rank/all',
  category: 'entertainment',
  // 2026-10 实测：ranking/v2 在无反爬指纹下返回 code -352（风控），热门视频已由
  // bilibili-hot-video（popular 接口）覆盖，先禁用，待有稳定取法再恢复。
  enabled: false,
  async read() {
    const json = await fetchJson<VideoResponse>('https://api.bilibili.com/x/web-interface/ranking/v2', {
      headers: { referer: 'https://www.bilibili.com/' },
    });
    return toVideoItems(json);
  },
};
