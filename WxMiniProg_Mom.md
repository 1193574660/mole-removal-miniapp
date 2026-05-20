# 点痣预约咨询小程序 - 设计文档

> 本文档用于指导 OpenClaw 自动开发微信小程序前端及配套后端接口，涵盖用户端核心功能：服务浏览、预约、咨询、微信支付。

## 1. 项目概述

- **项目名称**：点痣医美助手（Mole Removal Assistant）
- **目标平台**：微信小程序（iOS/Android）
- **核心功能**：
  - 点痣服务项目展示（按颗数、面积、难度定价）
  - 在线预约（选择日期、时段、医生/技师）
  - 即时咨询（文字/图片消息，客服或医生回复）
  - 微信支付（预付款/全款）
  - 订单管理（待付款、待服务、已完成、已取消）
  - 个人中心（预约记录、咨询记录、收藏）
- **用户角色**：普通用户（C端）、后台管理员（通过独立管理端操作，本文档仅涉及后端API需求）

## 2. 功能需求清单

### 2.1 用户端（小程序）

| 模块         | 功能点                                                       |
| ------------ | ------------------------------------------------------------ |
| 登录/授权    | 微信手机号一键登录，获取用户昵称/头像（可选）                |
| 首页         | Banner广告位、服务项目快捷入口、热门医生推荐、最新优惠        |
| 服务列表     | 按项目分类（面部点痣、身体点痣、复合痣等），展示价格、所需时长、已售数量 |
| 服务详情     | 图文介绍、价格明细、注意事项、用户评价、预约按钮              |
| 预约流程     | 选择服务（可多选/组合） → 选择医生/技师 → 选择日期 + 时段 → 填写个人信息（姓名、电话、备注） → 提交订单 → 支付 |
| 咨询         | 会话列表（与医生/客服的对话）、发送文字/图片、查看历史消息    |
| 订单管理     | 全部/待付款/待服务/已完成/已取消，支持取消订单（未支付直接取消，已支付需审核） |
| 支付         | 调用微信支付（统一下单 → 预付单 → 调起支付），支付成功后更新订单状态 |
| 个人中心     | 头像昵称、手机号、我的预约、我的咨询、我的收藏、联系客服      |

### 2.2 后台管理需求（仅API，供管理端调用）

- 服务项目CRUD
- 医生/技师排班管理
- 订单管理（确认/取消/退款）
- 咨询回复（客服或医生）
- 数据统计（预约量、收入）

## 3. 页面设计（小程序端）

> 共需以下页面，使用微信小程序原生语法（wxml/wxss/js/json）。路由采用 tabBar + 普通页面。

| 页面路径                 | 描述                     | 导航方式       |
| ------------------------ | ------------------------ | -------------- |
| pages/home/home          | 首页                     | tabBar         |
| pages/service/list       | 服务列表页               | 首页跳转       |
| pages/service/detail     | 服务详情页               | 列表页跳转     |
| pages/booking/select     | 预约选择页（选服务、医生） | 详情页跳转     |
| pages/booking/calendar   | 预约时间选择页           | 选择页跳转     |
| pages/booking/confirm    | 确认预约页（填信息+支付） | 时间页跳转     |
| pages/consult/list       | 咨询会话列表             | tabBar         |
| pages/consult/chat       | 聊天详情页               | 会话列表跳转   |
| pages/order/list         | 订单列表                 | tabBar / 个人中心 |
| pages/order/detail       | 订单详情                 | 订单列表跳转   |
| pages/user/center        | 个人中心                 | tabBar         |
| pages/user/profile       | 个人信息编辑             | 个人中心跳转   |

## 4. 数据库设计（简略示意）

> 供后端开发参考，需提供对应RESTful API。

### 4.1 用户表 `users`

| 字段名          | 类型        | 说明                         |
| --------------- | ----------- | ---------------------------- |
| id              | int         | 主键                         |
| openid          | varchar(64) | 微信openid                   |
| phone           | varchar(20) | 手机号（授权后获取）         |
| nickname        | varchar(50) | 昵称                         |
| avatar          | varchar(255)| 头像URL                      |
| created_at      | datetime    | 注册时间                     |

### 4.2 服务项目表 `services`

