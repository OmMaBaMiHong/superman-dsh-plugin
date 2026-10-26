#!/usr/bin/env bash
# ============================================================
# SAU 发布执行器（PyInstaller 二进制形态）启动脚本
#
# 供插件调度器 services.keeper 拉起（spawnSauExecutor → bash 本脚本 start），
# 也可手动管理：scripts/sau-executor.sh {start|stop|status|logs}
#
# 与上游 FeedFuse 版的差异：
#   - 执行器走 PyInstaller 二进制（build/sau-dist/sau-backend/），零 Python 依赖；
#     缺二进制时按提示跑 scripts/build-sau-binary.sh
#   - 数据目录独立：vendor/sau-data（cookies/db/videoFile，已 gitignore），
#     与上游服务互不影响；迁移账号 = 拷贝上游 cookies/ 与 db/database.db
#
# 密钥单一来源：~/.dsh/.env 的 SAU_TOKEN（与 DSH 插件进程同一把）。
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/build/sau-dist/sau-backend/sau-backend"
DATA_DIR="${SAU_DATA_DIR:-$ROOT/vendor/sau-data}"
PID_FILE="$DATA_DIR/.executor.pid"
LOG_FILE="$DATA_DIR/logs/executor.log"

# DSH 桌面端 webserver 端口（插件 /s/api 所在）；换端口时用环境变量覆盖
SAU_CALLBACK_URL="${SAU_CALLBACK_URL:-http://127.0.0.1:19387/s/api/platform-accounts/sau/callback}"

load_token() {
  if [ -f "$HOME/.dsh/.env" ]; then
    # shellcheck disable=SC1090
    SAU_TOKEN="$(grep -E '^SAU_TOKEN=' "$HOME/.dsh/.env" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
  fi
  if [ -z "${SAU_TOKEN:-}" ]; then
    echo "✗ 未找到 SAU_TOKEN：请在 ~/.dsh/.env 里配置（与 DSH 插件进程同一把密钥）" >&2
    exit 1
  fi
}

is_running() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

case "${1:-status}" in
  start)
    if is_running; then
      echo "✓ 执行器已在运行（pid $(cat "$PID_FILE")，:5409）"
      exit 0
    fi
    [ -x "$BIN" ] || { echo "✗ 找不到执行器二进制：$BIN（先跑 scripts/build-sau-binary.sh）" >&2; exit 1; }
    load_token
    mkdir -p "$DATA_DIR/logs"
    echo "启动 SAU 执行器（:5409，数据目录 ${DATA_DIR}，回调 → ${SAU_CALLBACK_URL}）…"
    (cd "$DATA_DIR" && \
      SAU_DATA_DIR="$DATA_DIR" SAU_TOKEN="$SAU_TOKEN" SAU_CALLBACK_URL="$SAU_CALLBACK_URL" \
      nohup "$BIN" >> "$LOG_FILE" 2>&1 & echo $! > "$PID_FILE")
    # PyInstaller 冷启动约 8-15s，轮询探活而非定长睡眠
    ok=0
    for _ in $(seq 1 15); do
      sleep 2
      if curl -sf -H "x-sau-token: $SAU_TOKEN" 'http://127.0.0.1:5409/getValidAccounts?type=1' >/dev/null 2>&1; then ok=1; break; fi
    done
    if [ "$ok" = 1 ]; then
      echo "✓ 执行器已就绪：http://127.0.0.1:5409"
    else
      echo "△ 进程已起（pid $(cat "$PID_FILE")）；健康检查未通过，看日志：scripts/sau-executor.sh logs"
      exit 1
    fi
    ;;
  stop)
    if is_running; then
      kill "$(cat "$PID_FILE")" && rm -f "$PID_FILE"
      echo "✓ 已停止"
    else
      echo "△ 未在运行"
      rm -f "$PID_FILE"
    fi
    ;;
  status)
    if is_running; then
      echo "✓ 运行中（pid $(cat "$PID_FILE")，:5409）"
    else
      echo "✗ 未运行"
      exit 1
    fi
    ;;
  logs)
    tail -n 40 "$LOG_FILE"
    ;;
  *)
    echo "用法：$0 {start|stop|status|logs}" >&2
    exit 1
    ;;
esac
