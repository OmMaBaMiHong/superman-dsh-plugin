# 热榜 reader 移植说明与许可

本目录（`src/hotboard/readers/`）里的各平台榜单解析器移植自开源项目 **newsnow**
（<https://github.com/ourongxing/newsnow>，MIT License，Copyright (c) 2024 ourongxing），
并把抓取方式统一改成 Node 自带 `fetch`（`http.ts`），只保留「取数 + 解析」逻辑。

- 每个 `sources/**/*.ts` 文件头部注明来源文件；
- newsnow 的 MIT 许可与版权声明见 `LICENSE-NEWSNOW-MIT.txt`，分发本仓库时请一并保留；
- `sources/social/`、`sources/tech-finance/` 里部分平台是社区后续修补（接口变更/反爬），
  实现可能与 newsnow 当前版本不同，但同样以 MIT 方式随本仓库分发。

新增一个平台的步骤：

1. 在对应 batch 目录下新建 `xxx.ts`，导出 `HotboardReader`（字段见 `types.ts`）；
2. 在 batch 的 `index.ts` 注册；
3. `pnpm hotboard:probe xxx` 实抓验证能返回条目；
4. 实测确实不可用（接口下线/需登录）的，保留代码但 `enabled: false`，目录不展示、默认不采集。
