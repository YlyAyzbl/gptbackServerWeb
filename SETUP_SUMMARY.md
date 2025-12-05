# Mock服务器集成总结

本文档总结了为React前端项目集成Mock API服务器所做的所有更改。

## 项目目标

1. ✅ 查看当前前端页面所需的API
2. ✅ 修改fast_gin服务端来充当mock服务器
3. ✅ 使用zap日志库，根据实际情况设置输出日志的level等级
4. ✅ 将前端配置为指向本地mock服务器

## 概览

### 前端分析

通过对前端代码的分析，我们确定了以下所需的API端点：

| 功能模块 | 所需API | 方法 | 说明 |
|---------|--------|------|------|
| 仪表板 | `/api/dashboard` | GET | 获取统计数据、趋势数据、模型信息 |
| 用户管理 | `/api/users` | GET | 获取用户列表 |
| | `/api/users/:id` | GET | 获取单个用户 |
| | `/api/users` | POST | 创建用户 |
| | `/api/users/:id` | PUT | 更新用户 |
| | `/api/users/:id` | DELETE | 删除用户 |
| 服务 | `/api/services` | GET | 获取服务列表 |
| 工单 | `/api/tickets` | GET | 获取支持工单列表 |
| Token | `/api/token-usage` | GET | 获取Token使用数据 |
| 认证 | `/api/login` | POST | 用户登录 |

---

## 后端更改 (fast_gin)

### 新增文件

#### 1. **models/models.go**
定义了所有API的数据模型：
- `DashboardStat` - 仪表板统计项
- `TrendData` - 趋势数据
- `DashboardResponse` - 仪表板响应
- `AIModel` - AI模型信息
- `User` - 用户数据
- `Service` - 服务数据
- `SupportTicket` - 工单数据
- `TokenUsage` - Token使用数据
- `Response` - 统一响应格式

**位置：** `/fast_gin/models/models.go`

#### 2. **services/dataService.go**
业务逻辑和数据服务层：
- 用户数据的CRUD操作（内存存储）
- 获取仪表板数据
- 获取服务列表
- 获取工单列表
- 获取Token使用数据

**关键函数：**
- `GetDashboardData()` - 获取仪表板数据
- `GetUsers()` / `GetUserByID()` / `CreateUser()` / `UpdateUser()` / `DeleteUser()` - 用户管理
- `GetServices()` - 获取服务列表
- `GetSupportTickets()` - 获取工单列表
- `GetTokenUsage()` - 获取Token使用数据

**位置：** `/fast_gin/services/dataService.go`

#### 3. **gins/apiController.go**
API请求处理器（控制层）：
- 仪表板处理器 - `GetDashboardData()`
- 用户相关处理器 - `GetUsers()`, `GetUser()`, `CreateUser()`, `UpdateUser()`, `DeleteUser()`
- 服务处理器 - `GetServices()`
- 工单处理器 - `GetSupportTickets()`
- Token处理器 - `GetTokenUsage()`

每个处理器包含：
- 完整的日志记录
- 错误处理
- JSON响应

**位置：** `/fast_gin/gins/apiController.go`

### 修改的文件

#### 1. **gins/router.go**
主要修改：
- 添加了CORS中间件，允许跨域请求
- 定义了所有新增的API路由
- 为所有请求添加日志记录

**新增路由：**
```
GET  /api/dashboard
GET  /api/users
GET  /api/users/:id
POST /api/users
PUT  /api/users/:id
DELETE /api/users/:id
GET  /api/services
GET  /api/tickets
GET  /api/token-usage
```

#### 2. **core/logger.go**
添加了灵活的日志级别配置：

**新增函数：**
- `InitLogWithModeAndLevel(mode, level)` - 根据模式和级别初始化日志
- `InitLogWithLevel(level)` - 仅指定日志级别
- `InitDevLogWithLevel(level)` - 开发模式指定级别
- `InitProdLogWithLevel(level)` - 生产模式指定级别

**日志级别（从低到高）：**
1. `DebugLevel` - 调试日志
2. `InfoLevel` - 信息日志
3. `WarnLevel` - 警告日志
4. `ErrorLevel` - 错误日志

#### 3. **main.go**
实现了环境变量配置的日志初始化：

**支持的环境变量：**
- `APP_MODE` - 应用模式（`development` 或 `production`）
- `LOG_LEVEL` - 日志级别（`debug`, `info`, `warn`, `error`）

