#!/usr/bin/env bash
# 构建 SAU 发布执行器 PyInstaller 二进制（免 Python 分发形态）。
#
# 用法：
#   bash scripts/build-sau-binary.sh [应用仓库路径]
#   缺省应用仓库：/Users/wade/work-space/pa-chong-cai-ji/FeedFuse
#
# 产物：build/sau-dist/sau-backend/（onedir，约 400MB，含 opencv + playwright/patchright 驱动）
# 数据目录由运行时 SAU_DATA_DIR 决定（scripts/sau-executor.sh 缺省 vendor/sau-data），
# conf 补丁（scripts/patches/sau-conf-data-dir.patch）负责脚手架与幂等建表。
#
# 浏览器依赖：Playwright/patchright 的 Chromium 在用户级缓存（~/Library/Caches/ms-playwright），
# 不随二进制分发；全新机器发布前需执行一次 `patchright install chromium`。
set -euo pipefail

APP_REPO="${1:-/Users/wade/work-space/pa-chong-cai-ji/FeedFuse}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$APP_REPO/vendor/douyin-publish-service"
VENV_PY="$SRC/.venv/bin/python"

[ -d "$SRC" ] || { echo "✗ 找不到 SAU 服务源码：$SRC"; exit 1; }
[ -x "$VENV_PY" ] || { echo "✗ 应用仓库 SAU venv 未部署（bash scripts/start-douyin-publish.sh 可自动创建）：$VENV_PY"; exit 1; }

echo "==> 暂存源码（排除 venv/缓存/用户数据）"
STAGE="$HERE/build/sau-stage"
rm -rf "$STAGE"
mkdir -p "$STAGE"
rsync -a --exclude='.venv' --exclude='__pycache__' --exclude='logs' --exclude='*.pyc' "$SRC/" "$STAGE/"
rm -rf "$STAGE/videoFile" "$STAGE/cookiesFile" "$STAGE/db/database.db"
mkdir -p "$STAGE/videoFile"

echo "==> 应用 conf 数据目录补丁"
patch -p1 -d "$STAGE" --forward < "$HERE/scripts/patches/sau-conf-data-dir.patch" \
  || { echo "✗ conf 补丁应用失败（上游 conf.py 变更？）需人工合并"; exit 1; }

echo "==> 确认 PyInstaller"
"$VENV_PY" -m PyInstaller --version >/dev/null 2>&1 || "$VENV_PY" -m pip install --quiet pyinstaller

echo "==> 构建（onedir）"
cd "$STAGE"
"$VENV_PY" -m PyInstaller --noconfirm --clean --onedir --name sau-backend \
  --paths . \
  --collect-all playwright --collect-all patchright --collect-all cv2 \
  --workpath "$HERE/build/pyinstaller-work" --distpath "$HERE/build/sau-dist" \
  sau_backend.py

echo "==> 冒烟：启动并探活 :5409"
SMOKE_DATA="$(mktemp -d)"
SAU_DATA_DIR="$SMOKE_DATA" SAU_TOKEN=build-smoke nohup "$HERE/build/sau-dist/sau-backend/sau-backend" > "$SMOKE_DATA/boot.log" 2>&1 &
BOOT_PID=$!
ok=0
for _ in $(seq 1 15); do
  sleep 2
  if curl -sf -H 'x-sau-token: build-smoke' 'http://127.0.0.1:5409/getValidAccounts?type=1' >/dev/null 2>&1; then ok=1; break; fi
done
kill "$BOOT_PID" 2>/dev/null || true
if [ "$ok" = 1 ]; then
  echo "✓ 构建完成且探活通过：build/sau-dist/sau-backend/sau-backend"
else
  echo "△ 构建完成但探活未通过，启动日志：$SMOKE_DATA/boot.log"; exit 1
fi
