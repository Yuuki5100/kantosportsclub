# SystemSettingResolver設計書

## 1. 目的
DB保管のシステム設定を共通APIで型安全に取得し、モジュール間の設定参照実装を統一する。

## 2. 対象クラス
- `com.example.servercommon.setting.SystemSettingResolver`（interface）
- `com.example.servercommon.setting.DatabaseSystemSettingResolver`
- `com.example.servercommon.setting.SystemSettingCache`
- `com.example.servercommon.setting.SystemSettingCacheProperties`
- `com.example.servercommon.setting.SystemSettingValueConverter`
- `com.example.servercommon.setting.SystemSettingValueMapper`
- `com.example.servercommon.setting.SystemSettingHistoryService`

## 3. 公開API

### 3-1. 取得API
- `Optional<String> getString(String key)`
- `Optional<Integer> getInt(String key)`
- `Optional<Long> getLong(String key)`
- `Optional<Boolean> getBoolean(String key)`
- `Optional<Duration> getDuration(String key)`
- `<T> Optional<T> get(String key, Class<T> targetType)`

### 3-2. 既定値API
- `getOrDefault` 系を提供し、呼び出し側のnull判定を削減する。

### 3-3. キャッシュ制御API
- `evict(String key)`
- `evictAll()`

## 4. 実装方針

### 4-1. 参照元
- `SystemSettingRepository.findById("1")` を使用し、単一レコード構成を維持する。

### 4-2. キー解決
- `SystemSettingValueMapper` が `SystemSetting` の各カラムをキーへマッピングする。
- 互換キー `noticeDisplayLimit` は `NUMBER_OF_NOTICES` と同値として返却する。

### 4-3. 型変換
- `SystemSettingValueConverter` が型変換を担当する。
- サポート対象外型/変換不能値は `IllegalArgumentException` を送出する。

### 4-4. キャッシュ
- TTLと最大件数は `system.setting.cache.*` で制御する。
- TTL切れ時は自動破棄し、次回参照で再読込する。

## 5. 更新連携
- `SystemSettingService.upsert()` 完了後に `SystemSettingHistoryService.recordChanges()` を実行する。
- その後 `SystemSettingResolver.evictAll()` でキャッシュを無効化する。

## 6. ログ/メッセージ
- `BackendMessageCatalog.LOG_SYSTEM_SETTING_*`
- `BackendMessageCatalog.EX_SYSTEM_SETTING_*`

## 7. 利用例
- `NoticeService.resolveNoticeDisplayLimit()`
  - `NUMBER_OF_NOTICES` を主キーとして取得
  - 互換として `noticeDisplayLimit` をフォールバック
