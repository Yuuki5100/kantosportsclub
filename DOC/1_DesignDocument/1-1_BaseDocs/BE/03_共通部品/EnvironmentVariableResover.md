# **EnvironmentVariableResolver設計書（バックエンド編）**
## **1. モジュール概要**
環境依存の設定値を一元的に取得するためのユーティリティクラス。
このクラスを利用することで、各サービスやコンポーネントが直接 application.yml や @Value アノテーションに依存せずに設定値を取得できるようになります。

- 利点:
  - 環境ごとの設定ファイルの重複記述を削減
  - テスト時のモックが容易になる
  - 設定管理の一元化と保守性向上

---
## **2. 適用範囲**
- 対象アプリ：servercommon, appserver
- 利用対象：環境変数、外部API設定、AWS認証情報、S3パスなど
- 利用場面：設定値を動的に取得したいすべての箇所

---
## **3. 設計方針**
### **3-1. クラス定義（現行実装）**

- 実装クラス: `servercommon/config/EnvironmentVariableResolver`
- `@Component`, `@RequiredArgsConstructor`, `@Data` を付与
- 型変換失敗時は warn ログ出力＋デフォルト返却

```java
@Component
@RequiredArgsConstructor
@Data
public class EnvironmentVariableResolver {
    private final Environment environment;

    public Optional<String> getOptional(String key) {
        return Optional.ofNullable(environment.getProperty(key));
    }

    public String getOrDefault(String key, String defaultValue) {
        return environment.getProperty(key, defaultValue);
    }

    public Integer getInt(String key, Integer defaultValue) {
        return getSafeProperty(key, Integer.class, defaultValue);
    }

    public Boolean getBoolean(String key, Boolean defaultValue) {
        return getSafeProperty(key, Boolean.class, defaultValue);
    }

    public Double getDouble(String key, Double defaultValue) {
        return getSafeProperty(key, Double.class, defaultValue);
    }

    private <T> T getSafeProperty(String key, Class<T> targetType, T defaultValue) {
        try {
            return environment.getProperty(key, targetType, defaultValue);
        } catch (Exception e) {
            logger.warn("適切なデータを取得できません。デフォルト値を返す", key, targetType.getSimpleName(), e);
            return defaultValue;
        }
    }
}
```
- environment.getProperty(key): application.yml や application.properties、環境変数などの設定情報から指定されたキーの値を取得するためのメソッド

### **3-2. 使用例**

```java
@Component
@RequiredArgsConstructor
@Data
public class EnvironmentVariableResolver {
    private final Environment environment;

    public Optional<String> getOptional(String key) {
        return Optional.ofNullable(environment.getProperty(key));
    }

    public String getOrDefault(String key, String defaultValue) {
        return environment.getProperty(key, defaultValue);
    }

    public Integer getInt(String key, Integer defaultValue) {
        return getSafeProperty(key, Integer.class, defaultValue);
    }

    public Boolean getBoolean(String key, Boolean defaultValue) {
        return getSafeProperty(key, Boolean.class, defaultValue);
    }

    public Double getDouble(String key, Double defaultValue) {
        return getSafeProperty(key, Double.class, defaultValue);
    }

    private <T> T getSafeProperty(String key, Class<T> targetType, T defaultValue) {
        try {
            return environment.getProperty(key, targetType, defaultValue);
        } catch (Exception e) {
            logger.warn("適切なデータを取得できません。デフォルト値を返す", key, targetType.getSimpleName(), e);
            return defaultValue;
        }
    }
}
```

### **3-3. 設定値の解決フロー（処理流れ）**

```
環境変数（OS/コンテナなど)
  → application.yml / application.properties
  → デフォルト値（引数で指定された場合）
```

### **3-4. 利用箇所（現行）**
- `SesMailConfig`
- `S3StorageService`
- `LocalFileStorageService`
- `NoticeFileService`

---

## **4. SystemSettingResolverとの責務分離（2026-04-02追記）**

- `EnvironmentVariableResolver`
  - `application.yml` / 環境変数など、起動時設定の取得に使用する。
  - 例: 外部接続先URL、認証情報、ストレージ接続設定。

- `SystemSettingResolver`
  - `system_setting` を正本とする業務可変設定の取得に使用する。
  - 例: `NUMBER_OF_NOTICES` など、運用中の更新を許容する値。

### **4-1. 選定ルール**
- 起動後の運用変更が必要な値: `SystemSettingResolver`
- 環境ごとに固定すべき値: `EnvironmentVariableResolver`

### **4-2. 実装ルール**
- 新規実装では、動的設定値の取得で `@Value` を直接利用しない。
- `SystemSettingResolver` で取得した値を必要に応じて `getOrDefault` で補完する。
