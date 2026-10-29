/**
 * FreeBuf 网络安全资讯。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/freebuf.ts
 *
 * 原实现用 fast-xml-parser + curl 兜底；这里用 cheerio 的 xmlMode 解析 RSS，不引入 XML 库。
 */
import { load } from 'cheerio';
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText } from '../../http.js';

const BASE_URL = 'https://www.freebuf.com';
const FEED_URL = `${BASE_URL}/feed`;

export const freebuf: HotboardReader = {
  id: 'freebuf',
  name: 'FreeBuf',
  homeUrl: `${BASE_URL}/`,
  category: 'tech',
  async read() {
    const xml = await fetchText(FEED_URL, {
      headers: { accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    const $ = load(xml, { xmlMode: true });
    const items: ReaderItem[] = [];
    $('item').each((_, el) => {
      const $el = $(el);
      const title = $el.find('title').first().text().trim();
      const link = $el.find('link').first().text().trim();
      if (!title) return;
      const description = $el
        .find('description')
        .first()
        .text()
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      items.push({
        title,
        url: absoluteUrl(BASE_URL, link),
        summary: description || null,
      });
    });
    return items;
  },
};
