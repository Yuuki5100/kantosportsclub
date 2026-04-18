// components/composite/header/Header.tsx
import React from 'react';
import { AppBar, Toolbar } from '@/components/base';
import Image from 'next/image';

import { HeaderLang } from './header.lang';
import { headerBgColor } from '../../color';
import router from 'next/router';
import { useAppDispatch } from '@/hooks';
import { logout } from '@/slices/authSlice';
import colors from '@/styles/colors';
import { Box, Font20 } from '@/components/base';

/**
 * Headerコンポーネントのプロパティ
 */
export type HeaderProps = {
  /**
   * タイトル
   *
   * @type {string}
   */
  title?: string;
  /**
   * 会社名
   *
   * @type {string}
   */
  companyName?: string | null;
  /**
   * 拠点名
   *
   * @type {string}
   */
  baseName?: string | null;
  /**
   * 組織名
   *
   * @type {string}
   */
  organizationName?: string | null;
  /**
   * ユーザー名
   *
   * @type {string}
   */
  userName?: string | null;
  /**
   * 設定ボタンがクリックされたときのコールバック関数
   *
   */
  onSettingsClick?: () => void;
  /**
   * ロゴがクリックされたときのコールバック関数
   *
   */
  onLogoClick?: () => void;
  /**
   * 言語設定
   *
   * @type {HeaderLang}
   */
  language: HeaderLang;
};

/**
 * ヘッダーコンポーネント
 *
 * @param {*} {
 *  title,
 *  userName,
 *  onSettingsClick,
 *  onLogoClick,
 *  language,
 * }
 * @return {*}
 */
const Header: React.FC<HeaderProps> = ({
  title,
  companyName: _companyName,
  baseName: _baseName,
  organizationName: _organizationName,
  userName,
  language,
}) => {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    dispatch(logout());
    router.push({
      pathname: '/login',
    });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: headerBgColor,
        width: '100%',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          sx={{ cursor: 'pointer' }}
        >
          <Image
            src={language.logoUrl}
            alt="Logo"
            width={0}
            height={0}
            sizes="40px"
            style={{
              height: language.logoHeight,
              width: 'auto',
              marginRight: language.iconMarginRight,
            }}
          />
          <Font20 data-testid="header-title" sx={{ color: 'inherit' }}>
            {title ?? language.title}
          </Font20>
        </Box>

        <Box display="flex" flexDirection="row" alignItems="center">
          <Box
            sx={{
              whiteSpace: 'nowrap',
              flexShrink: 0,
              mr: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span>{userName ?? language.defaultUserName}</span>
          </Box>
          <Box
            data-testid="logout-button"
            sx={{
              width: '110px',
              height: '40px',
              color: 'white',
              border: '2px solid white',  // ← 枠線
              borderRadius: '6px',        // ← 角丸（任意）
              backgroundColor: colors.Red,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
            onClick={handleLogout}
          >
            <span>ログアウト</span>
          </Box>
          <Box sx={{ mr: 1 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
