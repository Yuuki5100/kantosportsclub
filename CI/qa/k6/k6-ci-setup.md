# k6 CI 導入手順・動作確認ガイド
## 目的 - FE/FEG の k6 負荷テストを Merge Request(MR) 時に自動実行
- thresholds 不達で MR をブロック
- 結果は Artifacts(JSON) として保存、後から確認可能
- （任意）InfluxDB/Grafana へ送って可視化

---

## 構成・概要
- 共有テンプレ: `CI/qa/k6/.gitlab-ci-k6.yml`
- `.k6-run` で grafana/k6 を実行し JSON を出力
- ルート `.gitlab-ci.yml` で include
- `k6-both` で FE/FEG を parallel.matrix で並列実行
- スクリプト配置例: `FE/spa-next/my-next-app/k6/script.js` と `FEG/spa-next/my-next-gen-app/k6/script.js`

---

## 1. スクリプト配置の例
```bash
mkdir -p FE/spa-next/my-next-app/k6
mkdir -p FEG/spa-next/my-next-gen-app/k6

# FE のスクリプトを FEG にもコピー（中身は共通で OK）
cp FE/spa-next/my-next-app/k6/script.js FEG/spa-next/my-next-gen-app/k6/script.js
```

### `script.js` の共通サンプル
```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: Number(__ENV.K6_VUS || 10),
  duration: __ENV.K6_DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const url = __ENV.TARGET_URL || 'http://example.com/health';
  const res = http.get(url);
  check(res, { 'status 200': r => r.status === 200 });
}
```

> URL の指定は **CI Variables** で `TARGET_URL` / `K6_VUS` / `K6_DURATION` を与えて切り替え可能。
---

## 2. テンプレ CI: `CI/qa/k6/.gitlab-ci-k6.yml`
```yaml
# CI/qa/k6/.gitlab-ci-k6.yml
.k6-base:
  image:
    name: grafana/k6:latest
    entrypoint: [""]      # 👈 これで /bin/sh が使われる。k6 はシェルから実行。
  tags: [docker-runner]
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

.k6-run:
  stage: collect
  image: grafana/k6:latest
  needs: []
  tags: [docker-runner]
  script:
    - echo "▶ k6 version: $(k6 version)"
    - test -f "$K6_SCRIPT_PATH" || { echo "k6 script not found: $K6_SCRIPT_PATH"; ls -al $(dirname "$K6_SCRIPT_PATH") || true; exit 1; }
    - |
      k6 run \
        --vus "${K6_VUS:-10}" \
        --duration "${K6_DURATION:-30s}" \
        --summary-export "k6-summary-${OUT_PREFIX}.json" \
        --out json="k6-results-${OUT_PREFIX}.json" \
        "$K6_SCRIPT_PATH"
  artifacts:
    when: always
    paths:
      - k6-results-*.json
      - k6-summary-*.json
    expire_in: 2 weeks
  allow_failure: true
```

---

## 3. ルートCIへ include と並列ジョブ
**ルート `.gitlab-ci.yml`** の先頭に include を追加し、下記ジョブを追記。
```yaml
include:
  - local: 'CI/qa/k6/.gitlab-ci-k6.yml'
  - local: 'CI/.gitlab-ci-secrets.yml'   # 秘密情報スキャン（別途導入済み）
  - local: 'CI/.gitlab-ci-sk.yml'
    rules:
      - if: '$CI_COMMIT_BRANCH =~ /^(develop|release-(dev|uat|prd))$/'
      - changes: [FE/**/*, BE/**/*]
  - local: 'CI/.gitlab-ci-nu.yml'
    rules:
      - if: '$CI_COMMIT_BRANCH =~ /^(develop-nu|release-nu.*)$/'
      - changes: [FEG/**/*, BEG/**/*]

# FE / FEG を同時実行
k6-both:
  extends: .k6-run
  parallel:
    matrix:
      - K6_SCRIPT_PATH: "FE/spa-next/my-next-app/k6/script.js"
        OUT_PREFIX: "fe"
        K6_VUS: "10"
        K6_DURATION: "30s"
        # TARGET_URL: "https://dev-fe.example.com/health"
      - K6_SCRIPT_PATH: "FEG/spa-next/my-next-gen-app/k6/script.js"
        OUT_PREFIX: "feg"
        K6_VUS: "10"
        K6_DURATION: "30s"
        # TARGET_URL: "https://dev-feg.example.com/health"
```

> `stages:` は既存の `collect` を使うか、必要に応じて `test` に合わせて調整。MR 時のみ実行する場合は `.k6-base.rules` で制御。
---

## 4. CI Variables（任意）
Project > Settings > CI/CD > Variables に必要に応じて追加。
- 共通強度: `K6_VUS=10`, `K6_DURATION=30s`
- ターゲットURL: `TARGET_URL`（FE/FEG で異なる場合は matrix に直書き or Scoped Variables）
- Influx 併用時: `INFLUX_URL=http://<host>:8086/k6`（Runner から到達可能なこと）
---

## 5. 動作確認
1. ブランチを作成し、上記ファイルをコミットして push
2. MR を作成
3. `collect`（または `test`）ステージで **k6-both** が 2 並列で実行されることを確認
4. Artifacts に `k6-results-fe.json` / `k6-summary-fe.json` / `k6-results-feg.json` / `k6-summary-feg.json` が保存されることを確認
5. thresholds 未達の場合、ジョブが **Failed** となり MR がブロックされることを確認
---

## 6. 結果の見方
- `k6-summary-*.json`: 集計サマリ（p95、エラー率など）
- `k6-results-*.json`: 時系列データ（必要ならダウンロードして可視化に利用）
GitLab UI: MR > Pipelines > 対象ジョブ > Job artifacts > Download
---

## 7. よくあるハマり & 対処
- URL に到達できない: Runner からの到達性、Firewall/Proxy 設定、`HTTP_PROXY`/`HTTPS_PROXY` を確認
- スクリプトが見つからない: `K6_SCRIPT_PATH` の位置とパスを確認
- thresholds が厳しすぎる: 一旦緩めてパイプラインを通し、実測値に合わせて調整
- 長時間テストを CI で回すと遅い: MR 用は短く（例: 10s、30s）、本格負荷は schedule ジョブで夜間/UAT 時に実行
---

## 8. （任意）InfluxDB/Grafana への送信
Runner から InfluxDB に到達できる場合、各 matrix に追加。
```yaml
K6_OUT: "influxdb=$INFLUX_URL"   # 例: http://10.0.0.5:8086/k6
```

> 既存の可視化基盤があれば Grafana で統合可視化。
---

## 9. ロールバック/無効化
- 一時的に無効化: `k6-both` の `rules` に条件を追加（例: `$CI_MERGE_REQUEST_ID && $RUN_K6 == "1"`）
- 完全に停止: `k6-both` ジョブをコメントアウト or 削除
