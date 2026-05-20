# 点痣医美助手 - 微信小程序

微信小程序预约咨询系统，包含服务展示、在线预约、即时咨询、微信支付等功能。

## 技术栈

- **框架**: 微信小程序原生开发
- **基础库**: 2.20.0+
- **UI**: 自定义样式（推荐替换为 Vant Weapp）

## 项目结构

```
mole-removal-miniapp/
├── app.js / app.json / app.wxss    # 应用入口
├── project.config.json             # 项目配置（appid 为占位符）
├── sitemap.json
├── utils/
│   ├── config.js        # API 配置
│   ├── request.js       # 网络请求封装（token/401）
│   ├── storage.js       # 本地存储
│   └── util.js          # 工具函数
├── images/              # 图标和占位图
├── pages/
│   ├── home/            # 首页（Banner/服务/推荐医生）
│   ├── service/
│   │   ├── list         # 服务列表
│   │   └── detail       # 服务详情
│   ├── booking/
│   │   ├── select       # 选服务+选医生
│   │   ├── calendar     # 选日期+时段
│   │   └── confirm      # 填信息+支付
│   ├── consult/
│   │   ├── list         # 会话列表
│   │   └── chat         # 聊天页
│   ├── order/
│   │   ├── list         # 订单列表
│   │   └── detail       # 订单详情
│   └── user/
│       ├── center       # 个人中心
│       └── profile      # 个人信息
```

## 页面路由

| 页面 | 路径 | 导航 |
|------|------|------|
| 首页 | pages/home/home | tabBar |
| 服务列表 | pages/service/list | 首页跳转 |
| 服务详情 | pages/service/detail | 列表跳转 |
| 预约选择 | pages/booking/select | 详情跳转 |
| 预约日历 | pages/booking/calendar | 选择跳转 |
| 确认预约 | pages/booking/confirm | 日历跳转 |
| 咨询列表 | pages/consult/list | tabBar |
| 聊天页 | pages/consult/chat | 列表跳转 |
| 订单列表 | pages/order/list | tabBar |
| 订单详情 | pages/order/detail | 列表跳转 |
| 个人中心 | pages/user/center | tabBar |
| 个人资料 | pages/user/profile | 中心跳转 |

## 快速开始

1. 用微信开发者工具打开此目录
2. 在 `utils/config.js` 修改 `apiBase` 为实际后端地址
3. 替换 `project.config.json` 中的 `touristappid` 为真实 AppID
4. 替换 `images/` 中的占位图为实际素材

## 后端接口

详见设计文档 `WxMiniProg_Mom.md`。核心接口：
- `POST /auth/login` - 微信登录
- `GET/POST /orders` - 订单 CRUD & 支付
- `GET /services` - 服务列表
- `GET /doctors` - 医生列表
- `GET /doctors/:id/schedules` - 排班
- `POST /consult/send` - 发送消息

## 占位图标

运行 `python3 gen_icons.py` 可重新生成占位图标（需要 Pillow 库）。
