/**
 * 八字 — 详细分析页面
 */

import type { BaZiResult } from '../../services/types';

Page({
  data: {
    result: null as BaZiResult | null,
  },

  onLoad() {
    const app = getApp<{ globalData: Record<string, unknown> }>();
    const result = app.globalData.baziResult as BaZiResult | undefined;
    if (result) {
      this.setData({ result });
    }
  },
});
