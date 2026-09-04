# 干洗 POS 系统 — UI/UX 全局走查整改清单

> 走查基准：《干洗门店 POS 收银系统 UI/UX 整体设计规范》  
> 走查日期：2026-05-12 · 覆盖范围：所有已开发页面 + 全局组件  
> 优先级：🔴 必改（影响核心体验）· 🟡 应改（影响一致性）· 🟢 建议改（优化提升）

---

## 一、全局组件层

### G-01 · Header.tsx 🔴

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 员工身份 | 静态写死"管理员"文字 | 显示登录员工姓名 + 角色徽标 | 接入 `currentStaff` Context |
| 页面面包屑 | 移动端显示当前页名，PC 端缺失 | 所有尺寸显示「门店名 / 当前页」层级 | 增加 PC 端面包屑 |
| 顶部高度 | `h-14 lg:h-16`，间距不统一 | 统一 64px 固定高度 | 改为 `h-16` 全断点统一 |
| 通知角标 | 静态红点，无数字 | 未读数角标显示具体数量 | 增加角标数字 |
| 硬件状态 | 无 | 可视化展示打印机/钱箱状态 | Header 右侧增加硬件快捷状态指示 |

### G-02 · Sidebar.tsx 🟡

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 导航项高度 | `py-2.5`（约 42px） | 拇指触控热区 ≥ 44px | 改为 `py-3`（约 48px）|
| 底部「更多」 | 悬浮弹出白色卡片 | 弹出菜单项间距偏小 | 子项改为 `py-2.5` 至少 40px 高 |
| 移动端底部 Tab | 无，靠抽屉侧边栏 | 手机端应为底部 Tab | 增加移动端底部固定导航 Tab |

### G-03 · 全局卡片 & 间距 🟡

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 间距模数 | 混用 `p-3/p-4/p-5/p-6` | 严格 8px 倍数 | 统一：`p-4`(16px)内容卡 · `p-6`(24px) 大区域 |
| 卡片圆角 | 混用 `rounded-xl / rounded-2xl` | 统一 | 卡片统一 `rounded-xl`，弹窗 `rounded-2xl` |
| 边框颜色 | 混用 gray/slate | 统一 | 统一 `border-gray-100/200` |

### G-04 · 全局按钮规范 🔴

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 主要按钮高度 | `py-2 ~ py-2.5`（32~40px） | 触控热区 ≥ 44px | 主要按钮统一 `py-3`（48px）|
| 按钮点击态 | 仅 `hover:opacity-90` | 应有按压缩放动效 | 增加 `active:scale-95 transition-transform` |
| 危险操作 | 无二次确认弹窗 | 高危操作必须二次弹窗确认 | 封装 `ConfirmDialog` |
| 禁用状态 | 部分无 `disabled` 样式 | 禁用按钮灰底灰字 | 统一 `disabled:opacity-40 disabled:cursor-not-allowed` |

### G-05 · 金额显示规范 🔴

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| ¥ 前缀 | 部分有，部分无 | 统一 `¥` 前缀 + 两位小数 | 封装 `formatMoney(n: number): string` |
| 合计金额 | ReceiveOrder 右栏合计字号不突出 | 应付金额最醒目 | 应付金额 `text-2xl font-bold` + 橙色 |

---

## 二、页面级走查

### P-01 · ReceiveOrder.tsx 🔴

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 布局 | 三栏布局缺失 | 固定三栏：品类区·衣物录入区·订单汇总栏 | 右侧结算区改为固定宽度 `w-72 xl:w-80` |
| 支付方式 | 图标+文字小按钮 | 支付按钮需大尺寸，防误触 | 改为卡片式，最小高度 56px |
| 数字键盘 | 无专用数字键盘 | 收银/充值唤起专用数字键盘 | 收款弹窗内嵌自定义大按键数字键盘 |
| 空状态 | 无衣物时无空状态提示 | 应有引导性空状态 | 增加空状态组件 |

### P-02 · PickupOrder.tsx 🔴

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 整页几乎是 Mock | 核心业务流程缺失 | 接入 AppContext orders 数据 | 超期无高亮，无取件码 |

