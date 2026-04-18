# Lighthouse 驕狗畑繧ｬ繧､繝会ｼ医Ο繝ｼ繧ｫ繝ｫ螳溯｡・/ GitLab CI 邨・∩霎ｼ縺ｿ / 髢ｾ蛟､驕狗畑・・
縺薙・繝峨く繝･繝｡繝ｳ繝医・縲´ighthouse・医♀繧医・ Lighthouse CI: LHCI・峨・**繝ｭ繝ｼ繧ｫ繝ｫ螳溯｡梧婿豕・*縲・*GitLab CI 繧ｸ繝ｧ繝門ｮ夂ｾｩ**縲・*繧ｹ繧ｳ繧｢髢ｾ蛟､縺ｮ險ｭ險・*縲・*驕狗畑譎ゅ・隱ｿ謨ｴ繝昴う繝ｳ繝・*繧偵∪縺ｨ繧√◆繧ゅ・縺ｧ縺吶・
---

## 0. 蜑肴署縺ｨ繧ｴ繝ｼ繝ｫ

- 繝ｭ繝ｼ繧ｫ繝ｫ縺ｧ **謇区掠縺剰ｨ域ｸｬ**縺励？TML 繝ｬ繝昴・繝医ｒ遒ｺ隱阪〒縺阪ｋ
- GitLab CI 縺ｧ **MR 譎ゅ↓閾ｪ蜍戊ｨ域ｸｬ**縺励・*髢ｾ蛟､譛ｪ驕斐〒繧ｸ繝ｧ繝悶ｒ螟ｱ謨・*縺輔○繧具ｼ・R 繧ｲ繝ｼ繝茨ｼ・- 險域ｸｬ URL / 遶ｯ譛ｫ繝励Μ繧ｻ繝・ヨ / 螳溯｡悟屓謨ｰ / Chrome 襍ｷ蜍輔が繝励す繝ｧ繝ｳ / 霑ｽ蜉繝倥ャ繝 遲峨ｒ **譟碑ｻ溘↓隱ｿ謨ｴ**縺ｧ縺阪ｋ
- ・井ｻｻ諢擾ｼ・*FE / FEG 繧剃ｸｦ蛻・*縺ｧ險域ｸｬ縲∫ｵ先棡繧偵い繝ｼ繝・ぅ繝輔ぃ繧ｯ繝医↓菫晏ｭ・
---

## 1. 繝ｭ繝ｼ繧ｫ繝ｫ螳溯｡・
### 1.1 繧､繝ｳ繧ｹ繝医・繝ｫ
```powershell
npm i -g @lhci/cli
# 螟ｱ謨励☆繧句ｴ蜷医・ npx 縺ｧ莉｣逕ｨ: npx @lhci/cli <subcommand>
```

> Windows 縺ｧ Chrome 繝代せ讀懷・縺ｫ螟ｱ謨励☆繧句ｴ蜷茨ｼ・```powershell
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### 1.2 縺ｾ縺・1 蝗槭□縺題ｨ域ｸｬ・・ollect・・```powershell
$env:LHCI_URL="https://example.com/login"
lhci collect `
  --url="$env:LHCI_URL" `
  --settings.preset=desktop `
  --numberOfRuns=1 `
  --settings.chromeFlags="--headless=new --no-sandbox --disable-gpu"
```
- 蜃ｺ蜉帙・ `./.lighthouseci/` 驟堺ｸ具ｼ・TML/JSON・・
### 1.3 譛ｬ逡ｪ諠ｳ螳夲ｼ・utorun・壼庶髮・+ 髢ｾ蛟､繧｢繧ｵ繝ｼ繝・+ 繝ｬ繝昜ｿ晏ｭ假ｼ・```powershell
lhci autorun `
  --collect.url="$env:LHCI_URL" `
  --collect.settings.preset=desktop `
  --collect.numberOfRuns=3 `
  --collect.settings.chromeFlags="--headless=new --no-sandbox --disable-gpu" `
  --upload.target=filesystem `
  --upload.outputDir="./lhci-reports"
```
- 螳溯｡悟ｾ後～./lhci-reports` 縺ｫ HTML / JSON 縺檎函謌舌＆繧後∪縺吶・
### 1.4 隍・焚 URL 繧剃ｸ豌励↓貂ｬ繧・```powershell
lhci collect `
  --url="https://example.com/login" `
  --url="https://example.com/dashboard" `
  --url="https://example.com/help" `
  --settings.preset=desktop `
  --numberOfRuns=1
```

