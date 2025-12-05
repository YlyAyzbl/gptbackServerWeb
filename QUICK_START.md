# 🚀 快速启动指南

## 5分钟快速开始

### 第一步：启动Mock服务器

```bash
cd fast_gin
./run.sh dev
```

**预期输出：**
```
╔═══════════════════════════════════════════════╗
║            📋 测试账号信息                    ║
╚═══════════════════════════════════════════════╝

账号: test_user    密码: 123456
账号: admin        密码: admin123
账号: demo         密码: demo123

访问地址: http://localhost:5173/login
```

### 第二步：启动前端

打开新终端：

```bash
npm run dev
```

**预期输出：**
```
VITE v5.4.10  ready in 1234 ms

➜  Local:   http://localhost:5173/
```

### 第三步：登录测试

1. 打开浏览器访问 http://localhost:5173/login
2. 输入账号密码：
   - 用户名: `test_user`
   - 密码: `123456`
3. 点击"登录"
4. 应该自动重定向到 Dashboard ✅

---

## 📝 默认测试账号

### 基础账号（推荐）
```
用户名: test_user
密码: 123456
用途: 日常功能测试
```

### 管理员账号
```
用户名: admin
密码: admin123
用途: 管理功能测试
```

### 演示账号
```
用户名: demo
密码: demo123
用途: 演示和展示
```

> **注意：** 账号在服务器首次启动时自动创建，存储在SQLite数据库中。

---

## ⚡ 常用命令

### 开发
```bash
# 启动前端开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npx tsc --noEmit
```

### Mock服务器
```bash
# 开发模式 (DEBUG日志)
cd fast_gin && ./run.sh dev

# 生产模式 (INFO日志)
cd fast_gin && ./run.sh prod

# 安静模式 (ERROR日志)
cd fast_gin && ./run.sh quiet

# 手动编译
cd fast_gin && go build -o mock-server

# 运行编译后的二进制
./mock-server
```

### 数据库
```bash
# 查看数据库
cd fast_gin
sqlite3 test.db

# 查看所有用户
sqlite3 test.db "SELECT * FROM users;"

# 删除数据库重置（会失去所有数据）
rm -f test.db
# 重启服务器，自动重建
./run.sh dev
```

---

## 🔗 重要链接

| 地址 | 用途 |
|------|------|
| http://localhost:5173 | 前端应用主页 |
| http://localhost:5173/login | 登录页面 |
| http://localhost:5173/dashboard | 仪表板 |
| http://localhost:8080 | Mock服务器 |
| http://localhost:8080/api/test | 服务器健康检查 |

---

## 🧪 快速测试

### 验证登录功能
```bash
# Terminal 1: 启动服务器
cd fast_gin && ./run.sh dev

# Terminal 2: 启动前端
npm run dev

# 浏览器操作：
# 1. 访问 http://localhost:5173/login
# 2. 输入 test_user / 123456
# 3. 点击登录
# ✅ 应该看到Dashboard
```

### 验证API调用
```javascript
// 在浏览器Console中执行
import apiService from './src/api/apiService.js';

// 获取用户列表
apiService.getUsers()
  .then(res => console.log('✅ 用户列表:', res.data))
  .catch(err => console.error('❌ 错误:', err.message));

// 获取仪表板数据
apiService.getDashboardData()
  .then(res => console.log('✅ 仪表板:', res.data))
  .catch(err => console.error('❌ 错误:', err.message));
```

---

## 📚 文档

- **COMPLETE_TESTING_GUIDE.md** - 完整的测试指南（7个场景）
- **AXIOS_INTEGRATION_GUIDE.md** - API使用指南
- **AXIOS_TEST_GUIDE.md** - 测试指南
- **INTEGRATION_SUMMARY.md** - 架构总结

---

## ✅ 检查清单

启动前确认：

- [ ] Mock服务器已启动 (http://localhost:8080/api/test 返回 "hello world")
- [ ] 前端已启动 (http://localhost:5173 可访问)
- [ ] 浏览器DevTools已打开 (F12)
- [ ] localStorage已清除

---

## 🔧 故障排除

### 问题：无法访问 http://localhost:5173

**解决方案：**
```bash
# 1. 检查前端是否运行
npm run dev

# 2. 检查端口是否被占用
lsof -i :5173

# 3. 清除缓存并重启
rm -rf node_modules .vite
npm install
npm run dev
```

### 问题：登录失败 "用户名或密码错误"

**解决方案：**
```bash
# 1. 删除旧数据库
cd fast_gin && rm -f test.db

# 2. 重启服务器（会自动创建测试账号）
./run.sh dev

# 3. 查看输出中的测试账号信息
# 应该显示: test_user / 123456
```

### 问题：CORS错误

**解决方案：**
```bash
# 1. 确认Mock服务器运行在 localhost:8080
curl http://localhost:8080/api/test

# 2. 检查浏览器Console是否有CORS错误
# 如果有，检查axios配置中的baseURL

# 3. 查看Mock服务器的CORS中间件配置
# fast_gin/gins/router.go 应该有CORS配置
```

---

## 📞 获取帮助

遇到问题？查看以下文档：

1. **快速问题** → QUICK_START.md (本文档)
2. **测试指南** → COMPLETE_TESTING_GUIDE.md
3. **API使用** → AXIOS_INTEGRATION_GUIDE.md
4. **架构设计** → INTEGRATION_SUMMARY.md

---

## 🎯 下一步

1. **开发新功能**
   - 在 `src/pages/` 中创建新页面
   - 在 `src/api/apiService.ts` 中添加API方法
   - 在 `src/routes/` 中创建路由

2. **添加API端点**
   - 在 `fast_gin/gins/apiController.go` 中添加处理函数
   - 在 `fast_gin/gins/router.go` 中注册路由
   - 重新编译Mock服务器

3. **部署到生产**
   - 运行 `npm run build` 生成生产版本
   - 部署 `dist/` 目录到服务器
   - 配置后端API地址

---

**最后更新：** 2025年12月 | **版本：** 1.0

Happy Coding! 🎉
