#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

# Daily development startup:
# mysql + redis + minio + backend + gateway + frontend(Next.js dev)
exec bash docker/stack.sh all-in-one --logs

# docker compose -f docker/compose.base.yml -f docker/compose.family.modern.yml logs -f backend