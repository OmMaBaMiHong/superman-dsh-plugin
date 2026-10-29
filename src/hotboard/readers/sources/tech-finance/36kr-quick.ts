/**
 * 36 氪快讯。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/_36kr.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText, loadHtml } from '../../http.js';

const BASE_URL = 'https://www.36kr.com';

export const kr36Quick: HotboardReader = {
  id: '36kr-quick',
  name: '36氪快讯',
  homeUrl: `${BASE_URL}/newsflashes`,
  category: 'tech',
  async read() {
    const html = await fetchText(`${BASE_URL}/newsflashes`, {
      headers: { referer: `${BASE_URL}/` },
    });
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('.newsflash-item').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('a.item-title');
      const title = $a.text().trim();
      const href = $a.attr('href');
      if (!title) return;
      items.push({
        title,
        url: absoluteUrl(BASE_URL, href),
      });
    });
    return items;
  },
};
