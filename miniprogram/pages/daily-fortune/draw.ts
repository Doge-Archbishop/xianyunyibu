/**
 * 每日抽签 — 抽签页面
 */

import { drawFortune, saveTodayDraw, hasDrawnToday, getTodayCachedFortune } from '../../services/daily-fortune.service';
import type { FortuneStick } from '../../services/types';

Page({
  data: {
    isDrawing: false,
    isAnimating: false,
    drawn: false,
    fortune: null as FortuneStick | null,
    loadingText: '焚香祈愿中...',
  },

  onLoad() {
    // 检查今日是否已抽
    if (hasDrawnToday()) {
      const cached = getTodayCachedFortune();
      if (cached) {
        this.setData({
          drawn: true,
          fortune: cached,
        });
      }
    }
  },

  /** 开始抽签 */
  onStartDraw() {
    if (this.data.isDrawing) return;

    this.setData({ isAnimating: true, isDrawing: true, loadingText: '焚香祈愿中...' });

    // 焚香动画（2秒）
    setTimeout(() => {
      this.setData({ loadingText: '签筒摇晃中...' });
    }, 1000);

    // 摇签动画（2秒）
    setTimeout(() => {
      this.setData({ loadingText: '一支签正在落下...' });
    }, 2000);

    // 抽签结果（3秒后）
    setTimeout(() => {
      const fortune = drawFortune();
      if (fortune) {
        saveTodayDraw(fortune);
        this.setData({
          isAnimating: false,
          drawn: true,
          fortune,
        });
      }
    }, 3000);
  },

  /** 查看签文详情 */
  onViewDetail() {
    wx.navigateTo({ url: '/pages/daily-fortune/result' });
  },

  /** 分享 */
  onShareAppMessage() {
    const f = this.data.fortune;
    return {
      title: f ? `道易每日签：${f.title} — ${f.level}` : '道易 — 每日抽签',
      path: '/pages/daily-fortune/draw',
    };
  },
});
