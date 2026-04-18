# 再利用判定フロー

## 1. 目的
新しいフロントエンド機能を実装する際に、既存のモジュールや基盤を再利用できるかを判定する標準フローを定義する。エージェントが機械的に判断できるよう、条件分岐と参照元を明示する。

## 参照元
本資料は末尾の「参照元一覧」に記載した既存ドキュメントを根拠とする。

## 更新ルール
- 参照元一覧に更新が入った場合、本フローを更新する。
- pageConfig/権限/API接続/エラー・通知/メッセージカタログ/WebSocket/ファイル処理/多言語/BasePage レイアウトに変更があれば必ず見直す。
- モックモード設計（サービス切替/モック化方針）に変更があれば必ず見直す。

## 2. 判定対象
- UI部品（base）
- 複合UI（composite）
- 業務機能（functional）
- 共通基盤（application-foundation / realtime / features）
- 既存 page/layout 適用（BasePage/SideMenu/Breadcrumb 等）
- 横断要件（API、認証/認可、エラー/通知、WebSocket、ファイル処理、多言語、pageConfig/breadcrumb）

## 3. 前提確認
- Catalog の参照元が特定できていること（未特定は「要確認」）。(参照: FE/README.md, 01_architecture/Dir.md)
- 依存関係と実装パターンの参照元が特定できていること（未特定は「要確認」）。(参照: FE/README.md)
- 判定対象が base/composite/functional/共通基盤のいずれかに分類できること（分類不能は「要確認」）。(参照: 01_architecture/Dir.md, 各 module 仕様)
- pageConfig/breadcrumb 連携、BasePage 適用、API/認証/エラー/通知/WebSocket/ファイル/多言語の要否が要件として明記されていること（不明は「要確認」）。(参照: BasePage.md, Breadcrumb.md, SideMenu.md, AuthModule.md)

## 4. 判定フロー全体
```mermaid
flowchart TD
  A[Start] --> B{Catalogに候補?<br/>参照: FE/README.md, 01_architecture/Dir.md}
  B -- Yes --> C{Dependency一致?<br/>参照: FE/README.md(依存関係), 各モジュール仕様}
  C -- Yes --> D{Patterns一致?<br/>参照: FE/README.md(実装パターン), 各モジュール仕様}
  D -- Yes --> E[候補確定: 既存モジュール]
  D -- No --> F[分類へ]
  C -- No --> F
  B -- No --> F

  F --> G{UI部品?<br/>参照: modules/base/*, modules/composite/*}
  G -- Yes --> H{複合UI?<br/>参照: modules/composite/*}
  H -- Yes --> I[分類: composite]
  H -- No --> J{業務機能?<br/>参照: modules/functional/*}
  J -- Yes --> K[分類: functional]
  J -- No --> L[分類: base]
  G -- No --> M{共通基盤?<br/>参照: 02_application-foundation, 03_realtime, 04_features}
  M -- Yes --> N[分類: foundation/features]
  M -- No --> O[分類不能: 要確認]

  E --> P[横断チェック]
  I --> P
  K --> P
  L --> P
  N --> P
  O --> P

  P --> Q{既存 page/layout に乗る?<br/>参照: BasePage.md}
  Q -- Yes --> R{pageConfig/breadcrumb 連携?<br/>参照: Breadcrumb.md, SideMenu.md, AuthModule.md}
  Q -- No --> R
  R -- Yes --> S[pageConfig/breadcrumb 対応]
  R -- No --> S
  S --> T{API呼び出し?<br/>参照: APIConnectModule.md}
  T -- Yes --> U[API基盤利用]
  T -- No --> V
  U --> U2{モックモード対象?<br/>参照: docs/prompts/設計書/モックモード設計書/フロントエンド_モックモード_仕様書.md}
  U2 -- Yes --> U3[services/v1 facadeで切替]
  U2 -- No --> V
  U3 --> V{認証/認可?<br/>参照: AuthModule.md}
  V -- Yes --> W[Auth基盤利用]
  V -- No --> W
  W --> X{エラー/通知?<br/>参照: ErrorHandle.md, SnackBar.md, MessageCatalog.md}
  X -- Yes --> Y[Error/SnackBar/MessageCatalog利用]
  X -- No --> Y
  Y --> Z{WebSocket?<br/>参照: GlobalWebsocket.md, webSocketFront.md}
  Z -- Yes --> AA[WebSocket基盤利用]
  Z -- No --> AA
  AA --> AB{ファイル処理?<br/>参照: FileImport.md, FileUploaderFront.md}
  AB -- Yes --> AC[File基盤利用]
  AB -- No --> AC
  AC --> AD{多言語?<br/>参照: Lang.md}
  AD -- Yes --> AE[i18n基盤利用]
  AD -- No --> AE

  AE --> AF{候補確定済?}
  AF -- Yes --> AG{変更不要?}
  AG -- Yes --> Z1[結論: 再利用]
  AG -- No --> Z2[結論: 拡張]
  AF -- No --> Z3[結論: 新規作成]
```

