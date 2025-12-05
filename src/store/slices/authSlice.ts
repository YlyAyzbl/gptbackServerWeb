import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService, { LoginRequest } from '../../api/apiService';

// 用户信息接口
export interface AuthUser {
  id?: number;
  username: string;
  token: string;
}

// 认证状态接口
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// 初始状态
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

// 异步thunk - 登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      const token = response.data?.token;

      if (!token) {
        return rejectWithValue('登录失败：未获取到token');
      }

      // 保存token和用户信息到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        username: credentials.username,
        token,
      }));

      return {
        user: {
          username: credentials.username,
          token,
        },
        token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || '登录失败');
    }
  }
);

// 异步thunk - 登出
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // 清除localStorage中的token和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || '登出失败');
    }
  }
);

// 异步thunk - 恢复会话
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        return rejectWithValue('无有效会话');
      }

      const user = JSON.parse(userStr);
      return {
        user,
        token,
      };
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.message || '会话恢复失败');
    }
  }
);

// 认证 slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 同步的action
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 登出
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 恢复会话
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { setError, clearError } = authSlice.actions;
export default authSlice.reducer;
