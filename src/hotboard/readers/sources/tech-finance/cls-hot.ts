/**
 * 财联社热门文章。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/cls/index.ts
 *
 * 移植说明：原实现依赖 md5 / SHA-1（WebCrypto），这里用 node:crypto 复刻
 * RSSHub cls 的签名：sign = md5(sha1(按 key 排序后的 query))，不引入新依赖。
 */
import { createHash } from 'node:crypto';
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

const BASE_PARAMS: Readonly<Record<string, string>> = {
  appName: 'CailianpressWeb',
  os: 'web',
  sv: '7.7.5',
};

interface ClsItem {
  id?: number;
  title?: string;
  brief?: string;
  shareurl?: string;
  ctime?: number;
  readNum?: number;
}

interface ClsHotResponse {
  errno?: number;
  data?: ClsItem[];
}

function signedUrl(path: string): string {
  const searchParams = new URLSearchParams({ ...BASE_PARAMS });
  searchParams.sort();
  const sign = createHash('md5')
    .update(createHash('sha1').update(searchParams.toString()).digest('hex'))
    .digest('hex');
  searchParams.append('sign', sign);
  return `https://www.cls.cn${path}?${searchParams.toString()}`;
}

export const clsHot: HotboardReader = {
  id: 'cls-hot',
  name: '财联社热门',
  homeUrl: 'https://www.cls.cn/',
  category: 'finance',
  async read() {
    const json = await fetchJson<ClsHotResponse>(signedUrl('/v2/article/hot/list'), {
      headers: { referer: 'https://www.cls.cn/' },
    });
    return (json.data ?? [])
      .map((item): ReaderItem | null => {
        const title = text(item.title) || text(item.brief);
        if (!title) return null;
        const id = typeof item.id === 'number' ? item.id : 0;
        const readNum = typeof item.readNum === 'number' ? item.readNum : 0;
        return {
          title,
          url: id ? `https://www.cls.cn/detail/${id}` : 'https://www.cls.cn/',
          heatLabel: readNum > 0 ? `${readNum} 阅读` : null,
          heat: readNum > 0 ? readNum : null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
