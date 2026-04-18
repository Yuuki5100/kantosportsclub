import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  FlexBox,
  StackBox,
  TextBox,
  Section,
  Font12,
  Font14,
  Spacer,
  Box as MuiBox,
} from '@/components/base';
import { resetPasswordApi } from '@/api/services/v1/authService';
import ButtonAction from '@/components/base/Button/ButtonAction';

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 20;

/** 英大文字・英小文字・数字・記号のうち3つ以上を含むか判定 */
const meetsComplexity = (pw: string): boolean => {
  let count = 0;
  if (/[A-Z]/.test(pw)) count++;
  if (/[a-z]/.test(pw)) count++;
  if (/[0-9]/.test(pw)) count++;
  if (/[^A-Za-z0-9]/.test(pw)) count++;
  return count >= 3;
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePassword = (): boolean => {
    let valid = true;

    if (!password) {
      setPasswordError('新しいパスワードを入力してください');
      valid = false;
    } else if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      setPasswordError(`${PASSWORD_MIN_LENGTH}〜${PASSWORD_MAX_LENGTH}文字で入力してください`);
      valid = false;
    } else if (!meetsComplexity(password)) {
      setPasswordError('英大文字、英小文字、数字、記号の内3つ以上を組み合わせてください');
      valid = false;
    } else {
      setPasswordError(undefined);
    }

    if (!confirmPassword) {
      setConfirmError('確認用パスワードを入力してください');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('パスワードが一致しません');
      valid = false;
    } else {
      setConfirmError(undefined);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;
    if (!token || typeof token !== 'string') return;

    setIsSubmitting(true);
    try {
      await resetPasswordApi(token, password);
      setIsSuccess(true);
    } catch {
      // handleApiError already shows error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  if (isSuccess) {
    return (
      <FlexBox
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Section
          elevation={0}
          sx={{
            padding: 0,
            width: '100%',
            maxWidth: 500,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 0,
            backgroundColor: 'transparent',
          }}
        >
          <MuiBox
            sx={{
              width: '100%',
              backgroundColor: '#e3f2fd',
              border: '1px solid #90caf9',
              padding: 2,
              mb: 2,
            }}
          >
            <Font14 sx={{ color: '#1976d2', textAlign: 'center' }}>
              パスワードを設定しました。
            </Font14>
          </MuiBox>

          <FlexBox>
            <ButtonAction
              label="ログインへ"
              color="info"
              width={160}
              onClick={handleGoToLogin}
              sx={{ py: 1 }}
            />
          </FlexBox>
        </Section>
      </FlexBox>
    );
  }

  return (
    <FlexBox
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Section
        elevation={0}
        sx={{
          padding: 0,
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 0,
          backgroundColor: 'transparent',
        }}
      >
        {/* ヘッダー */}
        <MuiBox
          sx={{
            width: '100%',
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            padding: 2,
            mb: 2,
          }}
        >
          <Font14 sx={{ color: '#1976d2', textAlign: 'center' }}>
            パスワードを設定してください。
          </Font14>
        </MuiBox>

        {/* フォーム */}
        <MuiBox
          sx={{
            width: '100%',
            border: '1px solid #ccc',
            padding: 3,
            backgroundColor: '#fff',
            boxShadow: 3,
          }}
        >
          <StackBox
            component="form"
            onSubmit={handleSubmit}
            spacing={0}
            width="100%"
          >
            {/* パスワードルール説明 */}
            <Font12 sx={{ color: 'red', mb: 2 }}>
              ※英大文字、英小文字、数字、記号の内3つ以上を組み合わせて、{PASSWORD_MIN_LENGTH}〜{PASSWORD_MAX_LENGTH}文字で入力してください。
            </Font12>

            {/* 新しいパスワード */}
            <Font14 sx={{ color: '#333', mb: 1 }}>新しいパスワード</Font14>
            <TextBox
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(undefined);
              }}
              error={!!passwordError}
              helperText={passwordError}
            />

            <Spacer height={16} />

            {/* 新しいパスワード（確認用） */}
            <Font14 sx={{ color: '#333', mb: 1 }}>新しいパスワード（確認用）</Font14>
            <TextBox
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(undefined);
              }}
              error={!!confirmError}
              helperText={confirmError}
            />

            <Spacer height={24} />

            {/* 登録ボタン */}
            <FlexBox>
              <ButtonAction
                type="submit"
                color="info"
                width={120}
                disabled={isSubmitting}
                label={isSubmitting ? '処理中...' : '登録'}
                sx={{ py: 1 }}
              />
            </FlexBox>
          </StackBox>
        </MuiBox>
      </Section>
    </FlexBox>
  );
};

export default ResetPasswordPage;
