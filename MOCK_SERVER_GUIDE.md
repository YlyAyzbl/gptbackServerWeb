# Mock服务器指南

本项目集成了一个基于Go Gin框架的Mock服务器，用于前端开发和测试。

## 功能概述

Mock服务器（fast_gin）提供了以下API端点：

### 仪表板接口
- `GET /api/dashboard` - 获取仪表板数据（统计信息、趋势数据、模型数据）

### 用户管理接口
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取单个用户
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 服务接口
- `GET /api/services` - 获取服务列表

### 工单接口
- `GET /api/tickets` - 获取支持工单列表

### Token使用接口
- `GET /api/token-usage` - 获取Token使用数据

### 认证接口
- `POST /api/login` - 用户登录

## 启动Mock服务器

### 方法1：使用编译后的二进制文件
```bash
cd fast_gin
./mock-server
```

### 方法2：直接运行Go代码
```bash
cd fast_gin
go run main.go
```

### 方法3：重新编译
```bash
cd fast_gin
go build -o mock-server main.go
./mock-server
```

**默认配置：**
- 服务器地址：`0.0.0.0:8080`
- 访问URL：`http://localhost:8080`

## 日志配置

Mock服务器使用zap日志库，支持通过环境变量灵活配置日志级别。

### 日志级别（从低到高）
1. **DebugLevel** - 调试级别，输出所有日志信息
2. **InfoLevel** - 信息级别，输出正常运行信息
3. **WarnLevel** - 警告级别，输出警告和错误信息
4. **ErrorLevel** - 错误级别，仅输出错误和严重错误

### 配置方式

#### 环境变量配置

**开发模式（DebugLevel）：**
```bash
export APP_MODE=development
export LOG_LEVEL=debug
./mock-server
```

**生产模式（InfoLevel）：**
```bash
export APP_MODE=production
export LOG_LEVEL=info
./mock-server
```

**仅显示警告和错误：**
```bash
export LOG_LEVEL=warn
./mock-server
```

**仅显示错误：**
```bash
export LOG_LEVEL=error
./mock-server
```

#### 快速启动命令

```bash
# 开发环境（详细日志）
APP_MODE=development LOG_LEVEL=debug ./mock-server

# 生产环境（仅信息和错误）
APP_MODE=production LOG_LEVEL=info ./mock-server

# 安静模式（仅错误）
LOG_LEVEL=error ./mock-server
```

## 前端配置

前端项目已配置为自动连接到本地Mock服务器：

### 环境配置文件

**开发环境 (.env.development)**
```
VITE_API_URL=http://localhost:8080
VITE_APP_MODE=development
```

**生产环境 (.env.production)**
```
VITE_API_URL=https://api.example.com
VITE_APP_MODE=production
```

### API基础URL

前端通过以下方式获取API基础URL（优先级从高到低）：
1. 环境变量 `VITE_API_URL`（推荐）
2. 默认值 `http://localhost:8080`

在 `src/global/config.ts` 中定义：
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

## 日志文件位置

日志文件会按日期自动分类保存到 `logs/` 目录：
```
logs/
├── 2024-12-05/
│   ├── out.log    # 所有日志
│   └── err.log    # 错误日志
├── 2024-12-06/
│   ├── out.log
│   └── err.log
└── ...
```

## 项目结构

```
fast_gin/
├── main.go                 # 应用主文件
├── config.yaml             # 服务器配置
├── core/
│   ├── config.go          # 配置读取
│   └── logger.go          # 日志初始化（支持灵活的级别设置）
├── flags/
│   └── ...                # 命令行参数
├── gins/
│   ├── router.go          # 路由定义（含CORS中间件）
│   ├── apiController.go   # API处理器（新增）
│   ├── userController.go  # 用户相关处理器
│   └── auth.go            # 认证处理器
├── models/
│   └── models.go          # 数据模型定义（新增）
├── services/
│   └── dataService.go     # 数据服务层（新增）
├── sqlite/
│   └── ...                # SQLite相关
├── utils/
│   └── ...                # 工具函数
└── mock-server            # 编译后的二进制文件
```