**启动信息记录：**
- 应用启动时输出配置信息
- 服务器启动时输出地址信息
- 完整的错误处理和日志记录

---

## 前端更改

### 修改的文件

#### 1. **src/global/config.ts**
更新了API配置：
```typescript
// 原始配置（硬编码）
export const API_BASE_URL = 'https://api.example.com';

// 新配置（支持环境变量）
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

### 新增文件

#### 1. **.env.development**
开发环境配置：
```
VITE_API_URL=http://localhost:8080
VITE_APP_MODE=development
```

#### 2. **.env.production**
生产环境配置：
```
VITE_API_URL=https://api.example.com
VITE_APP_MODE=production
```

---

## 启动脚本

### Unix/Linux/Mac

**文件：** `fast_gin/run.sh`

**使用方法：**
```bash
# 开发模式（详细日志）
./run.sh dev

# 生产模式
./run.sh prod

# 安静模式（仅错误）
./run.sh quiet

# 默认（开发模式）
./run.sh
```

### Windows

**文件：** `fast_gin/run.bat`

**使用方法：**
```cmd
REM 开发模式
run.bat dev

REM 生产模式
run.bat prod

REM 安静模式
run.bat quiet
```

---

## 文档

### 1. **MOCK_SERVER_GUIDE.md**
完整的Mock服务器使用指南，包括：
- 功能概述
- 启动方法
- 日志配置
- 前端集成
- 使用示例
- curl测试命令
- 常见问题解决

---

## 快速开始指南

### 步骤1：启动Mock服务器

```bash
cd fast_gin

# 方式1：使用启动脚本
./run.sh dev

# 方式2：直接运行编译后的二进制
./mock-server

# 方式3：直接运行Go代码
go run main.go
```

### 步骤2：启动前端开发服务器

```bash
# 在项目根目录
npm run dev
```

### 步骤3：访问应用

打开浏览器访问：`http://localhost:5173`

前端会自动连接到 `http://localhost:8080` 的Mock服务器。

---

## 日志配置示例

### 开发环境（详细日志）
```bash
export APP_MODE=development
export LOG_LEVEL=debug
./mock-server
```

输出示例：
```
[myApp] 2024-12-05 20:15:30	INFO	应用启动	{"mode": "development", ...}
[myApp] 2024-12-05 20:15:30	INFO	服务器启动	{"address": "0.0.0.0:8080"}
[myApp] 2024-12-05 20:15:35	DEBUG	获取仪表板数据	{"endpoint": "/api/dashboard"}
```

### 生产环境（仅信息和错误）
```bash
export APP_MODE=production
export LOG_LEVEL=info
./mock-server
```

### 安静模式（仅错误）
```bash
export LOG_LEVEL=error
./mock-server
```

---

## 项目结构说明

```
react-me-mui-vite/
├── fast_gin/                    # Mock API服务器
│   ├── main.go                  # 应用入口
│   ├── config.yaml              # 服务器配置
│   ├── mock-server              # 编译后的二进制文件
│   ├── run.sh                   # Unix启动脚本
│   ├── run.bat                  # Windows启动脚本
│   ├── core/
│   │   ├── config.go            # 配置管理
│   │   └── logger.go            # 日志系统（已增强）
│   ├── models/
│   │   └── models.go            # 数据模型（新增）
│   ├── services/
│   │   └── dataService.go       # 业务逻辑（新增）
│   ├── gins/
│   │   ├── router.go            # 路由定义（已更新）
│   │   ├── apiController.go     # API处理器（新增）
│   │   └── auth.go              # 认证处理
│   └── ...
├── src/
│   ├── global/
│   │   └── config.ts            # 前端配置（已更新）
│   ├── pages/                   # 页面组件
│   └── ...
├── .env.development             # 开发环境配置（新增）
├── .env.production              # 生产环境配置（新增）
├── MOCK_SERVER_GUIDE.md         # Mock服务器完整指南
├── SETUP_SUMMARY.md             # 本文档
└── ...
```

---

## 技术栈

### 后端（Mock服务器）
- **Go 1.23+** - 编程语言
- **Gin Web Framework** - Web框架
- **Zap** - 日志库（已集成）
- **YAML** - 配置格式
- **SQLite** - 数据库（可选）

