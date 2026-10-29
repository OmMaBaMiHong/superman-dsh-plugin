/**
 * Product Hunt 今日 / 近期产品。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/producthunt.ts
 *
 * 原实现优先走需要 API Token 的 GraphQL，无 Token 时退化为官方 Atom feed；
 * 本项目不引入密钥，直接使用公开 Atom feed（结构与 newsnow 的 feed 兜底一致）。
 */
import { load } from 'cheerio';
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText } from '../../http.js';

const BASE_URL = 'https://www.producthunt.com';

export const producthunt: HotboardReader = {
  id: 'producthunt',
  name: 'ProductHunt',
  homeUrl: `${BASE_URL}/`,
  category: 'tech',
  async read() {
    const xml = await fetchText(`${BASE_URL}/feed`);
    const $ = load(xml, { xmlMode: true });
    const items: ReaderItem[] = [];
    $('entry').each((_, el) => {
      const $el = $(el);
      const title = $el.find('title').first().text().trim();
      if (!title) return;
      const href = $el.find('link[rel="alternate"]').attr('href') ?? $el.find('link').first().attr('href');
      // content 是转义后的 HTML，取第一段作为 tagline。
      const contentHtml = $el.find('content').first().text();
      const $content = load(contentHtml);
      const tagline = $content('p').first().text().replace(/\s+/g, ' ').trim();
      items.push({
        title,
        url: absoluteUrl(BASE_URL, href),
        summary: tagline || null,
      });
    });
    return items;
  },
};
