# 点痣医美助手 · 调试指南 (DEBUG.md)

> 本文档记录项目架构、常见故障排查方法和开发调试流程。  
> 设计文档参考：[WxMiniProg_Mom.md](./WxMiniProg_Mom.md)

---

## 一、项目架构速览

```
用户 → 小程序页面 → utils/request.js → 后端 API
                         ↓ (失败)
                    Mock 数据 Fallback
```

### 1.1 数据流

```
app.js (onLaunch)
  ├── 检查 wx.storage 中的 token
  ├── 无 token → wx.login() → POST /auth/login → 存 token + userInfo
  └── 有 token → 直接进入首页

页面 onLoad()
  ├── 调用 utils/request.js 封装的 request()
  │     ├── 自动带 Authorization: Bearer <token>
  │     ├── 401 → 清除 token → 重新 login() → 重试请求
  │     └── 其他错误 → toast 提示
  └── catch (err) → 使用 getMockXxx() 静态数据渲染（开发期兜底）
```

### 1.2 文件职责

| 文件 | 职责 |
|------|------|
| `app.js` | 应用入口，login() 方法，globalData |
| `app.json` | 页面路由注册 + tabBar 配置 + window 样式 |
| `app.wxss` | 全局样式（card、btn-primary、tag、empty 等） |
| `project.config.json` | 微信开发者工具项目配置 |
| `utils/config.js` | **唯一配置入口** — apiBase、支付参数、上传配置 |
| `utils/request.js` | wx.request 封装：自动 token、401 重登、loading |
| `utils/storage.js` | wx.storage 同步 API 封装 |
| `utils/util.js` | formatDate、getOrderStatus、防抖节流等工具函数 |

### 1.3 页面间数据传递

```
服务列表 → 服务详情:   wx.navigateTo({ url: `/pages/service/detail?id=${id}` })
服务详情 → 预约选择:   wx.navigateTo({ url: `/pages/booking/select?serviceId=${id}` })
预约选择 → 预约日历:   wx.navigateTo({ url: `...?serviceIds=1,2&doctorId=3` })
预约日历 → 确认预约:   wx.navigateTo({ url: `...?serviceIds=&doctorId=&date=&slot=` })
确认预约 → 订单详情:   wx.redirectTo({ url: `/pages/order/detail?orderNo=xxx` })

注：跨页面仅传递 ID 类参数，详情数据由目标页面自行请求。
```

---

## 二、开发环境调试流程

### 2.1 首次启动 Checklist

- [ ] 微信开发者工具打开项目目录
- [ ] `project.config.json` 中 `appid` 改为真实 AppID（或保留 `touristappid` 用测试号）
- [ ] `utils/config.js` 中 `apiBase` 指向真实后端（开发阶段可先用 Mock 数据）
- [ ] 检查 tabBar 图标路径：`images/tab-*.png` 文件存在
- [ ] 点击「编译」→ 查看 Console 有无报错

### 2.2 无后端时的纯前端调试

项目内置 Mock 回退机制——当 API 请求失败时，每个页面自动降级到静态数据。  
**你可以在完全没有后端的情况下预览全部页面和交互流程。**

> 当前 Mock 数据覆盖：首页、服务列表/详情、预约流程、医生列表、订单、聊天。  
> 真实数据接入后，Mock 逻辑不会生效（只有 catch 分支触发）。

### 2.3 微信开发者工具调试技巧

```
// Console 中查看 token 状态
wx.getStorageSync('token')

// 清除缓存（模拟首次登录）
wx.clearStorageSync()

// 查看 App 全局数据
getApp().globalData

// 手动触发登录
getApp().login().then(u => console.log('登录成功', u))
```

---

## 三、常见故障排查

### 3.1 页面白屏 / 编译报错

| 现象 | 可能原因 | 解决方法 |
|------|----------|----------|
| 编译后白屏 | `app.json` 中 `pages` 路径错误 | 检查 `pages` 数组第一项是否为 `pages/home/home` |
| `Page "xxx" has not been registered yet` | 页面未在 `app.json` 注册 | 在 `app.json.pages` 中添加路径 |
| tabBar 图标不显示 | `images/` 下缺少对应的 png | 运行 `python3 gen_icons.py` 重新生成 |
| `Module not defined` | require 路径错误 | 检查相对路径 `../../utils/xxx` 是否正确 |

### 3.2 网络请求相关

| 现象 | 排查方法 |
|------|----------|
| 请求一直 loading | 1. 微信开发者工具 → 详情 → 不校验合法域名打钩 <br> 2. 检查 `config.apiBase` 是否可达 |
| "网络异常，请稍后重试" | 后端未启动 / URL 错误 / SSL 证书问题 |
| 401 无限重登录 | 后端 `/auth/login` 返回格式不对；期望 `{ code: 0, data: { token, userInfo } }` |
| 请求成功但页面无数据 | 后端返回的数据结构不对；期望 `{ code: 0, data: { list: [...], ... } }` |

