#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEFAULT_BASE_COMPOSE_FILE="${SCRIPT_DIR}/compose.base.yml"
LEGACY_COMPOSE_FILE="${SCRIPT_DIR}/compose.yml"

usage() {
  cat <<'EOF'
Usage:
  docker/stack.sh [--family <name>] <mode> [env-file] [--logs|--logs=combined|--logs=tmux|--no-logs]

Modes:
  up           Start all default services in selected family compose
  multi-container  Start local multi-container stack (infra + appserver + gateway + batchserver + frontend)
  all-in-one   Legacy alias for multi-container
  all-in-one-sync  Start all-in-one stack with optional syncconnector
  instance1    Start instance-1 role (appserver + gateway) without infra dependencies
  instance1-backend Start instance-1 backend only without infra dependencies
  instance1-sync   Start instance-1 role (appserver + gateway + syncconnector option)
  appserver-build  Rebuild and restart appserver only (--build --no-deps backend)
                   Backend Docker build includes dependent servercommon module (-am)
  instance2    Start instance-2 role (batchserver) without infra dependencies
  instance3    Rebuild and start instance-3 role (frontend static on nginx) without infra dependencies
  instance3-dev    Start instance-3 role in Next.js dev mode
  cloudfront-export Build static assets for CloudFront/S3 deployment into dist/frontend-static
  test-fe      Run frontend lint + Jest coverage inside Docker
  test-be      Run backend Maven tests inside Docker
  e2e          Run smoke E2E test
  newman       Run Postman collection tests via Newman and export reports to dist/newman
  wiremock     Start WireMock for external API stubs (modern family)
  otel         Start OpenTelemetry Collector + InfluxDB (modern adds Grafana)
  otel-metrics Fetch OpenTelemetry Collector Prometheus metrics and save to dist/otel
  trivy        Run Trivy filesystem scan and export report to dist/security
  gitleaks     Run Gitleaks secret scan and export report to dist/security
  python       Run python-tools container default command (uv run python --version)
  python-lock  Generate/update Python dependency lock file via uv (uv lock)
  python-sync  Sync Python dependencies via uv (uses --frozen when uv.lock exists)
  k6           Run k6 smoke load test and export report to dist/k6
  zap-baseline Run OWASP ZAP baseline scan and export reports to dist/zap
                 Uses a production-mode frontend container and ignores
                 accepted informational alerts via docker/zap/zap-baseline.conf
  zap-smoke    Run short OWASP ZAP smoke scan with 1 minute spider
  zap-frontend-build  Rebuild and cache frontend-zap .next bundle into dist/frontend-zap/.next
  seed-data    Re-apply shared QA seed data to MySQL and MinIO
  status       Show container status
  logs         Tail logs for major services
  logs-backend Tail logs for backend only
  logs-backend-f Follow backend logs in real time
  down         Stop and remove containers/networks
  down-v       Stop and remove containers/networks/volumes

Examples:
  docker/stack.sh up
  docker/stack.sh multi-container
  docker/stack.sh --family modern multi-container
  docker/stack.sh --family csharp up
  docker/stack.sh --family java-legacy up
  docker/stack.sh all-in-one
  docker/stack.sh instance1 docker/env/instance1.env
  docker/stack.sh instance1-backend docker/env/instance1.env
  docker/stack.sh instance1-sync docker/env/instance1.env
  docker/stack.sh appserver-build
  docker/stack.sh instance1 docker/env/instance1.env --logs
  docker/stack.sh instance1-backend docker/env/instance1.env --logs
  docker/stack.sh instance1 docker/env/instance1.env --logs=tmux
  docker/stack.sh instance3 docker/env/instance3.env --logs
  docker/stack.sh cloudfront-export docker/env/instance3.env
  docker/stack.sh test-fe
  docker/stack.sh test-be
  docker/stack.sh newman
  docker/stack.sh wiremock
  docker/stack.sh otel --logs
  docker/stack.sh otel-metrics
  docker/stack.sh trivy
  docker/stack.sh gitleaks
  docker/stack.sh python
  docker/stack.sh python-lock
  docker/stack.sh python-sync
  docker/stack.sh k6
  docker/stack.sh zap-baseline
  docker/stack.sh zap-smoke
  docker/stack.sh zap-frontend-build
  docker/stack.sh seed-data
  docker/stack.sh status
  docker/stack.sh logs-backend docker/env/instance1.env
  docker/stack.sh logs-backend-f docker/env/instance1.env

Log options:
  --logs               Follow logs after startup (combined view)
  --logs=combined      Same as --logs
  --logs=tmux          Open per-service log windows in tmux and attach/switch
  --no-logs            Disable auto logs even if env var enables it

Environment variables:
  STACK_FAMILY=modern          Default family when --family is omitted
  STACK_PROJECT_NAME=<name>    Override compose project name
  STACK_AUTO_LOGS=1            Enable auto log following after startup
  STACK_LOG_VIEWER=combined    Log viewer mode: combined | tmux
  STACK_TMUX_SESSION_PREFIX=jems  Prefix for tmux session name
  COMPOSE_FILE=/path/to/file.yml  Override compose file selection (disables family split auto-select)
  CSP_DISABLE_UNSAFE_EVAL=0    Frontend CSP switch (dev only). 1 disables script-src 'unsafe-eval'
  CSP_DISABLE_UNSAFE_INLINE=0  Frontend CSP switch (dev only). 1 disables 'unsafe-inline'
  CROSS_ORIGIN_ISOLATION_HEADERS=0  Frontend security headers switch. 1 enables COOP/COEP
  NEWMAN_BASE_URL=http://gateway:8888  Newman target base URL
  NEWMAN_COLLECTION=/etc/newman/smoke.postman_collection.json  Newman collection path in container
  NEWMAN_ENVIRONMENT=   Optional Newman environment file path in container
  NEWMAN_LOGIN_USER_ID=   Newman login user ID for token acquisition
  NEWMAN_LOGIN_PASSWORD=  Newman login password for token acquisition
  NEWMAN_AUTH_LOGIN_PATH=/api/auth/login  Newman login API path
  NEWMAN_AUTH_STATUS_PATH=/api/auth/status  Newman auth status API path
  NEWMAN_AUTH_TOKEN_COOKIE_NAME=ACCESS_TOKEN  Newman auth token cookie name
  NEWMAN_AUTH_LOGIN_USER_ID_KEY=user_id  Newman login JSON key for user ID
  NEWMAN_AUTH_LOGIN_PASSWORD_KEY=password  Newman login JSON key for password
  NEWMAN_REPORT_JSON=/reports/newman-report.json  Newman JSON report path in container
  NEWMAN_REPORT_JUNIT=/reports/newman-report.xml  Newman JUnit XML report path in container
  WIREMOCK_PORT=18089         WireMock published port on host
  OTEL_COLLECTOR_GRPC_PORT=4317  OTel Collector gRPC receiver published port
  OTEL_COLLECTOR_HTTP_PORT=4318  OTel Collector HTTP receiver published port
  OTEL_COLLECTOR_PROM_PORT=9464  OTel Collector Prometheus metrics published port
  INFLUXDB_PORT=8086            InfluxDB published port (monitoring profile)
  INFLUXDB_DB=ci_metrics        InfluxDB database created at startup
  INFLUXDB_ADMIN_USER=admin     InfluxDB admin user
  INFLUXDB_ADMIN_PASSWORD=adminpass
                              InfluxDB admin password
  GRAFANA_PORT=3001            Grafana published port (modern monitoring profile)
  GRAFANA_ADMIN_USER=admin     Grafana admin user (modern monitoring profile)
  GRAFANA_ADMIN_PASSWORD=admin Grafana admin password (modern monitoring profile)
  OTEL_METRICS_ENDPOINT=http://otel-collector:9464/metrics
                              OTel metrics fetch endpoint used by otel-metrics mode
  OTEL_INTERNAL_METRICS_ENDPOINT=http://otel-collector:8888/metrics
                              Fallback endpoint when OTEL_METRICS_ENDPOINT is empty
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector:4318/v1/traces
                              OTLP traces endpoint used by backend/gateway/batchserver/syncconnector
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://otel-collector:4318/v1/metrics
                              OTLP metrics endpoint used by backend/gateway/batchserver/syncconnector
  OTEL_TRACING_ENABLED=true   Enable tracing export in backend/gateway/batchserver/syncconnector docker profile
  OTEL_METRICS_EXPORT_ENABLED=true
                              Enable metrics export in backend/gateway/batchserver/syncconnector docker profile
  OTEL_TRACING_SAMPLING_PROBABILITY=1.0
                              Tracing sampling ratio for backend/gateway/batchserver/syncconnector
  OTEL_METRICS_EXPORT_STEP=30s
                              Metrics export interval for backend/gateway/batchserver/syncconnector
  TRIVY_SEVERITY=HIGH,CRITICAL  Trivy vulnerability severity filter
  TRIVY_TIMEOUT=10m           Trivy scan timeout
  TRIVY_EXIT_CODE=1           Trivy exit code when findings are present
  TRIVY_TARGET_DIR=/workspace  Trivy scan target path in container
  GITLEAKS_EXIT_CODE=1        Gitleaks exit code when findings are present
  GITLEAKS_SOURCE_DIR=.       Gitleaks source path (relative to /workspace)
  ZAP_SPIDER_MINUTES=3         ZAP baseline spider duration. zap-smoke defaults to 1
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

FAMILY="${STACK_FAMILY:-modern}"
MODE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --family)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --family" >&2
        usage
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
      MODE="$1"
      shift
      break
      ;;
  esac
