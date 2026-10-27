#!/usr/bin/env bash
# Downloads the Fontshare faces MotionKit uses (free for commercial use under the ITF Free Font License,
# but not redistributable — so they are fetched, not bundled).
# Usage: fonts/fetch-fontshare.sh [destination-dir]   (default: this fonts/ folder)
set -euo pipefail
DEST="${1:-$(cd "$(dirname "$0")" && pwd)}"
mkdir -p "$DEST"
fetch() { # slug weight...
  local slug="$1"; shift
  for w in "$@"; do
    css=$(curl -fsSL "https://api.fontshare.com/v2/css?f[]=${slug}@${w}&display=swap")
    url=$(printf '%s' "$css" | grep -o "//cdn.fontshare.com[^']*\.woff2" | head -1)
    curl -fsSL "https:${url}" -o "${DEST}/${slug}-${w}.woff2" && echo "  ${slug}-${w}.woff2"
  done
}
echo "Fetching Fontshare fonts into ${DEST}"
fetch chillax 400 500 600 700
fetch satoshi 400 500 700 900
fetch general-sans 400 500 600 700
fetch clash-grotesk 400 500 600 700
fetch cabinet-grotesk 400 500 700 800
fetch switzer 400 500 600 700
