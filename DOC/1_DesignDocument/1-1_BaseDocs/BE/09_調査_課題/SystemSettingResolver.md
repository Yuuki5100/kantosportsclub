# 設定情報解決クラス検討メモ（SystemSettingResolver）設計書（バックエンド編）

# **1. モジュール概要**

### **1-1. 目的**
本モジュールは、アプリケーション内で業務上変更の可能性がある設定値をDBで管理し、動的に取得できる仕組みとして `SystemSettingResolver` を導入し
**設定値の柔軟な切り替え**と**保守性の向上**を目的とします。

### **1-2. 適用範囲**
- 対象層：共通ユーティリティ層(Service層やバッチ処理などから共通的に利用される)
- 対象アプリ：appserver,gateway
- フレームワーク：Spring Boot

## **2. 設計方針**
### **2-1. 動的変更の対象となる設定値**
-  アプリケーション動作中に変更される可能性がある設定値を対象とする。

例:
- 外貨為替レートに関する設定（例：為替レートの倍率、基準通貨の選択)
- 各画面や処理の表示・非表示フラグ（例：メニューの表示切り替え)

### **2.2. 選定基準（理由）**
- 以下の基準に該当する設定値を、DBで管理すべき動的取得対象として選定する：
- 業務上、頻繁に変更が発生する可能性がある
- 設定変更時にアプリケーションの再起動を伴うと業務影響が大きい
- 利用者や運用担当者によって柔軟に変更される可能性がある

### **2-3.設定値の変更方法方針**
- 基本はGUIで運用担当者が実施することを想定している
- バッチ更新(将来的に複数設定を一括更新するケースのため)

### **2-4.設定値の変更反映方針**
- 設定値は、各設定キーが初めて参照されたタイミングでDBから取得され、その値は `@Cacheable` によりメモリ上にキャッシュされます。
- 以降のアクセスではキャッシュから設定値を取得することでDBアクセスは発生しません。
- 設定値の更新がある場合,`@CacheEvict` により該当キーのキャッシュが削除され,次回アクセス時に最新の設定値がDBから再取得され、再びキャッシュされる。
    補足：キャッシュの有効期限は Spring Cache のデフォルト設定（明示的に期限なし）に従います。アプリケーションの再起動時にはキャッシュはクリアされるため,
    最新値が再取得されます。

### **2-5.変更履歴の保存方針**
-設定値の変更履歴を正確に記録し、追跡可能な状態を維持するために、以下のような保存方針とする：
- 設定値が更新されると、新しい値が `system_setting` テーブルに上書き保存される。
- 同時に以下の内容を含むレコードが `system_setting_history` テーブルに新規登録されます。
     　- 設定キー
       - 新しい設定値
       - 更新者
       - 更新日時

## **3.  モジュール構成とファイル構造**

### **3-1. フォルダツリー構成**
appserver
├── controller/
│   └── SystemSettingController.java                               // 設定管理用API
├── request/admin/
│   └──  SystemSettingRequest.java                                 // 設定値の追加、更新リクエスト
├── responseModel/admin/
│   └── SystemSettingResponse.java                                 // レスポンスDTO

servercommon
├── utils
│   └── SystemSettingResolver.java                                // 設定値の取得用ユーティリティ
        SystemSettingValueConverter.java                          // 設定値の型変換ユーティリティ
├── model
│   └── SystemSetting.java,                                       // 設定値エンティティ
        SystemSettingHistory.java                                 // 設定変更履歴を保持するエンティティ
├── service
│   └── SystemSettingService.java                                 // 設定の取得・保存処理を行うサービス
        SystemSettingHistoryService.java                          // 設定値の履歴情報を取得。保存を行うサービス
├── repository
│   └── SystemSettingRepository.java                              // SystemSettingエンティティ用のJPAリポジトリ
    SystemSettingHistoryRepository.java             // SystemSettingHistoryエンティティ用のJPAリポジトリ

frontend/src/
├── pages/
│   └── admin/
│       └── system-setting/
│           ├── index.tsx                                         // 設定値の一覧表示ページ
├── api/
│   └── systemSettingApi.ts                                       // 設定APIの通信関数（GET/POST/PUT/DELETE）
├── api/services/v1
│   └── systemSettingService.ts                                   // 設定データ操作用のAPI呼び出しサービス


### **3-2. 実装方法**
### バックエンド ServerCommon側
#### `SystemSettingResolver.java`
**概要**:`setting_key` を指定して `SystemSetting` テーブルから設定値を取得するユーティリティクラス。
**特徴**：
 - @Component により Spring 管理下に登録
 - DBからの単純な設定値取得のみに特化

