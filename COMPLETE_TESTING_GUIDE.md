# 完整的Axios集成测试文档

## 📋 目录
1. [环境准备](#环境准备)
2. [账号信息](#账号信息)
3. [初始化测试账号](#初始化测试账号)
4. [完整测试流程](#完整测试流程)
5. [API端点详解](#api端点详解)
6. [常见问题](#常见问题)

---

## 🔧 环境准备

### 前置条件
- Node.js 16+ 和 npm 8+
- Go 1.20+ (用于运行Mock服务器)
- 浏览器（Chrome/Firefox推荐）

### 第一步：启动Mock服务器

```bash
# 进入Mock服务器目录
cd /mnt/switchDisk/workSpace/grok.com/react-me-mui-vite/fast_gin

# 启动服务器（开发模式）
./run.sh dev
```

**预期输出：**
```
启动Mock服务器...
模式: dev
日志级别: DEBUG
访问地址: http://localhost:8080
[myApp] ... INFO 应用启动 ...
[myApp] ... INFO 服务器启动 ...
```

### 第二步：启动前端开发服务器

打开新终端，运行：

```bash
cd /mnt/switchDisk/workSpace/grok.com/react-me-mui-vite

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

**预期输出：**
```
VITE v5.4.10  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 📊 账号信息

### Mock服务器架构

Mock服务器使用**SQLite数据库**存储用户信息，支持以下功能：

- ✅ 用户账号管理（创建、验证、删除）
- ✅ 密码加密存储（使用bcrypt）
- ✅ JWT Token生成和验证
- ✅ 会话管理

### 初始状态

服务器启动时，**数据库为空**，不包含任何默认账号。

---

## 🔐 初始化测试账号

### 方法1：使用注册API创建账号（推荐）

#### 步骤1：获取管理员权限

首先，需要通过在内存中创建一个测试账号。编辑 `fast_gin/gins/userController.go` 中的注册函数：

**当前注册检查逻辑：**
```go
if value != "xingling" {  // 只允许 username == "xingling" 的用户注册
    c.JSON(200, ResponeResult.ErrorResult(gin.H{"error": "unauthorized"}))
    return
}
```

#### 步骤2：创建初始测试账号

**选项A：修改代码添加种子数据** (推荐)

编辑 `fast_gin/sqlite/db.go`，在 `init()` 函数中添加种子数据：

```go
func init() {
    // ... 现有代码 ...

    DB = db

    // 添加种子数据 - 创建初始测试账号
    initDefaultUsers()
}

// 添加这个新函数
func initDefaultUsers() {
    // 检查是否已存在测试账号
    var count int64
    DB.Model(&User{}).Count(&count)
    if count > 0 {
        return // 已有用户，跳过初始化
    }

    // 创建默认测试账号
    testUsers := []struct {
        username string
        password string
    }{
        {"test_user", "123456"},
        {"admin", "admin123"},
        {"demo", "demo123"},
    }

    for _, u := range testUsers {
        CreatUser(u.username, u.password)
    }
}
```

**选项B：使用curl创建测试账号**

首先创建一个初始账号（临时禁用授权检查）：

```bash
# 1. 临时修改注册检查（注释掉授权验证），重新编译并启动
# 2. 创建初始管理员账号
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=xingling&password=xingling123"

# 3. 恢复注册检查，重新编译
```

#### 步骤3：推荐的测试账号

添加以下测试账号：

| 用户名 | 密码 | 用途 | 权限 |
|--------|------|------|------|
| `test_user` | `123456` | 基础测试 | 普通用户 |
| `admin` | `admin123` | 管理员测试 | 管理员 |
| `demo` | `demo123` | 演示账号 | 普通用户 |

---

## 🧪 完整测试流程

### 场景1：登录功能测试

#### 目标
验证登录系统是否正常工作，token是否正确生成。

#### 步骤

1. **打开浏览器访问登录页面**
   ```
   http://localhost:5173/login
   ```

2. **输入测试账号**
   ```
   用户名: test_user
   密码: 123456
   ```

3. **点击"登录"按钮**

4. **验证结果**
   - ✅ 页面显示"登录中..."状态
   - ✅ 1-2秒后重定向到 `/dashboard`
   - ✅ 仪表板页面正常显示数据

#### DevTools验证

打开浏览器DevTools (F12)，检查以下内容：

**Network标签页：**
```
POST /api/login
Status: 200 OK
Response:
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "code": 200
  },
  "message": "success"
}
```

**Application → localStorage：**
```
token: "eyJhbGciOiJIUzI1NiIs..."
user: {
  "username": "test_user",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
persist:root: {...}  // Redux持久化数据
```

---

### 场景2：自动Token添加测试

#### 目标
验证后续API请求是否自动添加Authorization header。

#### 步骤

1. **确保已登录**
   - 验证localStorage中有token

2. **打开DevTools → Network标签**

3. **访问用户列表页面**
   ```
   http://localhost:5173/users
   ```

4. **查看API请求头**
   - 找到 `GET /api/users` 请求
   - 点击查看请求头

#### 预期结果

**Request Headers 应包含：**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Response 示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "role": "Admin",
        "status": "Active"
      },
      ...
    ],
    "total": 5
  }
}
```

---

### 场景3：会话持久化测试

#### 目标
验证页面刷新后是否保持登录状态。

#### 步骤

1. **成功登录并进入Dashboard**

2. **验证当前状态**
   - 打开DevTools → Application
   - 检查localStorage中有token

3. **刷新页面** (按 F5 或 Ctrl+R)

4. **验证结果**
   - ✅ 页面不重定向到登录页
   - ✅ Dashboard内容正常加载
   - ✅ 用户仍保持已登录状态

#### 技术细节

这是通过以下流程实现的：
```
页面刷新
  ↓
Redux Persist 恢复状态（包括token和user）
  ↓
ProtectedRoute 检查 isAuthenticated
  ↓
Token存在 → 显示内容
  ↓
Dashboard 自动加载数据
```

---

### 场景4：Token过期处理测试

#### 目标
验证Token失效时系统的处理流程。

#### 步骤

1. **成功登录并进入Dashboard**

2. **打开浏览器DevTools**

3. **手动删除Token**
   - 进入 Application → localStorage
   - 删除 `token` 条目
   - 也删除 `user` 条目
   - 删除 `persist:root` 条目

4. **刷新页面** (F5)

5. **观察重定向过程**

#### 预期结果

```
刷新页面
  ↓
ProtectedRoute 检查认证
  ↓
localStorage中没有token
  ↓
调用 restoreSession()
  ↓
尝试验证失败
  ↓
自动重定向到 /login ✅
```

**DevTools Console 可能看到：**
```
[DEBUG] 尝试恢复会话...
[ERROR] Token验证失败，重定向到登录页
```

---

### 场景5：未认证路由保护测试

#### 目标
验证未登录用户无法访问受保护的路由。

#### 步骤

1. **打开新的无痕浏览器窗口**
   - 或清除所有localStorage数据

2. **直接访问受保护页面**
   ```
   http://localhost:5173/dashboard
   ```

3. **观察页面行为**

#### 预期结果

```
访问 /dashboard
  ↓
ProtectedRoute 检查认证
  ↓
未认证 → 显示 CircularProgress (加载旋转器)
  ↓
尝试从localStorage恢复会话
  ↓
失败 → 重定向到 /login ✅
```

**视觉效果：**
- 短暂显示居中加载旋转器
- 自动跳转到登录页面
- 用户输入账号密码后重新尝试访问Dashboard

---

### 场景6：完整API调用测试

#### 目标
验证所有API端点都能正常工作。

#### 步骤

1. **登录系统**

2. **打开浏览器Console**
   - 按 F12 → Console标签页

3. **逐个测试API**

#### 测试代码

```javascript
// 导入API服务
import apiService from './src/api/apiService.js';

// 1. 测试健康检查
apiService.healthCheck()
  .then(res => console.log('✅ 健康检查:', res.data))
  .catch(err => console.error('❌ 健康检查失败:', err.message));

// 2. 获取仪表板数据
apiService.getDashboardData()
  .then(res => console.log('✅ 仪表板数据:', res.data))
  .catch(err => console.error('❌ 获取失败:', err.message));

// 3. 获取用户列表
apiService.getUsers()
  .then(res => console.log('✅ 用户列表:', res.data))
  .catch(err => console.error('❌ 获取失败:', err.message));

// 4. 获取单个用户
apiService.getUserById(1)
  .then(res => console.log('✅ 用户详情:', res.data))
  .catch(err => console.error('❌ 获取失败:', err.message));

// 5. 创建用户
apiService.createUser({
  name: 'Test User',
  email: 'test@example.com',
  role: 'User',
  status: 'Active'
})
  .then(res => console.log('✅ 新用户:', res.data))
  .catch(err => console.error('❌ 创建失败:', err.message));

// 6. 更新用户
apiService.updateUser(1, {
  name: 'Updated Name',
  email: 'updated@example.com',
  role: 'Admin',
  status: 'Active'
})
  .then(res => console.log('✅ 用户已更新:', res.data))
  .catch(err => console.error('❌ 更新失败:', err.message));

// 7. 获取服务列表
apiService.getServices()
  .then(res => console.log('✅ 服务列表:', res.data))
  .catch(err => console.error('❌ 获取失败:', err.message));

// 8. 获取工单列表
apiService.getTickets()
  .then(res => console.log('✅ 工单列表:', res.data))
  .catch(err => console.error('❌ 获取失败:', err.message));

// 9. 获取Token使用数据
apiService.getTokenUsage()
  .then(res => console.log('✅ Token使用:', res.data))
  .catch(err => console.error('❌ 获取失败:', err.message));
```

#### 预期结果

Console输出应显示：
```
✅ 健康检查: "hello world"
✅ 仪表板数据: { stats: [...], trendData: [...], models: [...] }
✅ 用户列表: { users: [...], total: 5 }
✅ 用户详情: { id: 1, name: "Alice Johnson", ... }
✅ 新用户: { id: 6, name: "Test User", ... }
✅ 用户已更新: { id: 1, name: "Updated Name", ... }
✅ 服务列表: { services: [...], total: 4 }
✅ 工单列表: { tickets: [...], total: 3 }
✅ Token使用: { data: [...] }
```

---

### 场景7：错误处理测试

#### 目标
验证API错误处理和用户反馈。

#### 步骤

1. **测试验证错误**
   ```javascript
   // 空用户名
   apiService.login({ username: '', password: 'test' })
     .catch(err => console.log('❌ 验证错误:', err.message));
   ```

2. **测试认证错误**
   ```javascript
   // 错误的用户名/密码
   apiService.login({ username: 'wrong', password: 'wrong' })
     .catch(err => console.log('❌ 认证失败:', err.message));
   ```

3. **测试网络错误**
   - 停止Mock服务器
   - 尝试调用API
   - 观察错误处理

4. **测试404错误**
   ```javascript
   // 请求不存在的用户
   apiService.getUserById(99999)
     .catch(err => console.log('❌ 用户不存在:', err.message));
   ```

#### 预期结果

- ✅ 错误消息清晰准确
- ✅ UI显示友好的错误提示
- ✅ 应用不会崩溃

---

## 📡 API端点详解

### 认证接口

#### 登录 (POST /api/login)

**请求：**
```json
{
  "username": "test_user",
  "password": "123456"
}
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "code": 200
  }
}
```

**错误响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "error": "用户名或密码错误"
  }
}
```

