
# 品目・品目終了日 管理処理設計書（バックエンド編）

## **1. モジュール概要**

### **1-1. 目的**
本モジュールでは、「運用開始日」と「運用終了日」 によって、各品目の有効期間（履歴）を管理する仕組みを実現する。
申請・承認・更新・削除などの業務フローを統一的に制御し、品目データの履歴整合性と一貫性を保つ。

### **1-2. 運用方針**
#### **1-2-1. 品目マスタ管理**
- **対象層**：Service クラス
- **対象アプリ**：appserver
- **対象機能**：品目の運用開始日を用いて有効期間を管理し、履歴の一貫性を保ちながら申請・承認・差戻し・取消などの業務処理を行う

#### **1-2-2. 品目終了日管理**
- **対象層**：Service層
- **対象アプリ**：appserver
- **対象データ**：`master_item_end_of_application_date`
- **対象機能**：運用終了日を用いて品目の履歴終了タイミングを管理し、終了日登録とそのステータス（申請・差戻し・取消など）を一貫して処理する

---

## **2. 設計方針**

### **2-1. 処理構成**

#### **2-1-1. 品目マスタ処理フロー**

##### ■ 新規登録処理
- 申請ボタンをクリックして実施。
- **エンドポイント**：`POST /api/test/master/apply`
- **リクエスト構造（MasterItemRequest）**：
```json
{
  "masterItem": {
    "itemCd": "string",
    "startOfApplicationDate": "yyyy-MM-dd",
    ...
  }
}
```

- **処理の流れ**：
  1. フロントエンドから `MasterItemRequest` を `/apply` に送信
  2. Controller では MasterItemServiceのsaveNewMasterItemを呼び出し
  3. 登録ステータスが'申請中'でのレコードをDBのmaster_itemtblやregister_step tblに新規登録する。

##### ■ 更新処理

- ステータス更新関連（承認／削除／取下）
- 各処理は個別のエンドポイントで定義されています。
- リクエスト本体は共通で MasterItemUpdateRequest を使用し、identificationId と status を保持します。

- 承認処理

エンドポイント：POST /api/test/master-item/approveMasterItem

削除処理

エンドポイント：POST /api/test/master-item/deleteMasterItem

申請取下処理

エンドポイント：POST /api/test/master-item/returnMasterItem

---

#### **2-1-2. 品目終了日処理フロー**

##### ■ 申請ボタン押下時

- **エンドポイント**：`POST /api/test/master-item-end-date/apply`
- **リクエスト構造（MasterItemEndRequest）**：
```json
{
  "masterItemEndDate": {
    "itemId": "string",
    "endDate": "yyyy-MM-dd",
    ...
  }
}
```
- **呼び出しメソッド**：
  - 新規データを保存するためはMasterItemEndDateServiceの`saveNewMasterItemEndDate()`を実行する。

- **処理の流れ**：
  1. フロントエンドから `MasterItemEndRequest` を `/apply` に送信
  2. Controller がリクエストを受け取り、Service の保存処理を呼び出す
  3. `master_item_end_of_application_date` テーブルや'register step' tbl に新規登録処理を実行

##### ■ 承認ボタン押下時

- **エンドポイント**：`POST /api/test/master-item-end-date/approveEndDate`
- **リクエスト構造（MasterItemEndUpdateRequest）**：
```json
{
  "identificationId": "string",
  "status": "1"
}
```
- **呼び出しメソッド**：
  - `approveMasterItemEndDate()`

- **処理の流れ**：
1. フロントエンドから、`identificationId` と `status` を含めた `MasterItemEndUpdateRequest` をリクエストボディとして送信する。
2. Controller がリクエストを受け取り、Service の `approveMasterItemEndDate(...)` を呼び出す。
3. Service 層でステータスに応じた業務処理（承認／削除申請承認）を実行し、該当データの登録ステップおよび終了日マスタを更新する。


---

## **3. モジュール構成とファイル構造**

### **3-1. フォルダ構成**
```
appserver
├── controller
│   ├── MasterItemController.java                  // 品目マスタ用コントローラー
│   └── MasterItemEndDateController.java          // 終了日用コントローラー
├── service
│   ├── MasterItemService.java                    // 品目マスタ用サービス
│   └── MasterItemEndDateService.java            // 終了日用サービス
├── request
│   └── item
│       ├── MasterItemRequest.java                // 品目申請用DTO
│       ├── MasterItemUpdateRequest.java          // ステータス更新用DTO
│       ├── MasterItemEndRequest.java             // 終了日申請DTO
│       └── MasterItemEndUpdateRequest.java       // 終了日ステータス更新DTO
```

---

### **3-2. 実装詳細**