| 字段名      | 类型        | 说明                       |
| ----------- | ----------- | -------------------------- |
| id          | int         | 主键                       |
| name        | varchar(100)| 服务名称（如“单颗普通点痣”） |
| cover_image | varchar(255)| 封面图                     |
| price       | decimal(10,2)| 单价（元）                |
| duration    | int         | 预计时长（分钟）           |
| description | text        | 详细介绍（富文本）         |
| status      | tinyint     | 1上架 0下架                |

### 4.3 医生/技师表 `doctors`

| 字段名      | 类型        | 说明                   |
| ----------- | ----------- | ---------------------- |
| id          | int         | 主键                   |
| name        | varchar(20) | 姓名                   |
| title       | varchar(50) | 职称/擅长              |
| avatar      | varchar(255)| 头像                   |
| sort_order  | int         | 排序                   |

### 4.4 排班表 `schedules`

| 字段名      | 类型        | 说明                         |
| ----------- | ----------- | ---------------------------- |
| id          | int         | 主键                         |
| doctor_id   | int         | 关联医生                     |
| service_date| date        | 日期（2025-03-20）           |
| time_slot   | varchar(20) | 时段（如“09:00-10:00”）      |
| max_bookings| int         | 最大预约数                   |
| booked_count| int         | 已预约数                     |
| status      | tinyint     | 1可用 0停用                  |

### 4.5 预约订单表 `orders`

| 字段名         | 类型         | 说明                           |
| -------------- | ------------ | ------------------------------ |
| id             | int          | 主键                           |
| order_no       | varchar(32)  | 唯一订单号                     |
| user_id        | int          | 用户ID                         |
| service_id     | int          | 服务ID                         |
| doctor_id      | int          | 医生ID                         |
| schedule_id    | int          | 排班ID                         |
| service_date   | date         | 服务日期                       |
| time_slot      | varchar(20)  | 时段                           |
| total_price    | decimal(10,2)| 实付金额                       |
| status         | tinyint      | 0待付款 1待服务 2已完成 3已取消 4退款中 |
| remark         | varchar(200) | 用户备注                       |
| paid_at        | datetime     | 支付时间                       |
| cancel_reason  | varchar(200) | 取消原因                       |
| created_at     | datetime     | 下单时间                       |

### 4.6 咨询消息表 `consult_messages`

| 字段名      | 类型         | 说明                           |
| ----------- | ------------ | ------------------------------ |
| id          | int          | 主键                           |
| user_id     | int          | 发送者用户ID                   |
| receiver_id | int          | 接收者（医生或客服）ID         |
| content     | text         | 消息内容                       |
| msg_type    | tinyint      | 1文字 2图片                    |
| image_url   | varchar(255) | 图片地址（若为图片）           |
| is_read     | tinyint      | 0未读 1已读                    |
| created_at  | datetime     | 发送时间                       |

## 5. 后端接口设计（RESTful JSON）

> 基础路径：`https://api.example.com/v1`  
> 认证方式：Bearer Token（通过 wx.login 获取 code，后端换取 openid 后下发自定义 token）

### 5.1 用户认证

| 接口               | 方法 | 说明                         |
| ------------------ | ---- | ---------------------------- |
| `/auth/login`      | POST | 接收 code，返回 token, openid |
| `/auth/phone`      | POST | 接收加密手机号数据，绑定手机号 |
| `/users/profile`   | GET  | 获取当前用户信息             |

### 5.2 服务模块

| 接口                     | 方法 | 说明                           |
| ------------------------ | ---- | ------------------------------ |
| `/services`              | GET  | 服务列表（支持分页、按分类筛选）|
| `/services/{id}`         | GET  | 服务详情                       |

### 5.3 医生与排班

| 接口                                 | 方法 | 说明                       |
| ------------------------------------ | ---- | -------------------------- |
| `/doctors`                           | GET  | 获取所有医生列表           |
| `/doctors/{id}/schedules?date=2025-03-20` | GET  | 获取指定医生某日可预约时段 |

### 5.4 预约订单

| 接口                       | 方法 | 说明                               |
| -------------------------- | ---- | ---------------------------------- |
| `/orders/preview`          | POST | 预览订单（计算价格，不生成订单）     |
| `/orders/create`           | POST | 创建订单（状态待付款）              |
| `/orders/{orderNo}/pay`    | POST | 发起支付，返回 prepay_id 及支付参数 |
| `/orders`                  | GET  | 获取我的订单列表（支持 status 筛选）|
| `/orders/{orderNo}`        | GET  | 订单详情                           |
| `/orders/{orderNo}/cancel` | POST | 取消订单（未支付直接取消；已支付需退款） |

