#!/bin/bash

# =====================================
# git-svn fetch 分割実行用スクリプト
# 対象: ブランチ全体など巨大なリポジトリ
# =====================================

# ▼ 取得範囲設定（必要に応じて調整）
START_REV=1
END_REV=500
STEP=50

# ▼ ログ出力ファイル（任意）
LOGFILE="fetch_log.txt"

echo "Start fetching SVN revisions..." | tee -a "$LOGFILE"

for ((i=START_REV; i<=END_REV; i+=STEP)); do
  FROM=$i
  TO=$((i+STEP-1))

  echo "Fetching revisions $FROM to $TO..." | tee -a "$LOGFILE"

  GIT_SVN_ID=$(git config --get svn-remote.svn.fetch | cut -d':' -f2)

  # フェッチ実行
  git svn fetch -r$FROM:$TO 2>&1 | tee -a "$LOGFILE"

  # 直前のステータス確認
  if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Fetch failed at revision $FROM-$TO. Stopping." | tee -a "$LOGFILE"
    break
  fi
done

echo "✅ Fetch completed." | tee -a "$LOGFILE"
