/**
 * 虫部落热帖（Discuz 导读「热门」页）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/chongbuluo.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText, loadHtml, text } from '../../http.js';

const BASE = 'https://www.chongbuluo.com';

/** 站点在 Cloudflare 后面，边缘偶发连接 reset：重试一次再交给 collector。 */
async function fetchHtmlWithRetry(url: string): Promise<string> {
  try {
    return await fetchText(url);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return fetchText(url);
  }
}

export const chongbuluoHotPosts: HotboardReader = {
  id: 'chongbuluo',
  name: '虫部落热帖',
  homeUrl: `${BASE}/`,
  category: 'tech',
  async read() {
    const html = await fetchHtmlWithRetry(`${BASE}/forum.php?mod=guide&view=hot`);
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('.bmw table tr').each((_, element) => {
      const row = $(element);
      const title = text(row.find('.common .xst').text());
      if (!title) return;
      const replies = text(row.find('.num .xi2').text());
      const views = text(row.find('.num em').text());
      const metrics = [replies ? `${replies} 回复` : '', views ? `${views} 查看` : ''].filter(Boolean);
      items.push({
        title,
        url: absoluteUrl(BASE, row.find('.common a').first().attr('href')),
        heatLabel: metrics.length > 0 ? metrics.join(' · ') : null,
      });
    });
    return items;
  },
};
