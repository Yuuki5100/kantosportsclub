# glossary（再利用判定用 用語集）

## 目的
再利用判定で使う用語を統一し、エージェントの誤解を防ぐ。

## 参照元
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/README.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/reuse-decision-flow.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/implementation-patterns.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Redux.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileUploaderFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/layout/Layaut.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`

## 更新ルール
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md` の分類定義やディレクトリ構造が更新されたら見直す。
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md` の `src/components` と `src/pages` の責務定義が変わったら見直す。
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation` の基盤仕様（Auth/API/Error/Log/SnackBar）が更新されたら見直す。
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket` の基盤仕様が更新されたら見直す。
- reuse 判定フローや anti-patterns/implementation-patterns が更新されたら見直す。

---

## 用語

### module
定義: UIコンポーネントを責務別に整理する分類単位で、`DOC/1_DesignDocument/1-1_BaseDocs/FE/modules` 配下の仕様書群を指す。
このプロジェクトでの意味: `src/components` の `base/composite/functional` 分類と対応し、再利用判断の基準となる単位。
類似語との違い: `base/composite/functional/examples` は module の下位分類。`feature` は 04_features の業務機能資料で、module とは別カテゴリ。相互参照: base, composite, functional, examples, feature。
判断時の注意点: modules 分類は実装構造と一致させる。再利用対象を `pages` 配下に直接実装しない。
再利用判断観点:
責務: UIコンポーネントを責務別に整理し、再利用判断の対象にする。
依存: `src/components` の分類と一致させる前提。
入出力: 要確認（各モジュール仕様書に記載）。
制約: base/composite/functional/examples の4分類に従う。
利用条件: modules の分類定義に沿って配置する。
禁止事項: 分類を崩した配置や pages 配下への直接実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### base
定義: 最小単位の再利用可能コンポーネント（ボタン、入力、タイポグラフィ、レイアウト等）を指す。
このプロジェクトでの意味: `modules/base` および `src/components/base` に配置され、業務ロジックを含まず、状態は持たないか最小限。
類似語との違い: `composite` は base の組み合わせ、`functional` は業務ロジックを含む。相互参照: composite, functional。
判断時の注意点: 業務知識やAPI連携を含めない。
再利用判断観点:
責務: 最小単位の汎用UI部品の提供。
依存: 要確認（各 base コンポーネント仕様に依存）。
入出力: 要確認（各 base コンポーネント仕様に記載）。
制約: 業務ロジックを含まない、汎用性が高いこと。
利用条件: 画面や機能に依存しないこと。
禁止事項: 業務ロジックを内包する実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`

### composite
定義: 複数の base コンポーネントを組み合わせたUI。
このプロジェクトでの意味: `modules/composite` および `src/components/composite` に配置され、UI構造を持ち、用途は限定される。
類似語との違い: `base` は最小単位、`functional` は業務ロジックを含む。相互参照: base, functional。
判断時の注意点: UI構造は持つが業務ロジックは最小限に留める。
再利用判断観点:
責務: base の組み合わせによるUI構造の提供。
依存: base コンポーネント群。
入出力: 要確認（各 composite 仕様に記載）。
制約: 汎用性はあるが用途は限定される。
利用条件: UI構造の再利用が目的であること。
禁止事項: 業務ロジックやAPI連携を内包すること。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`

### functional
定義: 業務ロジックを含む機能単位のコンポーネント。
このプロジェクトでの意味: `modules/functional` および `src/components/functional` に配置され、API連携や状態管理を含む。
類似語との違い: `base/composite` は業務ロジックを含まない。相互参照: base, composite。
判断時の注意点: 特定機能に依存するため再利用範囲は限定される。
再利用判断観点:
責務: 業務ロジックを含む機能単位の提供。
依存: API基盤や状態管理（例: Redux/React Query）に依存する場合がある。
入出力: 要確認（各 functional 仕様に記載）。
制約: 特定機能への依存が前提。
利用条件: 業務機能単位で利用する。
禁止事項: base/composite に置くべき汎用部品を混在させる。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`

