// src/hooks/useSidebar.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import type { RootState } from "../store";
import { setSelectedMenu, clearSelectedMenu } from "../slices/sidebarSlice";

export const useSidebar = () => {
  const selectedMenuKey = useAppSelector((state: RootState) => state.sidebar.selectedMenuKey);
  const dispatch = useAppDispatch();

  const selectMenu = useCallback((resourceKey: string) => {
    dispatch(setSelectedMenu(resourceKey));
  }, [dispatch]);

  const clearMenuSelection = useCallback(() => {
    dispatch(clearSelectedMenu());
  }, [dispatch]);

  return { selectedMenuKey, selectMenu, clearMenuSelection };
};