---

### 用户管理接口

#### 获取用户列表 (GET /api/users)

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "role": "Admin",
        "status": "Active"
      }
    ],
    "total": 5
  }
}
```

#### 获取单个用户 (GET /api/users/:id)

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "Admin",
    "status": "Active"
  }
}
```

#### 创建用户 (POST /api/users)

**请求体：**
```json
{
  "name": "New User",
  "email": "new@example.com",
  "role": "User",
  "status": "Active"
}
```

**响应：**
```json
{
  "code": 201,
  "message": "user created successfully",
  "data": {
    "id": 6,
    "name": "New User",
    "email": "new@example.com",
    "role": "User",
    "status": "Active"
  }
}
```

#### 更新用户 (PUT /api/users/:id)

**请求体：**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "Admin",
  "status": "Inactive"
}
```

#### 删除用户 (DELETE /api/users/:id)

**响应：**
```json
{
  "code": 200,
  "message": "user deleted successfully"
}
```

---

### 其他接口

#### 获取仪表板数据 (GET /api/dashboard)
- 返回统计信息、趋势数据、AI模型信息

#### 获取服务列表 (GET /api/services)
- 返回可用的AI服务列表

#### 获取工单列表 (GET /api/tickets)
- 返回支持工单列表

#### 获取Token使用数据 (GET /api/token-usage)
- 返回各模型的Token使用统计

#### 健康检查 (GET /api/test)
- 返回 `"hello world"` 表示服务正常

---

## ❓ 常见问题

### Q1：登录时提示"用户名或密码错误"

**原因：** 测试账号不存在或密码错误

**解决方案：**
1. 确认已按照[初始化测试账号](#初始化测试账号)部分创建账号
2. 检查数据库是否正确初始化
3. 查看Mock服务器日志（Debug模式）

```bash
# 查看是否有错误日志
cd fast_gin && ./run.sh dev
# 观察是否有错误信息
```

---

### Q2：Token添加失败，API请求返回"未授权"

**原因：** Token未正确保存或过期

**解决方案：**
1. 打开DevTools检查localStorage
   ```
   应该包含：token 和 user
   ```

2. 确认请求头中有Authorization
   ```
   Authorization: Bearer {token}
   ```

3. 检查axios拦截器是否正常工作

---

### Q3：刷新页面后自动重定向到登录页

**原因：** Redux Persist未正确恢复state

**解决方案：**
1. 检查localStorage中是否有 `persist:root`
2. 验证Redux配置中auth已添加到whitelist
3. 查看浏览器Console是否有错误

---

### Q4：CORS错误

**原因：** 后端CORS配置不正确

**解决方案：**
1. 确认Mock服务器已启动
2. 检查axios的baseURL配置
3. 查看Mock服务器是否有CORS中间件

```go
// fast_gin/gins/router.go 中应有CORS配置
func corsMiddleware() gin.HandlerFunc {
    // ... 代码 ...
}
```

---

### Q5：API请求超时

**原因：** 网络连接问题或服务器无响应

**解决方案：**
1. 确认Mock服务器仍在运行
   ```bash
   # 测试连通性
   curl http://localhost:8080/api/test
   # 应返回 "hello world"
   ```

2. 检查防火墙设置

3. 查看axios超时配置（默认10秒）

---

### Q6：如何修改测试账号密码？

**由于使用SQLite，需要直接修改数据库**

方法1：删除数据库文件重新初始化
```bash
cd fast_gin
rm -f test.db
# 重启服务器，重新创建账号
./run.sh dev
```

方法2：使用SQL工具编辑
```bash
# 安装sqlite3
sqlite3 test.db

