#!/usr/bin/env bash
# Typora → 偏好设置 → 图像 → 上传服务 → Custom Command：
#   /Users/abei/i/abei.me/scripts/typora-upload.sh
#
# 插入时选「上传图像」：压缩上传图床，正文只留 CDN 链接（不归档原图）。
# Token 优先读项目 .env 的 GITHUB_TOKEN。

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

exec "$NODE" "$ROOT/scripts/typora-upload.mjs" "$@"
