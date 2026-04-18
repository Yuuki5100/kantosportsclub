# capability-matrix

## 目的
既存モジュール・機能・基盤が提供する能力を横断比較し、再利用可否の判断材料を整理する。

## 参照元
- `DOC\1_DesignDocument\1-1_BaseDocs\FE` 配下の既存設計資料（詳細は末尾）

## 更新ルール
- 参照元ドキュメントに変更があった場合、本表を更新する。
- 根拠がない項目は「要確認」のままにし、推測で埋めない。
- 新規ドキュメント追加時は行を追記し、既存行の記号を見直す。

## 読み方
- 行は architecture / foundation / realtime / features / modules の主要ドキュメント。
- 列は再利用判断に必要な観点（責務、依存、入出力、制約）を示す。
- 記号の意味: ○ 主責務、△ 条件付きで関与、× 記載上の対象外/不要が明確、要確認 資料根拠不足
- 再利用優先度の基準: 高=modules/base、中=modules/composite、低=modules/functional・modules/examples、それ以外=要確認

## 能力マトリクス
| 対象 | 種別 | レイアウト | ナビゲーション | 入力 | 表示 | 一覧表示 | フォーム | モーダル | 通知 | エラーハンドリング | ログ/監視 | API取得 | API更新 | 認証 | 認可 | WebSocket | 多言語 | pageConfig依存 | Redux依存 | Context依存 | React Query依存 | ファイル処理 | サンプル有無 | 再利用優先度 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `01_architecture/Dir.md` | architecture | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | 要確認 | フォルダ構成設計 |
| `01_architecture/Env.md` | architecture | × | × | × | × | × | × | × | △ | △ | △ | △ | △ | × | × | × | × | × | × | × | △ | × | ○ | 要確認 | 環境変数でAPI/通知/ログ/React Query設定 |
| `01_architecture/Lang.md` | architecture | × | × | × | △ | × | × | × | × | × | × | × | × | × | × | × | ○ | × | ○ | × | × | × | ○ | 要確認 | useCurrentLanguage/useLanguage + langSlice |
| `01_architecture/Redux.md` | architecture | × | × | × | × | × | × | × | ○ | ○ | × | 要確認 | 要確認 | ○ | ○ | × | ○ | × | ○ | × | 要確認 | × | ○ | 要確認 | auth/error/snackbar/lang slices |
| `02_application-foundation/APIConnectModule.md` | foundation | × | × | × | × | × | × | × | △ | ○ | ○ | ○ | ○ | ○ | △ | × | × | × | 要確認 | × | ○ | × | ○ | 要確認 | apiClient/apiService/useApi |
| `02_application-foundation/Auth-API.md` | foundation | × | × | × | × | × | × | × | ○ | ○ | ○ | ○ | ○ | ○ | ○ | × | × | 要確認 | ○ | × | ○ | × | ○ | 要確認 | 認証+API+エラーハンドリング統合 |
| `02_application-foundation/AuthModule.md` | foundation | × | × | × | × | × | × | × | △ | △ | ○ | ○ | ○ | ○ | ○ | × | × | ○ | ○ | × | ○ | × | ○ | 要確認 | pageConfigで権限 |
| `02_application-foundation/ErrorHandle.md` | foundation | × | × | × | △ | × | × | × | ○ | ○ | ○ | △ | △ | × | × | × | × | × | ○ | × | × | × | ○ | 要確認 | errorHandler/logger/ErrorBoundary |
| `02_application-foundation/FullAPI.md` | foundation | × | × | × | × | × | × | × | △ | △ | ○ | ○ | ○ | ○ | ○ | × | × | × | ○ | × | ○ | × | ○ | 要確認 | FE-BE通信/ApiResponse |
| `02_application-foundation/logModule.md` | foundation | × | × | × | △ | × | × | × | ○ | ○ | ○ | △ | △ | × | × | × | × | × | ○ | × | × | × | ○ | 要確認 | Sentry/Teams/logger |
| `02_application-foundation/SnackBar.md` | foundation | × | × | × | ○ | × | × | × | ○ | △ | × | × | × | × | × | × | × | × | ○ | × | × | × | ○ | 要確認 | snackbarSlice/useSnackbar |
| `03_realtime/websocket/GlobalWebsocket.md` | realtime | × | × | × | △ | × | × | × | ○ | × | × | × | × | × | × | ○ | × | × | ○ | × | × | × | ○ | 要確認 | BasePage常駐/Redux slice |
| `03_realtime/websocket/websocket-usage-examples.md` | realtime | × | × | × | △ | × | × | △ | ○ | △ | △ | × | × | × | × | ○ | × | × | × | ○ | × | △ | ○ | 要確認 | Context-onlyガイド |
| `03_realtime/websocket/webSocketFront.md` | realtime | × | × | × | △ | × | × | △ | ○ | △ | △ | × | × | △ | △ | ○ | × | × | △ | ○ | × | △ | ○ | 要確認 | Context-only/STOMP/SockJS |
| `04_features/file-handling/FileImport.md` | feature | × | × | △ | △ | × | △ | × | ○ | △ | × | ○ | ○ | × | × | × | ○ | × | ○ | × | × | ○ | ○ | 要確認 | CSV/Excelバリデーション |
| `04_features/file-handling/FileUploaderFront.md` | feature | × | × | ○ | ○ | × | △ | × | ○ | × | × | ○ | ○ | × | × | × | × | × | ○ | × | ○ | ○ | ○ | 要確認 | 3スロット/Storybook |
| `04_features/file-handling/manifestCheck.md` | feature | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 要確認 | チェックデジット計算 |
| `modules/base/button/Button.md` | module/base | × | × | ○ | △ | × | △ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | ButtonBase/Back/Next/Reject |
| `modules/base/display/Accordion.md` | module/base | △ | × | △ | ○ | × | △ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | CommonAccordion |
| `modules/base/input/AutoResizingTextBox.md` | module/base | × | × | ○ | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | 多機能テキストエリア |
| `modules/base/input/DatePicker.md` | module/base | × | × | ○ | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | Dayjs/MUI DatePicker |
| `modules/base/input/Form.md` | module/base | × | × | ○ | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | 要確認 | 高 | 入力系コンポーネント群 |
| `modules/base/input/FormRow.md` | module/base | ○ | × | △ | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | ラベル+入力レイアウト |
| `modules/base/input/Input.md` | module/base | × | × | ○ | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | 要確認 | 高 | TextBox/CheckBox等 |
| `modules/base/input/RadioMatrix.md` | module/base | × | × | ○ | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | ラジオ行列 |
| `modules/base/layout/Box.md` | module/base | ○ | × | × | △ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | Box/FlexBox/StackBox |
| `modules/base/layout/Layaut.md` | module/base | ○ | × | × | △ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | PageContainer/Section/DividerWithLabel |
| `modules/base/layout/Spacer.md` | module/base | ○ | × | × | △ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | 空白調整 |
| `modules/base/typography/Font.md` | module/base | × | × | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | FontBase/Font10-30 |
| `modules/base/utility/Utils.md` | module/base | △ | × | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 高 | Tooltip/Spacer/InlineLabel/EllipsisText |
| `modules/composite/feature/BatchResults.md` | module/composite | △ | ○ | ○ | ○ | ○ | △ | × | × | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | ○ | 低 | CRJ固有バッチ結果一覧 |
| `modules/composite/feedback/LoadingSpinner.md` | module/composite | × | × | × | ○ | × | × | × | △ | × | × | × | × | × | × | × | △ | × | × | × | × | × | 要確認 | 中 | Backdrop/CircularProgress |
| `modules/composite/feedback/ModalWindow.md` | module/composite | × | × | △ | ○ | × | × | ○ | △ | × | × | × | × | × | × | × | △ | × | × | × | × | × | 要確認 | 中 | ModalWithButtons/ModalHeader/Body/Footer |
| `modules/composite/layout/BasePage.md` | module/composite | ○ | ○ | × | ○ | × | × | × | △ | △ | × | × | × | × | × | × | ○ | △ | △ | × | × | × | 要確認 | 中 | Header/SideMenu/Breadcrumb/Footer統合 |
| `modules/composite/list/ControllableListView.md` | module/composite | △ | × | △ | ○ | ○ | △ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 中 | 外部状態管理/検索アコーディオン |
| `modules/composite/list/ListView.md` | module/composite | △ | × | △ | ○ | ○ | △ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | ○ | 中 | 内部状態管理/テーブル |
| `modules/composite/list/ListViewFix.md` | module/composite | △ | × | × | △ | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | 要確認 | カラム幅算出ルール |
| `modules/composite/navigation/Breadcrumb.md` | module/composite | × | ○ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | ○ | ○ | △ | × | × | × | 要確認 | 中 | pageConfig/parentId構成 |
| `modules/composite/navigation/Footer.md` | module/composite | △ | △ | × | ○ | × | × | × | × | × | × | × | × | × | × | × | ○ | × | △ | × | × | × | ○ | 中 | language注入/クリック |
| `modules/composite/navigation/Header.md` | module/composite | △ | ○ | △ | ○ | × | × | × | × | × | × | × | × | × | × | × | ○ | × | △ | × | × | × | ○ | 中 | logo/username/設定導線 |
| `modules/composite/navigation/SideMenu.md` | module/composite | ○ | ○ | △ | ○ | × | × | × | × | × | × | × | × | ○ | ○ | × | ○ | ○ | ○ | △ | × | × | ○ | 中 | pageConfig+permission |
| `modules/examples/form/Formサンプル.md` | module/examples | △ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | × | 要確認 | 要確認 | 要確認 | 要確認 | × | ○ | × | ○ | × | × | × | ○ | 低 | サンプル実装 |
| `modules/functional/display/EllipsisText.md` | module/functional | × | × | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | 要確認 | 低 | FontBase依存 |
| `modules/functional/display/InlineLabel.md` | module/functional | × | × | × | ○ | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | × | 要確認 | 低 | FontBase依存 |
| `modules/functional/form/UserUpdateForm.md` | module/functional | × | × | ○ | △ | × | ○ | × | △ | △ | × | ○ | ○ | × | × | × | × | × | × | × | ○ | × | ○ | 低 | React QueryでGET/PUT |
| `modules/functional/display/UserListPage.md` | module/functional | △ | △ | ○ | ○ | ○ | △ | × | △ | △ | × | ○ | × | × | × | × | × | × | △ | × | × | × | ○ | 低 | 検索/一覧/詳細遷移 |

