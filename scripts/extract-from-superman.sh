#!/usr/bin/env bash
# 从 superman 应用仓库提取插件内核到本仓库（一键提取，可重复执行）。
#
# 用法：
#   bash scripts/extract-from-superman.sh [应用仓库路径]
#   缺省路径：/Users/wade/work-space/pa-chong-cai-ji/FeedFuse
#
# 提取内容：
#   src/plugin/**            → src/plugin/**            （插件本体：host/client/public）
#   src/core/**              → kernel/core/**           （自包含内核，对外零依赖）
#   @/server|lib|features 闭包 → kernel/server|lib|features/**（种子清单 + 自动迭代闭包）
#   vendor/rsshub package.json/dist-lib/patches → vendor/rsshub/
#
# 提取后：pnpm install && pnpm type-check，按剩余报错补 npm 依赖或排查缺文件。
set -euo pipefail

APP_REPO="${1:-/Users/wade/work-space/pa-chong-cai-ji/FeedFuse}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

[ -d "$APP_REPO/src/plugin" ] || { echo "找不到应用仓库：$APP_REPO"; exit 1; }

echo "==> 提取插件本体 src/plugin"
rm -rf "$HERE/src/plugin"
cp -R "$APP_REPO/src/plugin" "$HERE/src/plugin"
# public 下是构建产物，保留；构建脚本后续再决定是否随仓

echo "==> 提取内核 src/core → kernel/core"
rm -rf "$HERE/kernel/core"
mkdir -p "$HERE/kernel"
cp -R "$APP_REPO/src/core" "$HERE/kernel/core"

echo "==> 提取 @/server、@/lib、@/features 依赖闭包"
mkdir -p "$HERE/kernel/server" "$HERE/kernel/lib" "$HERE/kernel/features"

copy_rel() {
  # $1 = src 下的相对路径（不带 src/ 前缀），拷成 kernel/ 同形路径。
  # 先删后拷保证目录种子幂等（cp -R 对已存在 dst 会嵌套出一层同名目录）。
  local rel="$1" src="$APP_REPO/src/$1" dst="$HERE/kernel/$1"
  rm -rf "$dst"
  mkdir -p "$(dirname "$dst")"
  cp -R "$src" "$dst"
}

# 种子清单：api.ts / index.ts / tools.ts 的直接依赖（按提取时点盘点）。
# 后续闭包由下面的自动迭代补齐，种子只保证首轮有起点。
for p in \
  src/server/infra/http/errors.ts \
  src/server/infra/queue/localDriver.ts \
  src/server/integrations/ai \
  src/server/integrations/chaos \
  src/server/integrations/rss/ssrfGuard.ts \
  src/server/domains/articles/repositories/articlesRepo.ts \
  src/server/domains/settings/repositories/settingsRepo.ts \
  src/server/domains/rsshubCookie \
  src/server/domains/feeds/services/feedCategoryLifecycleService.ts \
  src/server/domains/trendradar/repository.ts \
  src/server/domains/users/userScope.ts \
  src/server/lib/contentType.ts \
  src/lib/rsshub/url.ts \
  src/features/settings/settingsSchema.ts \
  src/features/reader/utils \
  src/server/integrations/rsshub \
  src/server/services/video \
  src/server/infra/db/migrations \
  src/worker \
  src/types \
  ; do
  if [ -e "$APP_REPO/$p" ]; then
    copy_rel "${p#src/}"
  else
    echo "    [缺失] $p（构建修复阶段处理）"
  fi
done

echo "==> 自动迭代补齐 @/ 引用闭包"
# 规则：扫描 src/ kernel/ 里所有 @/core|server|lib|features 引用，
# 目标在 kernel/ 缺位的，从应用仓库按 .ts → .tsx → 目录 三种形态拷入；
# 每轮结束重算缺失清单，清单为空才收敛，最多 10 轮（每轮新文件可能带来新引用）。
list="$HERE/.extract-missing.$$"
absent="$HERE/.extract-absent.$$"
: > "$absent"
round=0
while [ "$round" -lt 10 ]; do
  round=$((round + 1))
  : > "$list"
  while IFS= read -r ref; do
    p="${ref#@/}"
    if [ -e "$HERE/kernel/$p.ts" ] || [ -e "$HERE/kernel/$p.tsx" ] \
       || [ -e "$HERE/kernel/$p/index.ts" ] || [ -e "$HERE/kernel/$p" ]; then
      continue
    fi
    echo "$ref" >> "$list"
  done < <(grep -rhoE "(from|import\()[[:space:]]*['\"]@/(core|server|lib|features|worker|types)(/[^'\"]+)?['\"]" \
             "$HERE/src" "$HERE/kernel" --include='*.ts' --include='*.tsx' \
           | grep -oE "@/[^'\"]+" | sort -u)
  [ -s "$list" ] || break
  while IFS= read -r ref; do
    p="${ref#@/}"
    if   [ -f "$APP_REPO/src/$p.ts" ];  then copy_rel "$p.ts";  echo "    + $ref"
    elif [ -f "$APP_REPO/src/$p.tsx" ]; then copy_rel "$p.tsx"; echo "    + $ref"
    elif [ -d "$APP_REPO/src/$p" ];     then copy_rel "$p";     echo "    + $ref/（目录）"
    else echo "$ref" >> "$absent"; fi
  done < "$list"
done
if [ -s "$absent" ]; then
  echo "    [缺失] 以下引用在应用仓库找不到源，type-check 阶段处理："
  sed 's/^/        /' "$absent"
fi
[ "$round" -lt 10 ] || echo "    [警告] 10 轮未收敛，剩余缺失见上"
rm -f "$list" "$absent"

echo "==> 应用独立版差异 patch（scripts/patches/）"
# 应用仓库的 src/plugin 是上游原样拷贝；独立版的差异（hotboard tick、调度默认开、
# 去 Python TrendRadar 定时器）以 patch 形式重放。已打过（含标记）自动跳过。
apply_patch() {
  # 注意：局部变量不能叫 patch（会遮蔽 /usr/bin/patch，bash 3.2 + set -u 下间歇性
  # 报 unbound variable 导致整个提取中止、独立版差异丢失），统一用 patch_file。
  local patch_file="$1" marker="$2" target="$3"
  if grep -q "$marker" "$HERE/$target" 2>/dev/null; then
    echo "    [跳过] $patch_file（已应用）"
  elif /usr/bin/patch -p1 --forward -d "$HERE" < "$HERE/scripts/patches/$patch_file"; then
    echo "    [应用] $patch_file"
  else
    echo "    [失败] $patch_file —— 上游文件变化导致补丁冲突，需人工合并后重新生成"; exit 1
  fi
}
apply_patch standalone-scheduler.patch 'hotboard.sync' src/plugin/host/jobs/scheduler.ts
apply_patch standalone-host.patch '独立版无 Python TrendRadar' src/plugin/host/index.ts

echo "==> 提取 vendor/rsshub 编译产物与补丁"
mkdir -p "$HERE/vendor/rsshub"
for f in package.json dist-lib patches; do
  if [ -e "$APP_REPO/vendor/rsshub/$f" ]; then
    rm -rf "$HERE/vendor/rsshub/$f"
    cp -R "$APP_REPO/vendor/rsshub/$f" "$HERE/vendor/rsshub/"
  fi
done

echo "==> 完成。下一步："
echo "    pnpm install"
echo "    pnpm type-check   # 按报错补 npm 依赖或缺漏文件"
echo "    pnpm build"
