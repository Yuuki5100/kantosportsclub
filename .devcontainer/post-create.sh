#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR="/workspace/common-archetecture"
FRONTEND_DIR="${WORKSPACE_DIR}/FE/spa-next/my-next-app"
BACKEND_DIR="${WORKSPACE_DIR}/BE"
CURRENT_UID="$(id -u)"
CURRENT_GID="$(id -g)"

git config --global --add safe.directory "${WORKSPACE_DIR}"

if [[ -f "${FRONTEND_DIR}/package-lock.json" ]]; then
  cd "${FRONTEND_DIR}"

  # Previous runs may leave root-owned build/dependency artifacts.
  # Normalize ownership so npm can write safely as the remoteUser.
  for target in node_modules .next next-env.d.ts; do
    if [[ -e "${target}" ]]; then
      owner_uid="$(stat -c "%u" "${target}")"
      owner_gid="$(stat -c "%g" "${target}")"
      if [[ "${owner_uid}" != "${CURRENT_UID}" || "${owner_gid}" != "${CURRENT_GID}" ]]; then
        sudo chown -R "${CURRENT_UID}:${CURRENT_GID}" "${target}"
      fi
    fi
  done

  npm ci
fi

if [[ -f "${BACKEND_DIR}/mvnw" ]]; then
  cd "${BACKEND_DIR}"

  # Previous docker runs may leave root-owned Maven build outputs.
  # Normalize only target directories to avoid broad ownership rewrites.
  while IFS= read -r target; do
    owner_uid="$(stat -c "%u" "${target}")"
    owner_gid="$(stat -c "%g" "${target}")"
    if [[ "${owner_uid}" != "${CURRENT_UID}" || "${owner_gid}" != "${CURRENT_GID}" ]]; then
      sudo chown -R "${CURRENT_UID}:${CURRENT_GID}" "${target}"
    fi
  done < <(find . -type d -name target -prune)

  chmod +x ./mvnw
  MAVEN_CONFIG="" ./mvnw -Pinstall-local-libs -pl servercommon/libs -am validate -q
fi
