import React, { useState } from "react";
import {
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@/components/base";
import TooltipWrapper from "@/components/base/utils/TooltipWrapper";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { PageConfigItem } from "@/config/PageConfig";
import { useSidebar } from "@/hooks/useSidebar";
import { useLanguage } from "@/hooks/useLanguage";
import { pageLang } from "@/config/PageLang";
import { useRouter } from "next/router";

interface Props {
  item: PageConfigItem;
  depth?: number;
  sidebarOpen?: boolean;
  onNavigate?: () => void;
}

export const SideMenuItem: React.FC<Props> = ({ item, depth = 0, sidebarOpen = true, onNavigate }) => {
  const router = useRouter();
  const { selectedMenuKey, selectMenu } = useSidebar();
  const [open, setOpen] = useState(false);
  const l = useLanguage(pageLang);

  const handleClick = () => {
    // If item has children, toggle expand/collapse
    if (item.children && item.children.length > 0) {
      setOpen(!open);
      return;
    }

    selectMenu(item.resourceKey); // ← 選択状態を更新
    onNavigate?.();

    // Force navigation with window.location for static export reliability
    if (router.pathname === item.resourceKey) {
      // Force a hard refresh if already on the same page
      window.location.href = item.resourceKey;
    } else {
      // Use router for navigation to different pages
      router.push(item.resourceKey);
    }
  };
  const isSelected = selectedMenuKey === item.resourceKey;

  const label = item.langKey ? l[item.langKey] : item.name;

  return (
    <>
      <TooltipWrapper
        title={!sidebarOpen ? label : ''}
        placement="right"
        arrow
      >
        <ListItemButton
          data-testid="close-menu"
          onClick={handleClick}
          selected={isSelected}
          sx={{
            position: 'relative',
            mx: sidebarOpen ? 1 : 0.5,
            my: 0.25,
            borderRadius: 2,
            minHeight: 44,
            pl: sidebarOpen ? 1.5 : 0,
            pr: sidebarOpen ? 1.5 : 0,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            alignItems: 'center',
            color: 'text.primary',
            transition: 'background-color 0.15s ease',
            // 選択中は左側に細いアクセントバーを表示
            ...(isSelected && {
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: '60%',
                borderRadius: 4,
                bgcolor: 'primary.main',
              },
            }),
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': {
                bgcolor: 'action.selected',
              },
            },
          }}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                color: isSelected ? 'primary.main' : 'text.secondary',
                minWidth: 0,
                mr: sidebarOpen ? 1.75 : 0,
                justifyContent: 'center',
                '& .MuiSvgIcon-root': { fontSize: 20 },
              }}
            >
              {item.icon}
            </ListItemIcon>
          )}
          {sidebarOpen && (
            <ListItemText
              primary={label}
              slotProps={{
                primary: {
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 500,
                  noWrap: true,
                },
              }}
              sx={{ my: 0, color: 'text.primary' }}
            />
          )}
          {sidebarOpen && item.children && (
            open
              ? <ExpandLess sx={{ fontSize: 18, color: 'text.secondary' }} />
              : <ExpandMore sx={{ fontSize: 18, color: 'text.secondary' }} />
          )}
        </ListItemButton>
      </TooltipWrapper>

      {/* Inline collapse for children (both open and collapsed sidebar) */}
      {item.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {!sidebarOpen && <Divider />}
          <List
            component="div"
            disablePadding
            sx={
              sidebarOpen
                ? {
                    // 子メニューの階層を細いガイド線で表現
                    ml: 2.75,
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                  }
                : undefined
            }
          >
            {item.children.filter((child) => !child.hidden).map((child) => (
              <SideMenuItem key={child.resourceKey} item={child} depth={depth + 1} sidebarOpen={sidebarOpen} />
            ))}
          </List>
          {!sidebarOpen && <Divider />}
        </Collapse>
      )}
    </>
  );
};

export default SideMenuItem;
