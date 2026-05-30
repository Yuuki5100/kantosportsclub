import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Drawer, List, Box, Divider, ListItemText } from "@/components/base";
import IconButtonBase from "@/components/base/Button/IconButtonBase";
import { getPageConfig } from "@/config/PageConfig";
import { SideMenuItem } from "./SideMenuItem";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, HEADER_HEIGHT } from "@/components/config";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { filterPageConfig } from "@/components/composite/SideMenu/utils";

type SideMenuProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type MenuSectionKey = "activity" | "assets" | "other";

const SECTION_LABELS: Record<MenuSectionKey, string> = {
  activity: "活動",
  assets: "管理",
  other: "その他",
};

const SECTION_ORDER: MenuSectionKey[] = ["activity", "assets", "other"];

const SideMenu: React.FC<SideMenuProps> = ({ open, setOpen }) => {
  const router = useRouter();
  const { roleLevel } = useAuth();
  const { selectMenu } = useSidebar();
  const filteredMenu = useMemo(
    () => filterPageConfig(getPageConfig(), roleLevel ?? null),
    [roleLevel]
  );

  const sectionedMenu = useMemo(
    () =>
      SECTION_ORDER.map((section) => ({
        section,
        items: filteredMenu.filter((item) => item.section === section),
      })).filter((group) => group.items.length > 0),
    [filteredMenu]
  );

  useEffect(() => {
    const currentPath = router.pathname;
    const matchingItem = filteredMenu.find((item) => item.resourceKey === currentPath);
    if (matchingItem) {
      selectMenu(matchingItem.resourceKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  const drawerWidth = open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <Drawer
      anchor="left"
      open
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          transition: "width 0.3s",
          boxShadow: 2,
          overflowX: "hidden",
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: open ? "auto" : "hidden",
          scrollbarWidth: "thin",
          scrollbarGutter: open ? "stable" : undefined,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: open ? "flex-end" : "center",
            p: 1,
          }}
        >
          <IconButtonBase data-testid="close-button" onClick={() => setOpen(!open)}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButtonBase>
        </Box>

        <List sx={{ flexGrow: 1 }}>
          {sectionedMenu.map((group, index) => (
            <React.Fragment key={group.section}>
              <ListItemText
                primary={SECTION_LABELS[group.section]}
                sx={{
                  px: 2,
                  py: 1,
                  color: "text.secondary",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              />
              {group.items.map((item) => (
                <SideMenuItem
                  key={item.resourceKey}
                  item={item}
                  sidebarOpen={open}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              {index < sectionedMenu.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideMenu;
