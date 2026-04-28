import React, { useEffect, useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, List } from '@/components/base';
import IconButtonBase from '@/components/base/Button/IconButtonBase';
import { getPageConfig } from '@/config/PageConfig';
import { useAuth } from '@/hooks/useAuth';
import { filterPageConfig } from '@/components/composite/SideMenu/utils';
import { SideMenuItem } from './SideMenuItem';
import { headerBgColor } from '../../color';
import { useRouter } from 'next/router';

type MobileSideMenuProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MobileSideMenu: React.FC<MobileSideMenuProps> = ({ open, setOpen }) => {
  const router = useRouter();
  const { rolePermissions } = useAuth();
  const filteredMenu = useMemo(
    () => filterPageConfig(getPageConfig(), rolePermissions || {}),
    [rolePermissions]
  );

  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  return (
    <Drawer
      anchor="left"
      open={open}
      variant="temporary"
      onClose={() => setOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 'min(84vw, 320px)',
          maxWidth: 320,
          height: '100dvh',
          overflowX: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          minHeight: 64,
          px: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: headerBgColor,
          color: 'white',
        }}
      >
        <Box sx={{ fontWeight: 700, px: 1 }}>メニュー</Box>
        <IconButtonBase
          aria-label="メニューを閉じる"
          data-testid="mobile-close-menu-button"
          onClick={() => setOpen(false)}
          sx={{ color: 'inherit' }}
        >
          <CloseIcon />
        </IconButtonBase>
      </Box>

      <List sx={{ py: 1 }}>
        {filteredMenu.map((item) => (
          <SideMenuItem key={item.resourceKey} item={item} sidebarOpen />
        ))}
      </List>
    </Drawer>
  );
};

export default MobileSideMenu;
