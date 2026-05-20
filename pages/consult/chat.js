const { request, uploadImage } = require('../../utils/request');
const { formatDate } = require('../../utils/util');

Page({
  data: {
    receiverId: '',
    receiverName: '医生',
    messages: [],
    inputValue: '',
    page: 1,
    hasMore: true,
    loading: false,
    scrollToView: '',
    keyboardHeight: 0
  },

  onLoad(options) {
    this.setData({
      receiverId: options.receiverId || '',
      receiverName: options.receiverName || '医生'
    });
    wx.setNavigationBarTitle({ title: this.data.receiverName });
    this.loadMessages();
  },

  onKeyboardHeightChange(e) {
    this.setData({ keyboardHeight: e.detail.height });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMessages();
    }
  },

  async loadMessages() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const data = await request('/consult/messages', 'GET', {
        receiver_id: this.data.receiverId,
        page: this.data.page,
        pageSize: 20
      });

      const newMsgs = (data.list || []).reverse().map(m => ({
        ...m,
        time_str: formatDate(m.created_at, 'HH:mm')
      }));

      this.setData({
        messages: this.data.page === 1 ? newMsgs : [...newMsgs, ...this.data.messages],
        hasMore: newMsgs.length >= 20,
        page: this.data.page + 1,
        loading: false,
        scrollToView: this.data.page === 1 && newMsgs.length > 0 ? `msg-${newMsgs[newMsgs.length - 1].id}` : ''
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  // 输入
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 发送文字
  async sendText() {
    const content = this.data.inputValue.trim();
    if (!content) return;

    // 乐观更新：先显示在界面上
    const tempMsg = {
      id: Date.now(),
      user_id: 'self',
      content,
      msg_type: 1,
      created_at: new Date().toISOString(),
      time_str: formatDate(new Date(), 'HH:mm'),
      sending: true
    };
    const messages = [...this.data.messages, tempMsg];
    this.setData({
      messages,
      inputValue: '',
      scrollToView: `msg-${tempMsg.id}`
    });

    try {
      await request('/consult/send', 'POST', {
        receiver_id: this.data.receiverId,
        content,
        msg_type: 1
      });
      // 标记发送成功
      const idx = messages.findIndex(m => m.id === tempMsg.id);
      if (idx > -1) {
        messages[idx].sending = false;
        this.setData({ messages });
      }
    } catch (e) {
      const idx = messages.findIndex(m => m.id === tempMsg.id);
      if (idx > -1) {
        messages[idx].sending = false;
        messages[idx].sendFail = true;
        this.setData({ messages });
      }
    }
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await wx.chooseImage({ count: 1, sizeType: ['compressed'] });
      const filePath = res.tempFilePaths[0];

      // 乐观更新
      const tempMsg = {
        id: Date.now(),
        user_id: 'self',
        content: '',
        msg_type: 2,
        image_url: filePath,
        created_at: new Date().toISOString(),
        time_str: formatDate(new Date(), 'HH:mm'),
        sending: true
      };
      const messages = [...this.data.messages, tempMsg];
      this.setData({ messages, scrollToView: `msg-${tempMsg.id}` });

      // 上传图片
      const imageUrl = await uploadImage(filePath);

      // 发送图片消息
      await request('/consult/send', 'POST', {
        receiver_id: this.data.receiverId,
        content: '',
        msg_type: 2,
        image_url: imageUrl
      });

      // 更新消息
      const idx = messages.findIndex(m => m.id === tempMsg.id);
      if (idx > -1) {
        messages[idx].sending = false;
        messages[idx].image_url = imageUrl;
        this.setData({ messages });
      }
    } catch (e) {
      // 用户取消选择不提示
      if (e.errMsg && e.errMsg.includes('cancel')) return;
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({ urls: [url], current: url });
  }
});