### 前端
- **React 18+** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Material-UI** - 组件库
- **Tailwind CSS** - 样式框架

---

## API请求示例

### 使用curl测试API

**获取仪表板数据：**
```bash
curl http://localhost:8080/api/dashboard
```

**获取用户列表：**
```bash
curl http://localhost:8080/api/users
```

**获取单个用户：**
```bash
curl http://localhost:8080/api/users/1
```

**创建用户：**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "status": "Active"
  }'
```

**更新用户：**
```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Admin",
    "status": "Active"
  }'
```

**删除用户：**
```bash
curl -X DELETE http://localhost:8080/api/users/1
```

**获取服务列表：**
```bash
curl http://localhost:8080/api/services
```

**获取工单列表：**
```bash
curl http://localhost:8080/api/tickets
```

**获取Token使用数据：**
```bash
curl http://localhost:8080/api/token-usage
```

---

## 关键特性

### 1. 完整的CRUD操作
- 用户数据支持创建、读取、更新、删除操作
- 内存存储，重启后数据重置（可集成数据库）

### 2. 灵活的日志系统
- 支持四个日志级别（Debug、Info、Warn、Error）
- 可通过环境变量动态配置
- 按日期自动分类保存日志文件
- 开发模式彩色输出，生产模式JSON格式

### 3. CORS支持
- 允许跨域请求
- 支持所有HTTP方法
- 自动处理OPTIONS预检请求

### 4. 统一的响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {...}
}
```

### 5. 完整的错误处理
- 参数验证
- 资源不存在处理
- 详细的日志记录

---

## 下一步建议

1. **数据持久化** - 将数据从内存迁移到SQLite数据库
2. **认证实现** - 完善JWT认证机制
3. **请求验证** - 添加更详细的参数验证
4. **单元测试** - 为所有API端点添加单元测试
5. **API文档** - 使用Swagger/OpenAPI生成API文档
6. **性能优化** - 添加缓存、限流等中间件
7. **部署** - 将mock服务器部署到测试环境

---

## 常见问题

### Q: 如何修改API端口？
A: 编辑 `fast_gin/config.yaml`：
```yaml
server:
  port: "9000"
  host: "0.0.0.0"
```

### Q: 如何集成真实数据库？
A: SQLite已在 `sqlite/` 目录中配置，可以在 `services/dataService.go` 中集成。

### Q: 日志文件保存在哪里？
A: 日志按日期保存在 `logs/YYYY-MM-DD/` 目录中。

### Q: 如何在生产环境切换到真实API？
A: 修改 `.env.production` 中的 `VITE_API_URL` 指向实际的API服务器。

---

## 测试检查清单

- [ ] Mock服务器能否正常启动
- [ ] 前端能否连接到Mock服务器
- [ ] 仪表板页面能否加载数据
- [ ] 用户管理页面的CRUD操作是否正常
- [ ] 日志输出是否正确
- [ ] 不同日志级别配置是否生效
- [ ] CORS跨域请求是否正常
- [ ] 错误处理是否完善

---

## 文件变更统计

### 新增文件
- `fast_gin/models/models.go` - 数据模型定义
- `fast_gin/services/dataService.go` - 业务逻辑层
- `fast_gin/gins/apiController.go` - API处理器
- `fast_gin/run.sh` - Unix启动脚本
- `fast_gin/run.bat` - Windows启动脚本
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `MOCK_SERVER_GUIDE.md` - 完整指南
- `SETUP_SUMMARY.md` - 本文档

### 修改文件
- `fast_gin/main.go` - 添加环境变量配置的日志初始化
- `fast_gin/core/logger.go` - 增强日志系统，支持灵活的日志级别配置
- `fast_gin/gins/router.go` - 添加CORS中间件和新的API路由
- `src/global/config.ts` - 支持环境变量配置API地址

---

## 总结

本次集成工作已完成以下目标：

1. ✅ **前端API需求分析** - 确定了所有前端页面所需的API端点
2. ✅ **Mock服务器开发** - 实现了完整的API端点和业务逻辑
3. ✅ **日志系统增强** - 支持灵活的日志级别配置
4. ✅ **前端集成配置** - 配置前端指向本地mock服务器
5. ✅ **文档和脚本** - 提供了完整的使用指南和启动脚本

现在可以直接运行Mock服务器和前端应用进行开发和测试了！