```java
@Slf4j
@Component
public class SystemSettingResolver {
  private final SystemSettingRepository repository;

  public SystemSettingResolver(SystemSettingRepository repository) {
    this.repository = repository;
  }

  /**
   * 指定されたキーに対応する設定値を取得します。
   * 該当するキーが存在しない場合は null を返します。
   */
  public String get(String key) {
    return repository.findBySettingKey(key)
        - map(SystemSetting::getSettingValue) - orElseGet(() -> {
            log.warn("設定キー '{}' が見つかりません。", key);
            return null;
          });
  }
}
```
#### `SystemSettingValueConverter.java`
**概要**： `SystemSetting` の設定値を、指定された型に変換するユーティリティクラス。
**特徴**：設定値（文字列）を指定された型`Integer`、`Long`、`Boolean`などに変換する
     型変換に失敗した場合やサポート対象外の型が指定された場合`null` を返却する。
        設定値を別の型に変換する必要があるタイミングでSystemSettingServiceから呼び出される。

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class SystemSettingValueConverter {

    private SystemSettingValueConverter() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * 設定値 (String) を指定された型に変換します。
     *
     * @param value 設定値の文字列
     * @param type  変換対象の型クラス
     * @param <T>   変換後の型
     * @return 成功時は変換結果、失敗時は null を返す
     */
    public static <T> T convert(String value, Class<T> type) {
        if (value == null) return null;

        try {
            if (type == String.class) {
                return type.cast(value);
            } else if (type == Integer.class) {
                return type.cast(Integer.parseInt(value));
            } else if (type == Long.class) {
                return type.cast(Long.parseLong(value));
            } else if (type == Boolean.class) {
                return type.cast(Boolean.parseBoolean(value));
            } else {
                log.warn("Unsupported type: {}", type.getSimpleName());
                return null;
            }
        } catch (Exception e) {
            log.warn("型変換に失敗しました。value='{}', type='{}'", value, type.getSimpleName(), e);
            return null;
        }
    }
  }
```

#### `SystemSetting.java`
**概要**: JPA Entity クラスであり,アプリケーションの各種設定値を管理する.
**特徴**：DBの system_setting テーブルとマッピングされ、設定値の永続化および取得が可能
          setting_key カラムは 一意キー（Unique Key） として使用されます。
```java

@Entity
@Table(name = "system_setting")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemSetting {
  @Id @GeneratedValue
  private Long id;          // 自動採番されるPK キー
  @Column(unique = true)
  private String settingKey;        // 設定キー
  private String settingValue;      // 設定値,実際に使用される設定値
  private String description;       // 設定の説明
  private LocalDateTime updateAt;   // 更新日時
  private String updatedBy;         // 更新者
}

```

#### `SystemSettingHistory.java`
**概要**: `SystemSetting` の変更履歴を記録するためのJPAエンティティクラスであり、各設定項目の変更時にその履歴情報を保持します。
**機能**: setting_id により元の設定と紐付けながら設定値や更新者情報を記録します。
**履歴保存のタイミング**：`SystemSetting` の新規作成または更新時に、対応する `SystemSettingHistory` エンティティが新たに登録されます。
                          履歴登録はSystemSettingHistoryServiceによって行われる。

```java
@Entity
@Table(name = "system_setting_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingHistory {

    @Id
    @GeneratedValue
    private Long id;
    @ManyToOne
    @JoinColumn(name = "setting_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_history_setting"))
    private SystemSetting setting;
    private String settingValue;
    private String updatedBy;
    private LocalDateTime updateAt;
}

```
#### `SystemSettingRepository.java`
**概要**: `SystemSetting` エンティティに対するDB操作を行うためのリポジトリインターフェース。
**機能**:
        - `SystemSetting` エンティティと `system_setting` テーブルの永続化操作を自動的にマッピングする処理をもつ

```java
@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(String settingKey);
}

```
#### `SystemSettingHistoryRepository.java`

**概要**:
`SystemSettingHistory` エンティティに対する DB 操作を行うためのリポジトリインターフェース。

**機能**:
- `SystemSettingHistory` エンティティと `system_setting_history` テーブルの永続化処理を自動的にマッピングする

```java
@Repository
public interface SystemSettingHistoryRepository extends JpaRepository<SystemSettingHistory, Long> {

    // 追加で検索用メソッドが必要になればここに定義する
    List<SystemSettingHistory> findBySettingKey(String settingKey);
}

