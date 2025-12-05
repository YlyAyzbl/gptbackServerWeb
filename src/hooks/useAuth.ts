import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login, logout, restoreSession } from '../store/slices/authSlice';
import { LoginRequest } from '../api/apiService';

/**
 * 认证自定义Hook
 * 提供登录、登出、获取认证状态等功能
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const handleLogin = async (credentials: LoginRequest) => {
    return dispatch(login(credentials));
  };

  const handleLogout = async () => {
    return dispatch(logout());
  };

  const handleRestoreSession = async () => {
    return dispatch(restoreSession());
  };

  return {
    // 状态
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,

    // 方法
    login: handleLogin,
    logout: handleLogout,
    restoreSession: handleRestoreSession,
  };
};
