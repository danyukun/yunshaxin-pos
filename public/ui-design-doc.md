# UI 与交互设计说明文档

> 云奢品干洗 POS · 版本 1.0.0 · 基于源码提取，2026-09-04

---

## 目录

1. [设计系统总览](#1-设计系统总览)
2. [整体布局结构](#2-整体布局结构)
3. [全局导航与路由](#3-全局导航与路由)
4. [通用组件规范](#4-通用组件规范)
5. [各页面 UI 与交互说明](#5-各页面-ui-与交互说明)
6. [表单与数据录入规范](#6-表单与数据录入规范)
7. [数据展示规范](#7-数据展示规范)
8. [状态与反馈规范](#8-状态与反馈规范)

---

## 1. 设计系统总览

设计 token 全部定义在 `src/styles/theme.css`，通过 CSS 自定义属性（CSS Variables）挂载，Tailwind 通过 `@theme inline` 映射为 utility class。

### 1.1 主题色

| Token | 亮色值 | 暗色值 | 用途 |
|---|---|---|---|
| `--primary` | `#030213` | `oklch(0.985 0 0)` | 主文字色、主按钮背景 |
| `--background` | `#ffffff` | `oklch(0.145 0 0)` | 页面底色 |
| `--card` | `#ffffff` | `oklch(0.145 0 0)` | 卡片背景 |
| `--muted` | `#ececf0` | `oklch(0.269 0 0)` | 次要背景 |
| `--muted-foreground` | `#717182` | `oklch(0.708 0 0)` | 次要文字 |
| `--accent` | `#e9ebef` | `oklch(0.269 0 0)` | 高亮背景 |
| `--destructive` | `#d4183d` | `oklch(0.396 0.141 25.723)` | 危险/删除操作 |
| `--border` | `rgba(0,0,0,0.1)` | `oklch(0.269 0 0)` | 通用边框 |
| `--input-background` | `#f3f3f5` | — | 输入框背景 |
| `--switch-background` | `#cbced4` | — | 开关未激活状态 |

**品牌主色（内联 style 硬编码）：**

| 颜色 | 十六进制 | 用途 |
|---|---|---|
| 品牌橙 | `#fd780f` | 主操作按钮、活跃导航、选中态、金额数字、logo 图标 |
| 浅橙背景 | `#fff3e8` | 品牌色区域背景（`#fd780f` + 透明度 / 固定值） |
| 品牌橙浅 | `#fff7ed` | 菜单激活背景 |

**图表色系（5色）：**

| Token | 亮色值 |
|---|---|
| `--chart-1` | `oklch(0.646 0.222 41.116)` |
| `--chart-2` | `oklch(0.6 0.118 184.704)` |
| `--chart-3` | `oklch(0.398 0.07 227.392)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` |

**侧边栏专属色系：**

| Token | 亮色值 |
|---|---|
| `--sidebar` | `oklch(0.985 0 0)` ≈ 近白（定义值），实际使用 `bg-slate-800`（深色） |
| `--sidebar-primary` | `#030213` |
| `--sidebar-accent` | `oklch(0.97 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` |

> 注：侧边栏在代码中直接使用 Tailwind 类 `bg-slate-800`，颜色约等于 `#1e293b`，而非 token 中的近白值。Token 仅为 shadcn/ui 组件库内部使用预留。

### 1.2 圆角规范

| Token | 计算值（基础 `--radius: 0.625rem = 10px`） | 等效 px |
|---|---|---|
| `--radius-sm` | `calc(0.625rem - 4px)` | 6px |
| `--radius-md` | `calc(0.625rem - 2px)` | 8px |
| `--radius-lg` | `0.625rem` | 10px |
| `--radius-xl` | `calc(0.625rem + 4px)` | 14px |

实际代码中大量使用 Tailwind 的 `rounded-xl`（12px）、`rounded-2xl`（16px）、`rounded-full`（全圆），统一呈现圆润风格。弹窗容器标准为 `rounded-2xl`，输入框、按钮标准为 `rounded-xl`，角标、Badge 使用 `rounded-full` 或 `rounded-lg`。

### 1.3 字体规范

```
html font-size: 16px（通过 --font-size 变量）
```

| 元素 | 字号 | 字重 | 行高 |
|---|---|---|---|
| h1 | `text-2xl`（24px） | 500 (medium) | 1.5 |
| h2 | `text-xl`（20px） | 500 | 1.5 |
| h3 | `text-lg`（18px） | 500 | 1.5 |
| h4 | `text-base`（16px） | 500 | 1.5 |
| label | `text-base`（16px） | 500 | 1.5 |
| button | `text-base`（16px） | 500 | 1.5 |
| input | `text-base`（16px） | 400 (normal) | 1.5 |

实际页面中大量使用 `text-sm`（14px）和 `text-xs`（12px）覆盖基础样式，形成紧凑的信息密度风格。超小提示文字使用 `text-[10px]`、`text-[11px]`（非标准 Tailwind，内联任意值）。

### 1.4 间距规范

主内容区 padding 响应式：
- 移动端：`p-4`（16px）
- 平板：`p-5`（20px）  
- 桌面：`p-6`（24px）

卡片内部 padding 常用值：`p-4`、`p-5`、`px-4 py-3`、`px-5 py-3.5`。

间距层级：
- 元素间小间距：`gap-1`、`gap-1.5`、`gap-2`
- 模块内分组：`gap-3`、`gap-4`
- 模块间：`gap-5`、`space-y-5`

### 1.5 阴影/层级规范

| 类名 | 用途 |
|---|---|
| `shadow-sm` | 卡片默认阴影 |
| `shadow-xl` | 弹窗、浮层 |
| `shadow-lg` | 下拉菜单、Tooltip |
| `shadow-md` | 激活导航项 |

层叠顺序（z-index）：
- 内容区：默认
- 侧边栏遮罩：`z-30`
- 侧边栏本体：`z-40`
- 弹窗/Modal：`z-50`
- 搜索下拉：`z-50`
- 快速新建弹窗：`z-[60]`（最高层）

---

## 2. 整体布局结构

### 2.1 页面框架

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (w-28, fixed/relative)  │  右侧区域             │
│  bg-slate-800                    │  ┌───────────────────┐│
│                                  │  │ Header (h-16)     ││
│  Logo区 + 门店切换                │  │ bg-white border-b ││
│  ─────────────                   │  └───────────────────┘│
│  主导航 (flex-col gap-1)          │  ┌───────────────────┐│
│  8个主菜单项                       │  │ main              ││
│  ─────────────                   │  │ flex-1 overflow   ││
│  更多按钮 (底部)                   │  │ auto              ││
│  v1.0.0                          │  │ p-4/5/6           ││
└─────────────────────────────────────┴───────────────────┘
```

整体容器：`size-full flex bg-gray-50 overflow-hidden`

右侧区域：`flex-1 flex flex-col min-w-0`

### 2.2 侧边栏结构

**固定宽度：** `w-28`（112px），不可折叠为图标模式，而是完全收起（`-translate-x-full`）。

**结构分区（从上到下）：**

1. **Logo + 门店切换区**（`border-b border-slate-700/80`）
   - 云朵 icon（`color: #fd780f`）+ "云奢品" 文字（`text-[11px] tracking-widest`）
   - 门店切换按钮：`rounded-lg bg-slate-700/60`，点击弹出向右展开的白色下拉菜单（`w-44 rounded-xl`）
   - 移动端：显示 X 关闭按钮（`lg:hidden`）

2. **主导航区**（`flex-1 py-3`）
   - 8个竖排菜单按钮，每项：`flex flex-col items-center gap-1.5 py-3 rounded-xl`
   - 激活态：`backgroundColor: #fd780f`，白色文字，带 `shadow-md`
   - 非激活态：`text-slate-400 hover:bg-slate-700 hover:text-white`
   - 图标尺寸：`size-[22px]`；标签：`text-[11px] font-medium`

3. **更多按钮区**（`border-t border-slate-700/80`）
   - 触发分组弹出面板（向右展开，`w-52 rounded-2xl bg-white`）
   - 包含两个导航分组：「经营管理」「系统配置」「文档」
   - 面板激活项颜色：`color: #fd780f; background: #fff7ed`

4. **版本号**（`text-[10px] text-slate-500`）

### 2.3 侧边栏展开/收起交互

- **桌面端**（≥ 1024px）：侧边栏以 `relative` 模式始终占位；初始状态下，若 `window.innerWidth < 1024` 则 `isSidebarCollapsed = true`
- **移动端**（< 1024px）：侧边栏以 `fixed` 模式定位，收起时 `-translate-x-full` 滑出屏幕；展开时显示半透明遮罩（`bg-black/50 z-30`），点击遮罩关闭
- 移动端点击导航项后自动关闭侧边栏（`if (window.innerWidth < 1024) onToggle()`）
- 切换动画：`transition-transform duration-300 ease-in-out`

### 2.4 Header 结构

高度：`h-16`，背景：`bg-white border-b border-gray-200`

**三段式布局（`flex items-center justify-between`）：**

| 区域 | 内容 |
|---|---|
| 左侧 | 移动端汉堡菜单（`lg:hidden`）+ 当前页面名称（`text-sm text-gray-400`）+ 日期标签（桌面端显示，`bg-gray-50 rounded-lg`） |
| 中间 | 全局搜索框（仅特定页面显示，`max-w-xl flex-1`，圆角 `rounded-xl`） |
| 右侧 | 通知铃铛（红色数字 badge）+ 当前用户头像+名称 |

**搜索框样式：**
- 左侧 Search 图标，右侧 X 清除按钮
- 聚焦态：`border-orange-400 ring-2 ring-orange-100`
- 背景：`bg-gray-50`

**下单页搜索下拉（特殊）：**
- 显示匹配会员列表（最多6条），每项含：彩色头像圆 + 姓名 + 手机号 + 会员等级 badge
- 底部固定「新建客户」按钮
- 无匹配时显示 `#fd780f` 填充的新建按钮 + Enter 快捷提示

### 2.5 响应式断点行为

| 断点 | 行为 |
|---|---|
| `< 640px` (sm) | 用户信息仅显示头像；内容区减少 padding |
| `< 1024px` (lg) | 侧边栏完全收起；Header 显示汉堡菜单；日期标签隐藏；主内容 `p-4` |
| `≥ 1024px` | 侧边栏固定显示；Header 不显示汉堡菜单；主内容 `p-6` |

---

## 3. 全局导航与路由

路由通过 App 组件内部 `currentPage` state 管理，无 URL 路由（单页应用内部状态切换）。

### 3.1 主导航菜单

| 路由 Key | 显示名 | 图标组件 | 分组 |
|---|---|---|---|
| `home` | 首页 | LayoutDashboard | 主菜单 |
| `order` | 下单 | ShoppingCart | 主菜单 |
| `clothes` | 订单 | Shirt | 主菜单 |
| `hang` | 上挂 | Tag | 主菜单 |
| `customer` | 客户 | Users | 主菜单 |
| `data` | 数据 | BarChart2 | 主菜单 |
| `wash` | 送洗 | Truck | 主菜单 |
| `arrive` | 到店 | Store | 主菜单 |

### 3.2 更多菜单（分组弹出面板）

**经营管理组：**

| 路由 Key | 显示名 | 图标 |
|---|---|---|
| `price-manage` | 价格管理 | Tags |
| `marketing` | 营销管理 | Megaphone |
| `store-manage` | 门店管理 | Building2 |
| `staff-manage` | 员工管理 | UserCog |

**系统配置组：**

| 路由 Key | 显示名 | 图标 |
|---|---|---|
| `settings` | 参数设置 | SlidersHorizontal |
| `printer-manage` | 打印机管理 | Printer |
| `hook-manage` | 挂点管理 | Network |
| `miniapp` | 小程序管理 | Smartphone |

**文档组：**

| 路由 Key | 显示名 |
|---|---|
| `arch-doc` | 技术架构文档 |
| `docs-download` | 下载文档包 |

**另有未在侧边栏显示的路由：**

| 路由 Key | 组件 | 入口 |
|---|---|---|
| `recharge` | RechargeManage | 程序内部跳转 |
| `alert` | AlertCenter | 程序内部跳转 |

### 3.3 导航交互规则

- **选中态**：`backgroundColor: '#fd780f'`，文字白色，主菜单增加 `shadow-md`
- **Hover 态**：`bg-slate-700 text-white`（主菜单）；`bg-gray-50`（更多面板）
- **更多按钮激活态**：当前页为更多菜单项时，更多按钮也显示 `#fd780f` 背景
- **页面切换**：切换时清空搜索词（`setSearchQuery('')`）和预选会员（`setOrderMember(null)`）
- **Header 面包屑**：切换页面后，Header 左侧显示对应中文页面名称

---

## 4. 通用组件规范

### 4.1 按钮样式变体

| 变体 | 样式实现 | 典型用途 |
|---|---|---|
| **主要（Primary）** | `style={{ backgroundColor: '#fd780f' }}` + 白色文字 + `rounded-xl` | 收银、确认添加、新建 |
| **次要（Secondary）** | `border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50` | 取消、返回 |
| **危险（Destructive）** | `text-red-400 hover:bg-red-50 rounded-lg` / 红色 border | 删除操作 |
| **图标按钮** | `p-1.5 hover:bg-slate-100 rounded-lg` / `p-2 hover:bg-gray-100 rounded-xl` | Header 铃铛、弹窗关闭 |
| **幽灵/链接** | `text-xs hover:underline` + `style={{ color: '#fd780f' }}` | "全部 >" 跳转链接 |
| **切换组（SegmentedControl）** | `flex rounded-lg border overflow-hidden` 中多个按钮 | 收衣方式、交付方式切换 |

**通用交互：**
- 按下缩放：`active:scale-95`（主要按钮）或 `active:scale-[0.98]`（菜单项）
- 过渡：`transition-colors`、`transition-all duration-150`
- 禁用态：`disabled:opacity-30` 或 `disabled:opacity-40` + `disabled:cursor-not-allowed`

### 4.2 表单输入规范

**单行输入框（通用）：**
```
h-9 px-3 rounded-xl border border-slate-200 text-sm
outline-none focus:border-orange-400 transition-colors
```

**聚焦态：** `border-orange-400`（`#fb923c` 近似值），部分加 `focus:ring-2 focus:ring-orange-100`

**错误态：** `border-red-400 focus:border-red-400`，下方展示 `text-[11px] text-red-500`

**内联可编辑（表格内）：**
```
border-b-2 border-orange-400 outline-none bg-transparent text-xs
```

**Select 下拉：**
```
px-3 rounded-xl border border-slate-200 text-sm outline-none
focus:border-orange-400 bg-white
```

**Textarea：**
```
w-full text-sm border border-slate-200 rounded-xl
px-3 py-2.5 outline-none focus:border-orange-400 resize-none
```

**Combobox（品牌选择）：**
- 触发：单行按钮，点击弹出浮层下拉
- 浮层：`bg-white border border-slate-200 rounded-xl shadow-xl w-52`
- 内含搜索框 + 选项列表（`max-h-40 overflow-y-auto`）
- 选中项：`bg-orange-50 text-orange-600` + Check 图标

**多选下拉（工艺/附件）：**
- 触发按钮显示已选数量
- 每个已选项可单独点击编辑价格（内联 number input）
- 选项行含 checkbox（`accent-orange-500`）+ 标签 + 价格

**日期输入：**
```
h-8 px-2 rounded-lg border border-slate-200 text-xs
outline-none focus:border-orange-400
```

**Toggle 开关（地址默认）：**
- 容器：`w-9 h-5 rounded-full`
- 激活：`backgroundColor: '#fd780f'`，未激活：`bg-slate-200`
- 滑块：`w-4 h-4 bg-white rounded-full shadow transition-transform`
- 位移：激活 `translate-x-4`，未激活 `translate-x-0.5`

### 4.3 表格/列表模式

**标准数据表格（下单衣物表格）：**
- 容器：`min-w-[1100px]`（水平滚动）
- 表头：`sticky top-0 bg-slate-50 border-b border-slate-200 z-10`
- 行：`border-b border-slate-100 group hover:bg-slate-50/60 text-xs`
- 附件行背景：`bg-indigo-50/40`
- 套餐标签行背景：`bg-orange-50/30`

**卡片列表（待上架、批次到店等）：**
- 项：`flex items-center gap-3 bg-white rounded-xl px-4 py-3 border`
- 未选中：`border-slate-200 hover:border-slate-300`
- 已选中：`border-orange-300 bg-orange-50`
- 点击切换选中，整行可点击

**订单分组折叠列表（送洗调度）：**
- 分组容器：`bg-white rounded-xl border shadow-sm`
- 分组头：`bg-slate-50 cursor-pointer hover:bg-slate-100`，含展开/收起箭头
- 内部衣物行：`border-b border-slate-100 hover:bg-slate-50`

### 4.4 弹窗/Dialog 规范

**遮罩层：**
- `fixed inset-0 bg-black/50`（通用）或 `bg-black/60`（拍照）
- 点击遮罩关闭（`onClick={e => { if (e.target === e.currentTarget) onClose(); }}`）

**弹窗容器：**
```
bg-white rounded-2xl shadow-xl w-full max-w-[sm/md/lg] overflow-hidden
```

**弹窗 Header：**
```
flex items-center justify-between px-5 py-3.5 border-b border-slate-100
```
- 标题：`text-sm text-slate-800`
- 关闭按钮：`p-1.5 hover:bg-slate-100 rounded-lg` + X 图标

**弹窗 Footer（操作按钮区）：**
```
px-5 py-3.5 border-t border-slate-100 flex gap-2
```
- 固定两按钮：取消（次要）+ 确认（主要，`#fd780f`）
- 等宽：`flex-1`

**最大高度限制：** `style={{ maxHeight: '88vh' }}` 或 `92vh`，内部 body 区 `overflow-y-auto`

**步骤弹窗（添加衣物，3步）：**
- 步骤指示器：小圆点 / 胶囊条，激活步骤为 `#fd780f`，已完成步骤为橙色，未到达步骤为 `bg-slate-200`
- 格式：圆点（`w-1.5 h-1.5`）→ 激活（`w-5 h-1.5`）→ 已完成（`w-5 h-1.5 bg-orange-400`）

### 4.5 Badge/Tag 状态标签

**通用小标签（`text-[10px]`）：**

| 用途 | 样式 |
|---|---|
| 状态圆角标签 | `text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500` |
| 批次号标签 | `bg-sky-50 border border-sky-200 text-sky-600 font-mono` |
| 出厂状态 | `bg-orange-50 border-orange-200 text-orange-600` |
| 入库状态 | `bg-green-50 border-green-200 text-green-700` |
| 超期警告 | `bg-red-100 text-red-600`（含 AlertCircle 图标） |
| 绑标标签 | `bg-indigo-50 text-indigo-600 border-indigo-200 font-mono` |
| 挂点标签 | `bg-orange-50 border-orange-200 text-orange-600` |
| 套餐标签 | `text-white bg-[#fd780f]` |

**会员等级 Badge（从 AppContext 定义）：**

| 等级 | 颜色 | Badge 类 |
|---|---|---|
| 普通会员 | `#6b7280` | `bg-slate-100 text-slate-600` |
| 银卡会员 | `#9ca3af` | `bg-gray-100 text-gray-500` |
| 金卡会员 | `#f59e0b` | `bg-amber-50 text-amber-700` |
| 黑卡会员 | `#374151` | `bg-gray-800 text-gray-100` |

**重要客户星级：**

| 等级 | 文字颜色 | 背景 | 边框 |
|---|---|---|---|
| ⭐（1级） | `text-yellow-600` | `bg-yellow-50` | `border-yellow-200` |
| ⭐⭐（2级） | `text-orange-600` | `bg-orange-50` | `border-orange-200` |
| ⭐⭐⭐（3级） | `text-red-600` | `bg-red-50` | `border-red-200` |

### 4.6 卡片（Card）结构

**数据统计卡（Dashboard StatCard）：**
```
bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4
```
- 图标区：`w-12 h-12 rounded-xl`，背景为品牌色 + `1a` 透明度（约10%）
- 数值：`text-2xl text-slate-800`
- 标签：`text-xs text-slate-400`

**待办卡（PendingCard）：**
```
bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3
```
- 图标区：`w-9 h-9 rounded-lg`
- 数值：`text-xl text-slate-800`，单位：`text-xs text-slate-400`

**功能特性卡（DataReport）：**
```
bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex gap-4 items-start
```
- 图标容器：`w-10 h-10 rounded-xl bg-[#fff3e8]`
- 图标颜色：`#fd780f`

---

## 5. 各页面 UI 与交互说明

### 5.1 首页 Dashboard（路由：`home`）

**用途：** 运营数据概览与快速导航入口。

**布局结构：**
```
max-w-4xl mx-auto space-y-5
├── 今日数据（3列统计卡，sm:grid-cols-3）
├── 待办事项（3列待办卡）
└── 最近订单(2/3宽) + 快捷操作(1/3宽)（lg:grid-cols-3）
```

**数据来源：** 全部从 `useAppStore().orders` 实时计算，无需额外 API。

**统计卡内容：**

| 卡片 | 图标色 | 数据 |
|---|---|---|
| 订单总数 | `#fd780f` | `orders.length` 单 |
| 累计营业额 | `#6366f1` | 所有订单 `totalAmount` 求和 |
| 会员总数 | `#10b981` | `orders` 中唯一 phone 数量 |

**待办卡内容：**

| 卡片 | 图标色 | 逻辑 |
|---|---|---|
| 待上架 | `#f59e0b` | 所有 garment.status === 'store_in' 数量 |
| 待配送 | `#3b82f6` | on_shelf 且 B/C 型订单的 garment 数量 |
| 挂单未付 | `#ef4444` | order.isHang === true 的订单数 |

**最近订单列表：**
- 按 `receivedAt` 倒序取前5条
- 每行：订单类型色块（A=`#6366f1`/B=`#10b981`/C=`#fd780f`）+ 客户名 + 订单号 + 件数 + 时间 + 金额 + 状态
- 右上角「全部 >」点击跳转 `clothes` 页

**快捷操作：**
- 3个导航按钮：快速下单、查看订单、客户管理
- 每项：`border border-slate-100 rounded-xl hover:bg-slate-50 active:scale-[0.98]`
- 门店状态提示区：`bg-[#fff7ed]` 背景

### 5.2 下单页 ReceiveOrder（路由：`order`）

**用途：** 门店前台收银录单核心页面，支持收衣、定价、结算。

**布局结构：**
```
全屏高度（calc(100vh - 4rem)），flex flex-col，负边距撑满主内容区
├── 顶部信息栏（flex-shrink-0，bg-white border-b）
│   ├── 客户信息行（会员名、等级、手机、折扣、余额、充值按钮）
│   ├── 收衣方式切换（到店 / 上门取件）
│   ├── 交付方式切换（到店自取 / 送货上门）
│   └── 条件展示：上门取件地址+时段 / 送货地址
├── 衣物表格（flex-1 overflow-auto）
│   └── 宽表格（min-w-[1100px]，水平滚动）
└── 底部结算栏（flex-shrink-0 bg-white border-t）
    ├── 可折叠订单备注
    └── 操作行：添加衣物 | 件数/价格汇总 | 实付总价 | 挂账/收银
```

**客户选择流程：**
1. 在 Header 搜索框输入手机号/姓名
2. 下拉显示匹配会员，点击选中，回填至顶部信息栏
3. 唯一匹配时 Enter 直接选中；无匹配时弹出快速新建弹窗
4. 选中后显示：头像圆（会员色）+ 姓名 + 等级 + 重要客户星 + 手机号 + 折扣率 + 余额

**添加衣物（3步弹窗）：**

| 步骤 | 内容 | 操作 |
|---|---|---|
| 1 - 选择项目 | 品类过滤栏 + 搜索框 + 商品网格（3-5列）| 点击商品进入步骤2；套餐类（N件）直接裂变为多行 |
| 2 - 颜色登记 | 7个色系标签页 + 颜色圆圈网格（8列） + 花色图案选项 + 自定义颜色 | 可跳过；选中显示 Check 图标 |
| 3 - 瑕疵标注 | 多选标签（领口污渍/袖口磨损等）+ 补充说明文本框 | 可跳过；已选标签以红色 Tag 显示 |

**衣物表格列（共14列）：**

`#` | 衣物名称（含标签编号） | 颜色（点击弹出颜色弹窗） | 品牌（Combobox）| 工艺加价（多选价格弹窗）| 附件（多选价格弹窗）| 单价 | 折后价 | 行小计（可点击手动编辑）| 瑕疵（点击弹出瑕疵弹窗）| 绑标（可点击录入/编辑）| 挂点（自动分配，可点击手动调整）| 拍照（打开拍照/上传弹窗）| 操作（复制/删除，hover 显示）

**价格计算逻辑：**
- 行小计 = 折后价 + 工艺加价 + 附件加价，可手动覆盖
- 总价 = 所有行小计之和 - 优惠券金额，可手动覆盖
- 折扣率来自会员等级（普通1.0/银卡0.95/金卡0.90/黑卡0.85）

**结算弹窗（CheckoutModal）：**
- 显示应收金额（`text-2xl color: #fd780f`）
- 有效优惠券列表（单选，满足门槛才可用）
- 支付方式选择（4列网格：会员卡/现金/微信/支付宝/抖音/美团/其他）
- 支持「挂账」模式（记入欠款账户）
- 确认后显示成功态 + 打印选项（勾选：收款小票 / 水洗唛）

**快捷充值弹窗（QuickRechargeModal）：**
- 预设金额按钮：100/200/500/1000/2000/5000
- 自定义金额输入
- 支付方式：微信/支付宝/现金
- 实时显示充值后余额预览

**挂点自动分配：**
- 添加衣物时自动调用 `allocateHookSlot(categoryId, hookZones, hookSlots)` 分配最近空闲挂点
- 挂点列显示：`bg-orange-50 border-orange-200 text-orange-600`（已分配）或虚线边框「待分配」
- 可点击打开挂点选择器手动调整；已占用点位显示灰色不可选

### 5.3 批次到店 PickupOrder（路由：`arrive`）

**用途：** 工厂发回批次的到店入库操作。

**布局结构：**
```
全屏高度，flex flex-col
├── 顶部标题区（bg-white border-b）
└── 内容区（flex-1 overflow-hidden flex）
    ├── 左侧：在途批次列表（w-52，lg:flex，hidden on mobile）
    └── 右侧：批次衣物列表（flex-1，bg-slate-50）
```

**操作流程：**
1. 左侧显示所有「在途」批次（状态：sent_wash/factory_in/washing 等）
2. 点击批次号或通过 Header 搜索框输入批次号查询
3. 右侧展示批次内所有衣物（含：衣物类型、品牌、颜色、状态、标签编号、客户名、挂点）
4. 勾选（全选按钮 + 单项勾选）需确认到店的衣物
5. 点击「确认到店（N件）」按钮，状态更新为 `store_in`，进入上挂列表

**衣物项状态色：**
- `factory_out`（已出厂）：橙色边框
- `store_in`（已入库）：绿色边框
- 其他在途状态：天蓝色边框

**空状态：** 左侧无批次时显示 Hash 图标 + "暂无在途批次"；右侧未搜索时显示 Package 图标提示

### 5.4 上挂管理 HangManage（路由：`hang`）

**用途：** 将已入库（`store_in`）衣物标记为上架（`on_shelf`）。

**布局结构：**
```
全屏高度，flex flex-col
├── 顶部操作栏（bg-white border-b）：全选按钮 + 确认上架(N件)按钮
└── 衣物列表区（flex-1 overflow-y-auto，bg-slate-50）
```

**衣物卡片信息：** checkbox + 衣物图标 + 类型/品牌/颜色标签 + 批次号（天蓝）+ 标签编号（mono字体）+ 挂点标签（橙色）+ 价格

**确认逻辑：** 选中项状态更新为 `on_shelf`，对应 hookSlot 状态更新为 `ready`（待取），写入 tracking 记录

**搜索：** 支持通过衣物标签、批次号、客户名、订单号筛选

**空状态：** Package 图标 + "暂无待上架衣物" + 次要说明文字

### 5.5 送洗调度 WashDispatch（路由：`wash`）

**用途：** 将「已收衣」状态的衣物打包成批次送往工厂。

**布局结构：**
```
全屏高度，flex flex-col
├── 顶部统计栏：总待送洗件数 + 已选N件 + 发送批次按钮
└── 订单分组列表（space-y-3）
    └── OrderGroup（可折叠）
        ├── 分组头（bg-slate-50）：全选框 + 客户名 + 订单号 + N件待送洗 + 展开箭头
        └── 衣物行列表（GarmentLine）：复选框 + 图标 + 类型/品牌/颜色 + 标签 + 价格
```

**批次发送弹窗（点击「发送批次」）：**
- 自动生成批次号（格式：`B{年月日}-{随机2位}`，如 `B260904-42`）
- 可手动修改批次号
- 可填写批次备注
- 确认后：选中衣物状态 → `sent_wash`，写入 batchId

**空状态：** Truck 图标 + "暂无待送洗订单"

### 5.6 客户管理 MemberManagement（路由：`customer`）

**用途：** 会员档案管理，含详情查看和编辑。

**布局结构（推断，基于代码片段）：**
```
两段式：左侧会员列表 + 右侧详情面板（或模态）
```

**会员列表过滤维度：**
- 所属门店（storeId）
- 是否会员（isMember）
- 会员等级（tierName）
- 重要客户（importantFilter：全部/重要/普通）
- 是否关注微信（wechat）
- 搜索框：客户姓名/手机号（Header 搜索联动）

**会员详情面板（Tab 页结构）：**
- 基础信息：姓名、手机、注册日期、会员等级 badge、重要客户星标
- 地址管理（AddressTab）：地址卡片列表 + 新增/编辑/删除/设为默认
- 优惠券（展示已有券）：券名 + 金额 + 使用门槛 + 到期日
- 历史订单（展示归属订单）

**地址卡片：**
- 默认地址：`border-orange-200 bg-orange-50/40`
- 非默认：`border-slate-200 bg-white`
- 图标：家（Home）/公司（Building2）/其他（MapPin）
- 操作：设为默认按钮 + 编辑 + 删除

**新增/编辑地址表单：**
- 标签快选：家/公司/学校/其他（按钮组）
- 详细地址（input）
- 联系电话（input）
- 设为默认（Toggle 开关）

### 5.7 挂点管理 HookManage（路由：`hook-manage`）

**用途：** 管理门店物理挂衣点位（区域 + 具体格子），查看实时占用状态。

**布局结构：**
```
区域卡片列表（ZoneCard per zone）
├── 区域头：区域名 + 容量 + 统计 badges + 编辑/删除按钮
└── 点位网格：flex flex-wrap gap-2
    └── SlotCell（52×66px 格子）
```

**SlotCell 三态颜色：**

| 状态 | 背景 | 边框 | 文字 |
|---|---|---|---|
| 空闲 | `bg-slate-50` | `border-dashed border-slate-200` | `text-slate-400` |
| 占用（正常） | `bg-emerald-50` | `border-emerald-200` | `text-emerald-700` |
| 超期 | `bg-red-50` | `border-red-300` | `text-red-600` |

- 超期判断：当前时间 > 收衣时间 + serviceCycleHours * 3,600,000ms
- 超期格子左上角显示橙色 AlertCircle 图标
- 右上角状态小圆点：空闲灰/洗涤蓝/待取橙/已取绿
- 占用格子 hover：`scale-[1.06] shadow-lg`，点击打开详情面板

**区域统计 Badges（区域头部）：**
- 超期（红色）/ 洗涤中（蓝色）/ 待取（橙色）/ 已取（绿色）/ 空闲数（灰色）

**新增/编辑区域弹窗：**
- 区域名称输入 + 容量数字输入
- 可选关联品类（限制该区域仅接受特定品类衣物，空=全接受）

**搜索：** 支持按挂点编号、订单号、客户名、衣物类型过滤

### 5.8 价格管理 PriceManage（路由：`price-manage`）

**用途：** 商品/服务价格列表管理，含多门店差价、SKU、上下架控制。

**布局结构：**
```
├── 顶部筛选栏：门店 Tab + 品类 Tab + 搜索框 + 新增按钮
└── 商品表格（含分组按品类）
```

**商品属性字段：**
- 名称、助记码（mnemonicCode）、品类
- 普通价（regularPrice）、线上价（onlinePrice）
- 洗护周期（washCycleDays 天）
- 存放区域（hangArea）：滑杆斜区 / 大件区 / 折叠区
- 状态（active / inactive）
- 是否允许折扣、是否上架小程序、是否参与配送
- 是否套餐（isBundle）、是否有 SKU（hasSKU）

**存放区域标签颜色：**
```
滑杆斜区: bg-[#fff3e8] color-[#fd780f]
大件区:   bg-[#eff6ff] color-[#2563eb]
折叠区:   bg-[#f0fdf4] color-[#16a34a]
```

**新增/编辑表单（三 Tab）：**
- 基础信息（Basic）：名称/助记码/品类/门店关联
- 定价（Price）：普通价/线上价/洗护周期/存放区域/状态/折扣/小程序/配送/套餐
- SKU（如启用）：规格名称 + 普通价 + 线上价（可添加多个）

### 5.9 数据报表 DataReport（路由：`data`）

**当前状态：** 占位页面，功能开发中。

**布局：** 居中单列，`min-h-[60vh]`

**展示内容：**
- 大图标（BarChart2，`#fd780f`）+ 标题 + 描述
- 5个功能特性卡（双列网格，`max-w-xl`）：门店营收统计、订单报表、品类销量分析、对账明细、SaaS 多门店汇总
- 底部橙色按钮「功能开发中，敬请期待」（不可点击，纯展示）

### 5.10 员工管理 StaffManage（路由：`staff-manage`）

**用途：** 员工档案管理与权限角色配置。

**布局结构：**
```
├── 顶部：搜索框（Header 联动）+ 新增员工按钮
├── 员工列表（左侧，约2/3宽）
│   └── 员工卡片：头像圆 + 姓名 + 手机 + 角色 Badge + 入职日期 + 状态
└── 角色权限说明（右侧，1/3宽）
    └── 角色卡片列表，每项含权限 Tag 网格
```

**角色体系（5种）：**

| 角色 | 颜色 | 权限描述 |
|---|---|---|
| 超级管理员 | `#ef4444`（红）| 全部15项权限 |
| 门店店长 | `#fd780f`（橙）| 11项（含报表/员工管理）|
| 收银员 | `#6366f1`（紫）| 3项（下单/订单/客户）|
| 操作员 | `#10b981`（绿）| 4项（后场操作流程）|
| 财务 | `#8b5cf6`（浅紫）| 1项（数据报表）|

**角色 Badge：** `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]`，背景/文字颜色各异

**新增/编辑员工弹窗：**
- 姓名（必填）/ 手机号（必填）/ 角色（select）/ 入职日期（date）
- 选择角色时展示对应权限描述（`text-xs text-slate-400`）

### 5.11 参数设置 Settings（路由：`settings`）

**用途：** 系统基础配置项。

**布局：** 两列等宽卡片网格（`lg:grid-cols-2 gap-6`）

**四个配置卡：**
1. **门店信息**：门店名称、联系电话、门店地址
2. **打印设置**：小票宽度（58/80/76mm）、编码方式（二维码/条码）、注意事项
3. **业务设置**：默认取衣天数、默认折扣率、自动短信通知开关（checkbox）
4. 页面底部有「保存设置」按钮（Save 图标）

**样式特点：** 此页面输入框使用蓝色聚焦环（`focus:ring-blue-500`），与其他页面橙色系不同，属于早期代码未统一。

---

## 6. 表单与数据录入规范

### 6.1 表单布局模式

**单列线性表单（弹窗内）：**
```
div.space-y-3 或 space-y-4
  label（text-xs text-slate-500，mb-1）
  input / select
```
弹窗内表单宽度：`w-full`，通过弹窗 `max-w-sm/md` 控制总宽度。

**双列表单（Settings 页）：**
```
grid grid-cols-1 lg:grid-cols-2 gap-6
```
每列独立卡片（`bg-white rounded-lg p-6`）。

**紧凑行内表单（下单页顶栏）：**
```
flex items-center gap-3 flex-wrap
```
控件水平排列，支持换行。

### 6.2 必填与校验反馈

- 必填字段：label 后跟 `<span className="text-red-400">*</span>`
- 实时校验（手机号重复）：输入变化即触发，`border-red-400` + 下方红色提示文字
- 提交前校验：`disabled={!canSave}`，按钮 `opacity-40`
- 地址字段校验：`if (!form.address.trim()) return;`（无视觉提示，仅阻止提交）
- 绑标格式校验：仅允许字母和数字，重复时 `text-[9px] text-red-500` 提示

### 6.3 提交/取消流程

**标准弹窗流程：**
1. 用户填写表单
2. 点击主按钮（`#fd780f`）提交
3. 成功后：显示成功态（绿色圆形 Check + 确认信息）
4. 用户点击「完成」或「确认选中」关闭弹窗
5. 失败/取消：点击取消按钮或点击遮罩层关闭

**快速充值成功态示例：**
```
w-12 h-12 rounded-full bg-[#e8f8f0]
  Check icon text-emerald-500
文字：充值成功 + 金额 + 新余额
按钮：完成（#fd780f）
```

**下单结算流程（两阶段）：**
- 第一阶段：选择支付方式/优惠券 → 点击「确认收款」
- 第二阶段：显示收款成功 + 打印选项 → 点击「打印并完成」或「跳过打印」

---

## 7. 数据展示规范

### 7.1 表格分页

当前版本**未实现分页**，所有列表数据全量渲染。会员列表、商品列表通过筛选控制展示数量；待上架/送洗列表通过状态过滤仅展示当前待处理项。

### 7.2 搜索/筛选模式

| 页面 | 搜索范围 | 实现位置 |
|---|---|---|
| 下单 | 手机号/姓名（精确+模糊）| Header 搜索框 + 实时下拉 |
| 订单查询 | 订单号/客户名/手机/衣物标签 | Header 搜索框 |
| 客户管理 | 姓名/手机号 | Header 搜索框 |
| 上挂管理 | 衣物标签/批次号/客户名 | Header 搜索框 |
| 送洗调度 | 客户名/订单号 | Header 搜索框 |
| 批次到店 | 批次号/客户名 | Header 搜索框 |
| 员工管理 | 姓名/手机号 | Header 搜索框 |
| 价格管理 | 衣物名称/助记码 | Header 搜索框 + 页内品类 Tab |
| 挂点管理 | 挂点编号/订单号/客户名/衣物类型 | 页内搜索框 |

**页内过滤模式（品类 Tab）：**
```
flex gap-1.5 flex-wrap
Button（全部）+ 各品类 Button
激活：backgroundColor = 品类色 / #fd780f，文字白色
未激活：border-slate-200 text-slate-600
```

### 7.3 空状态处理

统一模式：
```
flex flex-col items-center justify-center （py-8 ~ py-20）
Icon（size-8 ~ size-12，text-slate-300）
<p className="text-sm text-slate-300">{主提示}</p>
<p className="text-xs mt-1 text-slate-300">{次要说明}</p>（可选）
```

| 页面 | 图标 | 提示文字 |
|---|---|---|
| 下单（无衣物）| Plus（虚线圆角框）| 点击底部「添加衣物」开始录入 |
| 待上架（无数据）| Package | 暂无待上架衣物 |
| 批次到店（未搜索）| Package | 请输入批次号查询 |
| 批次到店（无结果）| X | 未找到批次 {id} |
| 在途批次（空）| Hash | 暂无在途批次 |
| 地址列表（空）| MapPin | 暂无收货地址 |
| 品类筛选无结果 | 无图标 | `text-slate-300 text-sm` 居中文字 |

### 7.4 加载态

当前版本无异步请求（全部为内存状态操作），故**无加载态实现**。所有操作即时生效，状态更新通过 React state 驱动 re-render。

---

## 8. 状态与反馈规范

### 8.1 操作成功/失败反馈

**成功状态（绿色）：**
- 容器：`w-12 h-12 rounded-full bg-[#e8f8f0]`
- 图标：`<Check className="size-6 text-emerald-500"/>`
- 标题：`text-sm text-slate-700`（如「充值成功」「创建成功」）
- 副文字：`text-xs text-slate-400`（显示具体数据）
- 确认按钮：`#fd780f` 橙色

**失败/警告反馈（内联）：**
- 手机号重复：`text-[11px] text-red-500 mt-1`（紧跟输入框下方）
- 余额不足：`text-red-500`（结算弹窗内金额行）
- 超期挂点：AlertCircle 图标 + 红色样式（挂点格子）
- 无匹配（搜索结果）：空状态 UI

**操作禁用反馈：**
- 未选客户时切换收衣方式：触发 `noMemberHint` → `animate-pulse text-xs text-red-500`「请先选择客户」，2秒后消失

### 8.2 确认对话框

项目中**未使用独立的 Confirm Dialog 组件**，删除/重置等危险操作直接执行，没有二次确认弹窗。部分销毁性操作通过按钮样式（红色）提示用户：

| 操作 | 交互方式 |
|---|---|
| 删除衣物行 | hover 显示红色 Trash 按钮，直接删除无确认 |
| 删除员工 | 直接从列表删除（推断）|
| 删除地址 | 直接删除无确认 |
| 清空绑标 | X 按钮直接清除 |
| 重置手动价格 | RotateCcw 图标按钮，hover 显示，直接重置 |

### 8.3 Toast/通知提示

当前版本**未实现 Toast 通知组件**。成功反馈通过弹窗内状态切换（二阶段弹窗）展示，无全局 Toast/Snackbar。

通知铃铛（Header 右侧）展示固定徽章数 `3`（硬编码），尚未接入实际通知系统。徽章样式：
```
absolute top-1.5 right-1.5
min-w-[14px] h-3.5 rounded-full
background: #ef4444
text-[9px] font-bold text-white
```

### 8.4 交互动效

| 效果 | CSS 类 | 触发场景 |
|---|---|---|
| 按钮按下 | `active:scale-95` | 主要按钮、导航项 |
| 图标悬停放大 | `hover:scale-110` | 颜色选择圆圈 |
| 挂点格子悬停 | `hover:scale-[1.06] hover:shadow-lg` | 已占用挂点 |
| 侧边栏滑入/出 | `transition-transform duration-300 ease-in-out` | 移动端展开/收起 |
| 批次列表动效 | `animate-pulse` | 未选客户提示 |
| 操作按钮淡入 | `opacity-0 group-hover:opacity-100 transition-all` | 表格行内操作按钮 |
| 颜色框聚焦 | `hover:border-orange-300` / 选中 `scale-110` | 颜色选择器 |

---

*文档由源码自动提取生成，如代码更新请同步维护此文档。*