done

if [[ -z "${MODE}" ]]; then
  usage
  exit 1
fi

ENV_FILE=""
FOLLOW_LOGS="${STACK_AUTO_LOGS:-0}"
LOG_VIEWER="${STACK_LOG_VIEWER:-combined}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --family)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --family" >&2
        usage
        exit 1
      fi
      FAMILY="$2"
      shift 2
      continue
      ;;
    --family=*)
      FAMILY="${1#*=}"
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --logs|--follow-logs|--logs=combined|--logs-viewer=combined)
      FOLLOW_LOGS=1
      LOG_VIEWER="combined"
      ;;
    --logs=tmux|--logs-viewer=tmux)
      FOLLOW_LOGS=1
      LOG_VIEWER="tmux"
      ;;
    --no-logs)
      FOLLOW_LOGS=0
      ;;
    *)
      if [[ -z "${ENV_FILE}" ]]; then
        ENV_FILE="$1"
      else
        echo "Unknown argument: $1" >&2
        usage
        exit 1
      fi
      ;;
  esac
  shift
done

if [[ ! "${FAMILY}" =~ ^[a-z0-9][a-z0-9_-]*$ ]]; then
  echo "Invalid family name: ${FAMILY}" >&2
  exit 1
fi

if [[ "${FOLLOW_LOGS}" != "0" && "${FOLLOW_LOGS}" != "1" ]]; then
  echo "Invalid STACK_AUTO_LOGS: ${FOLLOW_LOGS} (use 0 or 1)" >&2
  exit 1