### examples
定義: コンポーネントの使用例・サンプル。
このプロジェクトでの意味: `modules/examples` に配置され、本番ロジックを含まない実装ガイド。
類似語との違い: `base/composite/functional` は本番利用前提。相互参照: module。
判断時の注意点: examples を本番仕様として扱わない。
再利用判断観点:
責務: 使用例・実装ガイドの提示。
依存: 要確認（各 example 仕様に記載）。
入出力: 要確認（各 example 仕様に記載）。
制約: 本番ロジックを含まない。
利用条件: 実装の参考として参照する。
禁止事項: examples を本番仕様として流用する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### architecture
定義: フロントエンド全体の構造・設計思想・共通ルールを扱うカテゴリ。
このプロジェクトでの意味: `01_architecture` 配下の資料（ディレクトリ構成、状態管理、環境設定等）を指す。
類似語との違い: `application foundation` は共通アプリ基盤の機能仕様。相互参照: application foundation。
判断時の注意点: modules 分類や pages 構成などの前提は architecture で定義される。
再利用判断観点:
責務: 全体構造と設計思想の定義。
依存: 要確認（各 architecture 資料に依存）。
入出力: 要確認（設計資料のため入出力定義は個別に確認）。
制約: Dir.md の構成と命名規則を前提とする。
利用条件: 再利用判断の前提として参照する。
禁止事項: architecture の前提を無視した配置や命名。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`

### application foundation
定義: アプリケーション全体で共通利用される基盤機能のカテゴリ。
このプロジェクトでの意味: `02_application-foundation` 配下の認証・API通信・エラーハンドリング・ログ・通知などの基盤仕様を指す。
類似語との違い: `architecture` は設計思想と構造、`feature` は業務機能仕様。相互参照: architecture, feature。
判断時の注意点: 共通基盤を迂回した独自実装は禁止。
再利用判断観点:
責務: アプリ全体で共通利用される基盤機能の提供。
依存: 各基盤仕様（Auth/API/Error/Log/SnackBar）に依存。
入出力: 要確認（各基盤仕様に記載）。
制約: 共通基盤を経由することが前提。
利用条件: 該当機能が必要な場合は基盤を利用する。
禁止事項: 独自APIクライアント、独自認証、独自通知基盤などの迂回実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`

