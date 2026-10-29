/**
 * Solidot 奇客资讯。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/solidot.ts
 *
 * 原实现走 RSS（defineRSSSource）；这里用 cheerio 的 xml 模式直接解析，不引入 RSS 库。
 */
import { load } from 'cheerio';
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText } from '../../http.js';

const BASE_URL = 'https://www.solidot.org';

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const solidot: HotboardReader = {
  id: 'solidot',
  name: 'Solidot',
  homeUrl: `${BASE_URL}/`,
  category: 'tech',
  async read() {
    const xml = await fetchText(`${BASE_URL}/index.rss`);
    // RSS 的 <link> 是文本节点，必须用 xmlMode 解析（HTML 模式会把 link 当 void 标签丢掉）。
    const $ = load(xml, { xmlMode: true });
    const items: ReaderItem[] = [];
    $('item').each((_, el) => {
      const $el = $(el);
      const title = $el.find('title').first().text().trim();
      const link = $el.find('link').first().text().trim();
      const description = $el.find('description').first().text().trim();
      if (!title) return;
      items.push({
        title,
        url: absoluteUrl(BASE_URL, link),
        summary: stripTags(description) || null,
      });
    });
    return items;
  },
};
