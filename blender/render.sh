#!/usr/bin/env bash
# Render the playground, or stage a model from a .blend.
#
#   ./blender/render.sh                          fast EEVEE preview
#   ./blender/render.sh final                    full-res Cycles
#   ./blender/render.sh sheet                    4-angle contact sheet
#   ./blender/render.sh preview scenes/cat.blend  any mode + a .blend
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-preview}"
BLEND="${2:-}"
PORTRAIT=""
for a in "$@"; do [ "$a" = "portrait" ] && PORTRAIT="portrait"; done
[ "$MODE" = "portrait" ] && MODE="preview"
[ "$BLEND" = "portrait" ] && BLEND=""

case "$MODE" in
  preview|final|sheet) ;;
  *.blend) BLEND="$MODE"; MODE="preview" ;;   # allow `render.sh scenes/cat.blend`
  *) echo "usage: $0 [preview|final|sheet] [file.blend]" >&2; exit 2 ;;
esac

ARGS=()
STEM=""
if [ -n "$BLEND" ]; then
  [ -f "$BLEND" ] || { echo "no such .blend: $BLEND" >&2; exit 1; }
  BLEND="$(cd "$(dirname "$BLEND")" && pwd)/$(basename "$BLEND")"
  ARGS+=("$BLEND")
  STEM="$(basename "${BLEND%.blend}")_"
fi

case "$MODE" in
  preview) SCRIPT="$DIR/scene.py"; OUT="$DIR/out/${STEM}${PORTRAIT:+portrait_}render.png" ;;
  final)   SCRIPT="$DIR/scene.py"; ARGS+=(final); OUT="$DIR/out/${STEM}${PORTRAIT:+portrait_}final.png" ;;
  sheet)   SCRIPT="$DIR/sheet.py"; OUT="$DIR/out/${STEM}${PORTRAIT:+portrait_}sheet.png" ;;
esac

[ -n "$PORTRAIT" ] && ARGS+=(portrait)
mkdir -p "$DIR/out"
blender --background --python "$SCRIPT" -- "${ARGS[@]+"${ARGS[@]}"}" 2>&1 \
  | grep -Ev '^(Fra:|Blender quit)' || true

# Draw inline only for a real terminal; piped/CI callers just get the path.
if [ -t 1 ] && command -v viu >/dev/null 2>&1; then
  viu "$OUT"
else
  echo "wrote $OUT"
fi
