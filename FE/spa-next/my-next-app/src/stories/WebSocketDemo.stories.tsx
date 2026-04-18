// src/stories/WebSocketDemo.stories.tsx
import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { WebSocketProvider, useWebSocketClient, useWebSocketStatus } from '@/components/providers/WebSocketProvider';
import { 
  useWSSubscription, 
  useGlobalWebSocketEvent, 
  useMultipleWebSocketEvents, 
  useConditionalWebSocketEvent 
} from '@/hooks/useWSSubscription';
import { SnackbarListener } from '@/components/composite/SnackbarListener';
import SnackbarNotification from '@/components/functional/SnackbarNotification';
import authReducer from '@/slices/authSlice';
import errorReducer from '@/slices/errorSlice';
import langReducer from '@/slices/langSlice';
import snackbarReducer from '@/slices/snackbarSlice';
import authErrorReducer from '@/slices/authErrorSlice';
import sidebarSliceReducer from '@/slices/sidebarSlice';
import reportJobSliceReducer from '@/slices/reportJobSlice';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Divider,
  Chip,
} from '@mui/material';
import { useWebSocketContext } from '@/components/providers/WebSocketProvider';
import { useSnackbar } from '@/hooks/useSnackbar';

// WebSocketメッセージの型定義
type WSMessage = {
  id: string;
  eventType: string;
  data: any;
  timestamp: number;
  source: 'websocket' | 'manual'; // 送信元を区別
}

// Demo Context の型定義
type DemoContextType = {
  messages: WSMessage[];
  addMessage: (data: any, source?: 'websocket' | 'manual') => void;
  clearMessages: () => void;
}

// Demo Context
const DemoContext = createContext<DemoContextType | null>(null);

// Demo Context Hook
const useDemoContext = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within DemoProvider');
  }
  return context;
};

