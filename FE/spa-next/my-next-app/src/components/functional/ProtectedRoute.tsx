// src/components/functional/ProtectedRoute.tsx
import { ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoleLevel?: number;
  requireAuthentication?: boolean;
}

type ProtectedAccessOptions = Pick<ProtectedRouteProps, "requiredRoleLevel" | "requireAuthentication">;

export const useProtectedAccess = ({
  requiredRoleLevel,
  requireAuthentication = false,
}: ProtectedAccessOptions = {}) => {
  const { isAuthenticated, roleLevel } = useAuth();
  const isProtected = requiredRoleLevel !== undefined || requireAuthentication;
  const isChecking = isProtected && (
    isAuthenticated === null ||
    (requiredRoleLevel !== undefined && isAuthenticated === true && roleLevel === null)
  );
  const lacksRequiredRole = requiredRoleLevel !== undefined && (roleLevel ?? 0) < requiredRoleLevel;
  const isAllowed = !isProtected || (!isChecking && isAuthenticated === true && !lacksRequiredRole);

  return { isAllowed, isChecking };
};

const ProtectedRoute = ({ children, requiredRoleLevel, requireAuthentication = false }: ProtectedRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, roleLevel } = useAuth();
  const { isAllowed, isChecking } = useProtectedAccess({ requiredRoleLevel, requireAuthentication });
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!router.isReady || hasRedirected.current) return;

    if ((requiredRoleLevel === undefined && !requireAuthentication) || isChecking) return;

    if (!isAllowed) {
      hasRedirected.current = true;
      void router.push("/403");
    }
  }, [isAuthenticated, roleLevel, requiredRoleLevel, requireAuthentication, isAllowed, isChecking, router]);

  if (isChecking || !isAllowed) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
