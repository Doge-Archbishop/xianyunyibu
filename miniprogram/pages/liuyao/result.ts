/**
 * 六爻 — 结果页面
 */

import type { LiuYaoResult, Hexagram } from '../../services/types';

Page({
  data: {
    result: null as LiuYaoResult | null,
    primary: null as Hexagram | null,
    transformed: null as Hexagram | null,
  },

  onLoad() {
    const app = getApp<{ globalData: Record<string, unknown> }>();
    const result = app.globalData.liuyaoResult as LiuYaoResult | undefined;

    if (result) {
      this.setData({
        result,
        primary: result.primaryHexagram,
        transformed: result.transformedHexagram,
      });
    }
  },

  /** 查看详细解读 */
  onViewDetail() {
    wx.navigateTo({ url: '/pages/liuyao/detail' });
  },

  onShareAppMessage() {
    return { title: '六爻占卜结果', path: '/pages/liuyao/coin-toss' };
  },
});