### 5.5 咨询模块

| 接口                               | 方法 | 说明                           |
| ---------------------------------- | ---- | ------------------------------ |
| `/consult/sessions`                | GET  | 获取咨询会话列表（最近联系医生） |
| `/consult/messages?receiver_id=&page=` | GET  | 获取与某医生的聊天记录分页      |
| `/consult/send`                    | POST | 发送消息（文字/图片，图片先传 COS） |
| `/consult/unread`                  | GET  | 获取未读消息总数（红点提示）    |

### 5.6 微信支付回调

| 接口                   | 方法 | 说明                                    |
| ---------------------- | ---- | --------------------------------------- |
| `/wechat/pay/callback` | POST | 微信支付结果异步通知，更新订单状态为待服务 |

## 6. 核心业务逻辑

### 6.1 预约流程

1. 用户选择服务（支持数量修改，价格 = 单价 * 数量）
2. 选择医生（展示医生排班表，灰色不可约）
3. 选择日期（日历组件，仅展示有排班的日期）
4. 选择时段（从 `/doctors/{id}/schedules` 获取，校验已预约数 < max_bookings）
5. 填写姓名、电话、备注（电话自动带出已绑定的）
6. 提交订单：后端生成订单，状态=0待付款
7. 前端调起微信支付，支付成功后后端将状态改为1待服务，并增加排班表的 booked_count
8. 支付失败或取消，订单保持待付款，30分钟未支付自动取消（后端定时任务）

### 6.2 咨询规则

- 咨询采用单向客服模式：用户消息先发给系统指定的客服组或医生（后台可配置）
- 当用户发送消息时，后端给接收者（管理员）发送模板消息（可选）
- 支持上传图片（调用微信 wx.chooseImage，上传至云存储，再发送图片URL）
- 聊天记录保存，并支持分页加载

### 6.3 支付与退款

- 使用微信支付 JSAPI 方式
- 用户申请取消已支付订单，需后台人工处理（支持全额退款到原支付账户）
- 退款调用微信退款接口，并更新订单状态为已取消

## 7. 小程序技术栈建议

- **框架**：微信小程序原生开发（不使用 uni-app 以利自动化）
- **UI 组件库**：可选用 Vant Weapp 或 WeUI
- **状态管理**：使用 `mobx-miniprogram` 或原生 `globalData`
- **网络请求**：封装 `wx.request`，自动携带 token，处理 401 重登录
- **日历组件**：建议自定义或使用 `miniprogram-datepicker` 扩展
- **图表**：无需
- **地图**：暂不需要（如果门店导航，可后续增加）

## 8. 非功能性要求

- 安全性：所有接口需校验 token，敏感操作（支付、取消）需检查订单归属
- 并发：高峰预约时段需使用行锁或事务避免超卖（schedule.booked_count 原子增加）
- 数据缓存：服务列表可缓存 5 分钟，排班数据实时查询
- 兼容性：微信基础库版本 2.20.0 以上
- 错误处理：所有网络请求需展示 loading 及友好错误提示

## 9. 开发注意事项（针对 OpenClaw）

- 微信小程序项目目录结构按标准生成，在 `app.json` 中配置所有页面路由和 tabBar。
- 必须包含 `project.config.json` 文件，填入最小 appid 占位符（如 `touristappid`）。
- 所有后端接口域名需统一配置在 `utils/config.js` 中，方便替换。
- 支付流程需模拟？开发测试阶段可使用微信沙箱环境，文档提供支付参数获取示例代码。
- 咨询中的图片上传需要集成腾讯云 COS 或 微信云开发存储，给出封装好的 `uploadImage` 函数。
- 订单列表页要实现下拉刷新和上拉分页。
- 设计文档输出的代码应当能够直接导入微信开发者工具预览。

## 10. 附录：关键代码片段样例（非必须，但可提高自动开发准确性）

### 10.1 网络请求封装 (`utils/request.js`)

```javascript
const BASE_URL = 'https://api.example.com/v1';

const request = (url, method, data) => {
  const token = wx.getStorageSync('token');
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) resolve(res.data.data);
        else if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.reLaunch({ url: '/pages/login/login' });
        } else reject(res.data);
      },
      fail: reject
    });
  });
};