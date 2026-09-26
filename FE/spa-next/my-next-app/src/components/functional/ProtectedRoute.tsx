// src/components/functional/ProtectedRoute.tsx
import { ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoleLevel?: number;
}

const ProtectedRoute = ({ children, requiredRoleLevel }: ProtectedRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, roleLevel } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!router.isReady || hasRedirected.current) return;

    if (requiredRoleLevel === undefined) return;

    // 認証状態・権限情報の初期取得が終わるまで判定しない。
    if (isAuthenticated === null || (isAuthenticated === true && roleLevel === null)) return;

    if (isAuthenticated !== true || (roleLevel ?? 0) < requiredRoleLevel) {
      hasRedirected.current = true;
      void router.push("/403");
    }
  }, [isAuthenticated, roleLevel, requiredRoleLevel, router]);

  if (requiredRoleLevel !== undefined && (isAuthenticated === null || (isAuthenticated === true && roleLevel === null))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
