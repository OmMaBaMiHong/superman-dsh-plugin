/**
 * 快手热搜榜（首页 Apollo 状态里的 visionHotRank）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/kuaishou.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchText, text } from '../../http.js';

interface ApolloNode {
  id?: string;
  name?: string;
  hotValue?: string | null;
  tagType?: string | null;
  items?: Array<{ id?: string }>;
}

/** Apollo 归一化缓存：`defaultClient[key]` → 节点；根查询节点 key 为 ROOT_QUERY。 */
interface ApolloClient {
  ROOT_QUERY?: Record<string, ApolloNode | undefined>;
  [nodeKey: string]: ApolloNode | Record<string, ApolloNode | undefined> | undefined;
}

interface ApolloState {
  defaultClient?: ApolloClient;
}

const HOME_URL = 'https://www.kuaishou.com/?isHome=1';
const APOLLO_PATTERN = /window\.__APOLLO_STATE__\s*=\s*(\{.+?\});/s;
const HOT_RANK_KEY = 'visionHotRank({"page":"home"})';

export const kuaishouHotRank: HotboardReader = {
  id: 'kuaishou',
  name: '快手热搜',
  homeUrl: 'https://www.kuaishou.com/',
  category: 'entertainment',
  async read() {
    const html = await fetchText(HOME_URL);
    const matched = APOLLO_PATTERN.exec(html);
    if (!matched?.[1]) throw new Error('快手首页未找到 __APOLLO_STATE__');
    const state = JSON.parse(matched[1]) as ApolloState;
    const client: ApolloClient = state.defaultClient ?? {};
    const hotRankId = client.ROOT_QUERY?.[HOT_RANK_KEY]?.id;
    if (!hotRankId) throw new Error('快手 Apollo 状态缺少 visionHotRank 节点');
    const rank = client[hotRankId] as ApolloNode | undefined;
    const refs = rank?.items ?? [];
    return refs
      .map((ref): ReaderItem | null => {
        const node = ref.id ? client[ref.id] : undefined;
        const title = text(node?.name);
        // 置顶条目不参与热榜名次。
        if (!title || node?.tagType === '置顶') return null;
        return {
          title,
          url: `https://www.kuaishou.com/search/video?searchKey=${encodeURIComponent(title)}`,
          heatLabel: text(node?.hotValue) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
