/**
 * 36 氪 24 小时热榜。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/_36kr.ts
 *
 * 原实现抓 https://36kr.com/hot-list/renqi/YYYY-MM-DD/1 页面，站点现由火山引擎 WAF 拦截
 * （返回「正在安全检测」挑战页），故改用 36kr 网关公开热榜接口（同源数据）。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface HotRankItem {
  itemId?: number | string;
  templateMaterial?: {
    widgetTitle?: string;
    authorName?: string;
    statRead?: number;
    statFormat?: string;
  };
}

interface HotRankResponse {
  code?: number;
  data?: { hotRankList?: HotRankItem[] };
}

export const kr36Hot: HotboardReader = {
  id: '36kr-hot',
  name: '36氪热榜',
  homeUrl: 'https://36kr.com/hot-list/catalog',
  category: 'tech',
  async read() {
    const json = await fetchJson<HotRankResponse>('https://gateway.36kr.com/api/mis/nav/home/nav/rank/hot', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://36kr.com',
        referer: 'https://36kr.com/',
      },
      body: JSON.stringify({
        partner_id: 'wap',
        param: { siteId: 1, platformId: 2 },
        timestamp: Date.now(),
      }),
    });
    return (json.data?.hotRankList ?? [])
      .map((item): ReaderItem | null => {
        const material = item.templateMaterial;
        const title = text(material?.widgetTitle);
        if (!title) return null;
        const itemId = item.itemId == null ? '' : String(item.itemId);
        const author = text(material?.authorName);
        const read = typeof material?.statRead === 'number' && material.statRead > 0 ? `${material.statRead} 阅读` : '';
        const label = [author, read].filter(Boolean).join(' · ');
        return {
          title,
          url: itemId ? `https://36kr.com/p/${itemId}` : 'https://36kr.com/',
          heatLabel: label || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
