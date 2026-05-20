# 点痣医美助手 · 微信小程序

[![微信小程序](https://img.shields.io/badge/微信-小程序-07C160?logo=wechat)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![基础库](https://img.shields.io/badge/基础库-2.20.0+-3D7BFF)](https://developers.weixin.qq.com/miniprogram/dev/framework/release/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

面向医美机构的微信小程序，提供**点痣服务展示 → 在线预约 → 微信支付 → 即时咨询**全流程数字化解决方案。

> 📖 设计文档：[WxMiniProg_Mom.md](./WxMiniProg_Mom.md)  
> 🐛 调试指南：[DEBUG.md](./DEBUG.md)

---

## 功能概览

| 功能 | 说明 |
|------|------|
| 🏠 **首页** | Banner 轮播、分类入口、热门服务、推荐医生 |
| 📋 **服务展示** | 按分类浏览、图文详情、价格/时长/销量展示 |
| 📅 **在线预约** | 三步流程：选服务+医生 → 选日期+时段 → 填信息+支付 |
| 💳 **微信支付** | JSAPI 支付、待支付订单 30 分钟自动取消 |
| 💬 **即时咨询** | 与医生/客服文字/图片聊天，支持乐观更新 |
| 📦 **订单管理** | 按状态筛选（待付款/待服务/已完成/已取消）、取消/退款 |
| 👤 **个人中心** | 头像昵称修改、微信手机号授权、历史记录入口 |

---

## 快速开始

### 环境要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（最新稳定版）
- Node.js（可选，仅用于图标生成脚本）
- 微信小程序 AppID（测试可用 `touristappid`）

### 1. 克隆项目

```bash
git clone git@github.com:1193574660/mole-removal-miniapp.git
```

### 2. 打开项目

1. 启动微信开发者工具
2. 选择「导入项目」→ 指向项目根目录
3. AppID 填入 `wx08fa0cfd66161493`

### 3. 修改配置

编辑 **`utils/config.js`**：

```js
apiBase: 'https://你的后端域名/api/v1',  // ← 改为实际后端地址
```

如需接入微信支付，同时填写：

```js
pay: {
  mchId: '你的商户号',
  apiKey: '你的API密钥'
}
```

### 4. 编译运行

点击「编译」即可在模拟器中预览。  
**无后端也可以运行** — 项目内置 Mock 数据回退机制。

---

## 项目结构

```
mole-removal-miniapp/
├── app.js                   # 应用入口：登录、globalData
├── app.json                 # 全局配置：页面路由、tabBar、window
├── app.wxss                 # 全局样式
├── project.config.json      # 微信开发者工具项目配置
├── sitemap.json             # 微信索引配置
│
├── utils/                   # 工具类
│   ├── config.js            # 配置文件（API 地址、支付参数）
│   ├── request.js           # 网络请求封装（token/401/loading）
│   ├── storage.js           # 本地存储封装
│   └── util.js              # 工具函数（日期、防抖、订单状态）
│
├── images/                  # 图标资源（tabBar、占位图）
│
└── pages/                   # 页面
    ├── home/                # 首页
    ├── service/
    │   ├── list/            # 服务列表
    │   └── detail/          # 服务详情
    ├── booking/
    │   ├── select/          # 步骤1：选择服务 & 医生
    │   ├── calendar/        # 步骤2：选择日期 & 时段
    │   └── confirm/         # 步骤3：填写信息 & 支付
    ├── consult/
    │   ├── list/            # 咨询会话列表
    │   └── chat/            # 聊天详情
    ├── order/
    │   ├── list/            # 订单列表
    │   └── detail/          # 订单详情
    └── user/
        ├── center/          # 个人中心
        └── profile/         # 个人信息编辑
```

---

## 页面导航图

```
┌────────────────────────────────────────────┐
│  TabBar                                     │
│  ├── 🏠 首页 (home)                         │
│  │     ├── 分类入口 → 服务列表 (list)        │
│  │     │     └── 详情 (detail)               │
│  │     │         └── 预约选择 (select)        │
│  │     │             └── 预约日历 (calendar)  │
│  │     │                 └── 确认预约 (confirm)│
│  │     │                     └── 订单详情      │
│  │     └── 推荐医生                          │
│  ├── 💬 咨询 (consult/list)                  │
│  │     └── 聊天 (chat)                      │
│  ├── 📋 订单 (order/list)                    │
│  │     └── 详情 (detail)                     │
│  └── 👤 我的 (user/center)                   │
│        └── 资料编辑 (profile)                │
└────────────────────────────────────────────┘
```

---

## 核心设计

### 网络层

`utils/request.js` 封装了所有网络请求：

- **自动 Token 管理**：从 `wx.storage` 读取 token，注入 `Authorization` 头
- **401 自动重登**：token 过期时清除旧 token → 调用 `app.login()` → 重试原请求
- **统一错误提示**：非 0 code 自动 toast 错误信息

```js
// 示例：请求服务列表
const { request } = require('../../utils/request');
const data = await request('/services', 'GET', { page: 1, pageSize: 10 });
// data = { list: [...], total: 100 }
```

### 支付流程

```
用户点击支付
  ↓
POST /orders/{orderNo}/pay   → 获取 prepay_id 等参数
  ↓
wx.requestPayment({...})     → 调起微信支付收银台
  ↓
成功 → 跳转订单详情
失败/取消 → 弹窗提示，订单保留待付款状态
```

### 预约防超卖

- 排班表 `schedules` 维护 `max_bookings` 和 `booked_count`
- 创建订单时后端需使用**行锁或原子操作**更新 `booked_count`
- 前端在日历页实时展示剩余名额

---

## 接入后端

### 后端接口要求

统一返回格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

### 核心接口清单

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 微信登录，返回 token |
| POST | `/auth/phone` | 绑定手机号 |
| GET | `/services` | 服务列表（分页） |
| GET | `/services/:id` | 服务详情 |
| GET | `/doctors` | 医生列表 |
| GET | `/doctors/:id/schedules?date=` | 排班查询 |
| POST | `/orders/create` | 创建订单 |
| POST | `/orders/:orderNo/pay` | 发起支付 |
| GET | `/orders` | 订单列表（分页+status筛选） |
| GET | `/orders/:orderNo` | 订单详情 |
| POST | `/orders/:orderNo/cancel` | 取消/退款 |
| GET | `/consult/sessions` | 咨询会话列表 |
| GET | `/consult/messages` | 聊天记录分页 |
| POST | `/consult/send` | 发送消息 |
| POST | `/wechat/pay/callback` | 微信支付回调 |

详细字段请求/响应规范见 [DEBUG.md](./DEBUG.md) 第五节。

---

## 占位图标

当前图标为纯色占位块，替换步骤：

1. 准备相应尺寸的 PNG 图标
2. 覆盖 `images/` 目录下同名文件
3. 如需重新生成占位图标：`python3 gen_icons.py`（需要 Pillow 库）

推荐图标尺寸：

| 类型 | 尺寸 |
|------|------|
| tabBar 图标 | 81×81 px |
| 服务封面图 | 750×400 px |
| 医生头像 | 200×200 px |

---

## 开发规范

- 每个页面 4 个文件：`.js` `.json` `.wxml` `.wxss`
- 所有网络请求通过 `utils/request.js` 统一调用
- 价格存储单位为**分**（避免浮点精度问题），显示时 `/100` 转换
- 订单状态码：`0待付款` `1待服务` `2已完成` `3已取消` `4退款中`
- mock 数据作为 catch 分支，API 正常时不会被调用

---

## License

MIT

---

*Built by OpenClaw AI Assistant · 2026-05-20*