fi

if [[ "${LOG_VIEWER}" != "combined" && "${LOG_VIEWER}" != "tmux" ]]; then
  echo "Invalid log viewer: ${LOG_VIEWER} (use combined or tmux)" >&2
  exit 1
fi

ENV_ARGS=()
if [[ -n "${ENV_FILE}" ]]; then
  ENV_ARGS+=(--env-file "${ENV_FILE}")
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
    echo "Available families:" >&2
    for family_file in "${SCRIPT_DIR}"/compose.family.*.yml; do
      [[ -e "${family_file}" ]] || continue
      family_name="${family_file##*/compose.family.}"
      family_name="${family_name%.yml}"
      echo "  - ${family_name}" >&2
    done
    exit 1
  fi
fi

COMPOSE_ARGS=()
for compose_file in "${COMPOSE_FILES[@]}"; do
  COMPOSE_ARGS+=(-f "${compose_file}")
done

STACK_PROJECT_NAME="${STACK_PROJECT_NAME:-}"
if [[ -z "${STACK_PROJECT_NAME}" ]]; then
  if [[ "${FAMILY}" == "modern" ]]; then
    STACK_PROJECT_NAME="jems-dev"
  else
    STACK_PROJECT_NAME="jems-dev-${FAMILY}"
  fi
