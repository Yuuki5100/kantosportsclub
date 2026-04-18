# WebSocket使用例ガイド

## アーキテクチャ概要

WebSocket実装は**Context-only**アーキテクチャを採用しており、以下の特徴があります：

- ✅ **Redux不要**: Context APIのみでstate管理
- ✅ **自動クリーンアップ**: コンポーネントアンマウント時の自動購読解除
- ✅ **型安全**: TypeScriptサポート
- ✅ **柔軟な購読**: 条件付き購読、グローバル購読対応
- ✅ **デバッグ対応**: 開発時のログ出力

## セットアップ

### WebSocketProviderの設定

```typescript
// _app.tsx または layout.tsx
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { createDefaultWebSocketClient } from '@/utils/webSocketClient';

function MyApp({ Component, pageProps }) {
  return (
    <WebSocketProvider 
      ClientFactory={createDefaultWebSocketClient}
      autoConnect={true}
      debug={process.env.NODE_ENV === 'development'}
    >
      <Component {...pageProps} />
    </WebSocketProvider>
  );
}
```

### 通知システムとの統合

```typescript
// SnackbarListenerと組み合わせた完全なセットアップ例
import { SnackbarListener } from '@/components/composite/SnackbarListener';

function MyApp({ Component, pageProps }) {
  return (
    <WebSocketProvider 
      ClientFactory={createDefaultWebSocketClient}
      autoConnect={true}
      debug={process.env.NODE_ENV === 'development'}
    >
      <SnackbarListener /> {/* 自動通知処理 */}
      <Component {...pageProps} />
    </WebSocketProvider>
  );
}
```

## 基本的な使用方法

### WebSocketイベント購読

```typescript
import { useWSSubscription } from '@/hooks/useWSSubscription';

const MyComponent = () => {
  // 任意のイベントタイプを文字列で指定
  const subscriptionId = useWSSubscription(
    'FILE_UPLOAD_PROGRESS', // バックエンドが送信するイベントタイプ
    (data) => {
      // dataはRecord<string, any>型
      console.log(`進捗: ${data.progress}%`);
      console.log(`ファイル名: ${data.fileName}`);
      console.log(`アップロード済み: ${data.uploadedSize}/${data.totalSize}`);
    },
    true, // enabled: 購読を有効にするか
    { isGlobal: false } // オプション: グローバル購読設定
  );

  return <div>ファイルアップロード中...</div>;
};
```

### 複数のイベントタイプを購読

```typescript
import { useMultipleWebSocketEvents } from '@/hooks/useWSSubscription';

const Dashboard = () => {
  // 単一Hook での複数購読
  const handlerIds = useMultipleWebSocketEvents([
    {
      eventType: 'NOTIFICATION',
      handler: (data) => showSnackbar(data.message, data.type),
      enabled: true
    },
    {
      eventType: 'ERROR_NOTIFICATION', 
      handler: (data) => showError(`エラー: ${data.message} (Code: ${data.errorCode})`),
      enabled: true
    },
    {
      eventType: 'BATCH_PROGRESS',
      handler: (data) => updateProgress(data.jobId, data.progress),
      enabled: true
    }
  ]);

  // または個別購読
  useWSSubscription('NOTIFICATION', (data) => {
    showSnackbar(data.message, data.type);
  });

  useWSSubscription('ERROR_NOTIFICATION', (data) => {
    showError(`エラー: ${data.message} (Code: ${data.errorCode})`);
  });

  return <div>ダッシュボード</div>;
};
```

### 条件付き購読

