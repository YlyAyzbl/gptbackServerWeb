# Axios集成测试指南

本文档提供完整的测试步骤，验证axios和认证功能是否正确集成。

## 🚀 前置准备

### 1. 启动Mock服务器

```bash
cd fast_gin
./run.sh dev
```

验证输出：
```
启动Mock服务器...
模式: dev
日志级别: DEBUG
访问地址: http://localhost:8080
[myApp] ... INFO 应用启动 ...
[myApp] ... INFO 服务器启动 ...
```

### 2. 启动前端开发服务器

在另一个终端：

```bash
npm run dev
```

访问：http://localhost:5173

## 🧪 测试场景

### 场景1：测试登录功能

**步骤：**
1. 访问 http://localhost:5173/login
2. 输入用户名（例如：`test_user`）
3. 输入密码（例如：`123456`）
4. 点击"登录"按钮

**预期结果：**
- 显示"登录中..."按钮状态
- 请求应该成功
- 浏览器跳转到仪表板页面 `/dashboard`
- localStorage中应该保存了token

**验证：**
打开浏览器开发者工具 → 应用/Storage → localStorage
```
token: Bearer_...
user: {"username":"test_user","token":"Bearer_..."}
```

### 场景2：测试错误处理

**步骤：**
1. 访问登录页面
2. 不输入任何内容直接点击登录

**预期结果：**
- 显示错误信息"请输入用户名和密码"
- 不发送网络请求

**步骤2：**
1. 输入错误的用户名/密码组合
2. 点击登录

**预期结果：**
- 显示错误信息
- Mock服务器返回401或业务错误

### 场景3：测试自动token添加

**步骤：**
1. 登录成功后
2. 打开浏览器开发者工具 → 网络标签页
3. 访问 http://localhost:5173/users
4. 观察请求头

**预期结果：**
- 每个API请求都应该包含 `Authorization: Bearer <token>` 头
- 例如：`GET /api/users` 请求头中有Authorization

**验证代码：**
```javascript
// 在浏览器控制台执行
import apiService from './api/apiService';
await apiService.getUsers();
// 检查Network标签中的请求头
```

### 场景4：测试会话持久化

**步骤：**
1. 成功登录
2. 刷新页面 F5

**预期结果：**
- 页面不应该重定向到登录页
- 用户仍然保持已认证状态
- 自动恢复会话

**验证：**
检查Redux状态 → auth → isAuthenticated 应该是 true

### 场景5：测试token过期处理

**步骤：**
1. 成功登录
2. 打开浏览器开发者工具 → 应用/Storage → localStorage
3. 删除 `token` 条目
4. 尝试访问受保护的页面

**预期结果：**
- 页面显示加载器
- 尝试恢复会话失败
- 自动重定向到登录页

### 场景6：测试API调用

**步骤：**
1. 登录成功
2. 在浏览器控制台执行：

```javascript
import apiService from './api/apiService';

// 测试获取用户列表
apiService.getUsers().then(res => {
  console.log('用户列表:', res.data);
}).catch(err => {
  console.error('错误:', err.message);
});

// 测试获取仪表板数据
apiService.getDashboardData().then(res => {
  console.log('仪表板:', res.data);
}).catch(err => {
  console.error('错误:', err.message);
});

// 测试创建用户
apiService.createUser({
  name: 'Test User',
  email: 'test@example.com',
  role: 'User',
  status: 'Active'
}).then(res => {
  console.log('新用户:', res.data);
}).catch(err => {
  console.error('错误:', err.message);
});
```

**预期结果：**
- 所有请求都返回数据
- 没有CORS错误
- 没有401未授权错误
- 数据格式正确

### 场景7：测试路由保护

**步骤：**
1. 不登录，直接访问 http://localhost:5173/dashboard
2. 或者登出后访问

**预期结果：**
- 显示加载状态
- 尝试恢复会话
- 如果会话无效，重定向到登录页

## 📊 浏览器开发工具检查清单

### Network标签页
- [ ] 登录请求 `/api/login` 返回200，响应包含token
- [ ] 其他API请求都包含Authorization header
- [ ] CORS预检请求成功（OPTIONS）
- [ ] 没有CORS错误
- [ ] 没有401未授权错误（除非测试token过期）

### Application/Storage标签页
- [ ] localStorage中有 `token` 键
- [ ] localStorage中有 `user` 键
- [ ] localStorage中有 `persist:root` 键（Redux persistence）
- [ ] 刷新页面后token仍然存在

