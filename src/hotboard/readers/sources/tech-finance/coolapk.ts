/**
 * 酷安今日热门。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/coolapk/index.ts
 *
 * 移植说明：newsnow 用 md5 / base64 生成 X-App-Token（取自 RSSHub 的 coolapk 工具），
 * 这里用 Node 自带 node:crypto 复刻同一算法，不引入新依赖。
 */
import { createHash } from 'node:crypto';
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, loadHtml, text } from '../../http.js';

const BASE_URL = 'https://www.coolapk.com';
const LIST_URL =
  'https://api.coolapk.com/v6/page/dataList?' +
  'url=%2Ffeed%2FstatList%3FcacheExpires%3D300%26statType%3Dday%26sortField%3Ddetailnum%26title%3D%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8' +
  '&title=%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&subTitle=&page=1';

interface CoolapkItem {
  id?: number | string;
  message?: string;
  editor_title?: string;
  message_title?: string;
  url?: string;
  targetRow?: { subTitle?: string };
}

interface CoolapkResponse {
  data?: CoolapkItem[];
}

function md5(value: string): string {
  return createHash('md5').update(value).digest('hex');
}

function randomDeviceId(): string {
  return [10, 6, 6, 6, 14].map(len => Math.random().toString(36).substring(2, len)).join('-');
}

/** 复刻 RSSHub coolapk 的 X-App-Token 生成逻辑。 */
function appToken(): string {
  const deviceId = randomDeviceId();
  const now = Math.round(Date.now() / 1000);
  const hexNow = `0x${now.toString(16)}`;
  const md5Now = md5(now.toString());
  const raw = `token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?${md5Now}$${deviceId}&com.coolapk.market`;
  const md5Raw = md5(Buffer.from(raw).toString('base64'));
  return md5Raw + deviceId + hexNow;
}

function coolapkHeaders(): Record<string, string> {
  return {
    'X-Requested-With': 'XMLHttpRequest',
    'X-App-Id': 'com.coolapk.market',
    'X-App-Token': appToken(),
    'X-Sdk-Int': '29',
    'X-Sdk-Locale': 'zh-CN',
    'X-App-Version': '11.0',
    'X-Api-Version': '11',
    'X-App-Code': '2101202',
    // 小写 key，覆盖 http.ts 的默认 UA（大小写混用会被合并成双 UA，酷安直接 403）。
    'user-agent':
      'Dalvik/2.1.0 (Linux; U; Android 10; Redmi K30 5G MIUI/V12.0.3.0.QGICMXM) (#Build; Redmi; Redmi K30 5G; QKQ1.191222.002 test-keys; 10) +CoolMarket/11.0-2101202',
  };
}

function pickTitle(item: CoolapkItem): string {
  const editorTitle = text(item.editor_title);
  if (editorTitle) return editorTitle;
  const messageTitle = text(item.message_title);
  if (messageTitle) return messageTitle;
  const message = text(item.message);
  if (!message) return '';
  return text(loadHtml(message).text().split('\n')[0]);
}

export const coolapk: HotboardReader = {
  id: 'coolapk',
  name: '酷安热榜',
  homeUrl: `${BASE_URL}/`,
  category: 'tech',
  async read() {
    const json = await fetchJson<CoolapkResponse>(LIST_URL, { headers: coolapkHeaders() });
    const list = json.data ?? [];
    if (list.length === 0) throw new Error('酷安热榜返回空列表');
    return list
      .filter(item => item.id != null)
      .map((item): ReaderItem | null => {
        const title = pickTitle(item);
        if (!title) return null;
        const path = text(item.url);
        return {
          title,
          url: path ? `${BASE_URL}${path}` : `${BASE_URL}/`,
          heatLabel: text(item.targetRow?.subTitle) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
