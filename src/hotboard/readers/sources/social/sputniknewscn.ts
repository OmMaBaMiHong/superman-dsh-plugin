/**
 * 卫星通讯社（中文站新闻时间线 widget）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/sputniknewscn.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText, loadHtml, text } from '../../http.js';

const BASE = 'https://sputniknews.cn';

export const sputnikNews: HotboardReader = {
  id: 'sputniknewscn',
  name: '卫星通讯社',
  homeUrl: `${BASE}/`,
  category: 'world',
  async read() {
    const html = await fetchText(`${BASE}/services/widget/lenta/`);
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('.lenta__item').each((_, element) => {
      const anchor = $(element).find('a').first();
      const title = text(anchor.find('.lenta__item-text').text());
      if (!title) return;
      items.push({
        title,
        url: absoluteUrl(BASE, anchor.attr('href')),
        heatLabel: null,
        summary: text(anchor.find('.lenta__item-date').text()) || null,
      });
    });
    return items;
  },
};
