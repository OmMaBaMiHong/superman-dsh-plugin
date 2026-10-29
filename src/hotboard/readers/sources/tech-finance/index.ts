/**
 * 科技/财经/国际类平台 reader 注册表（batch tech-finance）。
 * 只允许改本文件与本目录下的 sources/*.ts；index 由 Lead 汇总。
 *
 * 顺序即目录展示顺序：科技 → 财经。每个 reader 的解析逻辑移植自
 * newsnow（MIT，Copyright 2024 ourongxing），抓取/解析助手统一走 readers/http.ts。
 */
import type { HotboardReader } from '../../types.js';
import { kr36Hot } from './36kr-hot.js';
import { kr36Quick } from './36kr-quick.js';
import { ithome } from './ithome.js';
import { sspai } from './sspai.js';
import { juejin } from './juejin.js';
import { v2ex } from './v2ex.js';
import { solidot } from './solidot.js';
import { hackernews } from './hackernews.js';
import { producthunt } from './producthunt.js';
import { githubTrending } from './github-trending.js';
import { coolapk } from './coolapk.js';
import { pcbetaWindows11 } from './pcbeta-windows11.js';
import { linuxdoHot } from './linuxdo-hot.js';
import { freebuf } from './freebuf.js';
import { nowcoder } from './nowcoder.js';
import { clsHot } from './cls-hot.js';
import { wallstreetcnHot } from './wallstreetcn-hot.js';
import { xueqiu } from './xueqiu.js';
import { gelonghui } from './gelonghui.js';
import { jin10 } from './jin10.js';
import { fastbull } from './fastbull.js';
import { mktnews } from './mktnews.js';

export const TECH_FINANCE_READERS: readonly HotboardReader[] = [
  kr36Hot,
  kr36Quick,
  ithome,
  sspai,
  juejin,
  v2ex,
  solidot,
  hackernews,
  producthunt,
  githubTrending,
  coolapk,
  pcbetaWindows11,
  linuxdoHot,
  freebuf,
  nowcoder,
  clsHot,
  wallstreetcnHot,
  xueqiu,
  gelonghui,
  jin10,
  fastbull,
  mktnews,
];
