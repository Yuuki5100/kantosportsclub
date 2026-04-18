# module-reuse-catalog

> 共通前置き
> - 本資料群は既存の設計書・実装構造の再利用判断を支援するための入口資料である。
> - 仕様書に記載のない推測は行わず、不明点は「要確認」として扱う。
> - この台帳だけで判定せず、必ず `reuse-decision-flow.md` を併用する。

## 全体方針
- 既存資料から読み取れることのみを記載し、不明な項目は「要確認」とする。
- 種別は `architecture / foundation / realtime / feature / base / composite / functional` に統一する。
- API・認証・通知・WebSocket は横断基盤として明示する。
- 機能単位（feature/foundation）と UI 部品（base/composite/functional）を混同しない。

## 分類別の一覧

### architecture
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| フォルダ構成設計（Dir） | architecture | Next.jsアプリのフォルダ構成・命名規則の基準 | 新規FE構成の立ち上げ<br>ディレクトリ整理 | Next.js以外は要確認 | なし（設計指針参照） | `src` 配置判断 | Next.js構成 | Env.md<br>Lang.md<br>Redux.md<br>modules/* | ディレクトリ追加<br>命名規則更新 | 命名規則（dir: lower camel、file: PascalCase）<br>テストは `__tests__` 分離 | `src/components/base` などの配置判断 | FE全体の基準文書 | DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md |
| 環境変数設定（Env） | architecture | 環境変数の一元管理と型安全な取得 | API/通知/ログなどの設定を環境別に分けたい時 | Next.js以外は要確認 | `.env.*`<br>`next.config.js`<br>`envUtils.ts` | 設定値（API URL、タイムアウト等） | Next.js env | APIConnectModule.md<br>ErrorHandle.md<br>logModule.md | 変数追加<br>検証/型変換追加 | `NEXT_PUBLIC_` 規則<br>デフォルト値設定 | 設定値を `envUtils` で取得 | 横断基盤（設定） | DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Env.md |
| 言語切替（Lang） | architecture | Reduxベースの言語状態管理と翻訳ファイル運用 | 多言語対応が必要な画面全般 | Reduxを使わない場合は要確認 | `langSlice.ts`<br>`useCurrentLanguage.ts`<br>`useLanguage.ts`<br>`*.lang.ts` | 言語別テキスト | Redux | Header.md<br>Footer.md<br>BasePage.md | 言語追加<br>langファイル追加 | langファイル形式（ja/en）<br>Redux管理 | `useLanguage(langFile)` で表示切替 | 横断基盤（i18n） | DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Lang.md |
| 状態管理（Redux） | architecture | 認証/エラー/通知/lang などのグローバル状態管理 | アプリ全体で状態を共有する場面 | サーバー状態は React Query 側とする方針では要確認 | actions<br>async thunks | slices state | Redux Toolkit<br>hooks | AuthModule.md<br>ErrorHandle.md<br>SnackBar.md<br>Lang.md | slice追加 | 初期値定義<br>ログアウト時初期化 | `useAuth`/`useError`/`useSnackbar` | 横断基盤（状態管理） | DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Redux.md |

### application-foundation
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API通信モジュール | foundation | API通信の共通化、エラーハンドリング、キャッシュ戦略 | REST API を共通化したい時 | REST以外は要確認 | リクエストデータ<br>環境変数 | APIレスポンス<br>エラー処理 | axios<br>apiClient/apiService<br>useApi<br>errorHandler | Auth-API.md<br>AuthModule.md<br>ErrorHandle.md<br>FullAPI.md | エンドポイント追加<br>キャッシュ戦略追加 | `apiService` 経由必須<br>401自動ログアウト<br>errorHandler統一 | services 経由で `useApi` を使用 | 横断基盤（API） | DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md |
| 認証・API統合エラーハンドリング | foundation | 認証/認可、API通信、エラー通知の統合設計 | 認証とAPIの統合運用 | 認証方式が異なる場合は要確認 | 認証情報<br>APIレスポンス<br>エラー | 認証状態<br>通知/エラーメッセージ | apiClient/apiService<br>Redux slices<br>ErrorBoundary | AuthModule.md<br>ErrorHandle.md<br>SnackBar.md | 認証方式追加<br>通知先追加 | httpOnly Cookie<br>401/403処理 | useAuth + errorHandler | 横断基盤（認証/通知） | DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md |
| 認証・認可モジュール | foundation | RBACとProtectedRouteによるアクセス制御 | 認証/認可が必要な画面 | セッション方式以外は要確認 | ログイン情報<br>`/auth/status` | AuthSlice状態<br>アクセス制御 | apiClient/authService<br>Redux slices<br>pageConfig | Auth-API.md<br>APIConnectModule.md | 認証方式追加<br>権限定義拡張 | `apiService` 経由<br>CSRFトークン | `useAuth` + ProtectedRoute | 横断基盤（認証） | DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md |
| エラーハンドリング/ログ | foundation | API/UIエラーの統一処理と通知/ログ | 全体エラーハンドリング | 個別仕様が強い場合は要確認 | APIエラー<br>UI例外 | エラーメッセージ<br>ログ<br>通知 | errorHandler<br>Redux slices<br>ErrorBoundary<br>logger | logModule.md<br>SnackBar.md | エラー分類追加<br>通知先追加 | メッセージはBE取得前提<br>LOG_LEVEL運用 | errorHandler経由でRedux更新 | 横断基盤（エラー/通知/ログ） | DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md |
| FE-BE通信設計（FullAPI） | foundation | FE/BE間の統一レスポンスと通信仕様 | ApiResponse形式の統一運用 | BE構成が異なる場合は要確認 | APIリクエスト<br>レスポンス形式 | 統一レスポンス設計 | Spring Boot<br>apiClient/apiService | APIConnectModule.md<br>AuthModule.md | APIバージョン追加 | ApiResponse形式<br>Spring Security前提 | apiEndpoints + apiService | 横断基盤（API） | DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/FullAPI.md |
| ログシステム | foundation | エラー/ログ出力と外部通知 | 監視/通知を統一したい時 | ログ方針が異なる場合は要確認 | エラーイベント | ログ出力<br>外部通知 | errorHandler<br>logger<br>sentry/teams | ErrorHandle.md | ロガー切替<br>通知先追加 | LOG_LEVEL依存 | errorHandler -> logger | 横断基盤（ログ） | DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md |
| スナックバー通知 | foundation | 通知の共通UI | 成功/警告/エラー通知 | 別UI通知の場合は要確認 | show/hide通知<br>Redux state | Snackbar UI | snackbarSlice<br>useSnackbar | ErrorHandle.md<br>GlobalWebsocket.md | 表示時間/スタイル調整 | Redux管理 | `useSnackbar().showSnackbar` | 横断基盤（通知） | DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md |

### realtime
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GlobalWebsocket | realtime | 単一WebSocketとReduxで購読管理 | 全ページ共通のリアルタイム通知 | Context-only運用時は要確認 | eventType購読<br>WebSocketメッセージ | notificationsSlice更新<br>通知UI | Redux slices<br>useGlobalWebSocket | webSocketFront.md<br>SnackBar.md | eventType追加 | BasePage常駐前提<br>Redux前提 | `useWSSubscription('EVENT')` | WebSocket横断基盤<br>Redux/Contextの標準要確認 | DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/GlobalWebsocket.md |
| WebSocket通知（Context-only） | realtime | Context-onlyのWebSocket基盤 | Redux不要のリアルタイム通知 | Redux前提運用時は要確認 | eventType<br>handler<br>config | 通知リスト<br>Snackbar自動表示 | WebSocketProvider<br>webSocketClient<br>SockJS/STOMP | websocket-usage-examples.md<br>GlobalWebsocket.md | イベント追加<br>Provider設定 | Context-only前提<br>自動再接続 | `<WebSocketProvider><SnackbarListener/>` | 2025-08-05移行記載あり<br>現行標準要確認 | DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md |
| WebSocket使用例 | realtime | Context-onlyの利用例とベストプラクティス | 画面実装時の参照 | 仕様決定の根拠には使わない | eventType<br>handler | 実装例 | WebSocketProvider<br>useWSSubscription | webSocketFront.md | 例の追加 | Context-only前提 | useWSSubscriptionの呼び出し例 | 例示資料 | DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/websocket-usage-examples.md |

### features
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ファイルバリデーション（FileImport） | feature | CSV/Excelのヘッダー/行検証 | アップロード前の事前検証 | CSV/Excel以外は要確認 | file<br>schema<br>expectedHeaders<br>lang | errors/warnings<br>アップロード可否 | utils/file validators<br>useFileImport<br>useSnackbar | FileUploaderFront.md | schema追加<br>検証ルール追加 | スキーマはBE定義前提 | `useFileImport` で検証 | file-handlingの中核 | DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileImport.md |
| FileUploader | feature | 最大3件のファイルアップロードUI | 画面内の簡易アップロード | 件数/仕様が異なる場合は要確認 | file選択<br>initialFiles<br>onChange | アップロード済みファイル配列 | useMutation<br>showSnackbar | FileImport.md | slot数変更<br>削除機能拡張 | 最大3件 | `/api/files/*` への連携 | UI部品だが仕様が具体的 | DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileUploaderFront.md |
| マニフェスト番号検証 | feature | チェックデジット計算/検証 | 産廃マニフェスト番号検証 | 産廃以外は要確認 | 10桁/11桁番号<br>方式指定 | チェックデジット<br>検証結果 | utilsのみ | 要確認 | 生成機能追加 | 7DR/Mod10方式 | `validateManifestNumber` 呼び出し | ドメイン特化 | DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/manifestCheck.md |

### modules/base
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Buttonモジュール | base | 汎用/派生ボタンの共通化 | 戻る/次へ/拒否など共通ボタン | デザインが大きく異なる場合は要確認 | label/onClick/variant 等 | クリックイベント | MUI Button/IconButton | ModalWindow.md | 派生ボタン追加 | MUI依存 | `ButtonBase` で統一 | 共通UI部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/button/Button.md |
| CommonAccordion | base | 折りたたみUIの共通化 | 検索条件や詳細表示 | 別のUI方針の場合は要確認 | title/children/defaultExpanded | 展開/折りたたみUI | MUI Accordion | ControllableListView.md | 見た目/挙動調整 | 内部状態管理 | `CommonAccordion` をラップ利用 | baseのUI共通部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/display/Accordion.md |
| Tableモジュール | base | 表形式UIの再利用窓口 | 画面内の表表示 | 独自テーブル実装が必要な場合は要確認 | children/props | テーブルUI | MUI Table/Paper | ListView.md | 共通スタイル拡張 | 直接MUI禁止 | `Table`/`TableRow` で構成 | baseへの統一窓口 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/display/Table.md |
| AutoResizingTextBox | base | 自動リサイズ可能なテキスト入力 | 長文入力欄 | 非MUIや幅固定不可の場合は要確認 | value/onChange/maxLength など | 入力値変更 | MUI TextField | Form.md<br>Input.md | 単位表示/クリア拡張 | デフォルト幅あり | テキストエリアで使用 | base入力部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/input/AutoResizingTextBox.md |
| DatePicker | base | 日付選択UIの共通化 | フォームの日時入力 | Dayjsを使わない場合は要確認 | value/onChange/min/max/allowedDays | 日付値 | MUI DatePicker<br>dayjs | Form.md<br>Input.md | 曜日制限拡張 | `allowedDaysOfWeek` 制約 | 日付入力項目 | base入力部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/input/DatePicker.md |
| Form（入力群仕様） | base | 入力コンポーネント群の仕様整理 | フォーム設計の基準確認 | 最新差分は要確認 | 各入力コンポーネントのprops | 入力UI | MUI | Input.md | 入力コンポーネント追加 | バリデーションは外部実装 | 入力系コンポーネント設計 | Input.mdと重複 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/input/Form.md |
| FormRow | base | ラベル＋入力の横並びレイアウト | フォーム行の統一表示 | レスポンシブ重視の画面は要確認 | label/children/required | レイアウトUI | MUI Box/Chip | Form.md<br>Input.md | Chip表示拡張 | ラベル最小幅固定 | 入力行の整形 | baseレイアウト部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/input/FormRow.md |
| Input（入力群仕様） | base | 入力コンポーネント群の仕様整理 | フォーム設計の基準確認 | Form.mdとの差分は要確認 | TextBox/DropBox等のprops | 入力UI | MUI | Form.md | 入力群の拡張 | バリデーションは外部実装 | 入力系コンポーネント設計 | Form.mdと内容重複 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/input/Input.md |
| RadioMatrix | base | マトリクス型ラジオ選択UI | 権限などの単一選択 | 別UI方針は要確認 | options/selectedValue/onChange | 選択値 | MUI Table | Form.md<br>Input.md | 表示スタイル調整 | disabled対応 | ラジオ選択を表形式で表示 | base入力部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/input/RadioMatrix.md |
| Boxレイアウト | base | 縦/横/スタックの簡易レイアウト | 画面内レイアウト統一 | MUI非採用は要確認 | children/BoxProps | レイアウトUI | MUI Box/Stack | Layout.md | デフォルトスタイル変更 | デフォルト整列あり | Box/FlexBox/StackBoxの使用 | baseレイアウト部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/layout/Box.md |
| Layout（PageContainer等） | base | ページ/セクションの枠組み | 画面構造の統一 | 既存レイアウトと衝突する場合は要確認 | children/label | セクションUI | MUI Box/Paper/Divider | BasePage.md | スタイル調整 | 既定のpadding/margin | PageContainer/Section使用 | baseレイアウト部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/layout/Layaut.md |
| Spacer | base | 余白の挿入 | レイアウトの間隔調整 | CSS margin/paddingで十分な場合は要確認 | width/height | 空白UI | MUI Box | Utils.md | サイズ指定拡張 | flexShrink=0 | `Spacer height={16}` | baseユーティリティ | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/layout/Spacer.md |
| Font | base | フォントサイズの統一 | テキストの一貫性 | デザイン体系が異なる場合は要確認 | size/color/weight/children | テキストUI | FontBase | EllipsisText.md<br>InlineLabel.md | サイズ追加 | FontBase経由 | `Font16` 等の使用 | baseタイポグラフィ | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/typography/Font.md |
| Baseユーティリティ | base | Tooltip/Spacer/InlineLabel/EllipsisTextの共通化 | 軽量UI補助 | 構成が異なる場合は要確認 | title/children<br>label/icon 等 | 補助UI | MUI | InlineLabel.md<br>EllipsisText.md<br>Spacer.md | ユーティリティ追加 | base配下に配置 | TooltipWrapper等の利用 | InlineLabel/EllipsisTextと配置差異要確認 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/utility/Utils.md |
| MUIプリミティブ | base | MUI部品の再エクスポート窓口 | base未整備のMUI部品を使う場面 | baseラップが存在する場合は要確認 | MUIの各種props | UI部品 | MUI | Utils.md | export追加 | 直接MUI禁止 | `@/components/base` から利用 | base経由に統一 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base/utility/MuiPrimitives.md |

### modules/composite
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BasePage | composite | 共通レイアウトの統合（Header/SideMenu/Footer等） | 全ページ共通の枠組み | 画面構成が大きく異なる場合は要確認 | children | レイアウトUI | Header/SideMenu/Breadcrumb/Footer<br>ErrorNotification | Header.md<br>Footer.md<br>SideMenu.md | レイアウト差分調整 | config定数に依存 | `<BasePage>{children}</BasePage>` | 共通レイアウト中核 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/layout/BasePage.md |
| Header | composite | グローバルヘッダー | 全ページ共通ヘッダー | 独自UIの場合は要確認 | language/onLogoClick/onSettingsClick | ヘッダーUI | MUI AppBar<br>header.lang.ts | BasePage.md | 表示要素追加 | color.ts依存 | `<Header language=...>` | 共通UI部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Header.md |
| SideMenu | composite | 権限連動のサイドメニュー | 画面ナビゲーション | pageConfig運用しない場合は要確認 | useAuth権限 | ナビUI | pageConfig<br>pageLang<br>useSidebar | BasePage.md<br>Breadcrumb.md | メニュー階層追加 | permissionTargetKey運用 | `<SideMenu />` | 横断ナビ基盤 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/SideMenu.md |
| Footer | composite | グローバルフッター | 全ページ共通フッター | 画面にフッター不要の場合は要確認 | language/onClick | フッターUI | MUI Box<br>color.ts | BasePage.md | 表示制御調整 | scroll/resize依存 | `<Footer language=...>` | 共通UI部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Footer.md |
| Breadcrumb | composite | パンくずナビ | 階層表示が必要な画面 | pageConfig運用しない場合は要確認 | router.pathname | パンくずUI | Next.js router<br>pageConfig/pageLang | SideMenu.md | 階層追加 | breadcrumb.id/parentId | `<Breadcrumb />` | ナビ補助UI | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/navigation/Breadcrumb.md |
| ListView | composite | 一覧表示・ソート・ページネーション | 小〜中規模の一覧表示 | 外部状態管理が必要な場合は要確認 | rowData/columns/sortColumns | テーブルUI | MUI Table | ControllableListView.md<br>ListViewFix.md | 列追加/スタイル調整 | 内部状態管理 | `ListView` で一覧表示 | ControllableListViewと比較要確認 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/list/ListView.md |
| ListView カラム幅制御 | composite | ListViewの幅計算仕様 | カラム幅を%指定したい時 | widthPercent不要な場合は要確認 | ColumnDefinition.widthPercent | computedWidth | ListView/TableHeaderRow | ListView.md | 幅計算ルール変更 | 合計>100%は警告のみ | widthPercent指定 | 表示対象列の扱い要確認 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/list/ListViewFix.md |
| ControllableListView | composite | 外部状態管理の一覧表示 | サーバーサイドソート/ページング | 内部状態で十分な場合は要確認 | page/rowsPerPage/sortParams | テーブルUI<br>状態変更通知 | TableHeaderRow<br>ListViewPagination<br>CommonAccordion | ListView.md | 検索アコーディオン拡張 | 状態は親で管理 | `onTableStateChange` で制御 | ListViewとの差分明示 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/list/ControllableListView.md |
| ModalWindow | composite | 汎用モーダルUI | 確認/通知/選択ダイアログ | モーダル不要な場合は要確認 | open/onClose/title/buttons | モーダルUI | MUI Modal<br>ButtonBase | Button.md | ボタン追加 | 既定サイズ 600x400 | `ModalWithButtons` 使用 | 共通UI部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/feedback/ModalWindow.md |
| LoadingSpinner | composite | 全画面ローディング表示 | API待機/ページ遷移 | 部分ローディングのみの場合は要確認 | open/size | スピナーUI | MUI Backdrop | ErrorHandle.md | 色/サイズ調整 | zIndex 1300 | `LoadingSpinner open={true}` | 共通UI部品 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/feedback/LoadingSpinner.md |
| BatchResults | composite | バッチ結果の検索/一覧表示 | CRJ特有のバッチ管理 | 汎用化用途は要確認 | onError（任意） | バッチ結果UI | ControllableListView<br>APIサービス | ControllableListView.md | 検索条件拡張 | CRJ固有仕様 | バッチ結果画面 | ドメイン特化 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite/feature/BatchResults.md |

### modules/functional
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EllipsisText | functional | 1行省略表示 | 長文の省略表示 | 2行以上表示が必要な場合は要確認 | text/size/bold | 省略テキストUI | MUI Box<br>FontBase | Font.md<br>Utils.md | スタイル調整 | 1行省略のみ | `EllipsisText` で表示 | base/functionalの配置差異要確認 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/functional/display/EllipsisText.md |
| InlineLabel | functional | アイコン＋ラベル表示 | ラベル付きアイコン | 別UI方針は要確認 | icon/label/size/bold | ラベルUI | MUI Box<br>FontBase | Font.md<br>Utils.md | スタイル調整 | 横並び固定 | `InlineLabel` で表示 | base/functionalの配置差異要確認 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/functional/display/InlineLabel.md |
| UserUpdateForm | functional | ユーザー情報更新フォーム | プロフィール更新画面 | 入力項目が異なる場合は要確認 | なし（内部state） | 更新処理<br>アラート表示 | useFetch<br>useApiMutation | APIConnectModule.md | 項目追加 | name/email前提 | プロフィール編集フォーム | ドメイン依存 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/functional/form/UserUpdateForm.md |
| UserListPage | functional | ユーザー一覧の検索/表示/ページング/詳細遷移 | 管理者/一般のユーザー一覧画面 | 一覧構成・検索条件が大きく異なる場合は要確認 | なし（内部state） | 一覧表示<br>詳細遷移 | ControllableListView<br>FormRow<br>TextBox/DropBox<br>ButtonBase<br>useSnackbar<br>getUserListApi<br>getRoleDropdownApi<br>useRouter | ControllableListView.md<br>FormRow.md<br>Input.md<br>Button.md<br>SnackBar.md | 検索条件/カラム追加<br>APIパラメータ拡張 | `email`/`status`/`sortKey`/`sortOrder` のAPI連携は要確認 | `<UserListPage />` を一覧画面に配置 | admin/user/list と user/list の共通利用 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/functional/display/UserListPage.md |

### modules/examples
| 名称 | 種別 | 主責務 | 再利用できる場面 | 再利用すべきでない場面 | 入力 | 出力 | 依存先 | 関連モジュール | 拡張ポイント | 制約 | 典型利用パターン | 再利用判定メモ | 参照元ドキュメント |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Formサンプル | feature | 入力/ボタン/リスト等の使用例集 | 利用例の参照 | 仕様の根拠には使わない | 例示コード | 使用例 | 多数のbase/composite | Form.md<br>Input.md<br>Button.md | サンプル追加 | サンプルであり仕様ではない | `src/pages/user.tsx` の例 | examples資料 | DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/examples/form/Formサンプル.md |

## 横断サマリ

### 再利用候補の強いモジュール
- APIConnectModule.md（API共通化の中核）
- AuthModule.md / Auth-API.md（認証・認可の横断基盤）
- ErrorHandle.md / SnackBar.md / logModule.md（エラー・通知・ログの横断基盤）
- GlobalWebsocket.md / webSocketFront.md（リアルタイム通知の横断基盤）
- BasePage.md / Header.md / SideMenu.md / Breadcrumb.md / Footer.md（共通レイアウト）
- ListView.md / ControllableListView.md（一覧表示の共通UI）
- Button.md / DatePicker.md / FormRow.md（汎用UI部品）

### 新規実装になりやすい領域
- BatchResults.md（CRJ固有機能）
- manifestCheck.md（産廃マニフェストに特化）
- FileImport.md（スキーマや運用ルール次第で差分が出やすい）

### 情報不足で判定困難な領域
- GlobalWebsocket.md と webSocketFront.md のどちらが現行標準か
- Form.md と Input.md の最新版・差分方針
- Utils.md と functional配下（InlineLabel/EllipsisText）の配置方針
- ListViewFix.md の適用範囲（display=false列の扱い）
