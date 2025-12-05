# Mock服务器集成验证清单

使用本清单验证所有功能是否正确集成。

## 前置要求

- [ ] Go 1.23+ 已安装
- [ ] Node.js 16+ 已安装
- [ ] npm 或 yarn 已安装
- [ ] 项目依赖已安装（`npm install`）

---

## 1. Mock服务器验证

### 1.1 编译验证

```bash
cd fast_gin
go build -o mock-server main.go
ls -lh mock-server
```

**验证项：**
- [ ] `mock-server` 文件存在
- [ ] 文件大小 > 20MB
- [ ] 文件可执行权限正确

### 1.2 启动验证 - 开发模式

```bash
cd fast_gin
export APP_MODE=development
export LOG_LEVEL=debug
./mock-server
```

**应看到的输出：**
```
[myApp] YYYY-MM-DD HH:MM:SS    INFO    应用启动    {"mode": "development", "log_level": "debug", ...}
[myApp] YYYY-MM-DD HH:MM:SS    INFO    服务器启动    {"address": "0.0.0.0:8080"}
```

**验证项：**
- [ ] 应用启动信息输出正确
- [ ] 日志级别显示为 "debug"
- [ ] 服务器地址为 "0.0.0.0:8080"
- [ ] 没有错误或异常

### 1.3 启动验证 - 生产模式

```bash
export APP_MODE=production
export LOG_LEVEL=info
./mock-server
```

**应看到的输出（JSON格式）：**
```json
{"level":"info","ts":1733412930.123,"caller":"main/main.go:55","msg":"应用启动",...}
```

**验证项：**
- [ ] 日志输出为JSON格式
- [ ] 日志级别显示为 "info"
- [ ] 应用成功启动

### 1.4 日志级别验证

测试各个日志级别：

```bash
# 仅调试日志
export LOG_LEVEL=debug && ./mock-server

# 仅信息日志
export LOG_LEVEL=info && ./mock-server

# 仅警告和错误
export LOG_LEVEL=warn && ./mock-server

# 仅错误
export LOG_LEVEL=error && ./mock-server
```

**验证项：**
- [ ] DEBUG 模式输出最详细
- [ ] INFO 模式不包含DEBUG日志
- [ ] WARN 模式不包含DEBUG和INFO日志
- [ ] ERROR 模式仅输出错误

---

## 2. API端点验证

在Mock服务器运行的状态下，在另一个终端执行以下命令：

### 2.1 健康检查

```bash
curl http://localhost:8080/api/test
```

**预期输出：**
```
hello world
```

**验证项：**
- [ ] 响应为 "hello world"
- [ ] HTTP状态码为 200

### 2.2 仪表板API

```bash
curl http://localhost:8080/api/dashboard | jq
```

**验证项：**
- [ ] 响应包含 "code": 200
- [ ] 响应包含 "stats" 数组（4项）
- [ ] 响应包含 "trendData" 数组（7项）
- [ ] 响应包含 "models" 数组（4项）

### 2.3 用户管理API

**获取用户列表：**
```bash
curl http://localhost:8080/api/users | jq
```

**验证项：**
- [ ] 响应包含 "code": 200
- [ ] "users" 数组包含5个用户
- [ ] 每个用户有 id, name, email, role, status 字段

**获取单个用户：**
```bash
curl http://localhost:8080/api/users/1 | jq
```

**验证项：**
- [ ] 返回ID为1的用户
- [ ] 用户名为 "Alice Johnson"

**创建用户：**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "role": "User",
    "status": "Active"
  }' | jq
```

**验证项：**
- [ ] 响应 "code": 201
- [ ] 返回新创建的用户
- [ ] 用户ID自动递增

**更新用户：**
```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Updated",
    "email": "alice.updated@example.com",
    "role": "Admin",
    "status": "Inactive"
  }' | jq
