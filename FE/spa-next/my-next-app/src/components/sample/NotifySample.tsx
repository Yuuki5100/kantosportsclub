'use client';

import { useState } from 'react';
import { apiService } from '@/api/apiService';
import { useError } from '@/hooks/useError';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useWSSubscription } from '@/hooks/useWSSubscription';
import { getMessage, MessageCodes } from '@/message';
import { List, ListItem } from '@mui/material';
import { Box } from '@/components/base';
import ButtonAction from '@/components/base/Button/ButtonAction';
import { Font20 } from '@/components/base';

export default function NotifySample() {
  const [messages, setMessages] = useState<unknown[]>([]);
  const { showError } = useError();
  const { showSnackbar } = useSnackbar();

  // 新しい型安全なuseWSSubscriptionフックを使用
  useWSSubscription(
    'GATE_IN',
    (data) => {
      // dataはWSEventDataMap['GATE_IN']型で型安全
      setMessages((prev) => [...prev, data]);
      showSnackbar(getMessage(MessageCodes.GATE_IN_RECEIVED, data.location), 'SUCCESS');
    },
    true
  );

  const handleClick = async () => {
    try {
      await apiService.post('/api/notify', {
        eventType: 'GATE_IN',
        refId: 123,
      });
      console.log('✅ 通知キューに登録成功');
    } catch (err: unknown) {
      showError(getMessage(MessageCodes.NOTIFY_REGISTER_FAILED));
      console.error('POST失敗:', err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <ButtonAction
        label="通知登録"
        color="primary"
        onClick={handleClick}
        sx={{ borderRadius: 1, px: 4, py: 1 }}
      />

      <Box sx={{ mt: 4 }}>
        <Font20 sx={{ mb: 2 }}>
          受信メッセージ:
        </Font20>
        <List sx={{ typography: 'body2' }}>
          {messages.map((msg, idx) => (
            <ListItem
              key={idx}
              sx={{
                backgroundColor: '#f5f5f5',
                px: 2,
                py: 1,
                borderRadius: 1,
                mb: 1,
              }}
            >
              {JSON.stringify(msg)}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