### feature
定義: 業務ロジックまたは画面単位の機能設計を扱うカテゴリ。
このプロジェクトでの意味: `04_features` 配下の資料（例: file-handling）を指す。
類似語との違い: `functional` はUIコンポーネント分類、`feature` は業務機能設計カテゴリ。相互参照: functional。
判断時の注意点: 既存 feature 基盤がある場合は新規実装前に再利用可否を確認する。
再利用判断観点:
責務: 業務機能やUI機能の設計・基盤提供。
依存: 要確認（各 feature 仕様に記載）。
入出力: 要確認（各 feature 仕様に記載）。
制約: 既存基盤（例: FileUploader の制限）に従う。
利用条件: 該当機能が必要な場合は feature 基盤を利用する。
禁止事項: feature 基盤を迂回した独自実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileUploaderFront.md`

### layout
定義: ページ全体やセクションの構造を組み立てるためのレイアウトコンポーネント群。
このプロジェクトでの意味: `modules/base/layout` の PageContainer/Section/DividerWithLabel 等と、共通レイアウトを提供する `BasePage` を指す。
類似語との違い: `navigation` は移動・階層表示のUI、`layout` は画面構造の枠組み。相互参照: navigation, BasePage。
判断時の注意点: 共通レイアウトは BasePage に集約する。
再利用判断観点:
責務: 画面構造の統一と配置基盤の提供。
依存: MUI などのレイアウト系コンポーネント。
入出力: 要確認（各 layout 仕様に記載）。
制約: BasePage のレイアウト構成やサイズ定数に従う。
利用条件: 共通レイアウトが必要なページは BasePage を使用する。
禁止事項: ページごとにヘッダー/サイドメニュー/パンくず/フッターを個別実装する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/layout/Layaut.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### navigation
定義: 画面内の移動・階層把握を支援するUIコンポーネント群。
このプロジェクトでの意味: `SideMenu` と `Breadcrumb` を中心としたナビゲーションUIを指し、`pageConfig.tsx` に基づいて構成される。
類似語との違い: `layout` は画面構造の枠、`navigation` は移動/階層のUI。相互参照: layout, breadcrumb, pageConfig。
判断時の注意点: pageConfig に基づかない独自ナビゲーションは不可。
再利用判断観点:
責務: ルーティング・階層表示・権限に基づくメニュー制御。
依存: `pageConfig.tsx`, `pageLang.ts`, `useAuth` など。
入出力: 要確認（各 navigation 仕様に記載）。
制約: pageConfig で定義された情報に従う。
利用条件: pageConfig/pageLang を更新して運用する。
禁止事項: 独自のパンくずやメニュー定義で置き換えること。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### page
定義: Next.js のルーティング単位となる画面。
このプロジェクトでの意味: `src/pages` 配下に配置され、ディレクトリ構造がURLパスと一致するページコンポーネント。
類似語との違い: `module` は再利用部品、`page` はルーティング入口。相互参照: module, pageConfig。
判断時の注意点: 再利用対象は pages 配下に直接実装しない。
再利用判断観点:
責務: ルーティングの入口として画面を構成する。
依存: Next.js の pages ルール。
入出力: 要確認（各ページ仕様に記載）。
制約: ディレクトリ構造がURLパスと一致する。
利用条件: pageConfig と連携する場合は設定を追加する。
禁止事項: 再利用部品の直接実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### pageConfig
定義: ページ構成・権限・パンくず・表示名・アイコン等を一元管理する設定ファイル。
このプロジェクトでの意味: `src/config/pageConfig.tsx` に集約され、`Breadcrumb` と `SideMenu`、`ProtectedRoute` が参照する共通定義。
類似語との違い: `page` は実装本体、`pageConfig` は設定。`breadcrumb` は pageConfig の一部情報を使うUI。相互参照: page, breadcrumb, permission。
判断時の注意点: pageConfig を介さない階層表示やメニュー構成は不可。
再利用判断観点:
責務: ルーティング・権限・階層・表示名の一元管理。
依存: `Breadcrumb`, `SideMenu`, `ProtectedRoute` の参照前提。
入出力: 入力は設定定義、出力はナビゲーション/権限制御の基準。
制約: breadcrumb の `id`/`parentId`、`requiredPermission` などの定義が必要。
利用条件: 新規ページ追加時に pageConfig を更新する。
禁止事項: pageConfig 以外でナビゲーションや権限定義を分散管理する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`

### breadcrumb
定義: 現在のページ階層を表示するパンくずリストUI。
このプロジェクトでの意味: `pageConfig.tsx` の `breadcrumb` 情報（`id`, `parentId`）を使い、`pageLang.ts` のラベルで表示する。
類似語との違い: `navigation` の一部機能。`SideMenu` は権限付きメニュー、`breadcrumb` は階層表示。相互参照: navigation, pageConfig。
判断時の注意点: pageConfig に基づかない独自パンくず生成は不可。
再利用判断観点:
責務: 階層ナビゲーションの表示。
依存: `pageConfig.tsx`, `pageLang.ts`, Next.js `useRouter`。
入出力: 入力は `router.pathname` と pageConfig、出力はパンくずUI。
制約: breadcrumb の定義がない場合は構築できない。
利用条件: 新規ページは pageConfig/pageLang を更新する。
禁止事項: 固定文字列でパンくずを直接描画する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`

### auth
定義: 認証（Authentication）および認可（Authorization）の機能群。
このプロジェクトでの意味: セッションベース認証（httpOnly Cookie）とRBACによるアクセス制御を提供し、`useAuth` と `ProtectedRoute` で利用する。
類似語との違い: `permission` は権限レベルやアクセス条件の定義。相互参照: permission。
判断時の注意点: 認証・認可は既存基盤（authSlice/useAuth/ProtectedRoute）に従う。
再利用判断観点:
責務: ログイン/ログアウト、認証状態管理、権限制御。
依存: `apiClient.ts`, `authService.ts`, `authSlice.ts`, `useAuth.ts`。
入出力: 入力は認証APIレスポンス、出力は認証状態とアクセス制御。
制約: httpOnly Cookie 前提、pageConfig の `requiredPermission` を使用。
利用条件: 認証必須ページは ProtectedRoute を通す。
禁止事項: 画面単位で独自の認証判定を実装する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`

