const { request } = require('../../utils/request');
const { formatDate } = require('../../utils/util');

Page({
  data: {
    serviceIds: '',
    doctorId: '',
    currentYear: 0,
    currentMonth: 0,
    days: [],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    slots: [],
    selectedDate: '',
    selectedSlot: '',
    scheduleDates: []   // 有排班的日期
  },

  onLoad(options) {
    this.setData({
      serviceIds: options.serviceIds || '',
      doctorId: options.doctorId || ''
    });

    const now = new Date();
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    });
    this.generateCalendar();
    this.loadScheduleDates();
  },

  // 生成日历
  generateCalendar() {
    const { currentYear, currentMonth } = this.data;
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = formatDate(new Date());

    const days = [];
    // 填充前面的空白
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: '', empty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < today;
      const hasSchedule = this.data.scheduleDates.includes(dateStr);
      const isSelected = dateStr === this.data.selectedDate;
      days.push({
        date: dateStr,
        day: d,
        empty: false,
        disabled: isPast || !hasSchedule,
        selected: isSelected,
        hasSchedule
      });
    }
    this.setData({ days });
  },

  // 加载有排班的日期
  async loadScheduleDates() {
    try {
      const data = await request(`/doctors/${this.data.doctorId}/schedules`);
      const dates = data.map(s => s.service_date);
      this.setData({ scheduleDates: dates }, () => this.generateCalendar());
    } catch (e) {
      // Fallback: 未来 7 天都可选
      const dates = [];
      for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(formatDate(d, 'YYYY-MM-DD'));
      }
      this.setData({ scheduleDates: dates }, () => this.generateCalendar());
    }
  },

  // 选择日期
  selectDay(e) {
    const { date, disabled } = e.currentTarget.dataset;
    if (disabled || !date) return;

    this.setData({ selectedDate: date, selectedSlot: '' });
    this.loadSlots(date);
    // 更新选中状态
    const days = this.data.days.map(d => ({
      ...d,
      selected: d.date === date
    }));
    this.setData({ days });
  },

  // 加载时段
  async loadSlots(date) {
    try {
      const data = await request(`/doctors/${this.data.doctorId}/schedules?date=${date}`);
      this.setData({ slots: data || this.getMockSlots() });
    } catch (e) {
      this.setData({ slots: this.getMockSlots() });
    }
  },

  // 选择时段
  selectSlot(e) {
    const slot = e.currentTarget.dataset.slot;
    this.setData({ selectedSlot: slot });
  },

  // 下一步
  goConfirm() {
    const { selectedDate, selectedSlot } = this.data;
    if (!selectedDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    if (!selectedSlot) {
      wx.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/booking/confirm?serviceIds=${this.data.serviceIds}&doctorId=${this.data.doctorId}&date=${selectedDate}&slot=${selectedSlot}`
    });
  },

  // 上/下月
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth }, () => this.generateCalendar());
  },
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear++;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth }, () => this.generateCalendar());
  },

  getMockSlots() {
    return [
      { id: 1, time_slot: '09:00-10:00', max_bookings: 3, booked_count: 1, available: true },
      { id: 2, time_slot: '10:00-11:00', max_bookings: 3, booked_count: 2, available: true },
      { id: 3, time_slot: '11:00-12:00', max_bookings: 3, booked_count: 0, available: true },
      { id: 4, time_slot: '14:00-15:00', max_bookings: 3, booked_count: 3, available: false },
      { id: 5, time_slot: '15:00-16:00', max_bookings: 3, booked_count: 1, available: true },
      { id: 6, time_slot: '16:00-17:00', max_bookings: 3, booked_count: 0, available: true }
    ];
  }
});
