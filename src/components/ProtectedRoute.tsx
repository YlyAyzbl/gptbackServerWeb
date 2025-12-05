import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * 受保护的路由组件
 * 检查用户是否已认证，如果未认证则重定向到登录页
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user, restoreSession } = useAuth();

  useEffect(() => {
    // 如果session已加载，检查认证状态
    if (!loading && !isAuthenticated) {
      // 尝试恢复session
      restoreSession().then((action) => {
        if (action.type === 'auth/restoreSession/rejected') {
          // 如果恢复失败，重定向到登录页
          navigate({ to: '/login', replace: true });
        }
      });
    }
  }, [isAuthenticated, loading, navigate, restoreSession]);

  // 检查权限
  if (requiredRole && user && user.username !== requiredRole) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <div>您没有权限访问此页面</div>
      </Box>
    );
  }

  // 仍在加载session时显示加载器
  if (loading || !isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};
