/**
 * 全量热榜 reader 注册表：内置 JSON 直采五渠道之外的平台都走这里。
 *
 * 顺序即目录排序（也是看板平台 Tab 的提示顺序）：社会 → 文娱 → 科技 → 财经 → 国际。
 * 新增平台：在对应 batch 的 sources/ 下加文件，再在该 batch 的 index.ts 注册一行。
 */
import type { HotboardReader } from './types.js';
import { bilibiliHotSearch, bilibiliHotVideo, bilibiliRanking } from './sources/bilibili.js';
import { thepaperHotNews } from './sources/thepaper.js';
import { SOCIAL_READERS } from './sources/social/index.js';
import { TECH_FINANCE_READERS } from './sources/tech-finance/index.js';

export const READER_CHANNELS: readonly HotboardReader[] = [
  thepaperHotNews,
  bilibiliHotSearch,
  bilibiliHotVideo,
  bilibiliRanking,
  ...SOCIAL_READERS,
  ...TECH_FINANCE_READERS,
];

export type { HotboardReader, ReaderCategory, ReaderItem } from './types.js';