### permission
定義: ページやメニューのアクセス制御に用いる権限条件。
このプロジェクトでの意味: `pageConfig.ts` の `requiredPermission` や `permissionTargetKey` を基準に、`ProtectedRoute` と `SideMenu` が判定する。
類似語との違い: `auth` は認証状態管理、`permission` はアクセス許可の条件。相互参照: auth, pageConfig。
判断時の注意点: 権限判定は pageConfig と auth 基盤に従う。
再利用判断観点:
責務: ページやメニューのアクセス制御基準の提供。
依存: `pageConfig.tsx`, `useAuth`, `ProtectedRoute`, `SideMenu`。
入出力: 入力は権限定義、出力はアクセス可否の判定。
制約: requiredPermission が未定義だと制御できない。
利用条件: pageConfig に権限定義を追加する。
禁止事項: 画面ごとの独自権限判定。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`

### apiClient
定義: Axios インスタンスを統一するAPIクライアント。
このプロジェクトでの意味: `apiClient.ts` で base URL やインターセプターを設定し、401/503等の共通処理を行う。
類似語との違い: `apiService` は API 操作の共通ラッパー、`service` は機能別API実装。相互参照: apiService, service。
判断時の注意点: 独自のAxios/Fetchインスタンスを作らない。
再利用判断観点:
責務: API通信の共通設定と監視・エラーハンドリングの入口。
依存: `errorHandler.ts`, 環境変数（APIベースURL等）。
入出力: 入力はリクエスト設定、出力はAxiosレスポンス。
制約: すべてのAPI通信は apiClient を経由する。
利用条件: withCredentials やインターセプターの設定に従う。
禁止事項: 独自APIクライアントの作成。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### apiService
定義: GET/POST/PUT/DELETE を共通化するAPI呼び出しラッパー。
このプロジェクトでの意味: すべてのAPIリクエストは `apiService.ts` 経由で行う。
類似語との違い: `apiClient` はAxiosインスタンス、`service` は機能別API実装。相互参照: apiClient, service。
判断時の注意点: 直接APIを叩かず apiService を経由する。
再利用判断観点:
責務: API呼び出しの共通化。
依存: `apiClient.ts`。
入出力: 入力はリクエストパラメータ、出力はレスポンスデータ。
制約: apiService 経由が必須。
利用条件: 例外なく apiService を利用する。
禁止事項: コンポーネントから直接APIを呼び出す。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### service
定義: 機能別のAPI呼び出し実装（例: authService, userService）。
このプロジェクトでの意味: `src/api/services/v1` などに配置され、apiService を利用してAPI呼び出しをまとめる層。
類似語との違い: `apiService` は汎用ラッパー、`service` はドメイン別。相互参照: apiService, apiClient。
判断時の注意点: 既存サービスに集約し、エンドポイントの直書きを避ける。
再利用判断観点:
責務: 機能単位のAPI呼び出しをまとめる。
依存: `apiService.ts`, `apiEndpoints.ts`。
入出力: 入力は機能別パラメータ、出力は機能別レスポンス。
制約: API呼び出しは apiService 経由。
利用条件: 既存サービスの拡張で対応する。
禁止事項: コンポーネントで直接API実装する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`

