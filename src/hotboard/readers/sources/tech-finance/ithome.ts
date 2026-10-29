/**
 * IT之家滚动新闻 / 排行。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/ithome.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText, loadHtml } from '../../http.js';

const BASE_URL = 'https://www.ithome.com';
const AD_KEYWORDS = ['神券', '优惠', '补贴', '京东'];

export const ithome: HotboardReader = {
  id: 'ithome',
  name: 'IT之家排行',
  homeUrl: 'https://www.ithome.com/',
  category: 'tech',
  async read() {
    const html = await fetchText(`${BASE_URL}/list/`);
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('#list > div.fl > ul > li').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('a.t');
      const title = $a.text().trim();
      const href = $a.attr('href');
      const date = $el.find('i').text().trim();
      if (!title || !href) return;
      if (href.includes('lapin') || AD_KEYWORDS.some(keyword => title.includes(keyword))) return;
      items.push({
        title,
        url: absoluteUrl(BASE_URL, href),
        summary: date || null,
      });
    });
    return items;
  },
};
