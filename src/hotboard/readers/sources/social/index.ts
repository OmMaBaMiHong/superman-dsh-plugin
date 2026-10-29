/**
 * 社会/新闻/文娱类平台 reader 注册表（batch social）。
 * 只允许改本文件与本目录下的 sources/*.ts；index 由 Lead 汇总。
 *
 * 顺序 = 勾选面板展示顺序：社会民生 → 文娱体育 → 国际时政 → 科技。
 */
import type { HotboardReader } from '../../types.js';
import { tiebaHotTopics } from './tieba.js';
import { tencentNewsHot } from './tencent.js';
import { hupuHotPosts } from './hupu.js';
import { doubanHotMovies } from './douban.js';
import { kuaishouHotRank } from './kuaishou.js';
import { ifengHotNews } from './ifeng.js';
import { dongqiudiNews } from './dongqiudi.js';
import { qqvideoHotSearch } from './qqvideo.js';
import { iqiyiHotRank } from './iqiyi.js';
import { zaobaoRealtime } from './zaobao.js';
import { cankaoxiaoxiNews } from './cankaoxiaoxi.js';
import { sputnikNews } from './sputniknewscn.js';
import { steamTopSellers } from './steam.js';
import { chongbuluoHotPosts } from './chongbuluo.js';

export const SOCIAL_READERS: readonly HotboardReader[] = [
  tiebaHotTopics,
  tencentNewsHot,
  hupuHotPosts,
  doubanHotMovies,
  kuaishouHotRank,
  ifengHotNews,
  dongqiudiNews,
  qqvideoHotSearch,
  iqiyiHotRank,
  zaobaoRealtime,
  cankaoxiaoxiNews,
  sputnikNews,
  steamTopSellers,
  chongbuluoHotPosts,
];
