import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import todoReducer from './slices/todoSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  todo: todoReducer,
  user: userReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  // 选择要持久化的状态部分
  whitelist: ['todo', 'user', 'auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