## 使用示例

### 1. 启动Mock服务器
```bash
cd fast_gin
APP_MODE=development LOG_LEVEL=debug ./mock-server
```

### 2. 启动前端开发服务器
```bash
npm run dev
```

### 3. 在浏览器中访问
```
http://localhost:5173
```

前端会自动连接到 `http://localhost:8080` 的Mock服务器。

### 4. 测试API（使用curl）

**获取仪表板数据：**
```bash
curl http://localhost:8080/api/dashboard
```

**获取用户列表：**
```bash
curl http://localhost:8080/api/users
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

## 日志输出示例

### 开发模式日志
```
[myApp] 2024-12-05 20:15:30.123	INFO	应用启动	{"mode": "development", "log_level": "debug", "server_host": "0.0.0.0", "server_port": "8080"}
[myApp] 2024-12-05 20:15:30.456	INFO	服务器启动	{"address": "0.0.0.0:8080"}
[myApp] 2024-12-05 20:15:35.789	DEBUG	获取仪表板数据	{"endpoint": "/api/dashboard"}
```

### 生产模式日志
```json
{"level":"info","ts":1733412930.123,"caller":"main/main.go:55","msg":"应用启动","mode":"production","log_level":"info","server_host":"0.0.0.0","server_port":"8080"}
{"level":"info","ts":1733412930.456,"caller":"main/main.go:76","msg":"服务器启动","address":"0.0.0.0:8080"}
```

## 常见问题

### Q: 前端无法连接到Mock服务器？
A: 确保：
1. Mock服务器已启动（`./mock-server`）
2. 确认服务器地址和端口正确（默认 `http://localhost:8080`）
3. 检查浏览器控制台是否有CORS错误
4. 确保 `.env.development` 中的 `VITE_API_URL` 配置正确

### Q: 如何修改服务器监听端口？
A: 编辑 `fast_gin/config.yaml`：
```yaml
server:
  port: "9000"  # 更改为所需端口
  host: "0.0.0.0"
```
然后重新启动服务器。

### Q: 如何调整日志输出？
A: 使用环境变量 `LOG_LEVEL`：
```bash
LOG_LEVEL=info ./mock-server    # 仅显示信息和错误
LOG_LEVEL=error ./mock-server   # 仅显示错误
```

### Q: 如何在生产环境中使用实际API？
A: 编辑 `.env.production`：
```
VITE_API_URL=https://your-api-server.com
```
然后使用生产环境变量构建：
```bash
VITE_API_URL=https://your-api-server.com npm run build
```

## 新增功能说明

### 1. 完整的API端点 (apiController.go)
- 实现了所有前端页面所需的API端点
- 统一的JSON响应格式
- 完整的错误处理和日志记录

### 2. 数据服务层 (dataService.go)
- 内存中的用户数据管理
- 完整的CRUD操作
- 模拟的业务逻辑

### 3. 灵活的日志系统 (logger.go)
- 支持开发/生产两种模式
- 支持多个日志级别（Debug、Info、Warn、Error）
- 可通过环境变量动态配置
- 按日期自动分类保存日志文件

### 4. CORS支持 (router.go)
- 前端可跨域访问API
- 支持所有HTTP方法（GET、POST、PUT、DELETE等）
- 自动处理OPTIONS预检请求

### 5. 环境配置文件
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- 自动加载对应的环境变量

## 依赖项

- **Gin Web Framework** - Web框架
- **Zap Logger** - 日志库（已集成）
- **YAML** - 配置文件格式
- **Go 1.23+** - Go语言版本

所有依赖已在 `go.mod` 中定义，运行 `go build` 或 `go run` 时自动下载。

## 下一步

1. 根据实际需求修改 `services/dataService.go` 中的模拟数据
2. 添加更多API端点和处理器
3. 集成实际的数据库（SQLite已配置）
4. 部署到生产环境

## 许可证

本项目遵循原项目许可证。