```typescript
import { useConditionalWebSocketEvent } from '@/hooks/useWSSubscription';

const ConditionalSubscription = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  // 条件付き購読Hook
  const handlerId = useConditionalWebSocketEvent(
    'SYSTEM_MAINTENANCE',
    (data) => {
      if (data.maintenanceType === 'emergency') {
        showEmergencyMaintenanceDialog(data);
      }
    },
    isMonitoring // condition: この値がtrueの時のみ購読
  );

  // または基本Hookのenabledパラメータ使用
  useWSSubscription(
    'SYSTEM_MAINTENANCE',
    (data) => {
      if (data.maintenanceType === 'emergency') {
        showEmergencyMaintenanceDialog(data);
      }
    },
    isMonitoring // enabled パラメータ
  );

  return (
    <button onClick={() => setIsMonitoring(!isMonitoring)}>
      {isMonitoring ? 'モニタリング停止' : 'モニタリング開始'}
    </button>
  );
};
```

## 実践的な使用例

### ファイルアップロード画面（通知システム統合版）

```typescript
const FileUploadPage = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // アップロード進捗の監視
  useWSSubscription('FILE_UPLOAD_PROGRESS', (data) => {
    setUploadProgress(data.progress);
  });

  // アップロード完了の通知
  // 注意: FILE_UPLOAD_COMPLETEDはSnackbarListenerが自動処理するため
  // カスタムハンドラーと重複しないよう注意
  useWSSubscription('FILE_UPLOAD_COMPLETED', (data) => {
    setUploadedFiles(prev => [...prev, data.fileName]);
    setUploadProgress(0);
    // Snackbar通知はSnackbarListenerが自動処理
  });

  return (
    <div>
      <ProgressBar value={uploadProgress} />
      <FileList files={uploadedFiles} />
    </div>
  );
};
```

### 通知システムの動作確認

```typescript
const NotificationDemo = () => {
  const { addNotification, notifications, clearNotifications } = useWebSocketContext();

  const handleTestNotification = () => {
    // 手動で通知を追加（テスト用）
    addNotification({
      id: crypto.randomUUID(),
      eventType: 'FILE_UPLOAD_COMPLETED',
      fileName: 'test-file.csv',
      refId: 'test-123',
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <button onClick={handleTestNotification}>
        テスト通知を送信
      </button>
      <button onClick={clearNotifications}>
        通知をクリア
      </button>
      <div>現在の通知数: {notifications.length}</div>
      {/* SnackbarListenerが自動的にSnackbar表示 */}
    </div>
  );
};
```

### バッチ処理監視画面

```typescript
interface JobStatus {
  progress?: number;
  estimatedTimeRemaining?: number;
  completed?: boolean;
  results?: {
    processed: number;
    succeeded: number;
    failed: number;
  };
}

const BatchMonitor = () => {
  const [jobs, setJobs] = useState<Map<string, JobStatus>>(new Map());

  // バッチ処理進捗
  useWSSubscription('BATCH_PROGRESS', (data) => {
    setJobs(prev => new Map(prev).set(data.jobId, {
      ...prev.get(data.jobId),
      progress: data.progress,
      estimatedTimeRemaining: data.estimatedTimeRemaining
    }));
  });

  // バッチ処理完了
  useWSSubscription('BATCH_COMPLETED', (data) => {
    setJobs(prev => new Map(prev).set(data.jobId, {
      ...prev.get(data.jobId),
      completed: true,
      results: data.results
    }));
  });

  return (
    <div>
      {Array.from(jobs.entries()).map(([jobId, status]) => (
        <JobStatusCard key={jobId} jobId={jobId} status={status} />
      ))}
    </div>
  );
};
```

### ゲート通過監視（リアルタイム）

```typescript
interface GateActivity {
  type: 'IN' | 'OUT';
  userId: string;
  location: string;
  timestamp: number;
}

const GateMonitor = () => {
  const [recentActivities, setRecentActivities] = useState<GateActivity[]>([]);

  // 入場イベント
  useWSSubscription('GATE_IN', (data) => {
    const activity: GateActivity = {
      type: 'IN',
      userId: data.userId,
      location: data.location,
      timestamp: data.timestamp
    };
    setRecentActivities(prev => [activity, ...prev.slice(0, 49)]); // 最新50件
  });

  // 退場イベント
  useWSSubscription('GATE_OUT', (data) => {
    const activity: GateActivity = {
      type: 'OUT',
      userId: data.userId,
      location: data.location,
      timestamp: data.timestamp
    };
    setRecentActivities(prev => [activity, ...prev.slice(0, 49)]);
  });

  return (
    <div>
      <h2>リアルタイムゲート監視</h2>
      <ActivityList activities={recentActivities} />
    </div>
  );
};
```

