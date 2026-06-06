/**
 * 梅花易数 — 起卦页面
 */

import { calculateMeiHua } from '../../services/meihua.service';
import type { MeiHuaResult } from '../../services/types';

Page({
  data: {
    method: 'time' as 'time' | 'manual' | 'random',
    input1: '',
    input2: '',
    input3: '',
  },

  /** 切换起卦方式 */
  onMethodChange(e: WechatMiniprogram.TouchEvent) {
    const method = e.currentTarget.dataset.method as 'time' | 'manual' | 'random';
    this.setData({ method });
  },

  /** 手动输入 */
  onInputChange(e: WechatMiniprogram.Input) {
    const { field } = e.currentTarget.dataset as { field: string };
    this.setData({ [field]: e.detail.value } as Record<string, string>);
  },

  /** 随机数 */
  onRandomNumbers() {
    this.setData({
      input1: String(Math.floor(Math.random() * 100) + 1),
      input2: String(Math.floor(Math.random() * 100) + 1),
      input3: String(Math.floor(Math.random() * 100) + 1),
    });
  },

  /** 开始起卦 */
  onCalculate() {
    let input: { method: 'time' | 'manual' | 'random'; numbers?: [number, number, number] };

    if (this.data.method === 'time') {
      input = { method: 'time' };
    } else if (this.data.method === 'random') {
      input = { method: 'random' };
    } else {
      const n1 = parseInt(this.data.input1);
      const n2 = parseInt(this.data.input2);
      const n3 = parseInt(this.data.input3);

      if (isNaN(n1) || isNaN(n2) || isNaN(n3) || n1 <= 0 || n2 <= 0 || n3 <= 0) {
        wx.showToast({ title: '请输入三个正整数', icon: 'none' });
        return;
      }
      input = { method: 'manual', numbers: [n1, n2, n3] };
    }

    const result = calculateMeiHua(input as never);

    // 缓存结果
    const app = getApp<{ globalData: Record<string, unknown> }>();
    app.globalData.meihuaResult = result;

    wx.navigateTo({ url: '/pages/meihua/result' });
  },
});