# 查看用户
SELECT * FROM users;

# 更新密码（需要重新加密，不推荐）
UPDATE users SET password = 'new_hash' WHERE username = 'test_user';
```

---

### Q7：如何添加新的API端点？

**前端步骤：**

1. 在 `src/api/apiService.ts` 中添加方法
   ```typescript
   async myNewEndpoint(param: any): Promise<ApiResponse<MyData>> {
     return axiosInstance.post('/api/my-endpoint', param);
   }
   ```

2. 在组件中使用
   ```typescript
   const result = await apiService.myNewEndpoint(data);
   ```

**后端步骤（Mock服务器）：**

1. 在 `fast_gin/gins/apiController.go` 中添加处理函数
   ```go
   func MyNewEndpoint(c *gin.Context) {
     // 处理逻辑
     c.JSON(http.StatusOK, models.Response{
       Code:    200,
       Message: "success",
       Data:    result,
     })
   }
   ```

2. 在 `fast_gin/gins/router.go` 中注册路由
   ```go
   r.POST("/api/my-endpoint", MyNewEndpoint)
   ```

3. 重新编译并启动
   ```bash
   cd fast_gin
   go build -o mock-server
   ./run.sh dev
   ```

---

## 📊 测试结果记录

使用以下模板记录测试结果：

```markdown
# 测试执行报告

