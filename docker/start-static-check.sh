#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

# Static frontend verification startup:
# 1) shared infra
# 2) backend + gateway
# 3) frontend-static(nginx)
docker compose -f docker/compose.base.yml up -d --wait mysql redis minio minio-init
bash docker/stack.sh instance1 docker/env/instance1.env
exec bash docker/stack.sh instance3 docker/env/instance3.env --logs
