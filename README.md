# React MUI Vite 管理后台

完整的前后端集成项目，包含Axios、认证系统和Mock服务器。

## 🚀 快速开始

```bash
# Terminal 1: 启动Mock服务器
cd fast_gin && ./run.sh dev

# Terminal 2: 启动前端
npm run dev

# 浏览器访问 http://localhost:5173/login
# 使用账号: test_user / 123456
```

## 🔐 默认测试账号

| 账号 | 密码 | 说明 |
|------|------|------|
| `test_user` | `123456` | 推荐使用 |
| `admin` | `admin123` | 管理员 |
| `demo` | `demo123` | 演示 |

> 账号在Mock服务器首次启动时自动创建

## 📊 功能总结

### ✅ 已实现

**1. Axios HTTP客户端**
- 请求/响应拦截器
- 自动添加Authorization header
- 401错误自动重定向
- 文件: `src/api/axiosInstance.ts`

**2. API服务层**
- 11个后端端点封装
- TypeScript类型定义
- 单例模式设计
- 文件: `src/api/apiService.ts`

**3. Redux认证管理**
- login/logout/restoreSession
- localStorage持久化
- Redux Persist集成
- 文件: `src/store/slices/authSlice.ts`

**4. 自定义Hook**
- `useAuth` - 认证状态和方法
- `useApiCall` - API调用Hook
- 文件: `src/hooks/`

**5. 路由保护**
- ProtectedRoute组件
- 12个路由已保护
- 自动会话恢复
- 文件: `src/components/ProtectedRoute.tsx`

**6. 登录功能**
- 登录页面UI
- 表单验证和错误提示
- 登录后自动跳转
- 文件: `src/pages/Login.tsx`

**7. Mock服务器**
- Go + Gin + SQLite
- JWT认证
- 11个API端点
- 自动创建测试账号
- 目录: `fast_gin/`

### ❌ 未实现（可扩展）

- 注册功能（前端）
- 忘记密码
- Token刷新机制
- 权限控制（RBAC）
- 个人资料编辑

## 🏗️ 技术栈

### 前端
- React 19 + TypeScript 5
- Material-UI 6 + TailwindCSS
- Redux Toolkit + Redux Persist
- TanStack Router
- Axios
- Vite 5

### 后端 (Mock)
- Go + Gin
- SQLite + GORM
- JWT认证

## 📁 核心文件

```
src/
├── api/
│   ├── axiosInstance.ts       # Axios配置
│   └── apiService.ts          # API服务层
├── store/
│   └── slices/authSlice.ts    # 认证状态
├── hooks/
│   ├── useAuth.ts             # 认证Hook
│   └── useApiCall.ts          # API Hook
├── components/
│   └── ProtectedRoute.tsx     # 路由保护
└── pages/
    └── Login.tsx              # 登录页面

fast_gin/
├── gins/
│   ├── router.go              # 路由
│   ├── apiController.go       # API
│   └── userController.go      # 认证
└── sqlite/
    ├── db.go                  # 数据库
    ├── user.go                # 用户模型
    └── seed.go                # 测试账号
```

## 🔐 认证流程

### 登录
```
输入账号密码 → apiService.login()
  ↓
POST /api/login → Mock服务器
  ↓
返回JWT Token
  ↓
Redux保存 + localStorage
  ↓
跳转到 /dashboard
```

### API请求
```
调用 apiService.getUsers()
  ↓
拦截器添加 Authorization: Bearer {token}
  ↓
发送请求
  ↓
处理响应 / 401重定向登录
```

### 路由保护
```
访问受保护路由
  ↓
ProtectedRoute检查认证
  ↓
未认证 → 尝试恢复会话
  ↓
失败 → 重定向登录
成功 → 显示内容
```

## 📡 API端点

**认证**
- `POST /api/login` - 登录

**用户管理**
- `GET /api/users` - 用户列表
- `GET /api/users/:id` - 单个用户
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

**数据**
- `GET /api/dashboard` - 仪表板
- `GET /api/services` - 服务列表
- `GET /api/tickets` - 工单列表
- `GET /api/token-usage` - Token统计
- `GET /api/test` - 健康检查

## 💻 使用示例

### 认证

```typescript
import { useAuth } from '../hooks/useAuth';

export default function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      {isAuthenticated && <p>欢迎, {user?.username}</p>}
      <button onClick={logout}>登出</button>
    </>
  );
}
```

### API调用

```typescript
import { useApiCall } from '../hooks/useApiCall';
import apiService from '../api/apiService';

export default function UserList() {
  const { data, loading, error } = useApiCall(
    () => apiService.getUsers(),
    true
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {data?.users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 路由保护

```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';

<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 🧪 测试

### 基础测试
```bash
npm run build        # 编译
npx tsc --noEmit     # 类型检查
```

### 功能测试

1. **登录** - 访问 /login，输入 test_user/123456
2. **Token** - DevTools → localStorage 确认 token
3. **API** - DevTools → Network 确认 Authorization header
4. **持久化** - 刷新页面验证仍保持登录
5. **保护** - 清除localStorage，访问 /dashboard 验证重定向

## 🛠️ 常用命令

```bash
# 开发
npm run dev
npm run build
npm run preview

# Mock服务器
cd fast_gin
./run.sh dev         # 开发模式
./run.sh prod        # 生产模式
./run.sh quiet       # 安静模式

# 数据库
cd fast_gin
sqlite3 test.db "SELECT * FROM users;"  # 查看用户
rm -f test.db && ./run.sh dev           # 重置
```

## 📊 受保护路由（12个）

**用户路由**
- /dashboard, /users, /services
- /support, /announcements, /settings
- /ai-tokens

**管理路由**
- /admin/, /admin/users, /admin/services
- /admin/support, /admin/announcements
- /admin/settings

## 🔧 故障排除

**无法登录**
- 确认Mock服务器：`curl http://localhost:8080/api/test`
- 检查测试账号（查看启动日志）
- 重置数据库：`rm -f test.db && ./run.sh dev`

**CORS错误**
- 确认Mock服务器运行
- 检查axios baseURL配置
- 验证前端在 localhost:5173

**Token失效**
- 检查localStorage
- 确认Authorization header
- 验证axios拦截器

## 🎯 下一步

### 功能扩展
- [ ] 注册页面
- [ ] 忘记密码
- [ ] Token刷新
- [ ] 权限控制
- [ ] 个人资料编辑

### 优化
- [ ] API缓存
- [ ] 虚拟滚动
- [ ] 代码分割
- [ ] 图片懒加载

### 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] E2E测试

## 📝 License

MIT

---

**最后更新：** 2025年12月
