#!/usr/bin/env bash
# Typora → 偏好设置 → 图像 → 上传服务 → Custom Command：
#   /Users/abei/i/abei.me/scripts/typora-upload.sh
#
# 插入时选「上传图像」：压缩上传图床，正文只留 CDN 链接（不归档原图）。
# Token 优先读项目 .env 的 GITHUB_TOKEN。
# 调试：每次调用追加写入 .typora-upload-debug.log（stdout/stderr/耗时/退出码）

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Typora 环境 PATH 很瘦，显式找 node
NODE=""
for c in \
  "$HOME/.local/share/vite-plus/bin/node" \
  "$HOME/.local/share/pnpm/node" \
  "$HOME/.nvm/versions/node/"*/bin/node \
  /opt/homebrew/bin/node \
  /usr/local/bin/node \
  "$(command -v node 2>/dev/null || true)"; do
  for cand in $c; do
    if [[ -x "$cand" ]]; then
      NODE="$cand"
      break 2
    fi
  done
done

if [[ -z "$NODE" ]]; then
  echo "Upload Failed: node not found" >&2
  exit 1
fi

# 加载 .env（不 export 整文件到 stdout）
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

DEBUG_LOG="$ROOT/.typora-upload-debug.log"
OUT="$(mktemp -t typora-up-out)"
ERR="$(mktemp -t typora-up-err)"
cleanup() { rm -f "$OUT" "$ERR"; }
trap cleanup EXIT

START_MS="$(python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null || echo 0)"
set +e
"$NODE" "$ROOT/scripts/typora-upload.mjs" "$@" >"$OUT" 2>"$ERR"
CODE=$?
set -e
END_MS="$(python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null || echo 0)"
DUR=$((END_MS - START_MS))

{
  echo "---- $(date -u +%Y-%m-%dT%H:%M:%SZ) pid=$$ code=$CODE ${DUR}ms ----"
  echo "argv: $*"
  echo "stdout:"
  cat "$OUT"
  echo "stderr:"
  cat "$ERR"
  echo
} >>"$DEBUG_LOG" 2>/dev/null || true

# Typora 只读 stdout；stderr 也回显方便「验证上传」面板
cat "$OUT"
cat "$ERR" >&2
exit "$CODE"
