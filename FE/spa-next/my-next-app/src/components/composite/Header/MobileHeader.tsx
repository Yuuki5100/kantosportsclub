import React from 'react';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import { Box, Font20, AppBar, Toolbar } from '@/components/base';
import IconButtonBase from '@/components/base/Button/IconButtonBase';
import { useAppDispatch } from '@/hooks';
import { logout } from '@/slices/authSlice';
import router from 'next/router';
import { headerBgColor } from '../../color';
import type { HeaderProps } from './Header';

type MobileHeaderProps = HeaderProps & {
  onMenuClick: () => void;
};

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  language,
  onLogoClick,
  onMenuClick,
  isAuthenticated,
}) => {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    if (isAuthenticated !== true) {
      router.push({ pathname: '/login' });
      return;
    }
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
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <Toolbar
        sx={{
          display: 'grid',
          gridTemplateColumns: '48px minmax(0, 1fr) 48px',
          minHeight: 64,
          px: 1,
          gap: 0.5,
        }}
      >
        <IconButtonBase
          aria-label="メニューを開く"
          data-testid="mobile-menu-button"
          onClick={onMenuClick}
          sx={{ color: 'inherit' }}
        >
          <MenuIcon />
        </IconButtonBase>

        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          sx={{ cursor: onLogoClick ? 'pointer' : 'default', minWidth: 0 }}
          onClick={onLogoClick}
        >
          <Image
            src={language.logoUrl}
            alt="Logo"
            width={0}
            height={0}
            sizes="32px"
            style={{
              height: 32,
              width: 'auto',
              marginRight: 8,
              flexShrink: 0,
            }}
          />
          <Font20
            data-testid="mobile-header-title"
            sx={{
              color: 'inherit',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {title ?? language.title}
          </Font20>
        </Box>

        <Button
          aria-label={isAuthenticated === true ? 'ログアウト' : 'ログイン'}
          data-testid="mobile-logout-button"
          onClick={handleLogout}
          sx={{
            color: 'inherit',
            minWidth: 0,
            width: 48,
            height: 32,
            px: 0,
            border: '1px solid currentColor',
            borderRadius: 1,
            fontSize: '0.6rem',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {isAuthenticated === true ? 'ログアウト' : 'ログイン'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default MobileHeader;