fi

# Keep container file ownership aligned with the host user.
LOCAL_UID="${LOCAL_UID:-$(id -u)}"
LOCAL_GID="${LOCAL_GID:-$(id -g)}"
export LOCAL_UID LOCAL_GID

compose() {
  docker compose --project-name "${STACK_PROJECT_NAME}" "${ENV_ARGS[@]}" "${COMPOSE_ARGS[@]}" "$@"
}

MODE_SERVICES=()
FOLLOWABLE=0
ZAP_FRONTEND_BUILD_DIR="${REPO_ROOT}/dist/frontend-zap"
ZAP_FRONTEND_NEXT_DIR="${ZAP_FRONTEND_BUILD_DIR}/.next"
ZAP_FRONTEND_HASH_FILE="${ZAP_FRONTEND_BUILD_DIR}/source.sha256"

bring_up_wait() {
  compose up -d --wait "$@"
}

ensure_grafana_volume_permissions() {
  local grafana_data_dir="${REPO_ROOT}/dist/monitoring/grafana"
  mkdir -p "${grafana_data_dir}"

  if docker run --rm \
    -v "${grafana_data_dir}:/var/lib/grafana" \
    --user 0:0 \
    --entrypoint sh \
    grafana/grafana:11.1.0 \
    -c 'chown -R 472:472 /var/lib/grafana' >/dev/null 2>&1; then
    return
  fi

  echo "[warn] Failed to align Grafana volume ownership to 472:472: ${grafana_data_dir}" >&2
  echo "[warn] Run manually: docker run --rm -v \"${grafana_data_dir}:/var/lib/grafana\" --user 0:0 --entrypoint sh grafana/grafana:11.1.0 -c 'chown -R 472:472 /var/lib/grafana'" >&2
}

follow_logs() {
  if [[ "${FOLLOW_LOGS}" != "1" || "${FOLLOWABLE}" != "1" || "${#MODE_SERVICES[@]}" -eq 0 ]]; then
    return
  fi

  if [[ "${LOG_VIEWER}" == "tmux" ]]; then
    if ! command -v tmux >/dev/null 2>&1; then
      echo "[warn] tmux is not installed. Falling back to combined logs." >&2
      LOG_VIEWER="combined"
    fi
  fi

  if [[ "${LOG_VIEWER}" == "combined" ]]; then
    echo "[logs] Following logs: ${MODE_SERVICES[*]}"
    compose logs -f "${MODE_SERVICES[@]}"
    return
  fi

  local session_prefix="${STACK_TMUX_SESSION_PREFIX:-jems}"
  local safe_mode="${MODE//[^a-zA-Z0-9_-]/-}"
  local session="${session_prefix}-${safe_mode}-$(date +%H%M%S)"
  local repo_quoted
  printf -v repo_quoted '%q' "${REPO_ROOT}"

  local compose_cmd=(docker compose --project-name "${STACK_PROJECT_NAME}" "${ENV_ARGS[@]}" "${COMPOSE_ARGS[@]}")
  local first=1

  for service in "${MODE_SERVICES[@]}"; do
    local service_cmd=("${compose_cmd[@]}" logs -f "${service}")
    local service_cmd_quoted
    printf -v service_cmd_quoted '%q ' "${service_cmd[@]}"
    local full_cmd="cd ${repo_quoted} && ${service_cmd_quoted}"

    if [[ "${first}" -eq 1 ]]; then
      tmux new-session -d -s "${session}" -n "${service}" "${full_cmd}"
      first=0
    else
      tmux new-window -t "${session}" -n "${service}" "${full_cmd}"
    fi
  done

  echo "[logs] Opened tmux session: ${session}"
  if [[ -n "${TMUX:-}" ]]; then
    tmux switch-client -t "${session}"
  else
    tmux attach-session -t "${session}"
  fi
}