### 1.5 繧医￥菴ｿ縺・ｨｭ螳・- **繝励Μ繧ｻ繝・ヨ**・啻--collect.settings.preset=desktop|mobile`
- **蝗樊焚**・啻--collect.numberOfRuns=1..5`・亥ｮ牙ｮ壼喧逶ｮ逧・ｼ・- **繝倥ャ繝**・啻--collect.extraHeaders='{"Cookie":"name=value","Authorization":"Basic xxxxx"}'`
- **繧ｿ繧､繝繧｢繧ｦ繝・*・啻--collect.settings.maxWaitForFcp=15000 --collect.settings.maxWaitForLoad=35000`

> 隱崎ｨｼ縺悟ｿ・ｦ√↑繝壹・繧ｸ縺ｯ縲√∪縺壹・繝ｭ繧ｰ繧､繝ｳ逕ｻ髱｢繧・・髢九・繝ｼ繧ｸ縺九ｉ縲ゅ←縺・＠縺ｦ繧ゅΟ繧ｰ繧､繝ｳ蠕後ｒ險域ｸｬ縺吶ｋ蝣ｴ蜷医・縲・*preScript** 縺ｧ繝ｭ繧ｰ繧､繝ｳ竊辰ookie 豕ｨ蜈･縲√∪縺溘・ **extraHeaders** 縺ｧ Cookie/Authorization 繝倥ャ繝繧呈ｸ｡縺呎焔豕輔ｒ讀懆ｨ弱・
---

## 2. 髢ｾ蛟､・・ssertions・峨→險ｭ螳壹ヵ繧｡繧､繝ｫ

繝励Ο繧ｸ繧ｧ繧ｯ繝育峩荳九↓ `lighthouserc.json` 繧帝・鄂ｮ縺吶ｋ縺ｨ縲～lhci autorun` 螳溯｡梧凾縺ｫ **閾ｪ蜍輔〒隱ｭ縺ｿ霎ｼ縺ｾ繧後∪縺・*縲・
```json
{
  "ci": {
    "collect": {
      "url": [
        "https://example.com/login"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--headless=new --no-sandbox --disable-gpu"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["warn", { "minScore": 0.90 }],
        "categories:best-practices": ["warn", { "minScore": 0.90 }],
        "categories:seo": ["warn", { "minScore": 0.90 }],
        "is-on-https": "error",
        "unused-css-rules": "warn",
        "unminified-javascript": "off",
        "unminified-css": "off"
      }
    }
  }
}
```
- **error**・壽悴驕斐〒繧ｸ繝ｧ繝門､ｱ謨暦ｼ・R 繝悶Ο繝・け・・- **warn**・壽悴驕斐〒繧ゅず繝ｧ繝悶・謌仙粥・磯夂衍縺ｮ縺ｿ・・- **off**・壹メ繧ｧ繝・け辟｡蜉ｹ

> 驕狗畑縺ｮ譛蛻昴・ `warn` 螟壹ａ縺ｧ蟆主・縺励∝ｮ牙ｮ壹＠縺溘ｉ **谿ｵ髫守噪縺ｫ `error`** 縺ｫ蠑輔″荳翫￡繧九→濶ｯ縺・〒縺吶・
---

## 3. GitLab CI 邨・∩霎ｼ縺ｿ・域怙蟆乗ｧ区・・・
### 3.1 繧ｸ繝ｧ繝悶ユ繝ｳ繝励Ξ・・CI/qa/lhci/.gitlab-ci-lhci.yml`・・```yaml
.lhci-base:
  image: node:20
  tags: [docker-runner]
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  before_script:
    - apt-get update
    - apt-get install -y chromium
    - npm i -g @lhci/cli
    - export CHROME_PATH=/usr/bin/chromium

lhci-run:
  stage: qa
  extends: .lhci-base
  variables:
    LHCI_URL: "https://example.com/login"  # 蠢・ｦ√↓蠢懊§縺ｦ CI Variables 縺ｧ荳頑嶌縺・  script: |
    lhci autorun \
      --collect.url="$LHCI_URL" \
      --collect.settings.preset=desktop \
      --collect.numberOfRuns=3 \
      --collect.settings.chromeFlags="--headless=new --no-sandbox --disable-gpu" \
      --upload.target=filesystem \
      --upload.outputDir="./lhci-reports"
  artifacts:
    when: always
    paths: [lhci-reports/]
    expire_in: 2 weeks
```

### 3.2 繝ｫ繝ｼ繝・`.gitlab-ci.yml` 縺ｫ include
```yaml
include:
  - local: 'CI/qa/lhci/.gitlab-ci-lhci.yml'
# ・井ｻ悶・ include 縺ｯ譌｢蟄倥←縺翫ｊ・・```