### P-03 · MemberManagement.tsx 🟡

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 操作按钮 | 充值、详情等无快捷按钮 | 大按钮「立即充值」 | 会员行右侧增加快捷充值按钮 |

### P-04 · HookManage.tsx 🟡

| 项 | 现状 | 规范要求 | 整改动作 |
|---|---|---|---|
| 格子尺寸 | `w-9 h-9 ~ w-10 h-10` | 触控热区 ≥ 44px | 改为最小 `w-11 h-11`（44px）|

---

## 三、交互专项缺陷

### I-01 · 数字键盘缺失 🔴
封装 NumericKeypad 组件：0-9按键(min 64×64px) + 退格 + 确认(橙色) + 小数点 + 快捷金额预设

### I-02 · 操作反馈缺失 🔴
全局统一：`active:scale-[0.97]` + loading Spinner + Toast通知(sonner) + 成功大号Toast+动效

### I-03 · 危险操作无二次确认 🔴
封装通用 ConfirmDialog：标题+说明+取消+确认删除(红色,延迟1.5s才可点)

### I-04 · 语音播报缺失 🟡
Web Speech API(SpeechSynthesis)：收款成功/取件核销/充值成功语音播报

### I-05 · 硬件状态可视化缺失 🟡
Header右侧增加：打印机绿/红点 + 扫码枪状态 + 异常时Header红色背景

### I-06 · 弹窗动效缺失 🟢
Motion库：中心弹窗scale 0.95→1 + opacity 0→1 (200ms)，右侧面板translateX(100%)→0 (250ms)

---

## 四、响应式适配缺陷

### R-01 · 移动端底部 Tab 缺失 🔴
Sidebar增加移动端底部Tab模式：固定5个高频入口(下单/取衣/客户/挂点/更多)，热区≥56px

### R-02 · 平板端图标模式 🟡
sm断点图标模式：w-16，仅图标，hover弹出文字Tooltip

### R-03 · ReceiveOrder 移动端三栏适配 🔴
移动端底部固定「查看汇总」悬浮按钮 → 点击弹出底部抽屉

---

## 五、整改优先级汇总

### 🔴 必改（影响核心收银流程）
G-04全局按钮, G-05全局金额, I-01数字键盘, I-02操作反馈, I-03危险确认, P-01收银页布局, P-02取衣页Mock, R-01移动端Tab, R-03收银移动端

### 🟡 应改（影响全局一致性）
G-01 Header员工/硬件, G-02 Sidebar热区/平板, G-03间距/圆角统一, G-06弹窗抽屉, P-03充值按钮, P-04挂点热区, I-04语音播报, I-05硬件状态

### 🟢 建议改（体验优化）
I-06弹窗动效, P-08占位页标签, P-09状态Tab角标, R-02平板图标

---

## 六、可复用组件开发清单

| 组件名 | 位置 | 用途 |
|---|---|---|
| `formatMoney(n)` | `src/app/utils/format.ts` | 统一 ¥ 金额格式化 |
| `<ConfirmDialog>` | `src/app/components/ui/ConfirmDialog.tsx` | 危险操作二次确认 |
| `<NumericKeypad>` | `src/app/components/ui/NumericKeypad.tsx` | 收银/充值数字键盘 |
| `<StatusBadge>` | `src/app/components/ui/StatusBadge.tsx` | 订单/衣物状态统一徽标 |
| `<EmptyState>` | `src/app/components/ui/EmptyState.tsx` | 空列表统一占位 |
| `<LoadingButton>` | `src/app/components/ui/LoadingButton.tsx` | 带 Loading 状态的按钮 |
| `<BottomDrawer>` | `src/app/components/ui/BottomDrawer.tsx` | 移动端底部抽屉（封装 vaul）|
| `useVoice()` | `src/app/hooks/useVoice.ts` | 语音播报 Hook |
| `useHardware()` | `src/app/hooks/useHardware.ts` | 硬件状态管理 Hook |

---

*走查人：Figma Make AI · 基于 UI/UX 设计规范文档 v1.0 · 2026-05-12*