```

**验证项：**
- [ ] 响应 "code": 200
- [ ] 用户信息已更新

**删除用户：**
```bash
curl -X DELETE http://localhost:8080/api/users/1 | jq
```

**验证项：**
- [ ] 响应 "code": 200
- [ ] 返回删除成功消息

### 2.4 服务API

```bash
curl http://localhost:8080/api/services | jq
```

**验证项：**
- [ ] 响应包含 "code": 200
- [ ] "services" 数组包含4个服务

### 2.5 工单API

```bash
curl http://localhost:8080/api/tickets | jq
```

**验证项：**
- [ ] 响应包含 "code": 200
- [ ] "tickets" 数组包含3个工单

### 2.6 Token使用API

```bash
curl http://localhost:8080/api/token-usage | jq
```

**验证项：**
- [ ] 响应包含 "code": 200
- [ ] "data" 数组包含4个token使用记录

---

## 3. CORS验证

使用浏览器开发者工具验证CORS：

```javascript
// 在浏览器控制台执行
fetch('http://localhost:8080/api/dashboard')
  .then(r => r.json())
  .then(d => console.log(d))
```

**验证项：**
- [ ] 没有CORS错误
- [ ] 成功获取数据
- [ ] 响应头包含 "Access-Control-Allow-Origin: *"

---

## 4. 前端配置验证

### 4.1 环境变量验证

```bash
# 检查 .env.development
cat .env.development
```

**应包含：**
```
VITE_API_URL=http://localhost:8080
VITE_APP_MODE=development
```

**验证项：**
- [ ] .env.development 文件存在
- [ ] VITE_API_URL 设置为 http://localhost:8080

### 4.2 全局配置验证

```bash
# 检查 src/global/config.ts
cat src/global/config.ts | grep API_BASE_URL
```

**应包含：**
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

**验证项：**
- [ ] 配置支持环境变量
- [ ] 默认值为 http://localhost:8080

---

## 5. 端到端集成验证

### 5.1 启动服务

**终端1 - 启动Mock服务器：**
```bash
cd fast_gin
./run.sh dev
```

**应看到：**
```
启动Mock服务器...
模式: dev
日志级别: DEBUG
访问地址: http://localhost:8080
按 Ctrl+C 停止服务器
[myApp] ... INFO 应用启动 ...
[myApp] ... INFO 服务器启动 ...
```

**验证项：**
- [ ] 服务器成功启动
- [ ] 日志输出正确

### 5.2 启动前端

**终端2 - 启动前端开发服务器：**
```bash
npm run dev
```

**应看到：**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

**验证项：**
- [ ] 前端服务器成功启动
- [ ] 监听在 http://localhost:5173

### 5.3 浏览器访问

打开浏览器访问：`http://localhost:5173`

**验证项：**
- [ ] 页面加载成功
- [ ] 没有网络错误
- [ ] 浏览器控制台没有CORS错误

### 5.4 数据加载验证

检查浏览器开发者工具 - 网络标签页：

**验证项：**
- [ ] `/api/dashboard` 请求返回200
- [ ] `/api/users` 请求返回200
- [ ] `/api/services` 请求返回200
- [ ] `/api/tickets` 请求返回200
- [ ] `/api/token-usage` 请求返回200

---

## 6. 功能验证

### 6.1 仪表板页面

访问 `http://localhost:5173/dashboard`

**验证项：**
- [ ] 页面加载成功
- [ ] 显示4个统计卡片（Total Requests, Total Tokens, Error Rate, Active Users）
- [ ] 显示趋势图表
- [ ] 显示模型饼图

### 6.2 用户管理页面

访问 `http://localhost:5173/users`

**验证项：**
- [ ] 用户列表加载成功
- [ ] 显示5个用户
- [ ] 可以创建新用户
- [ ] 可以编辑用户信息
- [ ] 可以删除用户

### 6.3 服务页面

访问 `http://localhost:5173/services`

**验证项：**
- [ ] 页面加载成功
- [ ] 显示4个服务
- [ ] 显示每个服务的状态和运行时间

### 6.4 支持页面

访问 `http://localhost:5173/support`

**验证项：**
- [ ] 页面加载成功
- [ ] 显示3个工单

### 6.5 Token使用页面

访问 `http://localhost:5173/ai-tokens`

**验证项：**
- [ ] 页面加载成功
- [ ] 显示Token分布饼图

---

## 7. 日志验证

### 7.1 查看日志文件