### hook
定義: React のカスタムフック。
このプロジェクトでの意味: `src/hooks` 配下の `useAuth`, `useError`, `useSnackbar`, `useApi` などで、Redux/React Query のアクセスを抽象化する。
類似語との違い: `service` はAPI実装、`hook` は状態/機能の呼び出し口。相互参照: Redux, React Query。
判断時の注意点: Reduxの内部実装に直接依存せず、hooks経由でアクセスする。
再利用判断観点:
責務: 状態管理やAPI呼び出しの利用窓口を統一する。
依存: Redux スライスや React Query のフックに依存。
入出力: 入力は関数引数や設定、出力は状態と操作関数。
制約: hooks での抽象化を前提。
利用条件: 既存 hooks を優先的に利用する。
禁止事項: コンポーネント内で直接ストアやAPIを操作する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Redux.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`

### snackbar
定義: スナックバー形式の通知UI。
このプロジェクトでの意味: Redux の `snackbarSlice.ts` と `useSnackbar.ts` で管理し、`SnackbarNotification.tsx` で表示する。
類似語との違い: `error handler` はエラー処理の共通関数、`snackbar` は通知UI。相互参照: error handler。
判断時の注意点: 個別の通知UIを乱立させない。
再利用判断観点:
責務: 通知メッセージの一貫した表示。
依存: `snackbarSlice.ts`, `useSnackbar.ts`, `SnackbarNotification.tsx`。
入出力: 入力は通知メッセージとタイプ、出力はSnackbar表示。
制約: Reduxでグローバル管理する。
利用条件: SnackbarNotification をアプリに常駐させる。
禁止事項: 個別 state による通知実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### error handler
定義: API通信やUIエラーの共通エラーハンドリングを行う仕組み。
このプロジェクトでの意味: `errorHandler.ts` を中心に、Redux の errorSlice と通知・ログ連携を行う。
類似語との違い: `logger` はログ出力の仕組み、`snackbar` は通知UI。相互参照: logger, snackbar。
判断時の注意点: APIエラーは必ず errorHandler に集約する。
再利用判断観点:
責務: エラー処理の統一、通知とログ連携。
依存: `errorSlice.ts`, `snackbarSlice.ts`, `logger.ts`, `teamsNotifier.ts`, `sentry.ts`。
入出力: 入力はエラー情報、出力は通知/ログ/例外。
制約: 共通ルールに従いステータスコードを処理する。
利用条件: apiClient 経由のエラー処理として利用する。
禁止事項: 画面ごとの個別エラー処理。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### logger
定義: ログレベルと出力先を管理し、外部通知も行うログ基盤。
このプロジェクトでの意味: `logger.ts` を通じて console だけでなく Sentry/Teams 等に送信する。
類似語との違い: `error handler` はエラー処理の入口、`logger` はログ出力の基盤。相互参照: error handler。
判断時の注意点: console 出力のみで運用を完結させない。
再利用判断観点:
責務: ログ出力の統一と外部通知。
依存: 環境変数（LOG_LEVEL 等）、Sentry/Teams 通知設定。
入出力: 入力はログ情報、出力はログ出力/外部通知。
制約: 環境別ログレベルに従う。
利用条件: logger.ts を経由する。
禁止事項: console のみの運用。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### websocket
定義: STOMP over WebSocket によるリアルタイム通知・イベント送受信の仕組み。
このプロジェクトでの意味: Context-only アーキテクチャの WebSocketProvider と useWSSubscription を使う基盤。
類似語との違い: `context-only` はWebSocketの状態管理方式。相互参照: context-only, provider。
判断時の注意点: 画面ごとの個別接続は不可。採用方式（Context-only/GlobalWebsocket）は要確認。
再利用判断観点:
責務: リアルタイムイベント購読と通知。
依存: WebSocketProvider, useWSSubscription, WebSocketClient。
入出力: 入力は eventType と handler、出力は UI 更新と通知。
制約: Context-only 実装が前提（Redux不要）。
利用条件: 単一接続の使い回しを前提とする。
禁止事項: ページごとに独自接続を作る。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### provider
定義: React コンポーネントツリーに状態や機能を注入する Provider コンポーネント。
このプロジェクトでの意味: `WebSocketProvider`、Redux の `Provider`、React Query の `QueryClientProvider` のように、基盤機能をアプリ全体へ提供する。
類似語との違い: `context-only` は Provider を用いた状態管理方式の一種。相互参照: context-only, websocket。
判断時の注意点: WebSocket は `_app.tsx` または `WebSocketProvider` による共通初期化が前提。
再利用判断観点:
責務: 依存性注入と状態/機能の共有基盤提供。
依存: 各Providerが必要とするストアやクライアント。
入出力: 入力は Provider の設定、出力は子コンポーネントへの機能提供。
制約: 要確認（配置やスコープのルールは個別仕様に従う）。
利用条件: `WebSocketProvider` など各基盤の利用例に従ってラップする（詳細な配置ルールは要確認）。
禁止事項: 要確認（個別仕様に準拠）。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileUploaderFront.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### context-only
定義: Redux を使わず React Context のみで状態管理するアーキテクチャ。
このプロジェクトでの意味: WebSocket 基盤が採用する方式で、WebSocketProvider と Context で購読状態を管理する。
類似語との違い: `Redux` を用いた状態管理とは別方式。相互参照: Redux, websocket。
判断時の注意点: WebSocket の現行採用方式は Context-only と明記されているが、GlobalWebsocket との併存は要確認。
再利用判断観点:
責務: WebSocket 状態管理の簡素化。
依存: React Context, WebSocketProvider。
入出力: 入力は購読設定、出力はイベント購読状態。
制約: Redux不要が前提。
利用条件: WebSocket基盤利用時に採用方式を確認する。
禁止事項: Redux前提の実装を混在させる。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`

