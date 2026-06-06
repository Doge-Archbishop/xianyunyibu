/**
 * 紫微斗数 — 输入页面
 */

Page({
  data: {
    birthDate: '2000-01-01',
    birthHour: 12,
    birthMinute: 0,
    gender: '男' as '男' | '女',
  },

  onDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ birthDate: e.detail.value });
  },

  onHourChange(e: WechatMiniprogram.SliderChange) {
    this.setData({ birthHour: e.detail.value });
  },

  onMinuteChange(e: WechatMiniprogram.SliderChange) {
    this.setData({ birthMinute: e.detail.value });
  },

  onGenderChange(e: WechatMiniprogram.TouchEvent) {
    const gender = e.currentTarget.dataset.gender as '男' | '女';
    this.setData({ gender });
  },

  onCalculate() {
    // ZWDS service placeholder — will be implemented in next iteration
    wx.showToast({ title: '紫微斗数模块开发中，敬请期待', icon: 'none' });

    // When ZWDS service is ready:
    // const app = getApp<{ globalData: Record<string, unknown> }>();
    // app.globalData.zwdsResult = result;
    // wx.navigateTo({ url: '/pages/zwds/chart' });
  },
});
