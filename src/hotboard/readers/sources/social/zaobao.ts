/**
 * 联合早报即时新闻。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/zaobao.ts
 *
 * 说明：官方 zaobao.com.sg 是客户端渲染（静态 HTML 里没有榜单条目），
 * 因此沿用 newsnow 的做法抓 zaochenbao.com —— 该站标题即「联合早报网」镜像，
 * 页面编码为 GB2312/GBK，需用 gb18030 解码。
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { absoluteUrl, fetchReaderResponse, loadHtml, text } from '../../http.js';

const BASE = 'https://www.zaochenbao.com';

interface ZaobaoRow {
  title: string;
  url: string;
  date: string;
}

export const zaobaoRealtime: HotboardReader = {
  id: 'zaobao',
  name: '联合早报',
  homeUrl: `${BASE}/realtime/`,
  category: 'world',
  async read() {
    const response = await fetchReaderResponse(`${BASE}/realtime/`);
    const html = new TextDecoder('gb18030').decode(await response.arrayBuffer());
    const $ = loadHtml(html);
    const rows: ZaobaoRow[] = [];
    $('div.list-block>a.item').each((_, element) => {
      const anchor = $(element);
      const title = text(anchor.find('.eps').text());
      const url = absoluteUrl(BASE, anchor.attr('href'));
      // 原始格式 "2026-10-29- 18:31:00"，去掉连字符后的空格，统一成可比对的时间串。
      const date = text(anchor.find('.pdt10').text().replace(/-\s/g, ' '));
      if (title && url) rows.push({ title, url, date });
    });
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(
        (row): ReaderItem => ({
          title: row.title,
          url: row.url,
          heatLabel: null,
          summary: row.date || null,
        }),
      );
  },
};