## 5. 詳細判定ルール
- 順序は必ず Catalog → Dependency → Patterns の順に判定する。(参照: FE/README.md)
- 判定: Catalogに候補があるか
参照: FE/README.md, 01_architecture/Dir.md
Yes: 依存・パターン確認へ進む。
No: UI/業務/基盤の分類へ進む。
- 判定: Dependency一致か
参照: FE/README.md(依存関係), BasePage.md, AuthModule.md, APIConnectModule.md, ErrorHandle.md, SnackBar.md, GlobalWebsocket.md, FileImport.md, FileUploaderFront.md, Lang.md
Yes: Patterns確認へ進む。
No: 分類に戻し、候補を再検討する。
- 判定: Patterns一致か
参照: FE/README.md(実装パターン), webSocketFront.md, FileImport.md, FileUploaderFront.md
Yes: 候補確定。
No: 分類に戻し、拡張/新規を検討する。
- 判定: UI部品か
参照: modules/base/button/Button.md, modules/composite/layout/BasePage.md
Yes: 複合UI判定へ進む。
No: 共通基盤判定へ進む。
- 判定: 複合UIか
参照: modules/composite/layout/BasePage.md, modules/composite/navigation/SideMenu.md, modules/composite/navigation/Breadcrumb.md
Yes: composite に分類。
No: 業務機能判定へ進む。
- 判定: 業務機能か
参照: modules/functional/form/UserUpdateForm.md
Yes: functional に分類。
No: base に分類。
- 判定: 共通基盤か
参照: 02_application-foundation/*, 03_realtime/websocket/*, 04_features/file-handling/*
Yes: foundation/features に分類。
No: 分類不能として「要確認」を明記。
- 判定: 既存 page/layout に乗るべきか
参照: modules/composite/layout/BasePage.md
Yes: BasePage の構成に合わせる。
No: 例外理由を明記し「要確認」扱い。
- 判定: pageConfig/breadcrumb 連携が必要か
参照: modules/composite/navigation/Breadcrumb.md, modules/composite/navigation/SideMenu.md, 02_application-foundation/AuthModule.md
Yes: `pageConfig.tsx`/`pageLang.ts`/`breadcrumb` 定義に連携する。
No: 不要理由を明記。
- 判定: API呼び出しがあるか
参照: 02_application-foundation/APIConnectModule.md, docs/prompts/設計書/モックモード設計書/フロントエンド_モックモード_仕様書.md
Yes: `apiClient.ts`/`apiService.ts`/`useApi.ts` 等の基盤を使用する。独自APIクライアントの作成は不可。モックモード対象の場合は `services/v1` の facade（mock/real）経由に統一し、画面/Hookでのモック分岐は禁止。モック未実装は real へのフォールバック方式に従う。
No: 次判定へ進む。
- 判定: 認証/認可があるか
参照: 02_application-foundation/AuthModule.md
Yes: `useAuth`/`ProtectedRoute`/`pageConfig.requiredPermission` の基盤に従う。独自認可は不可。
No: 次判定へ進む。
- 判定: エラー/通知が必要か
参照: 02_application-foundation/ErrorHandle.md, 02_application-foundation/SnackBar.md, modules/base/utility/MessageCatalog.md
Yes: `errorHandler`/`useError`/`useSnackbar`/通知コンポーネントの基盤に従う。メッセージは `MessageCatalog` を使用し、直書きは禁止。
No: 次判定へ進む。
- 判定: WebSocketが必要か
参照: 03_realtime/websocket/GlobalWebsocket.md, 03_realtime/websocket/webSocketFront.md
Yes: 既存 WebSocket 基盤を使用する。独自接続は不可。
No: 次判定へ進む。
- 判定: ファイル処理があるか
参照: 04_features/file-handling/FileImport.md, 04_features/file-handling/FileUploaderFront.md
Yes: 既存ファイル処理基盤を使用する。独自実装は不可。
No: 次判定へ進む。
- 判定: 多言語対応が必要か
参照: 01_architecture/Lang.md
Yes: `langSlice`/`useCurrentLanguage`/`useLanguage`/`*.lang.ts` に従う。独自言語管理は不可。
No: 次判定へ進む。
- 判定: 変更不要か
参照: 候補モジュール仕様書
Yes: 結論は「再利用」。
No: 結論は「拡張」。

## 6. 例外処理
- Catalog/Dependency/Patterns の参照元が特定できない場合は「要確認」とし、結論を保留する。
- 既存基盤で要件を満たせず独自実装が必要な場合は「要確認」とし、拡張の可否を再評価する。
- pageConfig/breadcrumb や BasePage 適用ができない場合は理由を明記し「要確認」とする。

## 7. 新規実装に進んでよい条件
- Catalogに該当候補がなく、Dependency/Patterns でも適合しない。
- 分類の結果、base/composite/functional/foundation のいずれにも該当がなく、要件上やむを得ない（要確認を明記）。
- 既存基盤の拡張でも要件を満たせないことが明確で、基盤迂回をしない前提が守られる。

## 8. 参照元一覧
- DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Lang.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md
- docs/prompts/設計書/モックモード設計書/フロントエンド_モックモード_仕様書.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/utility/MessageCatalog.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/GlobalWebsocket.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileImport.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileUploaderFront.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/button/Button.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md
- DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/functional/form/UserUpdateForm.md

---
### エージェント向けチェックリスト
- [ ] Catalogを参照した（FE/README.md, 01_architecture/Dir.md）
- [ ] Dependencyを確認した（FE/README.md と関連仕様書）
- [ ] Patternsを確認した（FE/README.md と関連仕様書）
- [ ] UI部品/複合UI/業務機能/共通基盤の分類を決めた
- [ ] BasePage 適用可否を判断した
- [ ] pageConfig/breadcrumb 連携の要否を判断した
- [ ] API呼び出しの有無と基盤利用を確認した
- [ ] モックモード対象有無を確認した（モックモード仕様書）
- [ ] モックモード対象APIは services/v1 facade で切替している
- [ ] 認証/認可の有無と基盤利用を確認した
- [ ] エラー/通知の有無と基盤利用を確認した
- [ ] WebSocket の有無と基盤利用を確認した
- [ ] ファイル処理の有無と基盤利用を確認した
- [ ] 多言語対応の有無と基盤利用を確認した
- [ ] 結論（再利用/拡張/新規作成）を確定した
- [ ] 根拠不明点を「要確認」と明記した
