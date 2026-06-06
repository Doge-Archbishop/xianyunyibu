/**
 * 八字 — 结果页面
 */

import { TIAN_GAN_WUXING, TIAN_GAN_YINYANG, DI_ZHI_WUXING } from '../../services/constants';
import { WUXING_COLORS } from '../../services/constants';
import type { BaZiResult, WuXing } from '../../services/types';

Page({
  data: {
    result: null as BaZiResult | null,
    wuxingBars: [] as { name: WuXing; count: number; color: string; percent: number }[],
  },

  onLoad() {
    const app = getApp<{ globalData: Record<string, unknown> }>();
    const result = app.globalData.baziResult as BaZiResult | undefined;

    if (result) {
      const maxCount = Math.max(...Object.values(result.wuxingCount), 1);
      const bars = (Object.keys(result.wuxingCount) as WuXing[]).map(wx => ({
        name: wx,
        count: result.wuxingCount[wx],
        color: { '金': '#F5F0E0', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#FF9800' }[wx],
        percent: Math.round((result.wuxingCount[wx] / maxCount) * 100),
      }));

      this.setData({ result, wuxingBars: bars });
    }
  },

  onViewAnalysis() {
    wx.navigateTo({ url: '/pages/bazi/analysis' });
  },
});
