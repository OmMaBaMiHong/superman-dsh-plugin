/**
 * 格隆汇财经资讯 / 事件。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/gelonghui.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText, loadHtml } from '../../http.js';

const BASE_URL = 'https://www.gelonghui.com';

export const gelonghui: HotboardReader = {
  id: 'gelonghui',
  name: '格隆汇',
  homeUrl: `${BASE_URL}/news/`,
  category: 'finance',
  async read() {
    const html = await fetchText(`${BASE_URL}/news/`);
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('.article-content').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('.detail-right > a');
      const title = $a.find('h2').text().trim();
      const href = $a.attr('href');
      if (!title || !href) return;
      const info = $el.find('.time > span:nth-child(1)').text().trim();
      items.push({
        title,
        url: absoluteUrl(BASE_URL, href),
        summary: info || null,
      });
    });
    return items;
  },
};
