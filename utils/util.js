/**
 * 常用工具函数
 */

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式，默认 'YYYY-MM-DD'
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

/**
 * 格式化价格（分转元）
 */
const formatPrice = (price) => {
  return (price / 100).toFixed(2);
};

/**
 * 防抖
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

/**
 * 节流
 */
const throttle = (fn, delay = 300) => {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

/**
 * 拨打电话
 */
const makePhoneCall = (phone) => {
  wx.makePhoneCall({ phoneNumber: phone });
};

/**
 * 订单状态映射
 */
const orderStatusMap = {
  0: { text: '待付款', class: 'status-pending' },
  1: { text: '待服务', class: 'status-paid' },
  2: { text: '已完成', class: 'status-done' },
  3: { text: '已取消', class: 'status-cancel' },
  4: { text: '退款中', class: 'status-pending' }
};

/**
 * 获取订单状态信息
 */
const getOrderStatus = (status) => {
  return orderStatusMap[status] || { text: '未知', class: '' };
};

module.exports = {
  formatDate,
  formatPrice,
  debounce,
  throttle,
  makePhoneCall,
  getOrderStatus
};
