import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@/hooks/useLanguage';
import forgotPasswordLang from '@lang/forgotPassword.lang';
import {
  FlexBox,
  StackBox,
  TextBox,
  Section,
  Font14,
  Spacer,
  Box as MuiBox,
} from '@/components/base';
import ClickableFont14 from '@/components/base/Font/ClickableFont14';
import { forgotPasswordApi } from '@/api/services/v1/authService';
import ButtonAction from '@/components/base/Button/ButtonAction';

const ForgotPasswordPage = () => {
  const l = useLanguage(forgotPasswordLang);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return l.emailRequired;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return l.emailInvalid;
    }
    return undefined;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (validationError) {
      setValidationError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateEmail(email);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPasswordApi(email);
      setIsSent(true);
    } catch {
      // handleApiError already handles the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (isSent) {
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
            maxWidth: 450,
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
              パスワードリセット用のメールを送信しました。メールをご確認ください。
            </Font14>
          </MuiBox>

          <FlexBox>
            <ButtonAction
              label="ログインへ戻る"
              color="info"
              width={160}
              onClick={handleBackToLogin}
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
          maxWidth: 450,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 0,
          backgroundColor: 'transparent',
        }}
      >
        {/* 説明文 */}
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
            {l.description}
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
            {/* メールアドレス */}
            <Font14 sx={{ color: '#333', mb: 1 }}>{l.emailLabel}</Font14>
            <TextBox
              name="email"
              type="text"
              value={email}
              onChange={handleEmailChange}
              error={!!validationError}
              helperText={validationError}
            />

            <Spacer height={16} />

            {/* ログインに戻る */}
            <ClickableFont14
              onClick={handleBackToLogin}
              sx={{ color: '#1976d2' }}
            >
              {l.backToLogin}
            </ClickableFont14>

            <Spacer height={16} />

            {/* 送信ボタン */}
            <FlexBox>
              <ButtonAction
                type="submit"
                color="info"
                width={120}
                disabled={isSubmitting}
                label={isSubmitting ? l.submitInProgress : l.submitButton}
                sx={{ py: 1 }}
              />
            </FlexBox>
          </StackBox>
        </MuiBox>
      </Section>
    </FlexBox>
  );
};

export default ForgotPasswordPage;
