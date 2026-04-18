# 📄 チェックデジットユーティリティ仕様書

## 概要

本ユーティリティは、**産業廃棄物マニフェスト**に使用される11桁のマニフェスト番号に対する**チェックデジットの計算・検証**を提供します。

対象は、以下の2種類：

* 紙マニフェスト（7DR方式）
* 電子マニフェスト（Mod10方式 / JWNET）

## 機能一覧

| 関数名                            | 説明                                              |
| --------------------------------- | ------------------------------------------------- |
| `calculatePaperCheckDigit`      | 紙マニフェストのチェックデジットを計算（7DR法）   |
| `calculateElectronicCheckDigit` | 電子マニフェストのチェックデジットを計算（Mod10） |
| `validateManifestNumber`        | 11桁のマニフェスト番号が正しいか検証              |

---

## 型定義

```ts
type ManifestType = 'paper' | 'electronic' | null;
```

* `'paper'`：紙方式（7DR）
* `'electronic'`：電子方式（Mod10）
* `null`：両方式で検証し、**どちらか一致すれば true**

---

## 各関数詳細

### 🔢 `calculatePaperCheckDigit(number10: string): string`

* **引数** ：10桁のマニフェスト番号
* **処理** ：10桁の数値を7で割った余り（7DR法）
* **戻り値** ：チェックデジット（1桁文字）

```ts
calculatePaperCheckDigit('2000000003'); // '1'
```

---

### 🔢 `calculateElectronicCheckDigit(number10: string): string`

* **引数** ：10桁のマニフェスト番号
* **処理** ：各桁を足して、合計を10で割った余り（Mod10法）
* **戻り値** ：チェックデジット（1桁文字）

```ts
calculateElectronicCheckDigit('1100213308'); // '9'
```

---

### ✅ `validateManifestNumber(manifestNumber11: string, check: ManifestType): boolean`

* **引数** ：
* `manifestNumber11`：11桁のマニフェスト番号（末尾にチェックデジットを含む）
* `check`：検証方式（'paper' | 'electronic' | null）
* **処理** ：
* 指定された方式でチェックデジットを算出し、末尾と一致するか検証
* `null` の場合は両方式で検証し、**どちらかが一致すれば true**
* **戻り値** ：チェックが一致すれば `true`、そうでなければ `false`

```ts
validateManifestNumber('20000000031', 'paper');      // true
validateManifestNumber('11002133089', 'electronic'); // true
validateManifestNumber('11002133089', null);         // true
validateManifestNumber('00000000000', null);         // false
```

---

## 想定配置パス

```
src/
├─ utils/
│   └─ manifest/
│       └─ checkDigit.ts       ← 本ユーティリティ実装
│
└─ utils/__tests__/manifest/
    └─ checkDigit.test.ts      ← テストコード
```

---

## 使用例

```ts
import {
  validateManifestNumber,
  calculateElectronicCheckDigit
} from '@utils/manifest/checkDigit';

const isValid = validateManifestNumber('11002133089', 'electronic');

if (!isValid) {
  throw new Error('マニフェスト番号が不正です');
}
```

---

## テスト状況

* Jest によるユニットテスト完備
* ケース網羅：
  * 各方式の正当性検証
  * チェックデジット一致/不一致
  * 両方式を許容する検証

---

## 補足・将来的な拡張余地

* `generateManifestNumber(number10, type)` のような **チェックデジット付き番号生成機能**
* `inferManifestType(number11): 'paper' | 'electronic' | 'unknown'` のような **タイプ自動判別**
