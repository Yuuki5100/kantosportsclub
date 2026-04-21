#!/usr/bin/env bash
# Usage:
#   bash docker/diagnose.sh backend docker/env/instance1.env --起動してそのまま追従
#   bash docker/diagnose.sh gateway docker/env/instance1.env --既存 backend のログを追従
#   bash docker/diagnose.sh instance1 docker/env/instance1.env --既存 backend のログを150行だけ表示
#
# Optional:
#   bash docker/diagnose.sh --family modern instance1 docker/env/instance1.env
#   STACK_PROJECT_NAME=jems-dev bash docker/diagnose.sh backend docker/env/instance1.env
#
# What it does:
#   1. Starts the target service with `up -d --wait --no-deps`
#   2. Prints `docker compose ps`
#   3. Prints container status, recent logs, and inspect state
#
# Notes:
#   - `instance1` diagnoses `backend` and `gateway` sequentially
#   - This is intended for startup failure triage, especially when using `--no-deps`
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEFAULT_BASE_COMPOSE_FILE="${SCRIPT_DIR}/compose.base.yml"
LEGACY_COMPOSE_FILE="${SCRIPT_DIR}/compose.yml"

usage() {
  cat <<'EOF'
Usage:
  docker/diagnose.sh [--family <name>] <target> [env-file]

Targets:
  backend    Start backend with --no-deps, then print ps/logs/state
  gateway    Start gateway with --no-deps, then print ps/logs/state
  instance1  Diagnose backend and gateway sequentially

Examples:
  docker/diagnose.sh backend docker/env/instance1.env
  docker/diagnose.sh instance1 docker/env/instance1.env
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

FAMILY="${STACK_FAMILY:-modern}"
TARGET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --family)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --family" >&2
        exit 1
      fi
      FAMILY="$2"
      shift 2
      ;;
    --family=*)
      FAMILY="${1#*=}"
      shift
      ;;
    *)
      TARGET="$1"
      shift
      break
      ;;
  esac
done

ENV_FILE=""
if [[ $# -gt 0 ]]; then
  ENV_FILE="$1"
  shift
fi

if [[ $# -gt 0 ]]; then
  echo "Unknown argument: $1" >&2
  usage
  exit 1
fi

if [[ ! "${FAMILY}" =~ ^[a-z0-9][a-z0-9_-]*$ ]]; then
  echo "Invalid family name: ${FAMILY}" >&2
  exit 1
fi

cd "${REPO_ROOT}"

COMPOSE_FILES=()
if [[ -n "${COMPOSE_FILE:-}" ]]; then
  COMPOSE_FILES=("${COMPOSE_FILE}")
else
  FAMILY_COMPOSE_FILE="${SCRIPT_DIR}/compose.family.${FAMILY}.yml"
  if [[ -f "${DEFAULT_BASE_COMPOSE_FILE}" && -f "${FAMILY_COMPOSE_FILE}" ]]; then
    COMPOSE_FILES=("${DEFAULT_BASE_COMPOSE_FILE}" "${FAMILY_COMPOSE_FILE}")
  elif [[ "${FAMILY}" == "modern" && -f "${LEGACY_COMPOSE_FILE}" ]]; then
    COMPOSE_FILES=("${LEGACY_COMPOSE_FILE}")
  else
    echo "Family compose file not found: ${FAMILY_COMPOSE_FILE}" >&2
    exit 1
  fi
fi

STACK_PROJECT_NAME="${STACK_PROJECT_NAME:-}"
if [[ -z "${STACK_PROJECT_NAME}" ]]; then
  if [[ "${FAMILY}" == "modern" ]]; then
    STACK_PROJECT_NAME="jems-dev"
  else
    STACK_PROJECT_NAME="jems-dev-${FAMILY}"
  fi
fi

compose_cmd=(docker compose --project-name "${STACK_PROJECT_NAME}")
if [[ -n "${ENV_FILE}" ]]; then
  compose_cmd+=(--env-file "${ENV_FILE}")
fi
for compose_file in "${COMPOSE_FILES[@]}"; do
  compose_cmd+=(-f "${compose_file}")
done

run_compose() {
  "${compose_cmd[@]}" "$@"
}

print_header() {
  printf '\n== %s ==\n' "$1"
}

diagnose_service() {
  local service="$1"
  local container="jems-${service}"

  print_header "up ${service} (--no-deps)"
  run_compose up -d --wait --no-deps "${service}"
  local up_rc=$?
  echo "exit_code=${up_rc}"

  print_header "compose ps"
  run_compose ps || true

  print_header "container ps (${container})"
  docker ps -a --filter "name=^${container}$" --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' || true

  print_header "logs (${container})"
  docker logs --tail 200 "${container}" || true

  print_header "inspect state (${container})"
  docker inspect "${container}" --format '{{json .State}}' || true
}

case "${TARGET}" in
  backend)
    diagnose_service backend
    ;;
  gateway)
    diagnose_service gateway
    ;;
  instance1)
    diagnose_service backend
    diagnose_service gateway
    ;;
  *)
    echo "Unknown target: ${TARGET}" >&2
    usage
    exit 1
    ;;
esac
