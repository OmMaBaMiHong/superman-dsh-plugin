/**
 * 虎扑热帖（步行街每日热榜）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/hupu.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText, loadHtml, text } from '../../http.js';

const BASE = 'https://bbs.hupu.com';

export const hupuHotPosts: HotboardReader = {
  id: 'hupu',
  name: '虎扑热帖',
  homeUrl: `${BASE}/topic-daily-hot`,
  category: 'entertainment',
  async read() {
    const html = await fetchText(`${BASE}/topic-daily-hot`);
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('li.bbs-sl-web-post-body').each((_, element) => {
      const anchor = $(element).find('a.p-title').first();
      const title = text(anchor.text());
      if (!title) return;
      items.push({
        title,
        url: absoluteUrl(BASE, anchor.attr('href')),
        heatLabel: null,
      });
    });
    return items;
  },
};
