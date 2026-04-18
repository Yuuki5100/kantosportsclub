#!/bin/sh
set -eu

mc alias set local http://minio:9000 minio minio123
mc mb -p local/app-bucket || true
mc anonymous set private local/app-bucket || true
mc mb -p local/qa-evidence || true
mc anonymous set private local/qa-evidence || true

cat <<'EOF' | mc pipe local/app-bucket/seed/qa-targets.json
{
  "generatedBy": "docker/minio/init.sh",
  "scenarios": [
    {
      "tool": "e2e-smoke",
      "baseUrl": "http://frontend:3000",
      "path": "/login"
    },
    {
      "tool": "k6-smoke",
      "baseUrl": "http://gateway:8888",
      "path": "/"
    },
    {
      "tool": "zap-baseline",
      "baseUrl": "http://frontend-zap:3000",
      "path": "/"
    }
  ]
}
EOF
