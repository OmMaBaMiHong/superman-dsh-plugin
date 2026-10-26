# superman-dsh-plugin

Superman 热点订阅与创作的 **DSH 独立插件**：只依赖 DSH 宿主，安装即可用——
内置渠道热榜采集、RSS/博主订阅、看板与 agent 工具，数据落在本机内嵌库
（PGlite，零配置），可选接入 Postgres。

## 安装

把本仓库放进（或 link 进）DSH profile 的依赖即可：

```bash
# DSH profile package.json
"dependencies": {
  "superman": "link:/path/to/superman-dsh-plugin"
}
```

重启 DSH 后插件自动挂载：`/s/api/*` 业务 API、`/s/app/*` H5 前端、
`superman_*` agent 工具、调度器（热点定时同步）。

## 内置渠道（写死、可改）

知乎热榜 · 微博热搜 · 百度热搜 · 头条热榜 · 抖音热点

- 渠道定义集中在 [`src/hotboard/channels.ts`](src/hotboard/channels.ts)：
  每个渠道 = endpoint + 解析函数，增删改只动这一个文件
- 追加渠道不改代码：`HOTBOARD_EXTRA_CHANNELS_JSON` 环境变量传 JSON 数组
- 单渠道失败自动隔离，不拖累其它渠道
- 采集结果写入 `trend_radar_items` 表，看板 / agent 工具 / 转选题链路零改动复用

## 架构

```
src/hotboard/   内置渠道采集器（纯 TS，零外部进程——替代旧 TrendRadar Python 外采链）
src/plugin/     插件本体（host：/s/api + 调度 + agent 工具；client：DSH 侧栏面板）
kernel/core/    自包含业务内核（治理/订阅/发布追踪/热点/知识，对外零依赖）
kernel/server|lib|features   依赖闭包（提取脚本搬入）
vendor/rsshub/  RSSHub 编译产物（dist-lib，import 即用，RSS/博主订阅）
```

可选增强（不配置即隐藏，插件功能不受影响）：Chaos 中台治理榜单、
平台发布能力（SAU 执行器，见下）。

## 平台发布（SAU 执行器，可选）

发布到抖音/小红书/B站等平台的能力由 SAU 执行器承载（Flask + patchright 浏览器自动化，
上游 social-auto-upload 分支）。它是**插件拉起的本地辅助进程**，以 PyInstaller 打成本机
二进制，本机无需 Python 环境：

```bash
bash scripts/build-sau-binary.sh    # 一次性构建（需应用仓库的 SAU venv），产物 build/sau-dist/
bash scripts/sau-executor.sh start  # 启动（调度器 keeper 也会自动拉起），:5409
```

- 数据目录 `vendor/sau-data/`（cookies/db/videoFile，gitignore），与上游服务互不影响；
  迁移已登录账号 = 拷贝上游的 `cookies/` 与 `db/database.db`
- 共享密钥 `~/.dsh/.env` 的 `SAU_TOKEN`，与插件进程同一把
- 本机浏览器驱动缺失时补一次：`patchright install chromium`（用户级缓存，不随二进制走）

## 开发

```bash
bash scripts/extract-from-superman.sh [应用仓库路径]   # 从 superman 应用提取内核（自动迭代闭包）
pnpm install
pnpm type-check     # 应为零错误
pnpm build          # esbuild 单文件打包（scripts/build.mjs）+ 资产拷贝
pnpm hotboard:sync  # 零配置：无连接串时自动走 PGlite 并补迁移
```

独立版与上游 `src/plugin` 的差异（hotboard 调度 tick、调度默认开、去 Python
TrendRadar 定时器）以 patch 形式放在 `scripts/patches/`，提取脚本拷贝后自动重放；
上游更新导致补丁冲突时需人工合并重新生成。

数据落在本机 `~/.dsh/superman/pgdata`（PGlite 单实例：插件运行中时 `pnpm hotboard:sync`
会等锁超时，先退出 DSH 或改用连接串）。

## License

见 LICENSE（内核与插件跟随主项目协议；内嵌 RSSHub 为 AGPL-3.0，见 vendor/rsshub）。
