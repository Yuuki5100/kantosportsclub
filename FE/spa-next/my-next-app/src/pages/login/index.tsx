import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppDispatch } from '@/hooks';
import loginLang from '@lang/login.lang';
import { clearErrors, pruneErrors } from '@/slices/authErrorSlice';
import { getMessage, MessageCodes } from '@/message';
import {
  FlexBox,
  StackBox,
  TextBox,
  Section,
  Font14,
  Font20,
  Spacer,
} from '@/components/base';
import ClickableFont14 from '@/components/base/Font/ClickableFont14';
import ButtonAction from '@/components/base/Button/ButtonAction';

const LoginPage = () => {
  const l = useLanguage(loginLang);
  const { loginUser, isAuthenticated } = useAuth();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});

  /**
   * ログイン処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate fields
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      setValidationErrors({ username: usernameError, password: passwordError });
      return;
    }

    setLoginPending(true);

    try {
      await loginUser(username, password).unwrap();

      dispatch(clearErrors());
      showSnackbar(l.loginSuccess, "SUCCESS");
      router.push("/");
    } catch (err: unknown) {
      console.error('❌ Login failed:', err);
      const errMsg = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
      const isLocked = errMsg.includes('Account is locked');
      const message = isLocked
        ? getMessage(MessageCodes.LOGIN_LOCKED)
        : errMsg || l.loginError;
      setError(message);
      showSnackbar(message, 'ERROR');
      dispatch(pruneErrors());
      setLoginPending(false);
    }
  };

  /**
   * ログイン済みであれば /user に遷移
   */
  useEffect(() => {
    if (loginPending && isAuthenticated === true) {
      console.log('🔁 認証済みなので /user に遷移');
      router.push('/');
    }
  }, [loginPending, isAuthenticated, router]);

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) {
      return l.userIdRequired;
    }
    if (value.length > 100) {
      return l.userIdMaxLength;
    }
    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      return l.userIdAlphanumeric;
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value.trim()) {
      return l.passwordRequired;
    }
    if (value.length > 20) {
      return l.passwordMaxLength;
    }
    // Allow alphanumeric and common special characters for passwords
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(value)) {
      return l.passwordAlphanumeric;
    }
    return undefined;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    // Clear validation error when user starts typing
    if (validationErrors.username) {
      setValidationErrors(prev => ({ ...prev, username: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    // Clear validation error when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  return (
    <FlexBox
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Section
        elevation={3}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 450,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 0,
        }}
      >
        <StackBox spacing={0} alignItems="center" width="100%">
          {/* ロゴ画像エリア */}
          <FlexBox
            sx={{
              width: 120,
              height: 120,
            }}
          >
            <img
              src="/Logo.png"
              alt="共通基盤テンプレート"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </FlexBox>

          <Spacer height={16} />

          {/* システム名 */}
          <Font20 sx={{ color: '#1976d2' }}>{l.systemName}</Font20>

          <Spacer height={24} />

          {/* エラーメッセージ */}
          {error && (
            <>
              <Font14 sx={{ color: 'error.main' }}>{error}</Font14>
              <Spacer height={16} />
            </>
          )}

          {/* ログインフォーム */}
          <StackBox
            component="form"
            onSubmit={handleSubmit}
            spacing={0}
            width="100%"
          >
            {/* ユーザID */}
            <Font14 sx={{ color: '#666', mb: 0.5 }}>{l.userId}</Font14>
            <TextBox
              name="username"
              value={username}
              onChange={handleUsernameChange}
              error={!!validationErrors.username}
              helperText={validationErrors.username}
            />

            <Spacer height={16} />

            {/* パスワード */}
            <Font14 sx={{ color: '#666', mb: 0.5 }}>{l.password}</Font14>
            <TextBox
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
            />

            <Spacer height={8} />

            {/* ログイン状態の保存 & パスワード忘れ */}
            <FlexBox justifyContent="space-between" width="100%">
              {/* <CheckBox
                name="rememberMe"
                options={[{ value: 'remember', label: l.rememberMe }]}
                selectedValues={rememberMe ? ['remember'] : []}
                onChange={handleRememberMeChange}
                direction="row"
              /> */}
              <ClickableFont14
                onClick={handleForgotPassword}
                sx={{ color: '#1976d2' }}
              >
                {l.forgotPassword}
              </ClickableFont14>
            </FlexBox>

            <Spacer height={24} />

            {/* ログインボタン */}
            <FlexBox>
              <ButtonAction
                type="submit"
                color="info"
                width={200}
                disabled={loginPending}
                label={loginPending ? l.loginInProgress : l.loginButton}
                sx={{ py: 1 }}
              />
            </FlexBox>
          </StackBox>
        </StackBox>
      </Section>
    </FlexBox>
  );
};

export default LoginPage;
