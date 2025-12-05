# 配置文件指南

本项目使用 JSON 配置文件来管理模型、菜单、统计数据等信息，使前端可以动态更新而无需修改组件代码。

## 文件结构

```
src/
├── data/                    # 配置文件目录
│   ├── models.json         # AI 模型配置
│   ├── stats.json          # 统计数据配置
│   └── menu.json           # 菜单配置
├── types/                   # TypeScript 类型定义
│   ├── models.ts           # 模型类型
│   ├── stats.ts            # 统计类型
│   └── menu.ts             # 菜单类型
└── hooks/                   # 自定义 Hooks
    ├── useModels.ts        # 模型 Hook
    ├── useStats.ts         # 统计 Hook
    └── useMenu.ts          # 菜单 Hook
```

## 配置文件详解

### 1. models.json - AI 模型配置

定义所有支持的 AI 模型信息。

```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "OpenAI",
      "category": "flagship",
      "description": "Most capable model, best for complex tasks",
      "icon": "brain",
      "color": { "light": "#6366f1", "dark": "#818cf8" },
      "backgroundColor": {
        "light": "bg-indigo-100/50",
        "dark": "dark:bg-indigo-900/30"
      },
      "textColor": {
        "light": "text-indigo-600",
        "dark": "dark:text-indigo-400"
      },
      "stats": {
        "requests": "12,450",
        "tokens": "450K",
        "percentage": 33
      }
    }
    // ... 更多模型
  ],
  "chartColors": ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6"],
  "categories": {
    "flagship": {
      "label": "Flagship Models",
      "description": "Most advanced and capable"
    }
  }
}
```

**字段说明：**
- `id`: 模型唯一标识符
- `name`: 模型显示名称
- `provider`: 模型提供商
- `category`: 模型分类
- `color`: 图表颜色（浅色/深色）
- `backgroundColor`: 背景颜色类名
- `textColor`: 文本颜色类名
- `stats.percentage`: 用于饼图占比

**使用方式：**

```typescript
import { useModels } from '../hooks/useModels';

function MyComponent() {
  const { models, chartColors, getModelsByCategory } = useModels();

  // 获取所有模型
  console.log(models);

  // 获取特定分类的模型
  const flagshipModels = getModelsByCategory('flagship');

  // 获取图表颜色
  console.log(chartColors);
}
```

### 2. stats.json - 统计数据配置

定义仪表盘显示的统计卡片。

```json
{
  "dashboardStats": [
    {
      "id": "requests",
      "title": "Total Requests",
      "value": "2.4M",
      "change": "12.5%",
      "isPositive": true,
      "icon": "trending-up",
      "iconColorClass": "text-blue-600 dark:text-blue-400",
      "iconBgClass": "bg-blue-100/50 dark:bg-blue-900/30"
    }
    // ... 更多统计
  ]
}
```

**使用方式：**

```typescript
import { useStats } from '../hooks/useStats';

function DashboardHome() {
  const { dashboardStats } = useStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardStats.map(stat => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
```

### 3. menu.json - 菜单配置

定义应用的导航菜单和设置标签。

```json
{
  "mainMenu": [
    {
      "id": "home",
      "text": "首页",
      "icon": "home",
      "path": "/"
    }
    // ... 更多菜单项
  ],
  "settingsTabs": [
    {
      "id": "profile",
      "label": "Profile",
      "icon": "user"
    }
    // ... 更多标签
  ]
}
```

**使用方式：**

```typescript
import { useMenu } from '../hooks/useMenu';

function DashboardLayout() {
  const { mainMenu, getMenuItemByPath } = useMenu();

  // 遍历所有菜单项
  return (
    <nav>
      {mainMenu.map(item => (
        <Link key={item.id} to={item.path}>
          {item.text}
        </Link>
      ))}
    </nav>
  );
}
```

## 支持的图标

### 模型 Icon
- `brain` - 大脑图标
- `zap` - 闪电图标
- `sparkles` - 星星图标
- `star` - 五角星图标

### 统计 Icon
- `trending-up` - 上升趋势
- `database` - 数据库
- `alert-circle` - 警告圆圈
- `users` - 用户

### 菜单 Icon
- `home` - 首页
- `layout-dashboard` - 仪表盘
- `wrench` - 工具
- `headphones` - 耳机
- `megaphone` - 喇叭
- `settings` - 设置

### 设置标签 Icon
- `user` - 用户
- `lock` - 锁
- `credit-card` - 信用卡
- `bell` - 铃铛

## 如何添加新的模型

1. 打开 `src/data/models.json`
2. 在 `models` 数组中添加新对象：

```json
{
  "id": "new-model",
  "name": "New Model Name",
  "provider": "Provider Name",
  "category": "standard",
  "description": "Model description",
  "icon": "star",
  "color": { "light": "#...", "dark": "#..." },
  "backgroundColor": {
    "light": "bg-...-100/50",
    "dark": "dark:bg-...-900/30"
  },
  "textColor": {
    "light": "text-...-600",
    "dark": "dark:text-...-400"
  },
  "stats": {
    "requests": "1,000",
    "tokens": "50K",
    "percentage": 10
  }
}
```

3. 可选：更新 `chartColors` 数组以包含新颜色

## 如何添加新的菜单项

1. 打开 `src/data/menu.json`
2. 在 `mainMenu` 数组中添加新对象：

```json
{
  "id": "new-item",
  "text": "新菜单项",
  "icon": "icon-name",
  "path": "/path"
}
```

## Hook API 参考

### useModels()

```typescript
const {
  models,                           // Model[]
  chartColors,                      // string[]
  categories,                       // Record<string, ModelCategory>
  getModelsByCategory,              // (categoryId: string) => Model[]
  getModelsByProvider,              // (provider: string) => Model[]
  getModelById,                     // (id: string) => Model | undefined
  getProviders,                     // () => string[]
} = useModels();
```

### useStats()

```typescript
const {
  dashboardStats,                   // StatCard[]
} = useStats();
```

### useMenu()

```typescript
const {
  mainMenu,                         // MenuItem[]
  settingsTabs,                     // SettingsTab[]
  getMenuItemById,                  // (id: string) => MenuItem | undefined
  getMenuItemByPath,                // (path: string) => MenuItem | undefined
  getSettingsTabById,               // (id: string) => SettingsTab | undefined
} = useMenu();
```

## 最佳实践

1. **集中管理配置**: 所有配置都在 `src/data/` 目录，便于维护
2. **类型安全**: 使用 TypeScript 类型确保配置的一致性
3. **图标映射**: 图标在组件中映射，使 JSON 保持轻量级
4. **颜色系统**: 使用 Tailwind CSS 类名，与现有设计系统保持一致
5. **动态构建**: 使用 Hook 而不是直接导入 JSON，便于未来扩展

## 常见问题

**Q: 能否从 API 加载配置？**
A: 可以。在对应的 hook 中修改数据源即可。例如用 `fetch()` 替换 `import`。

**Q: 如何支持多语言？**
A: 在 JSON 中为每个字段添加语言版本，或在 hook 中根据当前语言选择。

**Q: 能否验证 JSON 数据？**
A: 可以。使用 TypeScript 类型和 Zod 等库进行运行时验证。
