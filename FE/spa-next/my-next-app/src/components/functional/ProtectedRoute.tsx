// src/components/functional/ProtectedRoute.tsx
import { useEffect, ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { getPageConfig, PageConfigItem } from "@/config/PageConfig";

const findPageConfigByPath = (
  config: PageConfigItem[],
  path: string
): PageConfigItem | undefined => {
  for (const item of config) {
    if (item.resourceKey === path) return item;
    if (item.children) {
      const found = findPageConfigByPath(item.children, path);
      if (found) return found;
    }
  }
  return undefined;
};

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, rolePermissions } = useAuth();
  const router = useRouter();
  const [allowRender, setAllowRender] = useState(false);

  const pageConfig = useMemo(() => {
    return findPageConfigByPath(getPageConfig(), router.pathname);
  }, [router.pathname]);

  // ルート変更時にレンダリング許可をリセット（ページフラッシュ防止）
  useEffect(() => {
    setAllowRender(false);
  }, [router.pathname]);

  useEffect(() => {
    // pageConfigがない場合でも認証チェックは行う
    if (isAuthenticated == null) {
      return;
    }

    // 未認証の場合はログインページへリダイレクト
    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }

    // pageConfigがない場合は認証済みなら表示許可
    if (!pageConfig) {
      setAllowRender(true);
      return;
    }

    // 権限チェック: rolePermissionsがまだ読み込まれていない場合は待機
    if (pageConfig.requiredPermission > 0 && rolePermissions == null) {
      return;
    }

    // permissionTargetKeyに対するユーザーの権限レベルを確認
    if (pageConfig.requiredPermission > 0 && rolePermissions) {
      const targetKey = pageConfig.permissionTargetKey || pageConfig.resourceKey;
      const level = rolePermissions[targetKey] ?? 0;
      if (level < pageConfig.requiredPermission) {
        router.replace("/403");
        return;
      }
    }

    setAllowRender(true); // ✅ 認証済み＋権限OK → 表示許可
  }, [isAuthenticated, rolePermissions, pageConfig, router]);

  // 認証状態が未確定の場合はローディング表示
  if (isAuthenticated == null) {
    return <p>⏳ 認証確認中...</p>;
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (isAuthenticated === false) {
    return null;
  }

  if (!allowRender) {
    return null; // ❌ 表示条件未満 → レンダリング抑制
  }

  return <>{children}</>;
};

export default ProtectedRoute;
