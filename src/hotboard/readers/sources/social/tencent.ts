/**
 * 腾讯新闻热点榜（综合早报 tag 的 articleList）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/tencent.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface TencentArticle {
  id?: string;
  title?: string;
  desc?: string;
  short_title?: string;
  link_info?: {
    url?: string;
    share_url?: string;
  };
}

interface TencentResponse {
  ret?: number;
  data?: {
    tabs?: Array<{ articleList?: TencentArticle[] }>;
  };
}

export const tencentNewsHot: HotboardReader = {
  id: 'tencent',
  name: '腾讯新闻热点',
  homeUrl: 'https://news.qq.com/',
  category: 'china',
  async read() {
    const json = await fetchJson<TencentResponse>('https://i.news.qq.com/web_backend/v2/getTagInfo?tagId=aEWqxLtdgmQ%3D', {
      headers: { referer: 'https://news.qq.com/' },
    });
    const articles = json.data?.tabs?.[0]?.articleList ?? [];
    return articles
      .map((article): ReaderItem | null => {
        const title = text(article.title);
        if (!title) return null;
        const link = text(article.link_info?.url) || text(article.link_info?.share_url);
        const id = text(article.id);
        return {
          title,
          url: link || (id ? `https://view.inews.qq.com/a/${id}` : 'https://news.qq.com/'),
          heatLabel: null,
          summary: text(article.desc) || text(article.short_title) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