### 動的イベントタイプの購読

```typescript
const DynamicEventSubscription = () => {
  const [eventType, setEventType] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  // 動的にイベントタイプを変更可能
  useWSSubscription(
    eventType,
    (data) => {
      setMessages(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
    },
    !!eventType // eventTypeが設定されている場合のみ有効
  );

  return (
    <div>
      <input
        type="text"
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        placeholder="イベントタイプを入力"
      />
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.eventType}: {JSON.stringify(msg.data)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## ベストプラクティス

### 1. データ検証

バックエンドからのデータは`Record<string, any>`型なので、使用前に検証することを推奨：

```typescript
useWSSubscription('USER_DATA', (data) => {
  // データ検証
  if (!data.userId || typeof data.userId !== 'string') {
    console.error('Invalid user data received');
    return;
  }
  
  // 安全に使用
  updateUser(data.userId, data);
});
```

### 2. エラーハンドリング

```typescript
useWSSubscription('FILE_UPLOAD_PROGRESS', (data) => {
  try {
    updateProgressBar(data.progress);
  } catch (error) {
    console.error('Progress update failed:', error);
    // フォールバック処理
  }
});
```

### 3. TypeScriptの型定義（オプション）

プロジェクト内で型安全性を保ちたい場合は、独自の型定義を作成：

```typescript
// types/events.ts
export interface FileUploadProgressData {
  refId: string;
  progress: number;
  fileName: string;
  totalSize: number;
  uploadedSize: number;
}

// コンポーネント内
useWSSubscription('FILE_UPLOAD_PROGRESS', (data) => {
  const typedData = data as FileUploadProgressData;
  console.log(`進捗: ${typedData.progress}%`);
});
```

### 4. メモリリーク防止

```typescript
// useWSSubscriptionは自動的にクリーンアップされるため、
// 手動でのクリーンアップは不要
const MyComponent = () => {
  useWSSubscription('NOTIFICATION', handleNotification);
  // コンポーネントがアンマウントされると自動的にクリーンアップ
  return <div>...</div>;
};
```

### 5. グローバル購読

```typescript
import { useGlobalWebSocketEvent } from '@/hooks/useWSSubscription';

// アプリ全体で共通の処理（スナックバー通知など）
const AppGlobalHandlers = () => {
  // グローバル購読：コンポーネントがアンマウントされても動作継続
  useGlobalWebSocketEvent('GLOBAL_NOTIFICATION', (data) => {
    showGlobalSnackbar(data.message, data.type);
  });

  useGlobalWebSocketEvent('SYSTEM_ALERT', (data) => {
    showSystemAlert(data.message);
  });

  return null; // レンダリング不要
};

