import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  theme: 'light' | 'dark';
  language: string;
}

export interface UserState {
  currentUser: User | null;
  isLoggedIn: boolean;
  preferences: {
    notifications: boolean;
    autoSave: boolean;
  };
}

const initialState: UserState = {
  currentUser: null,
  isLoggedIn: false,
  preferences: {
    notifications: true,
    autoSave: true,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 用户登录
    login: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },

    // 用户登出
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
    },

    // 更新用户信息
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },

    // 更新用户偏好设置
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // 加载持久化数据
    loadFromStorage: (_state: UserState, action: PayloadAction<UserState>) => {
      return action.payload;
    },
  },
});

export const {
  login,
  logout,
  updateUser,
  updatePreferences,
  loadFromStorage,
} = userSlice.actions;

export default userSlice.reducer;