## 日期
2025-12-05

## 测试环境
- Node版本: 18.16.0
- Go版本: 1.20.0
- 浏览器: Chrome 120.0

## 测试项目和结果

### 基础功能
- [ ] Axios实例正确创建
- [ ] API_BASE_URL正确设置
- [ ] 请求和响应拦截器正确工作

### 认证功能
- [ ] 登录页面正确呈现
- [ ] 登录表单验证工作
- [ ] 登录请求成功
- [ ] Token保存到localStorage

### 路由保护
- [ ] ProtectedRoute组件工作
- [ ] 未认证时显示加载器
- [ ] 未认证时重定向到登录

### API集成
- [ ] 健康检查通过
- [ ] 用户列表获取成功
- [ ] 创建用户功能正常
- [ ] 更新用户功能正常
- [ ] 删除用户功能正常

### 错误处理
- [ ] 401错误自动跳转到登录页
- [ ] 404错误显示正确信息
- [ ] 网络错误显示连接失败

## 总体评分
Pass / Fail

## 问题备注
（记录发现的任何问题或改进建议）
```

---

## ✅ 测试清单

在开始完整测试前，确保以下所有项都已准备：

- [ ] Mock服务器已启动并运行在 http://localhost:8080
- [ ] 前端开发服务器已启动在 http://localhost:5173
- [ ] 至少创建了一个测试账号
- [ ] 浏览器DevTools已打开
- [ ] 所有localStorage和Cookies已清除

---

## 🎯 快速测试流程（5分钟）

如果只想快速验证基本功能，按以下步骤进行：

1. **启动服务器** (2分钟)
   ```bash
   # Terminal 1: Mock服务器
   cd fast_gin && ./run.sh dev

   # Terminal 2: 前端
   npm run dev
   ```

2. **创建测试账号** (自动完成)
   - 初始化脚本自动创建：test_user / 123456

3. **测试登录** (1分钟)
   - 访问 http://localhost:5173/login
   - 输入 test_user / 123456
   - 验证重定向到 /dashboard

4. **验证Token** (1分钟)
   - 打开DevTools
   - 检查localStorage中有token
   - Network标签查看Authorization header

5. **测试路由保护** (1分钟)
   - 清除localStorage
   - 访问 /dashboard
   - 验证重定向回 /login

---

## 📞 获取帮助

- 查看 AXIOS_INTEGRATION_GUIDE.md 了解API使用
- 查看 AXIOS_TEST_GUIDE.md 了解详细测试步骤
- 查看 INTEGRATION_SUMMARY.md 了解整体架构

---

**最后更新：** 2025年12月 | **版本：** 1.0
