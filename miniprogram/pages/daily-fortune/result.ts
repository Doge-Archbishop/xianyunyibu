/**
 * 每日抽签 — 结果详情页
 */

import { getTodayCachedFortune, getFortuneLevelColor, getFortuneLevelEmoji } from '../../services/daily-fortune.service';
import type { FortuneStick } from '../../services/types';

Page({
  data: {
    fortune: null as FortuneStick | null,
    levelColor: '',
    levelEmoji: '',
    isEmpty: false,
  },

  onLoad() {
    const fortune = getTodayCachedFortune();
    if (fortune) {
      this.setData({
        fortune,
        levelColor: getFortuneLevelColor(fortune.level),
        levelEmoji: getFortuneLevelEmoji(fortune.level),
      });
    } else {
      this.setData({ isEmpty: true });
    }
  },

  /** 返回抽签页 */
  onGoDraw() {
    wx.navigateTo({ url: '/pages/daily-fortune/draw' });
  },

  /** 分享 */
  onShareAppMessage() {
    const f = this.data.fortune;
    return {
      title: f ? `我的今日运势：${f.title}` : '道易每日签',
      path: '/pages/index/index',
    };
  },
});
