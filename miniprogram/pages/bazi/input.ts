/**
 * 八字 — 输入页面
 */

import { DI_ZHI, DI_ZHI_HOURS } from '../../services/constants';
import { calculateBaZi } from '../../services/bazi.service';
import type { DiZhi, BaZiResult } from '../../services/types';

Page({
  data: {
    birthDate: '2000-01-01',
    birthHour: 12,
    hourBranch: '午' as DiZhi,
    hourBranches: [] as { value: DiZhi; label: string }[],
    gender: '男' as '男' | '女',
  },

  onLoad() {
    const hours = DI_ZHI.map(zhi => ({
      value: zhi,
      label: DI_ZHI_HOURS[zhi].name + ' (' + DI_ZHI_HOURS[zhi].hourRange[0] + ':00-' + DI_ZHI_HOURS[zhi].hourRange[1] + ':00)',
    }));
    this.setData({ hourBranches: hours });
  },

  /** 选择日期 */
  onDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ birthDate: e.detail.value });
  },

  /** 选择时辰 */
  onHourChange(e: WechatMiniprogram.PickerChange) {
    const index = parseInt(e.detail.value);
    this.setData({ hourBranch: DI_ZHI[index] });
  },

  /** 选择性别 */
  onGenderChange(e: WechatMiniprogram.TouchEvent) {
    const gender = e.currentTarget.dataset.gender as '男' | '女';
    this.setData({ gender });
  },

  /** 排盘 */
  onCalculate() {
    const result = calculateBaZi({
      solarDate: this.data.birthDate,
      hourBranch: this.data.hourBranch,
      gender: this.data.gender,
    });

    const app = getApp<{ globalData: Record<string, unknown> }>();
    app.globalData.baziResult = result;

    wx.navigateTo({ url: '/pages/bazi/result' });
  },
});
