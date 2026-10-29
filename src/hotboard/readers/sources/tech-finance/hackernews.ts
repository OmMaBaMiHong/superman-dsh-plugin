/**
 * Hacker News 首页热帖。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/hackernews.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchText, loadHtml, numeric } from '../../http.js';

const BASE_URL = 'https://news.ycombinator.com';

export const hackernews: HotboardReader = {
  id: 'hackernews',
  name: 'HackerNews',
  homeUrl: `${BASE_URL}/`,
  category: 'tech',
  async read() {
    const html = await fetchText(`${BASE_URL}/`);
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('.athing').each((_, el) => {
      const $el = $(el);
      const id = $el.attr('id') ?? '';
      const title = $el.find('.titleline a').first().text().trim();
      if (!id || !title) return;
      const score = $('#score_' + id).text().trim();
      items.push({
        title,
        url: `${BASE_URL}/item?id=${id}`,
        heatLabel: score || null,
        heat: numeric(score.split(' ')[0]),
      });
    });
    return items;
  },
};
