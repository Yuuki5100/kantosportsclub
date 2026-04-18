## GlobalWebsocket 設計書

※Websocketの基礎知識について理解したい場合は、
　「DOC\designDocument\BaseDoc\BE\websocket.md」をご参照ください。

## 1. 目的

Web アプリケーション全体で単一の WebSocket を使い回し、ページ遷移に左右されないリアルタイム通信基盤を構築する。
これにより複数ページにまたがる実装の重複を排除し、保守性と拡張性を向上させる。

---

## 2. 要件

- リスナーは BasePage に常駐し、ページ遷移のライフサイクルに影響されない。
- カスタム Hook で Redux Slice の購読対象 (eventType) を動的に変更できる。
- Slice の値が更新されたら リスナーが自動的に必要な情報だけを購読／通知する。

---

## 3. 構成

### 3.1 ファイル／コンポーネントの役割

| ファイル                       | 役割計                                                   |
| -------------------------- | ------------------------------------------------------ |
| **_app.tsx** | アプリ起動時に一度だけ WebSocket を開き、<SnackbarListener/> 等の永続系リスナーを配置        |
| **useGlobalWebSocket.ts**       | WebSocket の onmessage / send を抽象化し、受信データを Redux に dispatch      |
| **useWSSubscription.ts**     | ページ固有のタイミングで購読対象 eventType を Slice に追加・削除する Hook |
| **wsSubscriptionsSlice.ts**         | 現在購読したい eventType の配列を保持し、add / remove reducer を提供          |
| **SnackbarListener.tsx**         | notificationsSlice から最新イベントを監視し UI (例: snackbar) に反映    |

### 3.2. 構成図

```
📂 src/
├── pages/
│   └── _app.tsx          // 永続リスナー配置 & WebSocket 初期化
├── hooks/
│   ├── useGlobalWebSocket.ts // WebSocket ↔ Slice ブリッジ
│   └── useWSSubscription.ts // 各ページから購読を追加・削除
├── slices/
│   ├── wsSubscriptionsSlice.ts // eventType 配列を保持
│   └── notificationsSlice.ts 　// eventType等をstoreに共有
└── components/
    └── SnackbarListener.tsx     // Slice を監視してトースト表示
```

---

## 4. データフロー

このリスナーをどこか（レイアウトやページ）に置くことで、slice 経由で飛んで来た通知をいつでもトーストにできるようにする。

```graph TD
  subgraph UI
      A[任意のページ] -- useWSSubscription --> B[wsSubscriptionsSlice]
      C[SnackbarListener] -- useSelector --> D[notificationsSlice]
  end

  B -- eventType 配列変更 --> E[useGlobalWebSocket]
  E -->|subscribe/unsubscribe| F[WebSocket]
  F -. message .-> E
  E --> dispatch --> D
```
---

## 5. 使用例
**カスタムフック呼び出すだけです。**
```tsx
// pages/FileUploadPage.tsx
export default function FileUploadPage() {
  // アップロード進行状況だけ購読
  useWSSubscription('FILE_CREATE_PROGRESS'); //★追記
  // ... UI 実装
}

// components/SnackbarListener.tsx (変更なし)
const latest = useAppSelector((s) => s.notifications.at(-1));
```

## 6. 通知別に処理を追加したい場合
**以下のswitch文に、SUBSCRIBE（サブスクライブ）したeventTypeを追記してください。**

個々でカスタムな処理を行いたい場合は、通知後に個別実装したコンポーネントを呼び出すようにしてください。
コンポーネントを呼び出す際、useState等が必要な場合は、
以下コンポーネントに実装するか設計を自身で考慮するようお願いいたします。

**SnackbarListener.tsx**
```tsx
  /* -------- 通知 → スナックバー -------- */
  switch (latest.eventType) {
    case 'FILE_CREATE_PROGRESS':
      // 進捗はアップロード画面側で処理する
      break;

    case 'FILE_UPLOAD_COMPLETED':
      showSnackbar('ファイルアップロード完了！', 'SUCCESS');
      break;

    case 'FILE_DOWNLOAD_COMPLETED':
      showSnackbar('ファイルダウンロードの準備完了！', 'SUCCESS');
      break;

    case 'USER_SESSION_EXPIRED':
      showSnackbar('セッションが切れました。再ログインしてください', 'ERROR');
      // 例 : router.push('/login') など
      break;

    default:
      // eventType をそのまま出す簡易ハンドラ
      showSnackbar(latest.eventType, 'ALERT');
  }
  /* ------------------------------------- */
```
---

## 7. メリット & 今後の拡張
- 単一 WebSocket で同時接続数を最小化
- ページごとに 必要なイベントだけ購読できるためバックエンド負荷も軽減
- Slice 変更のみで新しいイベントの購読が可能 → 疎結合
- 将来的に GraphQL Subscriptions 等へ移行する際も useGlobalWebSocket の実装を差し替えるだけで対応
---
