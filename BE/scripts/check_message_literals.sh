#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

TARGET_GLOB='**/src/main/java/**/*.java'

declare -a LABELS=(
  "ApiResponse.error literal"
  "log literal"
  "throw Exception literal"
  "System.out/err literal"
)

declare -a PATTERNS=(
  'ApiResponse\.error\("'
  'log\.(trace|debug|info|warn|error)\("'
  'throw new [A-Za-z0-9_$.]*Exception\("'
  'System\.(out|err)\.println\('
)

has_violation=0

echo "[check-message-literals] scanning src/main/java ..."

scan_matches() {
  local pattern="$1"
  if command -v rg >/dev/null 2>&1; then
    rg -n --pcre2 "${pattern}" --glob "${TARGET_GLOB}" || true
  else
    grep -R -n -E --include='*.java' "${pattern}" . 2>/dev/null | grep '/src/main/java/' || true
  fi
}

for i in "${!LABELS[@]}"; do
  label="${LABELS[$i]}"
  pattern="${PATTERNS[$i]}"

  matches="$(scan_matches "${pattern}")"
  if [[ -n "${matches}" ]]; then
    has_violation=1
    echo ""
    echo "Violation: ${label}"
    echo "${matches}"
  fi
done

if [[ "${has_violation}" -eq 1 ]]; then
  echo ""
  echo "[check-message-literals] NG: literal message/log usage detected."
  exit 1
fi

echo "[check-message-literals] OK: no literal usage found."