### 3.3 螳溯｡後ち繧､繝溘Φ繧ｰ
- 荳願ｨ倥ユ繝ｳ繝励Ξ縺ｧ縺ｯ **MR 繧､繝吶Φ繝域凾縺ｮ縺ｿ** 螳溯｡鯉ｼ・rules`・峨・- push / schedule 縺ｧ繧りｵｰ繧峨○縺溘＞蝣ｴ蜷医・ `rules` 繧定ｿｽ蜉・・```yaml
rules:
  - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  - if: '$CI_PIPELINE_SOURCE == "push"'
  - if: '$CI_PIPELINE_SOURCE == "schedule"'
```

---

## 4. FE / FEG 繧・*荳ｦ蛻励〒**險域ｸｬ・・atrix・・
```yaml
lhci-both:
  stage: qa
  extends: .lhci-base
  parallel:
    matrix:
      - TARGET_NAME: "fe"
        LHCI_URL: "https://fe.example.com/login"
      - TARGET_NAME: "feg"
        LHCI_URL: "https://feg.example.com/login"
  script: |
    lhci autorun \
      --collect.url="$LHCI_URL" \
      --collect.settings.preset=desktop \
      --collect.numberOfRuns=3 \
      --collect.settings.chromeFlags="--headless=new --no-sandbox --disable-gpu" \
      --upload.target=filesystem \
      --upload.outputDir="./lhci-reports-${TARGET_NAME}"
  artifacts:
    when: always
    paths:
      - lhci-reports-fe/
      - lhci-reports-feg/
    expire_in: 2 weeks
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```

---

## 5. CI Variables・井ｾ具ｼ・
- `LHCI_URL`・夊ｨ域ｸｬ蟇ｾ雎｡ URL・・R 蜈医・迺ｰ蠅・↓蠢懊§縺ｦ **繧ｹ繧ｳ繝ｼ繝嶺ｻ倥″螟画焚**縺ｧ蛻・崛・・- `LHCI_HEADERS`・哽SON 譁・ｭ怜・縺ｧ霑ｽ蜉繝倥ャ繝繧呈ｸ｡縺呻ｼ・--collect.extraHeaders="$LHCI_HEADERS"`・・- `CHROME_PATH`・啻/usr/bin/chromium`・・inux・・/ Windows 縺ｮ Chrome 繝代せ・・unner 縺・Windows 縺ｮ蝣ｴ蜷茨ｼ・
> 繝悶Λ繝ｳ繝√せ繧ｳ繝ｼ繝嶺ｾ具ｼ啻develop 竊・dev 迺ｰ蠅チ, `release-uat 竊・uat 迺ｰ蠅チ

---

## 6. 驕狗畑縺ｮ蜍俶園・磯明蛟､縺ｨ螟ｱ謨玲擅莉ｶ・・
1. **HTTPS 蠑ｷ蛻ｶ**・・is-on-https: error`・・ 
   - 縺ｾ縺壹・ **HTTPS 蛹悶ｒ譛蜆ｪ蜈・*縲・TTP 縺縺ｨ `security`/`best-practices` 邉ｻ逶｣譟ｻ縺御ｽ惹ｸ九＠繧・☆縺・・2. **谿ｵ髫主ｰ主・**  
   - 蛻晄悄縺ｯ `warn` 螟壹ａ 竊・繧ｹ繧ｳ繧｢縺悟ｮ牙ｮ壹＠縺ｦ縺阪◆繧・`error` 縺ｫ蠑輔″荳翫￡縺ｦ MR 繧ｲ繝ｼ繝医ｒ蠑ｷ蛹悶・3. **迺ｰ蠅・ｷｮ縺ｮ蜷ｸ蜿・*  
   - 繧ｭ繝｣繝・す繝･繧・CDN 縺檎┌縺・腸蠅・〒縺ｯ繧ｹ繧ｳ繧｢螟牙虚縺悟､ｧ縺阪＞縺ｮ縺ｧ縲・*numberOfRuns=3** 莉･荳翫〒荳ｭ螟ｮ蛟､・・ighthouse 縺ｯ繝・ヵ繧ｩ繝ｫ繝医〒繝吶せ繝・繝ｯ繝ｼ繧ｹ繝磯勁螟厄ｼ峨ｒ菴ｿ縺・・4. **繝｢繝舌う繝ｫ/繝・せ繧ｯ繝医ャ繝・*  
   - `preset=mobile` 縺ｯ繝阪ャ繝医Ρ繝ｼ繧ｯ繧ｹ繝ｭ繝・ヨ繝ｪ繝ｳ繧ｰ遲峨′蜴ｳ縺励ａ縲よ怙蛻昴・ `desktop` 縺九ｉ蟋九ａ繧九・5. **繧ｸ繝ｧ繝匁凾髢・*  
   - MR 縺ｧ髟ｷ譎る俣縺ｯ驕ｿ縺代ｋ縲・*1縲・ 蝗・* / 1 URL 遞句ｺｦ縺ｫ逡吶ａ縲∫屮譟ｻ縺ｮ豺ｱ蝣繧翫・謇句虚繧・せ繧ｱ繧ｸ繝･繝ｼ繝ｫ縺ｧ縲・
---

## 7. 繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・
- **Unable to connect to Chrome / Chrome not found**  
  - `apt-get install -y chromium` 縺ｨ `export CHROME_PATH=/usr/bin/chromium` 繧貞ｮ滓命
  - `--collect.settings.chromeFlags="--headless=new --no-sandbox --disable-gpu"` 繧剃ｻ倥￠繧・- **繝阪ャ繝医Ρ繝ｼ繧ｯ縺ｧ繝壹・繧ｸ縺ｫ蛻ｰ驕斐〒縺阪↑縺・*  
  - Runner 縺九ｉ縺ｮ逍朱夲ｼ・PC / FW / Proxy・峨ｒ遒ｺ隱阪ょｿ・ｦ√↑繧・Runner 縺ｫ `HTTPS_PROXY` 繧定ｨｭ螳・- **繧｢繧ｵ繝ｼ繝医〒豈主屓關ｽ縺｡繧・*  
  - `CI/qa/lhci/.lighthouserc.json` 縺ｮ `minScore` 繧堤樟螳溽噪縺ｪ蛟､縺ｫ隱ｿ謨ｴ・亥・譛溘・ warn・・- **HTML 繝ｬ繝昴′隕九▽縺九ｉ縺ｪ縺・*  
  - `--upload.target=filesystem --upload.outputDir=./lhci-reports[-suffix]` 縺後≠繧九°
  - `artifacts.paths` 縺ｫ蟇ｾ雎｡繝・ぅ繝ｬ繧ｯ繝医Μ縺悟性縺ｾ繧後※縺・ｋ縺・
---

## 8. 蜿り・ユ繝ｳ繝励Ξ・亥・菴灘ワ縺ｮ髮帛ｽ｢・・
```yaml
# CI/qa/lhci/.gitlab-ci-lhci.yml
.lhci-base:
  image: node:20
  tags: [docker-runner]
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  before_script:
    - apt-get update && apt-get install -y chromium
    - npm i -g @lhci/cli
    - export CHROME_PATH=/usr/bin/chromium

