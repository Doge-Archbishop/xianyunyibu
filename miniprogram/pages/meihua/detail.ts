/**
 * 梅花易数 — 详细解读页面
 */

import type { MeiHuaResult } from '../../services/types';

Page({
  data: {
    result: null as MeiHuaResult | null,
  },

  onLoad() {
    const app = getApp<{ globalData: Record<string, unknown> }>();
    const result = app.globalData.meihuaResult as MeiHuaResult | undefined;
    if (result) {
      this.setData({ result });
    }
  },
});
