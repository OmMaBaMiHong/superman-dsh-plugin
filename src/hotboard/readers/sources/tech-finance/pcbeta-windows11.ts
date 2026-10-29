/**
 * 远景论坛 Windows 11 版块。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/pcbeta.ts
 *
 * 状态：本轮实测不可用 —— bbs.pcbeta.com 已启用站点级 JS 人机校验（火山引擎/WAF），
 * 服务端请求只会拿到「请启用 JavaScript 后重试」挑战页，RSS 源同样被拦截。
 * 代码保留，enabled=false；若站点放开 RSS 直接打开即可。
 */
import { load } from 'cheerio';
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchText } from '../../http.js';

const BASE_URL = 'https://bbs.pcbeta.com';
const FEED_URL = `${BASE_URL}/forum.php?mod=rss&fid=563&auth=0`;

export const pcbetaWindows11: HotboardReader = {
  id: 'pcbeta-windows11',
  name: '远景Win11',
  homeUrl: `${BASE_URL}/forum-563-1.html`,
  category: 'tech',
  enabled: false,
  async read() {
    const xml = await fetchText(FEED_URL);
    if (xml.includes('<title>Just a moment') || xml.includes('请启用 JavaScript')) {
      throw new Error('远景论坛返回人机校验页（RSS 被 WAF 拦截）');
    }
    const $ = load(xml, { xmlMode: true });
    const items: ReaderItem[] = [];
    $('item').each((_, el) => {
      const $el = $(el);
      const title = $el.find('title').first().text().trim();
      const link = $el.find('link').first().text().trim();
      if (!title) return;
      items.push({
        title,
        url: absoluteUrl(BASE_URL, link),
        summary: $el.find('description').first().text().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || null,
      });
    });
    return items;
  },
};
