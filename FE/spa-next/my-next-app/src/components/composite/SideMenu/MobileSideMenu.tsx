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
import { Divider, ListItemText } from '@/components/base';

type MenuSectionKey = "activity" | "assets" | "other";

const SECTION_LABELS: Record<MenuSectionKey, string> = {
  activity: "活動",
  assets: "管理",
  other: "その他",
};

const SECTION_ORDER: MenuSectionKey[] = ["activity", "assets", "other"];

type MobileSideMenuProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MobileSideMenu: React.FC<MobileSideMenuProps> = ({ open, setOpen }) => {
  const router = useRouter();
  const { roleLevel } = useAuth();
  const filteredMenu = useMemo(
    () => filterPageConfig(getPageConfig(), roleLevel ?? null),
    [roleLevel]
  );

  const sectionedMenu = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      section,
      items: filteredMenu.filter((item) => item.section === section),
    })).filter((group) => group.items.length > 0);
  }, [filteredMenu]);

  useEffect(() => {
    // ルート変化後も念のため閉じるが、遷移前に閉じる処理を優先する
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  if (!open) {
    return null;
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      variant="temporary"
      onClose={() => setOpen(false)}
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
        {sectionedMenu.map((group, index) => (
          <React.Fragment key={group.section}>
            <ListItemText
              primary={SECTION_LABELS[group.section]}
              sx={{
                px: 2,
                py: 1,
                color: 'text.secondary',
                fontWeight: 700,
              }}
            />
            {group.items.map((item) => (
              <SideMenuItem key={item.resourceKey} item={item} sidebarOpen onNavigate={() => setOpen(false)} />
            ))}
            {index < sectionedMenu.length - 1 && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default MobileSideMenu;
