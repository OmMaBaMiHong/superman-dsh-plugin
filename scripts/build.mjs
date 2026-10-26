#!/usr/bin/env node
/**
 * 构建 superman-dsh-plugin 产物（dist/），对齐应用仓库 scripts/build/build-plugin.mjs：
 *   1. esbuild 把 host 半入口（src/plugin/host/index.ts）连 kernel/* 闭包打成
 *      单个 ESM 文件（@/ 别名经 tsconfig paths 在构建期解析；pg / better-sqlite3 /
 *      rsshub 等原生或运行时解析的依赖保持 external）
 *   2. 原样拷贝零构建资源：client 半 JS、H5 静态页、SQL 迁移（核心 + 插件）
 * hotboard（src/hotboard）被 jobs/scheduler 的动态 import 拉进同一 bundle。
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const esbuild = require('esbuild')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'dist', 'plugin')

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

await esbuild.build({
  entryPoints: [join(root, 'src', 'plugin', 'host', 'index.ts')],
  outfile: join(out, 'host', 'index.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  tsconfig: join(root, 'tsconfig.json'),
  // 原生模块与需要在运行时按 node_modules 解析的包保持 external。
  // rsshub 走 new Function 动态 import，本就不会被静态追踪，显式声明防意外。
  external: [
    'pg', 'pg-native', 'pg-cloudflare', 'better-sqlite3', 'jsdom', '@whisper-cpp-node/*',
    'cloudflare:sockets', 'busboy', '@extractus/article-extractor', 'patchright', 'playwright',
    'playwright-core', '@deepseek-ai/*', '@electric-sql/*', 'rsshub',
  ],
  // CJS 依赖（http2-wrapper 等）在 ESM 产物里动态 require node 内置模块；
  // 用 createRequire 兜底（esbuild 的已知限制）。
  banner: {
    js: "import { createRequire as __supermanCreateRequire } from 'node:module'; import { fileURLToPath as __supermanFileURLToPath } from 'node:url'; import { dirname as __supermanDirname } from 'node:path'; const require = __supermanCreateRequire(import.meta.url); const __filename = __supermanFileURLToPath(import.meta.url); const __dirname = __supermanDirname(__filename);",
  },
  logLevel: 'info',
})

for (const [from, to] of [
  ['src/plugin/client', 'dist/plugin/client'],
  ['src/plugin/public', 'dist/plugin/public'],
  ['src/plugin/host/migrations', 'dist/plugin/host/migrations'],
  ['kernel/server/infra/db/migrations', 'dist/plugin/host/migrations-core'],
]) {
  cpSync(join(root, from), join(root, to), { recursive: true })
}

console.log('[build] dist/plugin 就绪（host esbuild 产物 + client/public/migrations 拷贝）')
