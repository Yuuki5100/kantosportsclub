// src/components/functional/ProtectedRoute.tsx
import { ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoleLevel?: number;
  requireAuthentication?: boolean;
}

const ProtectedRoute = ({ children, requiredRoleLevel, requireAuthentication = false }: ProtectedRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, roleLevel } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!router.isReady || hasRedirected.current) return;

    if (requiredRoleLevel === undefined && !requireAuthentication) return;

    // 認証状態の初期取得が終わるまで判定しない。
    if (isAuthenticated === null || (requiredRoleLevel !== undefined && isAuthenticated === true && roleLevel === null)) return;

    const lacksRequiredRole = requiredRoleLevel !== undefined && (roleLevel ?? 0) < requiredRoleLevel;
    if (isAuthenticated !== true || lacksRequiredRole) {
      hasRedirected.current = true;
      void router.push("/403");
    }
  }, [isAuthenticated, roleLevel, requiredRoleLevel, requireAuthentication, router]);

  if ((requiredRoleLevel !== undefined || requireAuthentication) &&
    (isAuthenticated === null || (requiredRoleLevel !== undefined && isAuthenticated === true && roleLevel === null))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
