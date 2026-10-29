/**
 * 百度贴吧热议榜。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/tieba.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, numeric, text } from '../../http.js';

interface TiebaTopic {
  topic_id?: number | string;
  topic_name?: string;
  topic_desc?: string;
  abstract?: string;
  discuss_num?: number;
  topic_url?: string;
}

interface TiebaResponse {
  errno?: number;
  data?: {
    bang_topic?: {
      topic_list?: TiebaTopic[];
    };
  };
}

/** 接口里的 topic_url 带 `&amp;` 实体，JSON 解析不会还原。 */
function normalizeUrl(raw: string): string {
  return raw.replace(/&amp;/g, '&');
}

function formatDiscuss(value: number): string {
  return value >= 10_000 ? `${(value / 10_000).toFixed(1)} 万讨论` : `${value} 讨论`;
}

export const tiebaHotTopics: HotboardReader = {
  id: 'tieba',
  name: '百度贴吧热议',
  homeUrl: 'https://tieba.baidu.com/',
  category: 'china',
  async read() {
    const json = await fetchJson<TiebaResponse>('https://tieba.baidu.com/hottopic/browse/topicList');
    return (json.data?.bang_topic?.topic_list ?? [])
      .map((topic): ReaderItem | null => {
        const title = text(topic.topic_name);
        if (!title) return null;
        const rawUrl = text(topic.topic_url);
        const topicId = topic.topic_id === undefined || topic.topic_id === null ? '' : String(topic.topic_id);
        const discuss = numeric(topic.discuss_num);
        return {
          title,
          url: rawUrl
            ? normalizeUrl(rawUrl)
            : topicId
              ? `https://tieba.baidu.com/hottopic/browse/hottopic?topic_id=${topicId}`
              : 'https://tieba.baidu.com/',
          heatLabel: discuss ? formatDiscuss(discuss) : null,
          summary: text(topic.topic_desc) || text(topic.abstract) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
