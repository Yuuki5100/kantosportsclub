#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${BE_ROOT}"
chmod +x ./mvnw

MVN_COMMON_ARGS=()
if [[ -n "${MAVEN_REPO_LOCAL:-}" ]]; then
  MVN_COMMON_ARGS+=("-Dmaven.repo.local=${MAVEN_REPO_LOCAL}")
fi

run_mvnw() {
  MAVEN_CONFIG="" ./mvnw "${MVN_COMMON_ARGS[@]}" "$@"
}

# Private libs are required before module build/test.
run_mvnw -Pinstall-local-libs -pl servercommon/libs -am validate

if [[ "$#" -eq 0 ]]; then
  run_mvnw clean package -DskipTests
else
  run_mvnw "$@"
fi
