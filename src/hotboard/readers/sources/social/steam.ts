/**
 * Steam 热销榜（商店 featured categories 的 top_sellers）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/steam.ts
 *
 * 说明：newsnow 原实现抓的是 stats 页的「在线人数」，与「热销榜」语义不符；
 * 这里改用官方公开的 store featured categories 接口取 top_sellers，解析方式仍按其 cheerio 思路。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, numeric, text } from '../../http.js';

interface SteamItem {
  id?: number;
  name?: string;
  final_price?: number;
  currency?: string;
  discount_percent?: number;
}

interface SteamResponse {
  top_sellers?: {
    items?: SteamItem[];
  };
}

const ENDPOINT = 'https://store.steampowered.com/api/featuredcategories?cc=cn&l=schinese';
const HOME_URL = 'https://store.steampowered.com/';

/** 接口价格单位是「分」。 */
function formatPrice(cents: unknown, currency: string): string | null {
  const value = numeric(cents);
  if (!value) return null;
  const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency ? `${currency} ` : '';
  return `${symbol}${(value / 100).toFixed(2)}`;
}

export const steamTopSellers: HotboardReader = {
  id: 'steam',
  name: 'Steam热销榜',
  homeUrl: HOME_URL,
  category: 'entertainment',
  async read() {
    const json = await fetchJson<SteamResponse>(ENDPOINT);
    const items = json.top_sellers?.items ?? [];
    return items
      .map((item): ReaderItem | null => {
        const title = text(item.name);
        if (!title) return null;
        const discount = numeric(item.discount_percent);
        return {
          title,
          url: item.id ? `https://store.steampowered.com/app/${item.id}/` : HOME_URL,
          heatLabel: formatPrice(item.final_price, text(item.currency)),
          summary: discount ? `-${discount}%` : null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
