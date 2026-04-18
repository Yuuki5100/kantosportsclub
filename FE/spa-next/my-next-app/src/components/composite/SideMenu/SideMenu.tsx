// components/composite/sideMenu/SideMenu.tsx
import React, { useEffect, useMemo } from 'react';
import { Drawer, List } from '@/components/base';
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

  return (
    <Drawer
      anchor="left"
      open={open}
      variant="permanent"
      sx={{
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          transition: 'width 0.3s',
          boxShadow: 2,
          overflowX: 'hidden',
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
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
        {/* 開閉トグルボタン */}
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

        {/* メニュー本体（常に表示、collapsed時はアイコンのみ） */}
        <List sx={{ flexGrow: 1 }}>
          {filteredMenu.map((item) => (
            <SideMenuItem key={item.resourceKey} item={item} sidebarOpen={open} />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideMenu;