## 高再利用モジュール群
- `modules/base/button/Button.md`
- `modules/base/display/Accordion.md`
- `modules/base/input/AutoResizingTextBox.md`
- `modules/base/input/DatePicker.md`
- `modules/base/input/Form.md`
- `modules/base/input/FormRow.md`
- `modules/base/input/Input.md`
- `modules/base/input/RadioMatrix.md`
- `modules/base/layout/Box.md`
- `modules/base/layout/Layaut.md`
- `modules/base/layout/Spacer.md`
- `modules/base/typography/Font.md`
- `modules/base/utility/Utils.md`

## 依存が重く導入判断が必要なモジュール群
- `01_architecture/Redux.md`（グローバル状態管理）
- `01_architecture/Lang.md`（多言語＋Redux）
- `02_application-foundation/APIConnectModule.md`（API基盤＋React Query＋ログ監視）
- `02_application-foundation/Auth-API.md`（認証/認可＋Redux＋ログ監視）
- `02_application-foundation/AuthModule.md`（認証/認可＋pageConfig＋Redux）
- `02_application-foundation/ErrorHandle.md`（Redux＋外部ログ）
- `02_application-foundation/FullAPI.md`（API基盤＋React Query＋監視）
- `02_application-foundation/logModule.md`（外部ログ連携）
- `02_application-foundation/SnackBar.md`（Redux通知）
- `03_realtime/websocket/GlobalWebsocket.md`（WebSocket＋Redux）
- `03_realtime/websocket/webSocketFront.md`（WebSocket＋Context）
- `04_features/file-handling/FileImport.md`（API＋Redux通知＋i18n）
- `04_features/file-handling/FileUploaderFront.md`（API＋React Query＋Redux通知）
- `modules/composite/navigation/SideMenu.md`（pageConfig＋権限＋Redux）
- `modules/composite/navigation/Breadcrumb.md`（pageConfig＋i18n）
- `modules/composite/layout/BasePage.md`（複合依存）
- `modules/functional/form/UserUpdateForm.md`（React Query＋API）

