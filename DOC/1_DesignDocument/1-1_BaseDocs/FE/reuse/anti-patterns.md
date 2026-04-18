# anti-patterns

## 目的
既存のフロントエンド基盤・モジュール・共通ルールを無視した重複実装や逸脱実装を防ぎ、再利用判断のブレをなくすための禁止事項とアンチパターンを整理する。

## 参照元
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/GlobalWebsocket.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/websocket-usage-examples.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Header.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Footer.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/examples/form/Formサンプル.md`

## 更新ルール
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md` の分類方針や modules 定義が変わったら更新する。
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md` のフォルダ責務が変わったら更新する。
- API/認証/エラー/ログ/通知/WebSocket/レイアウト/ナビゲーション関連の仕様書が更新されたら、該当アンチパターンを見直す。
- reuse 配下の資料追加・削除があれば参照元一覧を更新する。

---

## 1. 目的
既存資産の再利用可否を判断するために、逸脱実装・重複実装の禁止事項を明確化し、共通基盤を前提とした設計判断を支援する。

## 2. なぜアンチパターン資料が必要か
- API、認証、エラー処理、通知、WebSocket、レイアウトなどは共通基盤として設計済みであり、個別実装が混入すると責務が崩れる。
- pageConfig や modules 分類など、共通の分類・定義を無視すると再利用判断が不能になる。
- 既存の設計基盤を前提とした統一的な実装を維持し、保守性と拡張性を担保するため。

## 3. 共通禁止事項
- 共通基盤（API、認証、エラーハンドリング、通知、ログ、WebSocket、レイアウト）を経由せずに独自実装する。
- 既存の責務境界（base/composite/functional/examples、src/components の分類）を無視した配置を行う。
- pageConfig/pageLang 等の共通定義を迂回し、ナビゲーションや表示名を個別管理する。
- エラーメッセージや通知を各画面のローカル状態で乱立させる。
- 既存資料で明記されていない項目を推測で追加する。

## 4. 分野別アンチパターン

### API

#### APIを直接叩いて共通層を通さない
何が問題か: `apiService.ts` / `apiClient.ts` を通らずに API を呼び出すと、共通のエラーハンドリングや監視・認証制御が迂回される。
なぜダメか: API通信は `apiService.ts` を経由する設計であり、`errorHandler.ts` による統一処理が前提となっている。
代わりに何を使うべきか: `apiService.ts` と `useApi.ts`、および `apiClient.ts` を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`

#### エンドポイントを各コンポーネントに直書きする
何が問題か: APIエンドポイントの変更に弱く、バージョン切替の一元管理ができない。
なぜダメか: `apiEndpoints.ts` での一元管理と環境変数によるバージョニングが前提。
代わりに何を使うべきか: `apiEndpoints.ts` を参照して API URL を取得する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`

#### 独自のAxios/Fetchインスタンスを作る
何が問題か: `apiClient.ts` のインターセプターや 401/503 の共通処理が適用されない。
なぜダメか: 認証・エラーハンドリング・監視が `apiClient.ts` に統一されている。
代わりに何を使うべきか: `apiClient.ts` の統一インスタンスと `apiService.ts` を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`

### 認証/認可

#### 認証判定を画面ごとに独自実装する
何が問題か: 認証状態の不整合や権限制御の欠落が発生する。
なぜダメか: 認証状態は `authSlice.ts` と `useAuth.ts` による一元管理が前提で、ルート保護は `ProtectedRoute.tsx` を利用する。
代わりに何を使うべきか: `useAuth.ts` と `ProtectedRoute.tsx`、`pageConfig.tsx` の `requiredPermission` を使用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`

#### 認証情報をクライアントで独自保持する
何が問題か: セッション管理方針と乖離し、セキュリティリスクが増大する。
なぜダメか: 認証方式は `httpOnly` Cookie を前提としており、クライアント側でトークンを保持しない設計。
代わりに何を使うべきか: `authService.ts` + `useAuth.ts` によるセッション管理を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`

### エラー/通知

#### Snackbar を独自 state で乱立させる
何が問題か: 通知の一貫性が崩れ、状態が分散する。
なぜダメか: SnackBar は `snackbarSlice.ts` と `useSnackbar.ts` によるグローバル管理が前提。
代わりに何を使うべきか: `snackbarSlice.ts` + `useSnackbar.ts` + `SnackbarNotification.tsx` を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`

#### APIエラーを各画面で個別処理する
何が問題か: エラー処理が分散し、通知・ログの統一が崩れる。
なぜダメか: APIエラーは `errorHandler.ts` に集約し、`errorSlice.ts` で管理する設計。
代わりに何を使うべきか: `errorHandler.ts` + `errorSlice.ts` + `ErrorNotification.tsx` を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`

#### UIエラーを ErrorBoundary で捕捉しない
何が問題か: 画面崩壊や無通知の障害が発生しうる。
なぜダメか: UIエラーは `ErrorBoundary.tsx` での捕捉を前提とする。
代わりに何を使うべきか: `ErrorBoundary.tsx` を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`

### ログ/監視

#### console出力のみで運用ログを完結させる
何が問題か: 本番環境での検知・追跡ができない。
なぜダメか: ログは `logger.ts` を経由し、Sentry/Teams 等の外部送信を行う設計。
代わりに何を使うべきか: `logger.ts`、`sentry.ts`、`teamsNotifier.ts` を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`