zap_frontend_source_hash() {
  local hash_inputs=(
    "${REPO_ROOT}/FE/spa-next/my-next-app"
    "${REPO_ROOT}/frontend/Dockerfile"
  )
  local compose_file
  for compose_file in "${COMPOSE_FILES[@]}"; do
    hash_inputs+=("${compose_file}")
  done

  find \
    "${hash_inputs[@]}" \
    \( -type d \( \
      -name .git \
      -o -name .next \
      -o -name coverage \
      -o -name node_modules \
      -o -name playwright-report \
      -o -name storybook-static \
      -o -name test-results \
    \) -prune \) \
    -o -type f -print0 \
    | LC_ALL=C sort -z \
    | xargs -0 sha256sum -- \
    | sha256sum \
    | awk '{print $1}'
}

zap_frontend_container_healthy() {
  [[ "$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' jems-frontend-zap 2>/dev/null || true)" == "healthy" ]]
}

zap_frontend_ensure_image() {
  if docker image inspect jems-dev-frontend-zap >/dev/null 2>&1; then
    return
  fi

  if docker image inspect jems-dev-frontend >/dev/null 2>&1; then
    docker image tag jems-dev-frontend jems-dev-frontend-zap
    return
  fi

  echo "[zap] frontend base image is missing. Building jems-dev-frontend-zap once..."
  compose --profile security build --pull=false frontend-zap-build
}

zap_frontend_build_cache() {
  mkdir -p "${ZAP_FRONTEND_NEXT_DIR}"
  zap_frontend_ensure_image
  echo "[zap] Building frontend-zap bundle cache..."
  compose --profile security run --rm --no-deps frontend-zap-build
  zap_frontend_source_hash > "${ZAP_FRONTEND_HASH_FILE}"
}

zap_frontend_ensure_running() {
  mkdir -p "${ZAP_FRONTEND_NEXT_DIR}"
  zap_frontend_ensure_image

  local source_hash=""
  local cached_hash=""
  source_hash="$(zap_frontend_source_hash)"
  if [[ -f "${ZAP_FRONTEND_HASH_FILE}" ]]; then
    cached_hash="$(cat "${ZAP_FRONTEND_HASH_FILE}")"
  fi

  if [[ "${source_hash}" != "${cached_hash}" || ! -f "${ZAP_FRONTEND_NEXT_DIR}/BUILD_ID" ]]; then
    zap_frontend_build_cache
    compose --profile security up -d --wait --no-build --force-recreate frontend-zap
    return
  fi

  if zap_frontend_container_healthy; then
    echo "[zap] Reusing healthy frontend-zap and cached .next bundle."
    return
  fi

  if compose --profile security up -d --wait --no-build frontend-zap; then
    echo "[zap] Started frontend-zap with cached .next bundle."
    return
  fi

  zap_frontend_build_cache
  compose --profile security up -d --wait --no-build --force-recreate frontend-zap
}

zap_scan() {
  mkdir -p dist/zap
  zap_frontend_ensure_running
  CROSS_ORIGIN_ISOLATION_HEADERS=1 ZAP_SPIDER_MINUTES="${1}" \
    compose --profile security up --no-build --force-recreate \
      --abort-on-container-exit --exit-code-from zap-baseline zap-baseline
}

