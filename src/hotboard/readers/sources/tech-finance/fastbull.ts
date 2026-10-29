/**
 * 法布财经（FastBull）实时快讯。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/fastbull.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchText, loadHtml } from '../../http.js';

const BASE_URL = 'https://www.fastbull.com';

interface RawFastbullItem {
  url: string;
  title: string;
  date: number;
}

export const fastbull: HotboardReader = {
  id: 'fastbull',
  name: '法布财经',
  homeUrl: `${BASE_URL}/cn/express-news`,
  category: 'finance',
  async read() {
    const html = await fetchText(`${BASE_URL}/cn/express-news`);
    const $ = loadHtml(html);
    const rows: RawFastbullItem[] = [];
    $('.content-list.news-list').each((_, el) => {
      const $el = $(el);
      const titleText = $el.find('.title_name').text().trim();
      const href = $el.find('[data-href]').attr('data-href') || $el.find('[data-id]').attr('data-id');
      const date = $el.attr('data-date') || $el.find('[data-date]').attr('data-date') || '0';
      if (!href || !titleText) return;
      const title = /【(.+)】/.exec(titleText)?.[1] ?? titleText;
      rows.push({
        url: href.startsWith('/') ? `${BASE_URL}${href}` : `${BASE_URL}/cn/fastshort/${href}`,
        title: title.length < 4 ? titleText : title,
        date: Number(date) || 0,
      });
    });
    return rows
      .sort((a, b) => b.date - a.date)
      .map((row): ReaderItem => ({
        title: row.title,
        url: row.url,
      }));
  },
};
