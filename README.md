# Redux + React Router 演示应用

一个完整的 React 应用示例，展示了 Redux 状态管理和 localStorage 持久化的最佳实践。

## 技术栈

- **React**: 18.3.1
- **React DOM**: 18.3.1
- **TypeScript**: 5.6.3
- **Redux**: @reduxjs/toolkit 1.9.7 + react-redux 8.1.3
- **Redux-Persist**: 6.0.0（用于状态持久化）
- **React Router**: @tanstack/react-router 1.78.3 + @tanstack/router-devtools 1.78.3
- **UI 框架**: Material-UI (MUI) 6.1.6
- **样式**: Tailwind CSS 3.4.1
- **构建工具**: Vite 5.4.8

## 项目结构

```
src/
├── store/                    # Redux 状态管理
│   ├── index.ts             # Store 配置和 persistor 设置
│   ├── hooks.ts             # 自定义 Redux hooks（类型安全）
│   └── slices/              # Redux slices
│       ├── todoSlice.ts      # 待办事项状态管理
│       └── userSlice.ts      # 用户状态管理
├── routes/                  # React Router 路由定义
│   ├── __root.tsx           # 根路由布局
│   ├── index.tsx            # 主页路由
│   ├── state-demo.tsx       # 状态管理演示页面
│   └── persistence-demo.tsx # 持久化存储演示页面
├── pages/                   # 页面组件
│   ├── HomePage.tsx         # 主页
│   ├── StateDemoPage.tsx    # 状态演示页面
│   └── PersistenceDemoPage.tsx # 持久化演示页面
├── compoents/              # 可复用组件
│   ├── navbar.tsx          # 导航栏
│   ├── footer.tsx          # 页脚
│   ├── TodoList.tsx        # 待办事项列表
│   └── UserInfo.tsx        # 用户信息展示
├── global/
│   └── config.ts           # 应用配置和常量
├── main.tsx                # 应用入口
└── index.css               # Tailwind CSS 全局样式
```

## 核心功能

### 1. Redux 状态管理

#### Todo State（待办事项）
- 添加待办事项 (`addTodo`)
- 删除待办事项 (`removeTodo`)
- 更新待办事项 (`updateTodo`)
- 切换完成状态 (`toggleTodo`)
- 设置过滤器 (`setFilter`: all/active/completed)
- 清除已完成项 (`clearCompleted`)

#### User State（用户状态）
- 用户登录 (`login`)
- 用户登出 (`logout`)
- 更新用户信息 (`updateUser`)
- 更新用户偏好设置 (`updatePreferences`)

### 2. 持久化存储

使用 redux-persist 自动将 Redux 状态持久化到浏览器 localStorage：
- 存储键名：`persist:root`
- 白名单：`['todo', 'user']`（只持久化这些 reducer 的状态）
- 自动恢复：应用启动时自动从 localStorage 恢复状态

### 3. React Router

- TanStack Router（现代化的类型安全路由）
- 支持嵌套路由
- 路由开发工具（Router DevTools）

## 快速开始

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

浏览器会自动打开 `http://localhost:3000`

### 生产构建

```bash
yarn build
```

### 预览生产构建

```bash
yarn serve
```

### 类型检查

```bash
yarn typecheck
```

## 页面导览

### 首页 (`/`)
展示应用概览，包含：
- 用户登录/登出组件
- 待办事项管理界面
- 功能导航链接

### 状态管理演示 (`/state-demo`)
展示 Redux 状态的实时变化：
- 用户状态管理演示
- 待办事项 CRUD 操作
- 状态 JSON 查看器（用于调试）

### 持久化演示 (`/persistence-demo`)
演示 localStorage 的持久化存储：
- 添加测试数据
- 查看 localStorage 中的数据
- 清除存储的选项
- 刷新页面验证数据持久化

## 使用示例

### 使用 Redux Hooks

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTodo, removeTodo } from '../store/slices/todoSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(state => state.todo.items);

  const handleAddTodo = (title: string) => {
    dispatch(addTodo({ title, description: '', completed: false }));
  };

  return (
    // JSX 代码
  );
}
```

### 查看 localStorage 数据

在浏览器开发者工具中：
1. 打开 DevTools (F12)
2. 进入 Application 标签
3. 找到 LocalStorage 部分
4. 查看 `persist:root` 键下的数据

## 持久化原理

```
Redux Store 变化 → redux-persist 监听 → 序列化状态 → 存储到 localStorage
                                          ↓
                                    应用启动时
                                       ↓
                          从 localStorage 读取 → 反序列化 → 恢复到 Redux Store
```

## 配置文件说明

- **tailwind.config.js**: Tailwind CSS 配置
- **postcss.config.js**: PostCSS 配置（处理 Tailwind）
- **vite.config.ts**: Vite 构建配置
- **tsconfig.json**: TypeScript 配置
- **.claude.md**: Claude 项目提示文件

## 开发建议

1. **类型安全**: 使用 `useAppDispatch` 和 `useAppSelector` 而不是原生 Redux hooks
2. **Redux DevTools**: 可以安装浏览器插件以更好地调试 Redux 状态变化
3. **性能优化**: 使用 `reselect` 库优化选择器性能（如需）
4. **中间件**: redux-persist 已配置，支持 localStorage 序列化

## 扩展应用

### 添加新的 Reducer

1. 在 `src/store/slices/` 中创建新的 slice 文件
2. 在 `src/store/index.ts` 中添加到 `combineReducers`
3. 在 `persist:root` 的 whitelist 中添加（如需持久化）

### 添加新的页面

1. 在 `src/pages/` 中创建页面组件
2. 在 `src/routes/` 中创建路由文件
3. 路由会自动被 TanStack Router 生成

## 浏览器兼容性

- Chrome/Edge: 最新版本
- Firefox: 最新版本
- Safari: 最新版本
- localStorage 支持所有现代浏览器

## 许可证

MIT

## 学习资源

- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [React Redux 文档](https://react-redux.js.org/)
- [redux-persist GitHub](https://github.com/rt2zz/redux-persist)
- [TanStack Router 文档](https://tanstack.com/router/latest)
- [Tailwind CSS 文档](https://tailwindcss.com/)
