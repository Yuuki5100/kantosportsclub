#!/bin/bash
#
# k6 テスト実行スクリプト（テンプレート）
#
# 使用方法:
#   ./run-test.sh <環境名> <テストファイル>
#
# 例:
#   ./run-test.sh dev CT1505_TIMEOUT.js
#   ./run-test.sh prd CT1105_IDEMPOTENCY.js
#

set -e

if [ $# -lt 2 ]; then
  echo "使用方法: $0 <環境名> <テストファイル>"
  exit 1
fi

ENV_NAME="$1"
TEST_FILE="$2"
shift 2

# 環境ごとのURL定義（必要に応じて追加）
case "$ENV_NAME" in
  dev)
    TARGET_URL="http://<DEV_HOST>"
    ;;
  prd)
    TARGET_URL="https://<PRD_HOST>"
    ;;
  local)
    TARGET_URL="http://localhost:3000"
    ;;
  *)
    echo "未知の環境: $ENV_NAME"
    exit 1
    ;;
 esac

# 認証情報（必要に応じて環境変数から受ける）
TEST_USERNAME="${TEST_USERNAME:-}"
TEST_PASSWORD="${TEST_PASSWORD:-}"

CMD="TARGET_URL=$TARGET_URL"
if [ -n "$TEST_USERNAME" ]; then
  CMD="$CMD TEST_USERNAME=$TEST_USERNAME"
fi
if [ -n "$TEST_PASSWORD" ]; then
  CMD="$CMD TEST_PASSWORD=$TEST_PASSWORD"
fi

CMD="$CMD k6 run $TEST_FILE"

echo "実行コマンド: $CMD"

eval "$CMD"
