#!/usr/bin/env node
/**
 * 热榜渠道探针：逐个实抓所有内置渠道，输出 条数/耗时/状态。
 *
 * 用途：
 *   - 开源用户排查「某个平台为什么没数据」；
 *   - 维护者发版前确认几十个渠道还有多少存活。
 *
 * 用法：
 *   pnpm hotboard:probe            # 全部渠道
 *   pnpm hotboard:probe weibo 36kr-hot   # 只看指定渠道
 */
import { BUILTIN_CHANNELS } from '../src/hotboard/channels.js';
import { collectHotboard } from '../src/hotboard/collector.js';

const wanted = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const channels = wanted.length > 0
  ? BUILTIN_CHANNELS.filter((channel) => wanted.includes(channel.id))
  : BUILTIN_CHANNELS;

if (channels.length === 0) {
  console.error(`没有匹配的渠道。可选：${BUILTIN_CHANNELS.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

const startedAt = Date.now();
const result = await collectHotboard(process.env, { platforms: channels.map((c) => c.id) });
const elapsed = Date.now() - startedAt;

const counts = new Map(result.channels.map((c) => [c.channelId, c]));
let ok = 0;
let failed = 0;
let items = 0;

for (const channel of channels) {
  const info = counts.get(channel.id);
  if (info?.ok) {
    ok += 1;
    items += info.count;
    console.log(`OK   ${String(info.count).padStart(3)} 条  ${channel.id}  ${channel.name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${'  -'.padStart(4)}    ${channel.id}  ${channel.name}  ${info?.error ?? 'no result'}`);
  }
}

console.log(
  `\n合计 ${channels.length} 个渠道：${ok} 成功 / ${failed} 失败，${items} 条，耗时 ${elapsed}ms`,
);
process.exitCode = failed === channels.length ? 1 : 0;