// Demo Provider コンポーネント
const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<WSMessage[]>([]);

  const addMessage = useCallback((data: any, source: 'websocket' | 'manual' = 'websocket') => {
    const message: WSMessage = {
      id: crypto.randomUUID(),
      eventType: 'GATE_IN',
      data: data,
      timestamp: Date.now(),
      source,
    };
    setMessages(prev => [message, ...prev].slice(0, 50)); // 最大50件
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const contextValue: DemoContextType = {
    messages,
    addMessage,
    clearMessages,
  };

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
};

// メッセージ送信コンポーネント
const MessageSender: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [jsonError, setJsonError] = useState('');
  const { addMessage } = useDemoContext();

  // プリセットデータ
  const presets = [
    {
      name: 'ゲートイン基本',
      data: {
        gateId: 'GATE-001',
        vehicleId: 'VH-12345',
        timestamp: new Date().toISOString(),
        status: 'ENTERED'
      }
    },
    {
      name: 'エラー通知',
      data: {
        error: 'CONNECTION_TIMEOUT',
        message: 'ゲート接続がタイムアウトしました',
        gateId: 'GATE-002'
      }
    },
    {
      name: '複雑データ',
      data: {
        event: 'GATE_IN',
        payload: {
          vehicle: {
            id: 'VH-67890',
            type: 'TRUCK',
            license: '品川500あ1234'
          },
          gate: {
            id: 'GATE-003',
            location: '東京倉庫A',
            lane: 2
          },
          metadata: {
            timestamp: Date.now(),
            operator: 'SYSTEM'
          }
        }
      }
    }
  ];

  const handleSendMessage = () => {
    if (!inputData.trim()) {
      setJsonError('メッセージを入力してください');
      return;
    }

    try {
      const parsedData = JSON.parse(inputData);
      addMessage(parsedData, 'manual');
      setInputData('');
      setJsonError('');
    } catch (error) {
      setJsonError('有効なJSON形式で入力してください');
    }
  };

  const handlePresetSelect = (preset: any) => {
    setInputData(JSON.stringify(preset.data, null, 2));
    setJsonError('');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          メッセージ送信（手動）
        </Typography>

        {/* プリセット */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            プリセット:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {presets.map((preset, index) => (
              <Chip
                key={index}
                label={preset.name}
                onClick={() => handlePresetSelect(preset)}
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        </Box>

        {/* JSON入力 */}
        <TextField
          label="JSON データ"
          multiline
          rows={8}
          fullWidth
          value={inputData}
          onChange={(e) => {
            setInputData(e.target.value);
            setJsonError('');
          }}
          error={!!jsonError}
          helperText={jsonError || 'JSON形式でメッセージデータを入力してください'}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSendMessage}
          fullWidth
          disabled={!inputData.trim()}
        >
          GATE_IN メッセージ送信
        </Button>
      </CardContent>
    </Card>
  );
};

// メインデモコンポーネント
const WebSocketDemoInner: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { messages, addMessage, clearMessages } = useDemoContext();

  // WebSocketClientとステータスを取得
  const Client = useWebSocketClient();
  const status = useWebSocketStatus();

  // WebSocketイベントハンドラー
  const handleWebSocketMessage = useCallback((data: any) => {
    addMessage(data, 'websocket');
  }, [addMessage]);

  // WebSocketイベント購読
  useWSSubscription('GATE_IN', handleWebSocketMessage, isSubscribed);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        WebSocket デモ
      </Typography>

      {/* 接続状態表示 */}
      <Alert severity={status.isConnected ? "success" : "warning"} sx={{ mb: 3 }}>
        WebSocket状態: {status.isConnected ? "接続中" : "切断中"}
        {status.isConnected && (
          <>
            <br />
            購読トピック数: {status.subscribedTopics.length}
          </>
        )}
      </Alert>

      <Stack spacing={3}>
        {/* 購読制御 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              購読制御
            </Typography>

            <Stack spacing={2}>
              {/* デバッグ情報表示 */}
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                <strong>デバッグ情報:</strong><br />
                接続状態: {status.isConnected ? '接続済み' : '未接続'}<br />
                URL: {status.config.url}<br />
                購読トピック: {status.subscribedTopics.join(', ') || 'なし'}
              </Alert>
              
              <Button
                variant="contained"
                color={isSubscribed ? "secondary" : "primary"}
                onClick={() => setIsSubscribed(!isSubscribed)}
                fullWidth
                disabled={false} // Storybookでのテスト用に常に有効化
              >
                {isSubscribed ? "購読停止" : "購読開始"}
                {!status.isConnected && ' (オフライン)'}
              </Button>

              {isSubscribed && (
                <Alert severity="success">
                  GATE_IN イベントを購読中
                  {!status.isConnected && ' (オフラインモード)'}
                </Alert>
              )}
              
              {/* Storybook用のモック接続ボタン */}
              {!status.isConnected && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // モックメッセージを送信してWebSocket通信をシミュレート
                    if (isSubscribed) {
                      addMessage({
                        message: 'Storybookモックメッセージ',
                        gateId: 'MOCK-GATE',
                        timestamp: new Date().toISOString(),
                        type: 'MOCK_EVENT'
                      }, 'websocket');
                    }
                  }}
                  disabled={!isSubscribed}
                >
                  モックメッセージ送信 (テスト用)
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* メッセージ送信セクション */}
        <MessageSender />

        {/* メッセージ履歴 */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                受信メッセージ履歴 ({messages.length})
              </Typography>
              <Button
                size="small"
                onClick={clearMessages}
                disabled={messages.length === 0}
              >
                クリア
              </Button>
            </Stack>

            <List sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
              {messages.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  メッセージはありません
                </Typography>
              ) : (
                messages.map(msg => (
                  <ListItem key={msg.id} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="primary">
                        {msg.eventType}
                      </Typography>
                      <Chip
                        label={msg.source === 'manual' ? '手動送信' : 'WebSocket'}
                        size="small"
                        color={msg.source === 'manual' ? 'secondary' : 'primary'}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Stack>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: msg.source === 'manual' ? 'secondary.light' : 'grey.50',
                        '& pre': {
                          margin: 0,
                          fontSize: '0.875rem',
                          overflow: 'auto'
                        }
                      }}
                    >
                      <pre>{JSON.stringify(msg.data, null, 2)}</pre>
                    </Paper>
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>

        {/* 使い方説明 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              使用方法
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="1. 購読開始をクリック"
                  secondary="GATE_INイベントの購読を開始します（オフラインでも動作します）"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. メッセージ受信テスト"
                  secondary="モックメッセージボタンまたは手動送信でテストできます"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. 手動メッセージ送信"
                  secondary="プリセットまたはカスタムJSONでGATE_INメッセージを手動送信できます"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="4. MSWでモック可能"
                  secondary="Storybookでは MSW を使用してWebSocket通信をモックできます"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

// Reduxストア作成（Snackbar用）
const createDemoStore = () => configureStore({
  reducer: {
    auth: authReducer,
    error: errorReducer,
    lang: langReducer,
    snackbar: snackbarReducer,
    authError: authErrorReducer,
    sidebar: sidebarSliceReducer,
    reportJob: reportJobSliceReducer,
  },
});

// アンマウント後購読継続テストコンポーネント
const UnmountTestComponent: React.FC<{ onUnmount: () => void }> = ({ onUnmount }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [globalSubscriptionId, setGlobalSubscriptionId] = useState<string | null>(null);
  const [localSubscriptionId, setLocalSubscriptionId] = useState<string | null>(null);

  // グローバル購読（アンマウント後も継続）
  const globalId = useWSSubscription(
    'GLOBAL_NOTIFICATION', 
    useCallback((data: any) => {
      console.log('🌐 グローバル通知受信:', data);
    }, []),
    true,
    { isGlobal: true }
  );

  // ローカル購読（アンマウント時に削除）
  const localId = useWSSubscription(
    'LOCAL_NOTIFICATION',
    useCallback((data: any) => {
      console.log('📍 ローカル通知受信:', data);
    }, []),
    true,
    { isGlobal: false }
  );

  React.useEffect(() => {
    setGlobalSubscriptionId(globalId);
    setLocalSubscriptionId(localId);
  }, [globalId, localId]);

  const handleUnmount = () => {
    setIsVisible(false);
    onUnmount();
  };

  if (!isVisible) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          アンマウントテストコンポーネント
        </Typography>
        <Stack spacing={2}>
          <Alert severity="info">
            <Typography variant="body2">
              グローバル購読ID: {globalSubscriptionId || 'なし'}<br />
              ローカル購読ID: {localSubscriptionId || 'なし'}
            </Typography>
          </Alert>
          <Typography variant="body2">
            このコンポーネントには2つの購読があります：<br />
            • グローバル購読（isGlobal: true）- アンマウント後も継続<br />
            • ローカル購読（isGlobal: false）- アンマウント時に削除
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleUnmount}
            fullWidth
          >
            コンポーネントをアンマウント
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// 通知テスト送信コンポーネント
const NotificationTester: React.FC = () => {
  const { addNotification } = useWebSocketContext();

  const sendNotification = (eventType: string, isSnackbar: boolean = false) => {
    const notification = {
      eventType,
      message: `${eventType}のテスト通知`,
      timestamp: Date.now(),
      testData: {
        source: 'demo',
        isSnackbar,
        randomId: Math.random().toString(36).substr(2, 9)
      }
    };

    console.log('🚀 通知送信:', notification);
    addNotification(notification);
    
    // 追加のデバッグ情報
    setTimeout(() => {
      const snackbarRoot = document.getElementById('snackbar-root');
      console.log('📍 snackbar-root状態:', snackbarRoot ? '存在' : '不在');
      if (snackbarRoot) {
        console.log('📍 子要素数:', snackbarRoot.children.length);
      }
    }, 100);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          通知テスト送信
        </Typography>
        <Stack spacing={2}>
          <Alert severity="warning">
            これらのボタンは通知システムに直接メッセージを送信します。
            SnackbarListenerが動作していれば、対応するSnackbarが表示されます。
          </Alert>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Button 
              size="small" 
              variant="contained" 
              color="success"
              onClick={() => sendNotification('FILE_UPLOAD_COMPLETED', true)}
            >
              アップロード完了
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              color="primary"
              onClick={() => sendNotification('FILE_DOWNLOAD_COMPLETED', true)}
            >
              ダウンロード完了
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              color="error"
              onClick={() => sendNotification('USER_SESSION_EXPIRED', true)}
            >
              セッション期限切れ
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              color="info"
              onClick={() => sendNotification('GLOBAL_NOTIFICATION', false)}
            >
              グローバル通知
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              color="secondary"
              onClick={() => sendNotification('LOCAL_NOTIFICATION', false)}
            >
              ローカル通知
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => sendNotification('CUSTOM_EVENT', false)}
            >
              カスタムイベント
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Provider付きラッパーコンポーネント
const WebSocketDemo: React.FC = () => {
  return (
    <WebSocketProvider autoConnect={true} debug={true}>
      <DemoProvider>
        <WebSocketDemoInner />
      </DemoProvider>
    </WebSocketProvider>
  );
};

// Storybook用DOM要素管理フック
const useStorybookSnackbarRoot = () => {
  const [rootReady, setRootReady] = useState(false);
  
  useEffect(() => {
    // snackbar-root要素が存在するかチェック
    let snackbarRoot = document.getElementById('snackbar-root');
    
    if (!snackbarRoot) {
      // 存在しない場合は動的に作成
      snackbarRoot = document.createElement('div');
      snackbarRoot.id = 'snackbar-root';
      snackbarRoot.style.position = 'fixed';
      snackbarRoot.style.top = '0';
      snackbarRoot.style.left = '0';
      snackbarRoot.style.width = '100%';
      snackbarRoot.style.height = '100%';
      snackbarRoot.style.pointerEvents = 'none';
      snackbarRoot.style.zIndex = '9999';
      document.body.appendChild(snackbarRoot);
      console.log('🎯 Storybook用snackbar-root要素を作成しました');
    }
    
    setRootReady(true);
    
    return () => {
      // クリーンアップ（必要に応じて）
      // 通常はStorybookでは削除しない
    };
  }, []);
  
  return rootReady;
};

// デバッグ情報表示コンポーネント
const DebugInfo: React.FC = () => {
  const { notifications } = useWebSocketContext();
  const { message, type } = useSnackbar();
  const [debugHistory, setDebugHistory] = useState<string[]>([]);
  
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      const debugMsg = `📢 通知追加: ${latest.eventType} (ID: ${latest.id})`;
      setDebugHistory(prev => [debugMsg, ...prev].slice(0, 5));
    }
  }, [notifications]);
  
  useEffect(() => {
    if (message) {
      const debugMsg = `🎯 Snackbar表示: ${message} (タイプ: ${type})`;
      setDebugHistory(prev => [debugMsg, ...prev].slice(0, 5));
    }
  }, [message, type]);
  
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          デバッグ情報
        </Typography>
        <Stack spacing={1}>
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            <strong>通知システム状態:</strong><br />
            総通知数: {notifications.length}<br />
            現在のSnackbar: {message || 'なし'} ({type || '-'})<br />
            snackbar-root存在: {document.getElementById('snackbar-root') ? '✅' : '❌'}
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            <strong>デバッグ履歴:</strong>
          </Typography>
          <Paper variant="outlined" sx={{ p: 1, maxHeight: 120, overflow: 'auto' }}>
            {debugHistory.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                デバッグログなし
              </Typography>
            ) : (
              debugHistory.map((log, index) => (
                <Typography key={index} variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                  {log}
                </Typography>
              ))
            )}
          </Paper>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Snackbar統合デモコンポーネント
const SnackbarIntegrationDemo: React.FC = () => {
  const [isUnmountTestVisible, setIsUnmountTestVisible] = useState(true);
  const [unmountCount, setUnmountCount] = useState(0);
  const rootReady = useStorybookSnackbarRoot();

  const handleUnmount = () => {
    setUnmountCount(prev => prev + 1);
    setTimeout(() => {
      setIsUnmountTestVisible(true);
    }, 2000); // 2秒後に再表示
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        WebSocket通知 & Snackbar統合デモ
      </Typography>

      {!rootReady && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Snackbar表示の準備中...
        </Alert>
      )}

      <Stack spacing={3}>
        {/* デバッグ情報 */}
        <DebugInfo />
        
        {/* 通知テスト送信 */}
        <NotificationTester />

        {/* アンマウントテスト */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              購読継続テスト
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              アンマウント回数: {unmountCount}回<br />
              グローバル購読はアンマウント後も継続し、ローカル購読は削除されることを確認できます。
            </Alert>

            {isUnmountTestVisible ? (
              <UnmountTestComponent 
                onUnmount={() => {
                  handleUnmount();
                  setIsUnmountTestVisible(false);
                }} 
              />
            ) : (
              <Alert severity="warning">
                コンポーネントがアンマウントされました。2秒後に再表示されます...
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 使用方法説明 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              デモの使用方法
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="1. Snackbar通知テスト"
                  secondary="各ボタンをクリックして対応するSnackbarが表示されることを確認"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. グローバル/ローカル購読テスト"
                  secondary="コンポーネントをアンマウントしてから通知を送信し、グローバル購読が継続することを確認"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. ブラウザコンソール確認"
                  secondary="デバッグログでハンドラー登録/削除の動作を確認できます"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="4. 通知システムの動作"
                  secondary="SnackbarListenerが通知を受け取り、適切なSnackbarを表示します"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Stack>

      {/* SnackbarListener - 通知をSnackbarに変換 */}
      <SnackbarListener />
      
      {/* SnackbarNotification - 実際のSnackbar UI表示 */}
      {rootReady && <SnackbarNotification />}
    </Box>
  );
};

// Storybook設定
const meta = {
  title: 'WebSocket/Demo',
  component: WebSocketDemo,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WebSocketDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なuseWSSubscriptionデモ
const WSSubscriptionBasicDemo: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const { addNotification } = useWebSocketContext();

  const handleMessage = useCallback((data: any) => {
    console.log('📨 Basic subscription received:', data);
    setReceivedMessages(prev => [{...data, timestamp: Date.now()}, ...prev].slice(0, 10));
  }, []);

  const subscriptionId = useWSSubscription('BASIC_EVENT', handleMessage, isEnabled);

  const sendTestMessage = () => {
    addNotification({
      eventType: 'BASIC_EVENT',
      message: 'Basic subscription test message',
      testData: { source: 'basic-demo', timestamp: Date.now() }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          基本的なuseWSSubscription
        </Typography>
        
        <Stack spacing={2}>
          <Alert severity="info">
            購読ID: {subscriptionId || 'なし'}<br />
            購読状態: {isEnabled ? '有効' : '無効'}<br />
            受信メッセージ数: {receivedMessages.length}
          </Alert>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color={isEnabled ? 'secondary' : 'primary'}
              onClick={() => setIsEnabled(!isEnabled)}
            >
              {isEnabled ? '購読停止' : '購読開始'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={sendTestMessage}
              disabled={!isEnabled}
            >
              テストメッセージ送信
            </Button>
            
            <Button
              size="small"
              onClick={() => setReceivedMessages([])}
              disabled={receivedMessages.length === 0}
            >
              履歴クリア
            </Button>
          </Stack>

          {receivedMessages.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2" gutterBottom>
                受信履歴:
              </Typography>
              {receivedMessages.map((msg, index) => (
                <Typography key={index} variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}: {JSON.stringify(msg, null, 1)}
                </Typography>
              ))}
            </Paper>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// グローバルWebSocket購読デモ
const WSSubscriptionGlobalDemo: React.FC = () => {
  const [isLocalEnabled, setIsLocalEnabled] = useState(false);
  const [isGlobalEnabled, setIsGlobalEnabled] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'local' | 'global', data: any, timestamp: number}>>([]);
  const { addNotification } = useWebSocketContext();

  const handleLocalMessage = useCallback((data: any) => {
    console.log('📍 Local message received:', data);
    setMessages(prev => [{type: 'local' as const, data, timestamp: Date.now()}, ...prev].slice(0, 15));
  }, []);

  const handleGlobalMessage = useCallback((data: any) => {
    console.log('🌐 Global message received:', data);
    setMessages(prev => [{type: 'global' as const, data, timestamp: Date.now()}, ...prev].slice(0, 15));
  }, []);

  const localId = useWSSubscription('GLOBAL_TEST_EVENT', handleLocalMessage, isLocalEnabled, { isGlobal: false });
  const globalId = useGlobalWebSocketEvent('GLOBAL_TEST_EVENT', handleGlobalMessage, isGlobalEnabled);

  const sendTestMessage = () => {
    addNotification({
      eventType: 'GLOBAL_TEST_EVENT',
      message: 'Global vs Local test message',
      testData: { source: 'global-demo', timestamp: Date.now() }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          グローバル vs ローカル購読
        </Typography>
        
        <Stack spacing={2}>
          <Alert severity="info">
            ローカル購読ID: {localId || 'なし'}<br />
            グローバル購読ID: {globalId || 'なし'}<br />
            受信メッセージ数: {messages.length}
          </Alert>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Button
              size="small"
              variant="contained"
              color={isLocalEnabled ? 'secondary' : 'primary'}
              onClick={() => setIsLocalEnabled(!isLocalEnabled)}
            >
              ローカル購読 {isLocalEnabled ? 'OFF' : 'ON'}
            </Button>
            
            <Button
              size="small"
              variant="contained"
              color={isGlobalEnabled ? 'secondary' : 'success'}
              onClick={() => setIsGlobalEnabled(!isGlobalEnabled)}
            >
              グローバル購読 {isGlobalEnabled ? 'OFF' : 'ON'}
            </Button>
            
            <Button
              size="small"
              variant="outlined"
              onClick={sendTestMessage}
              disabled={!isLocalEnabled && !isGlobalEnabled}
            >
              テストメッセージ送信
            </Button>
            
            <Button
              size="small"
              onClick={() => setMessages([])}
              disabled={messages.length === 0}
            >
              履歴クリア
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            💡 グローバル購読はコンポーネントがアンマウントされても継続します。ローカル購読は削除されます。
          </Typography>

          {messages.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 250, overflow: 'auto' }}>
              <Typography variant="body2" gutterBottom>
                受信履歴:
              </Typography>
              {messages.map((msg, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Chip 
                    label={msg.type === 'global' ? 'グローバル' : 'ローカル'} 
                    size="small" 
                    color={msg.type === 'global' ? 'success' : 'primary'}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}: {msg.data.message}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// 複数WebSocket購読デモ
const WSSubscriptionMultipleDemo: React.FC = () => {
  const [messages, setMessages] = useState<Array<{eventType: string, data: any, timestamp: number}>>([]);
  const { addNotification } = useWebSocketContext();

  const eventConfigs = [
    { eventType: 'EVENT_A', enabled: true, isGlobal: false, label: 'イベントA (ローカル)' },
    { eventType: 'EVENT_B', enabled: true, isGlobal: true, label: 'イベントB (グローバル)' },
    { eventType: 'EVENT_C', enabled: false, isGlobal: false, label: 'イベントC (無効)' },
  ];

  const [configs, setConfigs] = useState(eventConfigs);

  const subscriptions = configs.map(config => ({
    eventType: config.eventType,
    handler: useCallback((data: any) => {
      console.log(`📬 Multiple subscription (${config.eventType}):`, data);
      setMessages(prev => [{
        eventType: config.eventType,
        data,
        timestamp: Date.now()
      }, ...prev].slice(0, 20));
    }, [config.eventType]),
    enabled: config.enabled,
    isGlobal: config.isGlobal,
  }));

  const handlerIds = useMultipleWebSocketEvents(subscriptions);

  const toggleConfig = (index: number) => {
    setConfigs(prev => prev.map((config, i) => 
      i === index ? { ...config, enabled: !config.enabled } : config
    ));
  };

  const sendTestMessage = (eventType: string) => {
    addNotification({
      eventType,
      message: `${eventType} test message`,
      testData: { source: 'multiple-demo', timestamp: Date.now() }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          複数イベント同時購読
        </Typography>
        
        <Stack spacing={2}>
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            {Object.entries(handlerIds).map(([eventType, id]) => (
              <div key={eventType}>
                {eventType}: {id || 'なし'}
              </div>
            ))}
          </Alert>

          <Stack spacing={1}>
            {configs.map((config, index) => (
              <Stack key={config.eventType} direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  variant={config.enabled ? 'contained' : 'outlined'}
                  color={config.enabled ? 'primary' : 'inherit'}
                  onClick={() => toggleConfig(index)}
                  sx={{ minWidth: 120 }}
                >
                  {config.label}
                </Button>
                
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => sendTestMessage(config.eventType)}
                  disabled={!config.enabled}
                >
                  送信
                </Button>
                
                <Chip 
                  label={config.isGlobal ? 'Global' : 'Local'} 
                  size="small" 
                  color={config.isGlobal ? 'success' : 'default'}
                />
              </Stack>
            ))}
          </Stack>

          <Button
            size="small"
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
          >
            履歴クリア ({messages.length})
          </Button>

          {messages.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 250, overflow: 'auto' }}>
              <Typography variant="body2" gutterBottom>
                受信履歴:
              </Typography>
              {messages.map((msg, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Chip 
                    label={msg.eventType} 
                    size="small" 
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}: {msg.data.message}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// 条件付きWebSocket購読デモ
const WSSubscriptionConditionalDemo: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const { addNotification } = useWebSocketContext();

  const handleMessage = useCallback((data: any) => {
    console.log('🔄 Conditional subscription received:', data);
    setMessages(prev => [{...data, timestamp: Date.now()}, ...prev].slice(0, 10));
  }, []);

  // ログイン状態かつアクティブな場合のみ購読
  const condition = isLoggedIn && isActive;
  const subscriptionId = useConditionalWebSocketEvent('CONDITIONAL_EVENT', handleMessage, condition);

  const sendTestMessage = () => {
    addNotification({
      eventType: 'CONDITIONAL_EVENT',
      message: 'Conditional subscription test message',
      testData: { source: 'conditional-demo', timestamp: Date.now() }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          条件付き購読
        </Typography>
        
        <Stack spacing={2}>
          <Alert severity={condition ? 'success' : 'warning'}>
            購読ID: {subscriptionId || 'なし'}<br />
            ログイン状態: {isLoggedIn ? 'ログイン中' : 'ログアウト'}<br />
            アクティブ状態: {isActive ? 'アクティブ' : '非アクティブ'}<br />
            購読条件: {condition ? '満たされている' : '満たされていない'}
          </Alert>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Button
              size="small"
              variant={isLoggedIn ? 'contained' : 'outlined'}
              color={isLoggedIn ? 'success' : 'inherit'}
              onClick={() => setIsLoggedIn(!isLoggedIn)}
            >
              {isLoggedIn ? 'ログアウト' : 'ログイン'}
            </Button>
            
            <Button
              size="small"
              variant={isActive ? 'contained' : 'outlined'}
              color={isActive ? 'primary' : 'inherit'}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? '非アクティブ化' : 'アクティブ化'}
            </Button>
            
            <Button
              size="small"
              variant="outlined"
              onClick={sendTestMessage}
              disabled={!condition}
            >
              テストメッセージ送信
            </Button>
            
            <Button
              size="small"
              onClick={() => setMessages([])}
              disabled={messages.length === 0}
            >
              履歴クリア
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            💡 「ログイン中」かつ「アクティブ」の場合のみイベントを受信します。
          </Typography>

          {messages.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2" gutterBottom>
                受信履歴:
              </Typography>
              {messages.map((msg, index) => (
                <Typography key={index} variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}: {msg.message}
                </Typography>
              ))}
            </Paper>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// useWSSubscription包括デモ
const WSSubscriptionShowcase: React.FC = () => {
  const rootReady = useStorybookSnackbarRoot();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        useWSSubscription フック包括デモ
      </Typography>
      
      {!rootReady && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Snackbar表示の準備中...
        </Alert>
      )}

      <Stack spacing={3}>
        <WSSubscriptionBasicDemo />
        <WSSubscriptionGlobalDemo />
        <WSSubscriptionMultipleDemo />
        <WSSubscriptionConditionalDemo />
        
        {/* 使用方法説明 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              フック使用ガイド
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="useWSSubscription"
                  secondary="基本的なWebSocketイベント購読。enabled/disabledの切り替えが可能"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="useGlobalWebSocketEvent"
                  secondary="グローバル購読。コンポーネントアンマウント後も継続する永続的なハンドラー"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="useMultipleWebSocketEvents"
                  secondary="複数イベントの同時購読。各イベントの独立した制御が可能"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="useConditionalWebSocketEvent"
                  secondary="条件付き購読。特定の状態でのみイベントを受信する動的制御"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Stack>

      {/* SnackbarListener - 通知をSnackbarに変換 */}
      <SnackbarListener />
      
      {/* SnackbarNotification - 実際のSnackbar UI表示 */}
      {rootReady && <SnackbarNotification />}
    </Box>
  );
};

// Redux統合版のStorybook用ラッパー
const SnackbarIntegrationWrapper: React.FC = () => {
  const store = createDemoStore();
  
  return (
    <Provider store={store}>
      <WebSocketProvider autoConnect={true} debug={true}>
        <SnackbarIntegrationDemo />
      </WebSocketProvider>
    </Provider>
  );
};

const WSSubscriptionWrapper: React.FC = () => {
  const store = createDemoStore();
  
  return (
    <Provider store={store}>
      <WebSocketProvider autoConnect={true} debug={true}>
        <WSSubscriptionShowcase />
      </WebSocketProvider>
    </Provider>
  );
};

export const Default: Story = {
  name: 'WebSocketデモ',
};

export const SnackbarIntegration: Story = {
  name: 'Snackbar統合デモ',
  render: () => <SnackbarIntegrationWrapper />,
  parameters: {
    docs: {
      description: {
        story: `
WebSocket通知とSnackbarの統合デモです。以下の機能をテストできます：

- **通知→Snackbar表示**: 各種通知ボタンでSnackbarが表示されることを確認
- **グローバル購読継続**: コンポーネントアンマウント後もグローバル購読が継続することを確認  
- **ローカル購読削除**: ローカル購読はアンマウント時に適切に削除されることを確認
- **SnackbarListener連携**: 通知システムとSnackbarListenerの連携動作を確認

ブラウザのコンソールでデバッグログも確認できます。
        `
      }
    }
  }
};

export const WSSubscriptionDemo: Story = {
  name: 'useWSSubscriptionフック デモ',
  render: () => <WSSubscriptionWrapper />,
  parameters: {
    docs: {
      description: {
        story: `
useWSSubscriptionフックとその関連フックの包括的なデモです。以下の機能を学習できます：

## 提供されるフック

### useWSSubscription
- 基本的なWebSocketイベント購読
- enabled/disabledの動的制御
- 購読IDの追跡とデバッグ

### useGlobalWebSocketEvent  
- グローバル購読（永続的）
- コンポーネントアンマウント後も継続
- アプリケーション全体で共通の処理に適用

### useMultipleWebSocketEvents
- 複数イベントの同時購読
- 各イベントの独立した有効/無効制御
- 購読状態の一括管理

### useConditionalWebSocketEvent
- 条件付き購読
- 動的な購読開始/停止
- ビジネスロジックに応じた柔軟な制御

## 学習ポイント
- 各フックの基本的な使用方法
- グローバルvsローカル購読の違い
- 複数購読の管理パターン
- 条件付き購読の実用例
- WebSocket購読のライフサイクル

ブラウザコンソールで詳細なデバッグログを確認できます。
        `
      }
    }
  }
};