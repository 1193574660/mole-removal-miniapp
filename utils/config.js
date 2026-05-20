// API 配置文件 - 部署时修改此处
const config = {
  // 后端 API 基础地址
  apiBase: 'https://your-api-domain.com/v1',

  // 图片资源基础地址
  imageBase: 'https://cdn.example.com',

  // 微信支付相关
  pay: {
    mchId: '',     // 商户号
    apiKey: ''     // API Key
  },

  // 订单设置
  order: {
    autoCancelMinutes: 30  // 未支付订单自动取消时间（分钟）
  },

  // 云存储配置（用于咨询图片上传）
  upload: {
    cosRegion: 'ap-guangzhou',
    cosBucket: 'mole-app-1250000000',
    cosPath: 'consult-images/'
  }
};

module.exports = config;