### Redux
定義: アプリ全体のグローバル状態を管理する状態管理基盤。
このプロジェクトでの意味: 認証・エラー・通知・言語などの状態を `authSlice` などで一元管理し、hooks で参照する。
類似語との違い: `React Query` はサーバーサイドデータの取得・キャッシュを担当。相互参照: React Query, hook。
判断時の注意点: UIローカル状態とサーバーデータの役割分担を守る。
再利用判断観点:
責務: ローカルUI状態や認証/通知の一元管理。
依存: Redux Toolkit, 各slice, hooks。
入出力: 入力はアクション/非同期処理、出力は状態。
制約: 各sliceの初期値とログアウト時の初期化を前提。
利用条件: hooks 経由で状態を参照する。
禁止事項: Redux を迂回した状態管理。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Redux.md`

### React Query
定義: サーバーサイドデータ取得とキャッシュ管理を担うライブラリ。
このプロジェクトでの意味: `useApi.ts` などのカスタムフックで API フェッチを行い、キャッシュ戦略を適用する。
類似語との違い: `Redux` はローカルUI状態管理、`React Query` はサーバーデータ管理。相互参照: Redux, hook。
判断時の注意点: React Query と Redux の役割分担を守る。
再利用判断観点:
責務: APIデータ取得・キャッシュ・再検証。
依存: `useApi.ts`, `apiService.ts`。
入出力: 入力はクエリ/ミューテーション条件、出力は取得データと状態。
制約: cacheTime/staleTime の設定に従う。
利用条件: API通信は useApi 経由で行う。
禁止事項: 独自のAPIフェッチを乱立させる。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Redux.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`

### reusable
定義: 既存資産として再利用可能とみなされるUI/基盤。
このプロジェクトでの意味: base/composite など「再利用可能コンポーネント」として明記されたものを指す。本資料では modules と共通基盤の再利用判断対象を指す。
類似語との違い: `extend` は既存モジュールの拡張、`new implementation` は新規作成。相互参照: extend, new implementation。
判断時の注意点: 再利用可能な資産がある場合は新規実装を避ける。
再利用判断観点:
責務: 既存資産の再利用可否を判断する対象の定義。
依存: modules 分類と共通基盤に依存。
入出力: 要確認（対象資産ごとに定義）。
制約: 再利用対象は `src/components` に分類して配置する。
利用条件: 再利用判断フローに従う。
禁止事項: 再利用可能資産を無視した重複実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/README.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/reuse-decision-flow.md`

### extend
定義: 既存モジュールを前提に変更・追加を行う判断結果。
このプロジェクトでの意味: reuse 判定フローで候補があるが変更が必要な場合の結論「拡張」を指す。
類似語との違い: `reusable` は変更不要な再利用、`new implementation` は新規作成。相互参照: reusable, new implementation。
判断時の注意点: 既存基盤を迂回せず拡張することが前提。
再利用判断観点:
責務: 既存資産の拡張可否を判断する。
依存: 候補モジュール仕様と依存関係。
入出力: 要確認（拡張対象の仕様に記載）。
制約: 依存・パターンが一致する範囲で拡張する。
利用条件: 再利用判定フローの「変更不要か」判定で No の場合。
禁止事項: 基盤迂回の独自実装。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/reuse-decision-flow.md`