### 3.3 支付相关

| 现象 | 原因 |
|------|------|
| 支付调不起来 | `wx.requestPayment` 参数不对；注意 `timeStamp` 必须是字符串 |
| "支付未完成"弹窗 | 用户取消支付，订单已生成（状态=待付款），可在订单列表继续支付 |
| 支付成功但状态未更新 | 检查后端支付回调 `/wechat/pay/callback` 是否正确更新订单状态 |

### 3.4 预约日历异常

| 现象 | 原因 |
|------|------|
| 所有日期都是灰色不可选 | `/doctors/:id/schedules` 未返回数据，Mock fallback 只生成未来 7 天 |
| 选时段后按钮不出现 | `selectedDate` 和 `selectedSlot` 有一个为空 |
| 时段显示"已满" | `booked_count >= max_bookings` |

### 3.5 咨询聊天问题

| 现象 | 排查 |
|------|------|
| 消息发送中一直转 | `POST /consult/send` 未返回；查看 Network 面板 |
| 图片发送失败 | `uploadImage` 中的 `/upload/image` 接口不可用 |
| 历史消息未加载 | `/consult/messages` 返回格式不符；期望 `{ code: 0, data: { list: [...] } }` |

---

## 四、配置项速查

所有需要修改的配置集中在 **`utils/config.js`**：

```js
apiBase          → 后端 API 地址（必改）
imageBase        → 图片 CDN 地址
pay.mchId        → 微信支付商户号（接入支付时必改）
pay.apiKey       → 微信支付 API Key
order.autoCancelMinutes → 未支付自动取消时间
upload.cosRegion → COS 地域
upload.cosBucket → COS 存储桶
```

其他关键配置：

```js
// project.config.json
"appid": "touristappid"          → 改为真实 AppID
"libVersion": "2.20.0"           → 基础库最低版本

// 微信开发者工具
详情 → 本地设置 → ☑ 不校验合法域名、web-view、TLS 版本
```

---

## 五、后端接口契约核对

后端必须返回统一格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

`code === 0` 表示成功，其他值表示失败。  
`request.js` 仅当 `statusCode === 200 && code === 0` 时 resolve。  
**如果后端返回格式不同，需要修改 `request.js` 中的判断逻辑。**

关键接口返回字段核对：

| 接口 | 期望 data 字段 |
|------|---------------|
| `POST /auth/login` | `{ token, userInfo: { nickname, avatar, phone } }` |
| `GET /services` | `{ list: [{ id, name, price, ... }] }` + 分页支持 |
| `GET /doctors` | `{ list: [{ id, name, title, avatar }] }` |
| `GET /doctors/:id/schedules?date=` | `[{ time_slot, max_bookings, booked_count }]` |
| `POST /orders/create` | `{ orderNo }` |
| `POST /orders/:orderNo/pay` | `{ timeStamp, nonceStr, package, signType, paySign }` |
| `GET /orders` | `{ list: [{ orderNo, status, ... }] }` |
| `GET /consult/sessions` | `{ list: [{ id, name, last_msg, unread }] }` |
| `GET /consult/messages` | `{ list: [{ id, content, msg_type, created_at }] }` |
| `POST /consult/send` | `{}`（无需返回特殊字段） |

---

## 六、调试技巧

### 6.1 模拟不同后端响应

在 `utils/request.js` 的 `success` 回调中加临时代码：

```js
// 模拟 401（测试重登录流程）
if (url.includes('/test-401')) {
  res.statusCode = 401;
}
```

### 6.2 追踪页面跳转参数

在每个页面的 `onLoad(options)` 第一行加：

```js
console.log('[页面名] onLoad options:', JSON.stringify(options));
```

### 6.3 查看 Mock 数据是否生效

页面 `loadXxx()` 方法中，Mock 数据在 `catch` 分支。  
如果页面显示了数据但 Network 面板无请求，说明走了 Mock 分支。

---

## 七、已知限制 & TODO

- [ ] 占位图标为纯色块，需替换为设计稿素材
- [ ] `wx.requestPayment` 在开发者工具中可能不可用，需真机测试
- [ ] 咨询图片上传目前用 `/upload/image`，未对接腾讯云 COS 直传
- [ ] Order 列表的 `cancelOrder` 对于已支付订单调用退款接口，后端需支持
- [ ] 没有做 WebSocket 实时推送，聊天需手动刷新
- [ ] `project.config.json` 中 `appid` 为 `touristappid`，上线前必须替换
- [ ] `libVersion: 2.20.0`，如需更低版本兼容需降级

---

*最后更新：2026-05-20*
