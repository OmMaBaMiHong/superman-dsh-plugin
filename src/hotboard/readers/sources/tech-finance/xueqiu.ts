/**
 * 雪球热股榜。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/xueqiu.ts
 *
 * 移植说明：雪球接口要求 cookie（xq_a_token），原实现先 GET /hq 拿 Set-Cookie；
 * 这里用 http.ts 的 fetchReaderResponse 读取响应头里的 cookie，再带上请求热股列表。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, fetchReaderResponse, text } from '../../http.js';

const HOME_URL = 'https://xueqiu.com/';
const LIST_URL = 'https://stock.xueqiu.com/v5/stock/hot_stock/list.json?size=30&_type=10&type=10';

interface XueqiuStock {
  code?: string;
  name?: string;
  percent?: number;
  exchange?: string;
  ad?: number;
}

interface XueqiuResponse {
  data?: { items?: XueqiuStock[] };
}

async function acquireCookie(): Promise<string> {
  const response = await fetchReaderResponse('https://www.xueqiu.com/hq', {
    headers: { accept: 'text/html,application/xhtml+xml' },
  });
  const setCookies = response.headers.getSetCookie?.() ?? [];
  return setCookies.map(cookie => cookie.split(';')[0]).join('; ');
}

export const xueqiu: HotboardReader = {
  id: 'xueqiu',
  name: '雪球热帖',
  homeUrl: HOME_URL,
  category: 'finance',
  async read() {
    const cookie = await acquireCookie();
    const json = await fetchJson<XueqiuResponse>(LIST_URL, {
      headers: {
        cookie,
        referer: HOME_URL,
      },
    });
    return (json.data?.items ?? [])
      .filter(item => !item.ad && item.code && item.name)
      .map((item): ReaderItem | null => {
        const title = text(item.name);
        const code = text(item.code);
        if (!title || !code) return null;
        const percent = typeof item.percent === 'number' ? item.percent : 0;
        const exchange = text(item.exchange);
        const label = [percent ? `${percent}%` : '', exchange].filter(Boolean).join(' ');
        return {
          title,
          url: `https://xueqiu.com/s/${code}`,
          heatLabel: label || null,
          heat: percent || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