ensure_non_modern_family_exclusive_ready() {
  local existing_names
  existing_names="$(docker ps -a --format '{{.Names}}')"

  local shared_container_names=(
    jems-mysql
    jems-minio
    jems-minio-init
    jems-redis
    jems-python-tools
  )

  local conflicts=()
  local name
  for name in "${shared_container_names[@]}"; do
    if grep -Fxq "${name}" <<<"${existing_names}"; then
      conflicts+=("${name}")
    fi
  done

  if [[ "${#conflicts[@]}" -gt 0 ]]; then
    echo "Family '${FAMILY}' is configured for exclusive operation." >&2
    echo "Shared base containers already exist: ${conflicts[*]}" >&2
    echo "Stop the currently running family first (example):" >&2
    echo "  docker/stack.sh --family modern down" >&2
    exit 1
  fi
}

if [[ "${FAMILY}" != "modern" ]]; then
  case "${MODE}" in
    up|status|logs|down|down-v)
      ;;
    otel|otel-metrics)
      if [[ "${FAMILY}" != "java-legacy" ]]; then
        echo "Mode '${MODE}' is currently supported only for families 'modern' and 'java-legacy'." >&2
        echo "For family '${FAMILY}', use one of: up, status, logs, down, down-v" >&2
        exit 1
      fi
      ;;
    *)
      echo "Mode '${MODE}' is currently supported only for family 'modern'." >&2
      echo "For family '${FAMILY}', use one of: up, status, logs, down, down-v" >&2
      if [[ "${FAMILY}" == "java-legacy" ]]; then
        echo "Additionally, java-legacy supports: otel, otel-metrics" >&2
      fi
      exit 1
      ;;
  esac
fi

if [[ "${MODE}" == "up" && "${FAMILY}" != "modern" ]]; then
  ensure_non_modern_family_exclusive_ready
fi