lhci-run:
  stage: qa
  extends: .lhci-base
  variables:
    LHCI_URL: "https://example.com/login"
  script: |
    lhci autorun \
      --collect.url="$LHCI_URL" \
      --collect.settings.preset=desktop \
      --collect.numberOfRuns=3 \
      --collect.settings.chromeFlags="--headless=new --no-sandbox --disable-gpu" \
      --upload.target=filesystem \
      --upload.outputDir="./lhci-reports"
  artifacts:
    when: always
    paths: [lhci-reports/]
    expire_in: 2 weeks
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--headless=new --no-sandbox --disable-gpu"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "is-on-https": "error",
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## 9. 谺｡縺ｮ荳謇具ｼ井ｻｻ諢擾ｼ・
- **邨先棡繧偵い繝ｼ繧ｫ繧､繝紋ｿ晉ｮ｡**・・rtifacts 繧帝聞繧√↓ / 螟夜Κ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｸ菫晏ｭ假ｼ・- **繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ螳溯｡・*・亥､憺俣縺ｫ繝壹・繧ｸ鄒､繧偵∪縺ｨ繧∬ｨ域ｸｬ・・- **Budgets・医ヱ繝輔か繝ｼ繝槭Φ繧ｹ莠育ｮ暦ｼ・*蟆主・縺ｧ繧｢繧ｻ繝・ヨ繧ｵ繧､繧ｺ縺ｮ邯咏ｶ夂屮隕厄ｼ・--budgetsPath`・・- **Grafana 騾｣謳ｺ**・・ighthouse 繧ｹ繧ｳ繧｢繧呈凾邉ｻ蛻怜喧縺励◆縺・ｴ蜷医・蛻･騾斐ヱ繧､繝励Λ繧､繝ｳ螳溯｣・ｼ・
---

莉･荳翫ゅ％繧後ｒ繝吶・繧ｹ縺ｫ縲：E/FEG 縺ｮ URL 繧・CI Variables 縺・`matrix` 縺ｧ蛻・崛縺医ｌ縺ｰ縺吶＄縺ｫ蝗槭○縺ｾ縺吶・TML 繝ｬ繝昴・繝医・蟶ｸ縺ｫ Artifacts 縺ｫ谿九＠縲√＠縺阪＞蛟､縺ｯ谿ｵ髫守噪縺ｫ蜴ｳ縺励￥縺励※縺・￥驕狗畑縺後が繧ｹ繧ｹ繝｡縺ｧ縺吶・