### replace
定義: 既存基盤に統一するために独自実装を既存モジュールへ置き換えること。
このプロジェクトでの意味: anti-patterns の「置き換えルール」に従い、直接API呼び出しや独自通知を基盤へ置き換える。
類似語との違い: `extend` は既存モジュールの変更、`replace` は独自実装の置き換え。相互参照: extend。
判断時の注意点: 置き換え対象と置き換え先の基盤を明示する。
再利用判断観点:
責務: 逸脱実装を基盤に統一する。
依存: 各基盤モジュール（apiService, useAuth, errorHandler 等）。
入出力: 要確認（置き換え対象により異なる）。
制約: 置き換えルールに従う。
利用条件: 独自実装が既存基盤で代替可能な場合。
禁止事項: 置き換え先を用いず独自実装を継続する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`

### new implementation
定義: 既存候補がなく再利用・拡張で要件を満たせない場合の新規作成。
このプロジェクトでの意味: reuse 判定フローの結論「新規作成」を指す。
類似語との違い: `reusable` は再利用、`extend` は拡張。相互参照: reusable, extend。
判断時の注意点: 新規作成の条件を満たすことを確認し、要確認事項を明記する。
再利用判断観点:
責務: 新規作成が妥当かを判断する。
依存: 既存候補・依存・パターン一致の結果。
入出力: 要確認（新規設計で定義）。
制約: 既存基盤を迂回しない前提。
利用条件: Catalog/Dependency/Patterns が一致しない場合。
禁止事項: 再利用可能資産があるのに新規作成する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/reuse-decision-flow.md`

### dependency
定義: 本資料では、既存ドキュメントで「依存」として言及される基盤・モジュールへの前提関係を指す。
このプロジェクトでの意味: 再利用判定では Dependency 一致を確認し、必要な基盤（Auth/API/Error/Log/WebSocket等）への依存が合致しているかを判断する。
類似語との違い: `strong dependency`/`optional dependency` の強弱分類は既存資料に明記がなく要確認。相互参照: strong dependency, optional dependency。
判断時の注意点: 依存関係の参照元が特定できない場合は「要確認」。
再利用判断観点:
責務: 再利用可否判断の前提条件の整理。
依存: FE/README と各モジュール仕様の依存記述。
入出力: 要確認（依存関係図が未整備）。
制約: Dependency一致が前提。
利用条件: 参照元の依存が特定できること。
禁止事項: 依存関係を特定せずに再利用判断する。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/reuse-decision-flow.md`, `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`

### strong dependency
定義: 要確認（既存資料に強い依存の定義は明記なし）。
このプロジェクトでの意味: 要確認。
類似語との違い: optional dependency との対比は要確認。相互参照: dependency, optional dependency。
判断時の注意点: 強弱の判断基準は要確認。
再利用判断観点:
責務: 要確認。
依存: 要確認。
入出力: 要確認。
制約: 要確認。
利用条件: 要確認。
禁止事項: 要確認。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/README.md`

### optional dependency
定義: 本資料では、implementation-patterns の「任意追加モジュール」に相当する依存を指す。
このプロジェクトでの意味: 必須基盤ではないが、必要に応じて追加可能なモジュール依存。
類似語との違い: `dependency` は必須/前提を含む広義の依存。相互参照: dependency。
判断時の注意点: 任意追加であっても既存基盤に反しないことを確認する。
再利用判断観点:
責務: 任意追加モジュールの位置付けを明確にする。
依存: 任意追加モジュールへの依存。
入出力: 要確認（任意追加モジュールの仕様に記載）。
制約: 必須基盤を欠いた状態で依存しない。
利用条件: implementation-patterns の任意追加に該当する場合。
禁止事項: 任意追加を必須と誤認して基盤構成を崩す。
代表的な参照資料: `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/implementation-patterns.md`

---

## 参照した既存ドキュメント一覧
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/README.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/reuse-decision-flow.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/anti-patterns.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/implementation-patterns.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Redux.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileUploaderFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/layout/Layaut.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`
