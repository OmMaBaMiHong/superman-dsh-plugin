/**
 * 热榜 reader 契约。
 *
 * 每个 reader 封装「一个平台的榜单抓取 + 解析」：返回数组顺序即名次。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）的解析器统一收敛到这一形状，
 * 新增平台 = 加一个 sources/*.ts + 在对应 batch 的 index.ts 里注册一行。
 */
export type ReaderCategory = 'china' | 'entertainment' | 'tech' | 'finance' | 'world'

export interface ReaderItem {
  title: string
  url?: string | null
  /** 平台原生热度文案（如「456 万热度」），看板直接展示。 */
  heatLabel?: string | null
  /** 数值化热度，仅用于排序/展示。 */
  heat?: number | null
  /** 摘要/副标题（可选）。 */
  summary?: string | null
}

export interface HotboardReader {
  /** 稳定 ID，入库 platform 字段 + 目录 key。 */
  id: string
  /** 展示名。 */
  name: string
  homeUrl: string
  category: ReaderCategory
  /** 本轮实测不可用（接口下线/需登录）时置 false：代码保留、目录不展示、默认不采集。 */
  enabled?: boolean
  read: () => Promise<readonly ReaderItem[]>
}