```

#### `SystemSettingService.java`
**概要**: 設定値の取得・更新・キャッシュ削除・履歴保存を一括して担当するサービスクラス。
**機能**:
     - DBから設定値の取得および更新処理を行う(SystemResolver経由)
         - キャッシュ操作（@Cacheable / @CacheEvict）を担当する

```java
@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingResolver systemSettingResolver;

    /**
      * 指定された設定キーの値を新しい値に更新します。
      * 更新後は該当キーのキャッシュを削除し、次回取得時に最新の値が反映されるようにします。
      * 更新日時および更新者も同時に上書きされます。
    */
    @Cacheable(value = "systemSettings", key = "#key")
    public String getSettingValue(String key) {
        return systemSettingResolver.get(key);
    }


    @CacheEvict(value = "systemSettings", key = "#key")
    public void updateSettingValue(String key, String newValue, String updatedBy) {
      SystemSetting setting = systemSettingRepository.findBySettingKey(key).orElseThrow(() ->
                              new BusinessException("設定キーが見つかりません: " + key));

        setting.setSettingValue(newValue);
        setting.setUpdatedBy(updatedBy);
        setting.setUpdateAt(LocalDateTime.now());
        systemSettingRepository.save(setting);
    }

    /**
     * 指定されたキーに対応する SystemSetting エンティティ全体を取得します。
   */
    public Optional<SystemSetting> getSetting(String key) {
       return systemSettingRepository.findBySettingKey(key);
    }
}
```

#### `SystemSettingHistoryService.java`

**概要**:`SystemSetting` の新規作成または更新時に、履歴情報を `SystemSettingHistory` エンティティとして記録するためのサービスクラス。

**機能**:
- `SystemSetting` の変更内容を元に、履歴エンティティを生成・保存する

```java
@Service
@RequiredArgsConstructor
public class SystemSettingHistoryService {

    private final SystemSettingHistoryRepository systemSettingHistoryRepository;

    public void saveHistory(SystemSetting setting) {
        SystemSettingHistory history = new SystemSettingHistory();
        history.setSetting(setting);
        history.setSettingKey(setting.getSettingKey());
        history.setSettingValue(setting.getSettingValue());
        history.setUpdatedBy(setting.getUpdatedBy());
        history.setUpdateAt(setting.getUpdateAt() != null ? setting.getUpdateAt() : LocalDateTime.now());

        systemSettingHistoryRepository.save(history);
    }

}

```
### バックエンドappServer側
#### `SystemSettingController.java`
**概要**: 設定値の新規登録、取得、更新、削除などを実施する。
**機能**:
  - GET `/api/system-settings`： 全設定値の一覧を取得する
  - PUT `/api/system-settings/update/{key}`: キーにより既存の設定値を更新する

#### `SystemSettingRequest.java`
- **目的:**
  設定値の更新時に使用されるDTOクラス。
   -settingKey
   -newvalue (入力された設定の新値)

#### `SystemSettingResponse.java`
- **目的:**
  設定値の取得時に返却されるレスポンスDTOクラス。
   -settingKey, settingValue, description, updatedAt, updatedBy

### フロントエンド
#### systemSettingApi.ts
- **目的:**
設定値（SystemSetting）に関する API 通信処理を担当し、Axios による GET / POST / PUT / DELETE のHTTP通信関数を定義する。

#### systemSettingService.ts
- **目的:**
systemSettingApi.ts で定義された通信関数を呼び出し、バリデーション、前処理、データ整形などの補助ロジックを担うサービス層。

#### index.tsx
- **目的:**
管理画面における設定値 (SystemSetting) の一覧表示ページ。
**機能**:
- 全設定値を一覧で表示する。
- 一覧画面上に「更新」ボタンを配置し、各設定値の更新操作を行えるようにする。
- settingKey は更新APIのエンドポイントにおいて、URL パスパラメータとして使用される。
  例: PUT `/api/system-settings/update/{key}`

# 現行実装（最新）
このドキュメントの「SystemSettingResolver」は現行コードには存在しません。現行実装は以下の構成です。

**主要クラス**
- `BE/appserver/src/main/java/com/example/appserver/controller/SystemSettingController.java`
- `BE/appserver/src/main/java/com/example/appserver/service/SystemSettingService.java`
- `BE/appserver/src/main/java/com/example/appserver/request/system/SystemSettingUpdateRequest.java`
- `BE/appserver/src/main/java/com/example/appserver/response/system/SystemSettingResponse.java`
- `BE/appserver/src/main/java/com/example/appserver/response/system/SystemSettingItem.java`
- `BE/appserver/src/main/java/com/example/appserver/response/system/SystemSettingData.java`
- `BE/servercommon/src/main/java/com/example/servercommon/model/SystemSetting.java`

**補足**
- `SystemSettingResolver` は現行実装から削除されているため、本ドキュメントの記載は更新が必要です。