case "${MODE}" in
  up)
    compose up -d
    mapfile -t MODE_SERVICES < <(compose config --services)
    if [[ "${#MODE_SERVICES[@]}" -gt 0 ]]; then
      wait_services=()
      for service in "${MODE_SERVICES[@]}"; do
        if [[ "${service}" == "minio-init" ]]; then
          continue
        fi
        wait_services+=("${service}")
      done
      if [[ "${#wait_services[@]}" -gt 0 ]]; then
        compose up -d --wait "${wait_services[@]}"
      fi
      FOLLOWABLE=1
    fi
    ;;
  multi-container|all-in-one)
    bring_up_wait backend
    bring_up_wait batchserver
    bring_up_wait gateway
    bring_up_wait frontend
    MODE_SERVICES=(mysql redis minio minio-init backend gateway batchserver frontend)
    FOLLOWABLE=1
    ;;
  all-in-one-sync)
    compose --profile syncconnector up -d --wait backend
    compose --profile syncconnector up -d --wait batchserver
    compose --profile syncconnector up -d --wait gateway
    compose --profile syncconnector up -d --wait syncconnector
    compose --profile syncconnector up -d --wait frontend
    MODE_SERVICES=(mysql redis minio minio-init backend gateway syncconnector batchserver frontend)
    FOLLOWABLE=1
    ;;
  instance1)
    bring_up_wait --no-deps backend
    bring_up_wait --no-deps gateway
    MODE_SERVICES=(backend gateway)
    FOLLOWABLE=1
    ;;
  instance1-backend)
    bring_up_wait --no-deps backend
    MODE_SERVICES=(backend)
    FOLLOWABLE=1
    ;;
  instance1-sync)
    compose --profile syncconnector up -d --wait --no-deps backend
    compose --profile syncconnector up -d --wait --no-deps gateway
    compose --profile syncconnector up -d --wait --no-deps syncconnector
    MODE_SERVICES=(backend gateway syncconnector)
    FOLLOWABLE=1
    ;;
  appserver-build)
    compose up -d --build --no-deps backend
    MODE_SERVICES=(backend)
    FOLLOWABLE=1
    ;;
  instance2)
    compose up -d --no-deps batchserver
    MODE_SERVICES=(batchserver)
    FOLLOWABLE=1
    ;;
  instance3)
    compose up -d --build --no-deps frontend-static
    MODE_SERVICES=(frontend-static)
    FOLLOWABLE=1
    ;;
  instance3-dev)
    compose up -d --no-deps frontend
    MODE_SERVICES=(frontend)
    FOLLOWABLE=1
    ;;
  cloudfront-export)
    mkdir -p dist/frontend-static
    compose --profile cloudfront run --rm frontend-export
    ;;
  test-fe)
    compose --profile test run --rm frontend-test
    ;;
  test-be)
    mkdir -p dist/backend-test-home/.m2
    compose --profile test run --rm backend-test
    ;;
  e2e)
    compose up --build --abort-on-container-exit --exit-code-from e2e e2e
    ;;
  newman)
    mkdir -p dist/newman
    compose --profile qa run --rm newman
    ;;
  wiremock)
    bring_up_wait wiremock
    MODE_SERVICES=(wiremock)
    FOLLOWABLE=1
    ;;
  otel)
    if [[ "${FAMILY}" == "modern" ]]; then
      ensure_grafana_volume_permissions
      compose --profile monitoring up -d --wait otel-collector grafana
      MODE_SERVICES=(influxdb otel-collector grafana)
    else
      compose --profile monitoring up -d --wait otel-collector
      MODE_SERVICES=(influxdb otel-collector)
    fi
    FOLLOWABLE=1
    ;;
  otel-metrics)
    mkdir -p dist/otel
    compose --profile monitoring up -d --wait otel-collector
    compose --profile monitoring run --rm --no-deps otel-metrics | tee dist/otel/collector-metrics.prom
    echo "[otel] Metrics snapshot saved to dist/otel/collector-metrics.prom"
    ;;
  trivy)
    mkdir -p dist/security
    compose --profile security run --rm trivy
    ;;
  gitleaks)
    mkdir -p dist/security
    compose --profile security run --rm gitleaks
    ;;
  python)
    mkdir -p dist/python/uv-cache
    compose --profile tools run --rm python-tools
    ;;
  python-lock)
    mkdir -p dist/python/uv-cache
    compose --profile tools run --rm python-tools uv lock
    ;;
  python-sync)
    mkdir -p dist/python/uv-cache
    if [[ -f "${REPO_ROOT}/TOOL/python/uv.lock" ]]; then
      compose --profile tools run --rm python-tools uv sync --frozen
    else
      echo "[python] uv.lock not found. Running 'uv sync' to generate lock file first."
      compose --profile tools run --rm python-tools uv sync
    fi
    ;;
  k6)
    mkdir -p dist/k6
    compose --profile performance up --abort-on-container-exit --exit-code-from k6 k6
    ;;
  zap-baseline)
    zap_scan "${ZAP_SPIDER_MINUTES:-3}"
    ;;
  zap-smoke)
    zap_scan "${ZAP_SPIDER_MINUTES:-1}"
    ;;
  zap-frontend-build)
    zap_frontend_build_cache
    ;;
  seed-data)
    bring_up_wait mysql
    bring_up_wait minio
    compose run --rm minio-init
    compose exec -T mysql sh -lc 'mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" < /docker-entrypoint-initdb.d/02_seed_automation.sql'
    ;;
  status)
    compose ps -a
    ;;
  logs)
    if [[ "${FAMILY}" == "modern" ]]; then
      compose logs --tail=150 backend gateway syncconnector batchserver frontend frontend-static wiremock influxdb grafana otel-collector
    else
      compose logs --tail=150
    fi
    ;;
  logs-backend)
    compose logs --tail=150 backend
    ;;
  logs-backend-f)
    compose logs -f backend
    ;;
  down)
    compose down
    ;;
  down-v)
    compose down -v --remove-orphans
    ;;
  *)
    usage
    exit 1
    ;;
esac

follow_logs