// _app.tsx で使用
function MyApp({ Component, pageProps }) {
  return (
    <WebSocketProvider>
      <AppGlobalHandlers />
      <Component {...pageProps} />
    </WebSocketProvider>
  );
}
```

### 6. デバッグ情報の活用

```typescript
const MyComponent = () => {
  const subscriptionId = useWSSubscription('GATE_IN', handleGateIn);
  
  // デバッグ時にサブスクリプションIDを確認可能
  console.log('Subscription ID:', subscriptionId);
  
  return <div>...</div>;
};
```

## Hook API リファレンス

### useWSSubscription

基本的なWebSocketイベント購読Hook

```typescript
const handlerId = useWSSubscription(
  eventType: string,
  handler: (data: any) => void,
  enabled?: boolean, // デフォルト: true
  options?: {
    isGlobal?: boolean; // デフォルト: false
    autoCleanup?: boolean; // 後方互換用（使用されません）
  }
): string | null;
```

### useGlobalWebSocketEvent

グローバル購読Hook（永続化）

```typescript
const handlerId = useGlobalWebSocketEvent(
  eventType: string,
  handler: (data: any) => void,
  enabled?: boolean
): string | null;
```

### useMultipleWebSocketEvents

複数イベント同時購読Hook

```typescript
const handlerIds = useMultipleWebSocketEvents(
  subscriptions: Array<{
    eventType: string;
    handler: (data: any) => void;
    enabled?: boolean;
    isGlobal?: boolean;
  }>
): Record<string, string | null>;
```

### useConditionalWebSocketEvent

条件付き購読Hook

```typescript
const handlerId = useConditionalWebSocketEvent(
  eventType: string,
  handler: (data: any) => void,
  condition: boolean,
  isGlobal?: boolean
): string | null;
```

## Context APIリファレンス

### WebSocketProvider Props

```typescript
type WebSocketProviderProps = {
  children: ReactNode;
  ClientFactory?: () => WebSocketClient;
  autoConnect?: boolean; // デフォルト: true
  debug?: boolean; // デフォルト: false
}
```

### useWebSocketContext

低レベルWebSocket操作と通知システム管理用

```typescript
const {
  client,
  addHandler,
  removeHandler,
  getHandlers,
  getActiveEventTypes,
  addNotification,      // 通知システム: 手動通知追加
  notifications,        // 通知システム: 現在の通知一覧
  clearNotifications    // 通知システム: 通知クリア
} = useWebSocketContext();
```

### useLatestNotification

最新の通知を取得（SnackbarListener等で使用）

```typescript
const latestNotification = useLatestNotification();
// 戻り値: 最新の通知オブジェクトまたはnull
```

### useWebSocketStatus

接続状態監視用

```typescript
const {
  isConnected,
  subscribedTopics,
  config
} = useWebSocketStatus();
```

## 新しいイベントタイプの追加

バックエンドで新しいイベントタイプが追加された場合、フロントエンドでの変更は不要です。
単純に新しいイベントタイプ名を指定するだけで購読可能：

```typescript
// バックエンドが 'NEW_FEATURE_EVENT' を追加した場合
useWSSubscription('NEW_FEATURE_EVENT', (data) => {
  console.log('新機能のイベント:', data);
});
```

## テスト・デバッグ機能

### Storybook での動作確認

StorybookでWebSocket機能をテストするには：

1. `WebSocket/Demo` ストーリーを開く
2. 購読開始ボタンをクリック
3. 手動メッセージ送信でテスト
4. モックメッセージボタンでWebSocket通信をシミュレート

### テストスイート

WebSocket機能は包括的なテストスイートでカバーされています：

```bash
# WebSocket関連テストの実行
npm test -- --testPathPattern="webSocketClient.test.ts|WebSocketProvider.test.tsx|useWSSubscription.test.tsx|SnackbarListener.test.tsx"
```

**テストファイル構成:**
- `webSocketClient.test.ts` - WebSocketClient核機能とメッセージ受信テスト
- `WebSocketProvider.test.tsx` - Context統合とハンドラー実行統合テスト
- `useWSSubscription.test.tsx` - Hook機能とハンドラー呼び出しテスト
- `SnackbarListener.test.tsx` - 通知処理とSnackbar統合テスト

### デバッグTips

```typescript
// デバッグモードでの詳細ログ出力
<WebSocketProvider debug={true}>
  {/* 接続状態、メッセージ受信、ハンドラー実行ログが出力される */}
</WebSocketProvider>

// 接続状態の監視
const { isConnected, subscribedTopics } = useWebSocketStatus();
console.log('WebSocket接続状態:', isConnected);
console.log('購読中のトピック:', subscribedTopics);

// 通知システム状態の確認
const { notifications } = useWebSocketContext();
console.log('現在の通知数:', notifications.length);
```

この柔軟なContext-only APIにより、Redux不要でバックエンドとフロントエンドの独立した開発が可能になります。