```bash
ls -la logs/
ls -la logs/$(date +%Y-%m-%d)/
cat logs/$(date +%Y-%m-%d)/out.log
```

**验证项：**
- [ ] logs 目录存在
- [ ] 当前日期目录存在
- [ ] out.log 文件存在
- [ ] 日志内容包含应用启动信息

### 7.2 错误日志验证

```bash
cat logs/$(date +%Y-%m-%d)/err.log
```

**验证项：**
- [ ] err.log 文件存在（可能为空，如无错误）
- [ ] 错误信息格式正确

---

## 8. 脚本验证

### 8.1 启动脚本验证（Unix/Linux/Mac）

```bash
cd fast_gin

# 测试开发模式脚本
./run.sh dev

# 测试生产模式脚本
./run.sh prod

# 测试安静模式脚本
./run.sh quiet
```

**验证项：**
- [ ] 脚本可执行
- [ ] 各模式正确启动服务器
- [ ] 日志级别设置正确

### 8.2 启动脚本验证（Windows）

```cmd
cd fast_gin

REM 测试开发模式脚本
run.bat dev

REM 测试生产模式脚本
run.bat prod

REM 测试安静模式脚本
run.bat quiet
```

**验证项：**
- [ ] 脚本能够执行
- [ ] 各模式正确启动服务器

---

## 9. 文档验证

### 9.1 检查文档文件

```bash
ls -la MOCK_SERVER_GUIDE.md SETUP_SUMMARY.md VERIFICATION_CHECKLIST.md
```

**验证项：**
- [ ] MOCK_SERVER_GUIDE.md 存在
- [ ] SETUP_SUMMARY.md 存在
- [ ] VERIFICATION_CHECKLIST.md 存在

### 9.2 文档内容验证

- [ ] MOCK_SERVER_GUIDE.md 包含完整的使用指南
- [ ] SETUP_SUMMARY.md 包含所有变更摘要
- [ ] VERIFICATION_CHECKLIST.md 包含本验证清单

---

## 10. 性能验证

### 10.1 启动时间

启动Mock服务器并记录启动时间：

```bash
time ./mock-server
```

**验证项：**
- [ ] 启动时间 < 1秒
- [ ] 没有明显的性能问题

### 10.2 响应时间

使用curl测试API响应时间：

```bash
time curl http://localhost:8080/api/dashboard > /dev/null
```

**验证项：**
- [ ] API响应时间 < 100ms
- [ ] 响应速度良好

---

## 11. 错误处理验证

### 11.1 404错误

```bash
curl http://localhost:8080/api/nonexistent
```

**验证项：**
- [ ] 返回404状态码
- [ ] 返回随机UUID作为错误ID

### 11.2 无效参数

```bash
curl http://localhost:8080/api/users/invalid
```

**验证项：**
- [ ] 返回400状态码
- [ ] 返回 "invalid user id" 错误信息

### 11.3 不存在的资源

```bash
curl http://localhost:8080/api/users/999
```

**验证项：**
- [ ] 返回404状态码
- [ ] 返回 "user not found" 错误信息

---

## 总体验证总结

**完成情况：**

| 项目 | 状态 | 备注 |
|------|------|------|
| Mock服务器编译 | ✅/❌ | |
| 开发模式日志 | ✅/❌ | |
| 生产模式日志 | ✅/❌ | |
| API端点 (10个) | ✅/❌ | |
| CORS支持 | ✅/❌ | |
| 前端配置 | ✅/❌ | |
| 端到端集成 | ✅/❌ | |
| 日志文件 | ✅/❌ | |
| 启动脚本 | ✅/❌ | |
| 文档完整 | ✅/❌ | |

---

## 故障排除

如果验证过程中遇到问题，请参考：
- `MOCK_SERVER_GUIDE.md` - 常见问题解决
- `SETUP_SUMMARY.md` - 项目结构和配置说明
- Go编译错误 - 检查Go版本 `go version`
- 端口被占用 - 修改 `config.yaml` 中的端口
- 前端连接错误 - 检查 `.env.development` 配置

---

**验证完成日期：** ____________________

**验证人员：** ____________________

**总体结论：** ✅ 通过 / ❌ 未通过

**备注：**