### WebSocket

#### WebSocket接続を画面内で個別実装する
何が問題か: 接続の多重化や購読の重複が発生し、保守性が低下する。
なぜダメか: 全体で単一接続を使い回す設計（BasePage / _app.tsx などの常駐リスナー）や、Context-only の Provider 方式が前提。
代わりに何を使うべきか: `useWSSubscription` とグローバルな WebSocket 初期化（`_app.tsx` / `WebSocketProvider`）を利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/GlobalWebsocket.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`
補足: WebSocket は GlobalWebsocket（Redux前提）と Context-only の2系統が記載されており、現行採用方式は要確認。

#### SnackbarListener と通知処理を二重実装する
何が問題か: 同一通知が二重表示される。
なぜダメか: `SnackbarListener` が一部イベントの通知を自動処理する設計。
代わりに何を使うべきか: `SnackbarListener` で処理されるイベントは重複実装を避ける。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/GlobalWebsocket.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/websocket-usage-examples.md`

### layout/navigation

#### ページごとにヘッダー・サイドメニュー・パンくず・フッターを個別実装する
何が問題か: UI構成が統一されず、修正コストが増大する。
なぜダメか: `BasePage` が共通レイアウトとして統合提供する設計。
代わりに何を使うべきか: `BasePage` を利用して共通レイアウトを構成する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md`

#### SideMenu / Breadcrumb を独自UIで置き換える
何が問題か: pageConfig と権限制御の一貫性が崩れる。
なぜダメか: SideMenu と Breadcrumb は `pageConfig.tsx` を前提に構成される。
代わりに何を使うべきか: `SideMenu` / `Breadcrumb` コンポーネントを利用する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`

### pageConfig / breadcrumb

#### pageConfig を介さずに階層表示を独自生成する
何が問題か: ナビゲーションの階層情報が分散し、変更に弱くなる。
なぜダメか: `Breadcrumb` は `pageConfig.tsx` の `breadcrumb` 情報をもとに階層を再帰的に構築する設計。
代わりに何を使うべきか: `pageConfig.tsx` と `pageLang.ts` を基準に Breadcrumb を構築する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`

#### pageConfig 以外でメニュー構成を保持する
何が問題か: 権限やメニュー構造の二重管理が発生する。
なぜダメか: SideMenu は `pageConfig.tsx` をもとに表示・権限判定を行う設計。
代わりに何を使うべきか: `pageConfig.tsx` に集約して管理する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`

### module配置

#### base/composite/functional の責務を崩す
何が問題か: 再利用性と依存関係の整理が崩れる。
なぜダメか: base は最小単位、composite は組み合わせ、functional は業務ロジックを含むという分類が明記されている。
代わりに何を使うべきか: 仕様に沿って modules の階層を選定し、`src/components` 配下の分類に合わせる。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`

#### 再利用対象を pages 配下に直接実装する
何が問題か: 再利用性が担保されず、責務が混在する。
なぜダメか: 再利用可能な UI は `src/components` 配下に分類して置く設計。
代わりに何を使うべきか: `src/components/base|composite|functional` に配置する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`

### examples の扱い

#### examples を本番仕様として扱う
何が問題か: サンプル用途の実装が本番仕様に混入し、責務が崩れる。
なぜダメか: examples は「使用例・サンプル」として位置付けられており、本番ロジックを含まない前提。
代わりに何を使うべきか: modules 配下の仕様書（base/composite/functional）を参照して実装する。
どの資料を見ればよいか: `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`、`DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/examples/form/Formサンプル.md`

## 5. 置き換えルール
- 直接 API 呼び出しは `apiService.ts` / `useApi.ts` に置き換える。
- 画面単位の認証判定は `ProtectedRoute.tsx` と `useAuth.ts` に置き換える。
- 個別 Snackbar 実装は `snackbarSlice.ts` / `useSnackbar.ts` / `SnackbarNotification.tsx` に置き換える。
- 個別エラーハンドリングは `errorHandler.ts` / `errorSlice.ts` / `ErrorNotification.tsx` に置き換える。
- console 出力のみの運用は `logger.ts` / `sentry.ts` / `teamsNotifier.ts` に置き換える。
- WebSocket の画面内接続は `_app.tsx` もしくは `WebSocketProvider` での共通初期化に置き換える。
- 独自のパンくず・メニュー定義は `pageConfig.tsx` と既存コンポーネントに置き換える。
- base/composite/functional の責務逸脱は modules の定義に沿って再配置する。

## 6. 例外扱い
- 例外条件は既存資料に明記されていないため、例外を設ける場合は要確認とする。
- 要確認の観点: 採用すべき WebSocket アーキテクチャ（GlobalWebsocket か Context-only か）、例外的に個別レイアウトが必要な画面の有無。

## 7. 参照元一覧
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/GlobalWebsocket.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/websocket-usage-examples.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Header.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Footer.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/examples/form/Formサンプル.md`

## 新規実装前の最終チェック
- 再利用できる既存モジュールがあるか。
- API/認証/エラー/通知/ログ/WebSocket/レイアウトの共通基盤を迂回していないか。
- pageConfig/pageLang の統一定義を使っているか。
- base/composite/functional/examples の責務に沿った配置か。
- 例外扱いに該当する場合は要確認として明記したか。