### Console标签页
- [ ] 没有相关的JavaScript错误
- [ ] Axios拦截器日志显示token被添加
- [ ] API调用成功打印结果

### Redux DevTools（如果安装）
- [ ] auth.isAuthenticated 登录后为true
- [ ] auth.user 包含用户名和token
- [ ] auth.token 包含有效token
- [ ] 登出后所有值重置

## 🔍 手动API测试

### 使用curl测试

```bash
# 1. 测试健康检查
curl http://localhost:8080/api/test

# 2. 测试登录
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 3. 获取token后测试受保护的端点
TOKEN="your-token-here"
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"

# 4. 获取仪表板数据
curl http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 测试清单

### 基础功能
- [ ] Axios实例正确创建
- [ ] API_BASE_URL正确设置
- [ ] 请求和响应拦截器正确工作
- [ ] axios构建时无编译错误

### 认证功能
- [ ] 登录页面正确呈现
- [ ] 登录表单验证工作
- [ ] 登录请求成功
- [ ] Token保存到localStorage
- [ ] 用户信息保存到localStorage

### Redux集成
- [ ] authSlice正确集成到store
- [ ] auth状态持久化到localStorage
- [ ] 登录/登出action正确执行
- [ ] 状态更新正确

### Hook功能
- [ ] useAuth Hook返回正确的属性
- [ ] useAuth Hook中的login/logout方法正确工作
- [ ] useApiCall Hook正确处理加载/错误/数据
- [ ] useAuth Hook中的restoreSession工作

### 路由保护
- [ ] ProtectedRoute组件存在
- [ ] 未认证时显示加载器
- [ ] 未认证时重定向到登录页
- [ ] 已认证时显示受保护内容
- [ ] 刷新页面时会话正确恢复

### API集成
- [ ] apiService所有方法都存在
- [ ] 请求都包含Authorization header
- [ ] 响应正确解析
- [ ] 错误正确处理
- [ ] Token自动添加到所有请求

### 错误处理
- [ ] 401错误自动跳转到登录页
- [ ] 403错误显示权限错误消息
- [ ] 404错误显示资源不存在消息
- [ ] 网络错误显示连接失败消息
- [ ] 超时错误显示超时消息

## 🐛 常见问题排查

### 问题：登录后仍然看不到数据
**排查步骤：**
1. 检查浏览器控制台是否有错误
2. 检查Network标签中Authorization header是否存在
3. 检查localStorage中token是否存在
4. 检查Mock服务器是否运行

### 问题：CORS错误
**排查步骤：**
1. 确保Mock服务器运行在 http://localhost:8080
2. 确保API_BASE_URL设置正确
3. 检查浏览器控制台中的CORS错误信息
4. 验证Mock服务器CORS中间件配置

### 问题：Token未自动添加
**排查步骤：**
1. 检查localStorage中token是否存在
2. 打开开发者工具Network标签
3. 查看请求头中Authorization是否存在
4. 检查axiosInstance中的请求拦截器

### 问题：登出后仍然保持认证状态
**排查步骤：**
1. 检查localStorage中token是否被清除
2. 检查auth.token state是否为null
3. 检查auth.isAuthenticated是否为false
4. 检查Redux持久化配置

## 📈 性能检查

### 加载时间
- [ ] 首次加载< 3秒
- [ ] 登录< 2秒
- [ ] API调用< 1秒

### 网络请求
- [ ] 每个请求大小< 100KB
- [ ] 登录请求包含token
- [ ] 其他请求包含Authorization header

### 内存使用
- [ ] 没有明显的内存泄漏
- [ ] Redux DevTools显示正常的状态

## ✅ 最终验证

完成所有测试后，运行以下检查：

```bash
# 1. 构建项目
npm run build

# 2. 检查是否有TypeScript错误
npx tsc --noEmit

# 3. 启动开发服务器并手动测试
npm run dev
```

如果所有测试都通过，axios和认证集成就成功了！🎉

## 📝 测试报告模板

```
# Axios集成测试报告

## 日期
[YYYY-MM-DD]

## 测试环境
- Node版本: [version]
- Mock服务器: [running/failed]
- 浏览器: [name version]

## 测试结果
- 基础功能: [✓/✗]
- 认证功能: [✓/✗]
- Redux集成: [✓/✗]
- Hook功能: [✓/✗]
- 路由保护: [✓/✗]
- API集成: [✓/✗]
- 错误处理: [✓/✗]

## 总体评分
[Pass/Fail]

## 问题备注
[如有任何问题，在此记录]
```