#### **MasterItemService.java**

**概要**：品目マスタに関する申請・登録・内容修正・ステータス更新処理を担当する業務ロジックサービスクラス。

- `saveNewMasterItem(...)`: 新規登録
- `approveStatusOfMasterItemInRegistrationStep(...)`: 同一CD・適用開始日を持つ承認済みデータを削除扱いにし、現在の申請データを承認状態に更新。削除申請承認の場合は APPROVED_APPLIED_DELETE に変更し、削除フラグも付与。
- `deleteMasterItemByIdentificationId(...)`:削除処理で承認済データの場合は削除申請にステータスを変更、それ以外は削除として登録。
- `cancelApplication(...)`: 申請取下処理で申請中データは APPLICATION_CANCELLED に、削除申請中データは CANCEL_APPLIED_DELETE に変更する。

#### **MasterItemEndDateService.java**

**概要**：品目の運用終了日管理に関する処理を担当。終了日申請・承認およびステータス制御を行う。

- `saveNewMasterItemEndDate(...)`: 終了日の新規申請登録
- `approveMasterItemEndDate(...)`: 申請中 の場合は同一CDを持つ承認済みデータをすべて削除扱いに変更し、自身は承認済にする。削除申請中の場合は削除申請承認に更新する。


#### **MasterItemRepository.java**

**概要**： `MasterItem` エンティティに対する永続化操作を提供する JPA リポジトリ。

```java

public interface MasterItemRepository extends JpaRepository<MasterItem, String> {
    List<String> findIdsByItemCdAndStartOfApplicationDate(String itemCd, LocalDate startOfApplicationDate);
    boolean existsByItemCd(String itemCd);
    @Override
    MasterItem save(MasterItem masterItem);
    Optional<MasterItem> findById(String id);
    List<MasterItem> findByItemCdOrderByStartOfApplicationDateDescCreatedDateAndTimeDesc(String itemCd);
    List<MasterItem> findByItemCdAndStartOfApplicationDate(String itemCd, LocalDate startOfApplicationDate);
    List<MasterItem> findByItemCdOrderByStartOfApplicationDateDesc(String itemCd);
}

```


#### **RegistrationStepRepository.java**

**概要**： RegistrationStep エンティティに対する永続化操作を提供する JPA リポジトリ。

```java
public interface RegistrationStepRepository extends JpaRepository<RegistrationStep, String> {
    Optional<RegistrationStep> findByIdentificationId(String identificationId);
    boolean existsByIdentificationIdAndRegistrationStatus(String identificationId, String registrationStatus);
    List<RegistrationStep> findByIdentificationIdInAndRegistrationStatusAndIdentificationIdNot(
            List<String> ids, String registrationStatus, String currentId);
    @Override
    RegistrationStep save(RegistrationStep entity);
    List<RegistrationStep> findByIdentificationIdInOrderByRegistrationStatusDesc(List<String> ids);
    List<RegistrationStep> findByIdentificationIdInOrderByUpdatedDateAndTimeDesc(List<String> identificationIds);
}

```

#### **MasterItemEndDateRepository.java**

**概要**： MasterItemEndOfApplicationDate  エンティティに対する永続化操作を提供する JPA リポジトリ。

```java

public interface MasterItemEndDateRepository extends JpaRepository<MasterItemEndOfApplicationDate, String> {
    MasterItemEndOfApplicationDate save(MasterItemEndOfApplicationDate entity);
    Optional<MasterItemEndOfApplicationDate> findById(String id);
    List<MasterItemEndOfApplicationDate> findByItemCd(String itemCd);
    List<String> findIdentificationIdsByItemCd(String itemCd);
}

```

#### **MasterItemController.java**

**概要**：MasterItemController は、品目マスタ（MasterItem）の登録・承認・削除・取下処理などを受け付ける REST API を提供するクラス。

**提供するAPI**: 
| エンドポイント                   | 処理内容           | リクエスト構造                   |
| ------------------------- | -------------- | ------------------------- |
| `POST /apply`             | 新規登録／日付変更／内容修正 | `MasterItemRequest`       |
| `POST /approveMasterItem` | 承認処理           | `MasterItemUpdateRequest` |
| `POST /deleteMasterItem`  | 削除処理           | `MasterItemDeleteRequest` |
| `POST /returnMasterItem`  | 申請取下処理         | `MasterItemUpdateRequest` |


- すべての更新系処理では、MasterItemUpdateRequest または MasterItemDeleteRequest に identificationId と statusを含めて送信する。

- 処理ごとにエンドポイントを分離し、責務を明確化している。

- 各 API は対応する masterItemService のサービスメソッドを呼び出す形式で設計されている。



---

