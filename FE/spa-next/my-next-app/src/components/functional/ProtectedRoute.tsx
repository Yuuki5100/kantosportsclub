// src/components/functional/ProtectedRoute.tsx
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // 認証 API 移植前の画面確認用に、認証・権限チェックは一時的に通過させる。
  return <>{children}</>;
};

export default ProtectedRoute;
