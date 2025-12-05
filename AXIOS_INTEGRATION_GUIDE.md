# Axios集成和路由认证指南

本文档说明如何在项目中使用封装的axios和路由认证功能。

## 📦 新增文件

### API层
- `src/api/axiosInstance.ts` - Axios实例和拦截器配置
- `src/api/apiService.ts` - API服务层，包含所有API调用方法

### 认证管理
- `src/store/slices/authSlice.ts` - Redux认证状态管理
- `src/hooks/useAuth.ts` - 认证自定义Hook
- `src/hooks/useApiCall.ts` - API调用通用Hook

### 路由保护
- `src/components/ProtectedRoute.tsx` - 受保护路由组件

### 页面
- `src/pages/Login.tsx` - 更新的登录页面（集成axios）

## 🚀 使用指南

### 1. 登录流程

在登录页面使用认证Hook：

```typescript
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login({
      username: 'admin',
      password: 'password'
    });

    if (result.type === 'auth/login/fulfilled') {
      // 登录成功，跳转到仪表板
      navigate({ to: '/dashboard' });
    }
  };

  return (
    // 表单UI
  );
}
```

### 2. 获取认证信息

```typescript
import { useAuth } from '../hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, token } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>欢迎，{user?.username}</p>}
    </div>
  );
}
```

### 3. 登出

```typescript
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // 自动跳转到登录页
  };

  return (
    <button onClick={handleLogout}>登出</button>
  );
}
```

### 4. 保护路由

使用ProtectedRoute包装需要认证的路由：

```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';
import Dashboard from '../pages/DashboardHome';

<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### 5. 获取API数据

#### 方式1：使用useApiCall Hook

```typescript
import { useApiCall } from '../hooks/useApiCall';
import apiService from '../api/apiService';

export default function UserList() {
  const { data, loading, error, fetch } = useApiCall(
    () => apiService.getUsers(),
    true // 自动获取数据
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {data?.data?.users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={fetch}>刷新</button>
    </div>
  );
}
```

#### 方式2：直接调用API服务

```typescript
import { useEffect, useState } from 'react';
import apiService from '../api/apiService';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getDashboardData()
      .then(response => setData(response.data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    // UI
  );
}
```

## 🔐 认证流程

### 自动认证
1. 用户登录成功后，token自动保存到localStorage
2. 后续所有API请求的请求拦截器会自动添加Authorization header
3. 如果token过期（401错误），会自动清除并重定向到登录页

### 手动恢复会话
```typescript
const { restoreSession } = useAuth();

useEffect(() => {
  restoreSession(); // 页面加载时恢复用户会话
}, []);
```

## 📋 API服务方法

### 认证相关

```typescript
// 登录
apiService.login({ username: 'admin', password: 'pass' })

// 登出
logout()
```

### 用户管理

```typescript
// 获取用户列表
apiService.getUsers()

// 获取单个用户
apiService.getUserById(1)

// 创建用户
apiService.createUser({
  name: 'John',
  email: 'john@example.com',
  role: 'User',
  status: 'Active'
})

// 更新用户
apiService.updateUser(1, userData)

// 删除用户
apiService.deleteUser(1)
```

### 仪表板

```typescript
// 获取仪表板数据
apiService.getDashboardData()
```

### 服务

```typescript
// 获取服务列表
apiService.getServices()
```

### 工单

```typescript
// 获取工单列表
apiService.getTickets()
```

### Token使用

```typescript
// 获取Token使用数据
apiService.getTokenUsage()
```

## ⚙️ Axios配置

### 基础配置

文件：`src/api/axiosInstance.ts`

```typescript
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,  // http://localhost:8080
  timeout: 10000,         // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 请求拦截器

自动添加认证token：

```typescript
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

### 响应拦截器

处理响应和错误：

```typescript
// 成功响应
if (code === 200 || code === 201) {
  return Promise.resolve(response.data);
}

// 错误处理
if (status === 401) {
  // 未授权 - 清除token并跳转到登录
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## 🛡️ 错误处理

所有错误都会被catch捕获，包括：

- 网络错误
- 超时错误
- HTTP错误（401, 403, 404, 500）
- 业务逻辑错误

```typescript
try {
  const result = await apiService.getUsers();
  console.log(result.data);
} catch (error) {
  console.error(error.message); // 错误信息
}
```

## 🧪 测试

### 使用Mock服务器测试

确保Mock服务器正在运行：

```bash
cd fast_gin
./run.sh dev
```

### 测试登录

1. 打开 http://localhost:5173/login
2. 输入任意用户名和密码（Mock服务器会接受）
3. 点击"登录"按钮
4. 应该跳转到仪表板页面

### 测试API调用

在浏览器控制台测试：

```javascript
// 导入API服务
import apiService from './api/apiService';

// 获取用户列表
apiService.getUsers().then(res => console.log(res.data));

// 创建用户
apiService.createUser({
  name: 'Test',
  email: 'test@example.com',
  role: 'User',
  status: 'Active'
}).then(res => console.log(res.data));
```

## 📊 Redux状态管理

认证状态通过Redux管理，可以在任何组件中访问：

```typescript
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function MyComponent() {
  const auth = useSelector((state: RootState) => state.auth);

  return (
    <div>
      <p>用户: {auth.user?.username}</p>
      <p>已认证: {auth.isAuthenticated}</p>
    </div>
  );
}
```

### 状态结构

```typescript
{
  user: {
    username: string;
    token: string;
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

## 🔄 工作流

### 登录工作流
1. 用户在登录页面输入用户名和密码
2. 调用 `apiService.login()`
3. axios实例发送POST请求到 `/api/login`
4. Mock服务器返回token
5. Redux authSlice更新状态，保存token到localStorage
6. 页面自动跳转到仪表板

### 请求工作流
1. 组件调用API服务方法
2. 请求拦截器自动添加token
3. axios发送请求
4. 响应拦截器处理响应和错误
5. Promise resolve或reject
6. 组件更新UI

### 路由保护工作流
1. 用户尝试访问受保护的路由
2. ProtectedRoute检查isAuthenticated状态
3. 如果未认证，显示加载器
4. 尝试从localStorage恢复会话
5. 如果恢复失败，重定向到登录页
6. 如果成功，显示受保护的内容

## 🚨 常见问题

### Q: Token过期后会发生什么？
A: 当API返回401错误时，axios响应拦截器会：
1. 清除localStorage中的token
2. 清除用户信息
3. 跳转到登录页

### Q: 如何手动设置token？
A: 虽然通常不需要，但可以这样做：
```typescript
localStorage.setItem('token', 'your-token-here');
```

### Q: 如何测试未认证的请求？
A: 清除token：
```javascript
localStorage.removeItem('token');
// 下次请求不会包含Authorization header
```

### Q: 如何添加新的API端点？
A: 在 `src/api/apiService.ts` 中添加方法：
```typescript
async myNewMethod(): Promise<ApiResponse<MyData>> {
  return axiosInstance.get('/api/my-endpoint');
}
```

## 📝 总结

这个集成提供了：
- ✅ 完整的axios配置和拦截器
- ✅ API服务层，统一管理API调用
- ✅ Redux认证状态管理
- ✅ 自定义Hook简化使用
- ✅ 路由保护组件
- ✅ 自动token管理和过期处理
- ✅ 完整的错误处理

现在可以在任何组件中轻松调用API和管理认证！
