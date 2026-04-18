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
import {
  sidebarTextColor,
  sidebarSelectedBackgroundColor,
  sidebarBackgroundColor,
} from "@/components/color";
import { useLanguage } from "@/hooks/useLanguage";
import { pageLang } from "@/config/PageLang";
import { useRouter } from "next/router";

interface Props {
  item: PageConfigItem;
  depth?: number;
  sidebarOpen?: boolean;
}

export const SideMenuItem: React.FC<Props> = ({ item, depth = 0, sidebarOpen = true }) => {
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

  return (
    <>
      <TooltipWrapper
        title={!sidebarOpen ? (item.langKey ? l[item.langKey] : item.name) : ''}
        placement="right"
        arrow
      >
        <ListItemButton
          data-testid="close-menu"
          onClick={handleClick}
          selected={isSelected}
          sx={{
            pl: sidebarOpen ? 2 + depth * 2 : 0,
            pr: sidebarOpen ? undefined : 0,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 48,
            bgcolor: isSelected
              ? sidebarSelectedBackgroundColor
              : sidebarBackgroundColor,
          }}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                color: sidebarTextColor,
                minWidth: 0,
                mr: sidebarOpen ? 2 : 0,
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
          )}
          {sidebarOpen && (
            <ListItemText
              primary={item.langKey ? l[item.langKey] : item.name}
              sx={{ color: sidebarTextColor }}
            />
          )}
          {sidebarOpen && item.children && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </TooltipWrapper>

      {/* Inline collapse for children (both open and collapsed sidebar) */}
      {item.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {!sidebarOpen && <Divider />}
          <List component="div" disablePadding>
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
