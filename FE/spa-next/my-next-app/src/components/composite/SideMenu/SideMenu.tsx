// components/composite/sideMenu/SideMenu.tsx
import React, { useEffect, useMemo } from 'react';
import { Drawer, List } from '@/components/base';
import { useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useRouter } from 'next/router';
import { Box } from '@/components/base';
import IconButtonBase from '@/components/base/Button/IconButtonBase';

import { getPageConfig } from '@/config/PageConfig';
import { SideMenuItem } from './SideMenuItem';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, HEADER_HEIGHT } from '@/components/config';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { filterPageConfig } from '@/components/composite/SideMenu/utils';

type SideMenuProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SideMenu: React.FC<SideMenuProps> = ({ open, setOpen }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const toggleSidebar = () => setOpen(!open);
  const { rolePermissions } = useAuth();
  const { selectMenu } = useSidebar();
  const filteredMenu = useMemo(
    () => filterPageConfig(getPageConfig(), rolePermissions || {}),
    [rolePermissions]
  );

  // Auto-select menu based on current route
  useEffect(() => {
    const currentPath = router.pathname;
    const matchingItem = filteredMenu.find(item => item.resourceKey === currentPath);
    if (matchingItem) {
      selectMenu(matchingItem.resourceKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  const drawerWidth = isMobile ? SIDEBAR_WIDTH : (open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH);

  return (
    <>
      {isMobile && !open && (
        <Box
          sx={{
            position: 'fixed',
            top: `${HEADER_HEIGHT + 8}px`,
            left: 8,
            zIndex: (zTheme) => zTheme.zIndex.drawer + 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <IconButtonBase data-testid="open-button" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButtonBase>
        </Box>
      )}

      <Drawer
        anchor="left"
        open={open}
        variant={isMobile ? 'temporary' : 'permanent'}
        onClose={isMobile ? () => setOpen(false) : undefined}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: 'width 0.3s',
            boxShadow: 2,
            overflowX: 'hidden',
            top: `${HEADER_HEIGHT}px`,
            height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: open ? 'auto' : 'hidden',
            scrollbarWidth: 'thin',
            scrollbarGutter: open ? 'stable' : undefined,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: open ? 'flex-end' : 'center',
              p: 1,
            }}
          >
            <IconButtonBase data-testid="close-button" onClick={toggleSidebar}>
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButtonBase>
          </Box>

          <List sx={{ flexGrow: 1 }}>
            {filteredMenu.map((item) => (
              <SideMenuItem
                key={item.resourceKey}
                item={item}
                sidebarOpen={isMobile ? true : open}
              />
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default SideMenu;
