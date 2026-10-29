/**
 * Linux.do 热帖（每日 top）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/linuxdo.ts
 *
 * 状态：本轮实测不可用 —— linux.do 全站由 Cloudflare 人机验证（「Just a moment...」）保护，
 * 服务端请求固定返回 403，需真实浏览器执行 JS challenge。
 * 代码保留，enabled=false；站点放开直连后打开即可。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, numeric, text } from '../../http.js';

interface LinuxdoTopic {
  id?: number;
  title?: string;
  visible?: boolean;
  archived?: boolean;
  pinned?: boolean;
  like_count?: number;
}

interface LinuxdoResponse {
  topic_list?: { topics?: LinuxdoTopic[] };
}

export const linuxdoHot: HotboardReader = {
  id: 'linuxdo-hot',
  name: 'Linux.do热帖',
  homeUrl: 'https://linux.do/',
  category: 'tech',
  enabled: false,
  async read() {
    const json = await fetchJson<LinuxdoResponse>('https://linux.do/top/daily.json', {
      headers: { accept: 'application/json' },
    });
    return (json.topic_list?.topics ?? [])
      .filter(topic => topic.visible && !topic.archived && !topic.pinned)
      .map((topic): ReaderItem | null => {
        const title = text(topic.title);
        if (!title || !topic.id) return null;
        const likes = numeric(topic.like_count);
        return {
          title,
          url: `https://linux.do/t/topic/${topic.id}`,
          heatLabel: likes ? `${likes} 赞` : null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