## 単体再利用より組み合わせ利用が前提のモジュール群
- `modules/composite/layout/BasePage.md`
- `modules/composite/feature/BatchResults.md`
- `modules/composite/feedback/ModalWindow.md`
- `modules/composite/list/ControllableListView.md`
- `modules/composite/list/ListView.md`
- `modules/composite/navigation/Header.md`
- `modules/composite/navigation/Footer.md`
- `modules/composite/navigation/SideMenu.md`
- `modules/composite/navigation/Breadcrumb.md`

## 参照ドキュメント一覧
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\01_architecture\Dir.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\01_architecture\Env.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\01_architecture\Lang.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\01_architecture\Redux.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\02_application-foundation\APIConnectModule.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\02_application-foundation\Auth-API.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\02_application-foundation\AuthModule.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\02_application-foundation\ErrorHandle.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\02_application-foundation\FullAPI.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\02_application-foundation\logModule.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\02_application-foundation\SnackBar.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\03_realtime\websocket\GlobalWebsocket.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\03_realtime\websocket\websocket-usage-examples.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\03_realtime\websocket\webSocketFront.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\04_features\file-handling\FileImport.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\04_features\file-handling\FileUploaderFront.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\04_features\file-handling\manifestCheck.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\button\Button.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\display\Accordion.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\input\AutoResizingTextBox.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\input\DatePicker.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\input\Form.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\input\FormRow.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\input\Input.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\input\RadioMatrix.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\layout\Box.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\layout\Layaut.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\layout\Spacer.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\typography\Font.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\base\utility\Utils.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\feature\BatchResults.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\feedback\LoadingSpinner.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\feedback\ModalWindow.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\layout\BasePage.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\list\ControllableListView.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\list\ListView.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\list\ListViewFix.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\navigation\Breadcrumb.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\navigation\Footer.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\navigation\Header.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\composite\navigation\SideMenu.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\examples\form\Formサンプル.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\functional\display\EllipsisText.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\functional\display\InlineLabel.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\functional\display\UserListPage.md`
- `DOC\1_DesignDocument\1-1_BaseDocs\FE\modules\functional\form\UserUpdateForm.md`
