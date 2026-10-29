/**
 * GitHub Trending（今日热门仓库）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/github.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchText, loadHtml, numeric } from '../../http.js';

const BASE_URL = 'https://github.com';

function squash(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export const githubTrending: HotboardReader = {
  id: 'github-trending',
  name: 'GitHub Trending',
  homeUrl: `${BASE_URL}/trending`,
  category: 'tech',
  async read() {
    const html = await fetchText(`${BASE_URL}/trending?spoken_language_code=`);
    const $ = loadHtml(html);
    const items: ReaderItem[] = [];
    $('main article.Box-row').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('h2 a').first();
      const title = squash($a.text());
      const href = $a.attr('href');
      if (!title || !href) return;
      const star = squash($el.find('a[href$="/stargazers"]').text());
      const desc = squash($el.find('p').first().text());
      const starCount = numeric(star.replace(/,/g, ''));
      items.push({
        title,
        url: `${BASE_URL}${href}`,
        heatLabel: star ? `✰ ${star}` : null,
        heat: starCount,
        summary: desc || null,
      });
    });
    return items;
  },
};
