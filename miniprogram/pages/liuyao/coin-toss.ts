/**
 * 六爻 — 摇卦页面
 */

import { performFullToss, buildHexagrams, determineShiYing, assignLiuQin } from '../../services/liuyao.service';
import type { CoinTossResult, LiuYaoResult } from '../../services/types';

Page({
  data: {
    currentRound: 0,       // 当前第几次抛 (1-6)
    tosses: [] as CoinTossResult[],
    isComplete: false,
    isTossing: false,
    coinAnimating: false,
    lastResult: null as CoinTossResult | null,
    guideStep: 0,          // 0=准备, 1=抛硬币
  },

  onLoad() {
    // 显示准备引导
    this.setData({ guideStep: 0 });
  },

  /** 开始摇卦 */
  onStartToss() {
    this.setData({
      guideStep: 1,
      currentRound: 0,
      tosses: [],
      isComplete: false,
      lastResult: null,
    });
  },

  /** 抛一次硬币 */
  onTossCoins() {
    if (this.data.isTossing || this.data.isComplete) return;

    this.setData({ isTossing: true, coinAnimating: true });

    // 动画延迟
    setTimeout(() => {
      // 单次抛硬币结果
      const result = this.singleToss();

      const newTosses = [...this.data.tosses, result];
      const currentRound = newTosses.length;

      this.setData({
        tosses: newTosses,
        currentRound,
        lastResult: result,
        coinAnimating: false,
        isTossing: false,
        isComplete: currentRound >= 6,
      });
    }, 800);
  },

  /** 模拟单次抛硬币 */
  singleToss(): CoinTossResult {
    const faces: ['正面', '反面'] = ['正面', '反面'];
    const coinFaces: ['正面', '反面', '正面'] = [
      faces[Math.floor(Math.random() * 2)],
      faces[Math.floor(Math.random() * 2)],
      faces[Math.floor(Math.random() * 2)],
    ];

    const zhengCount = coinFaces.filter(c => c === '正面').length;

    let yaoType: CoinTossResult['yaoType'];
    let isChanging: boolean;
    switch (zhengCount) {
      case 3: yaoType = '老阳'; isChanging = true; break;
      case 2: yaoType = '少阳'; isChanging = false; break;
      case 1: yaoType = '少阴'; isChanging = false; break;
      case 0: yaoType = '老阴'; isChanging = true; break;
      default: yaoType = '少阳'; isChanging = false;
    }

    return {
      round: this.data.tosses.length + 1,
      faces: coinFaces,
      yaoType,
      isChanging,
    };
  },

  /** 查看结果 */
  onViewResult() {
    const { primary, transformed, changingLines } = buildHexagrams(this.data.tosses);
    const { shi, ying } = determineShiYing(primary);
    const lineRelations = assignLiuQin(primary);

    // 将结果存入全局缓存
    const app = getApp<{ globalData: Record<string, unknown> }>();
    app.globalData.liuyaoResult = {
      tosses: this.data.tosses,
      primaryHexagram: primary,
      transformedHexagram: transformed,
      changingLines,
      lineRelations,
      shiYao: shi,
      yingYao: ying,
    };

    wx.navigateTo({ url: '/pages/liuyao/result' });
  },

  /** 重新摇卦 */
  onRetry() {
    this.setData({
      currentRound: 0,
      tosses: [],
      isComplete: false,
      lastResult: null,
    });
  },

  /** 获取爻的类型描述 */
  getYaoDesc(yaoType: string): string {
    const map: Record<string, string> = {
      '老阳': '老阳 ⚊（变爻）',
      '少阳': '少阳 ⚊',
      '老阴': '老阴 ⚋（变爻）',
      '少阴': '少阴 ⚋',
    };
    return map[yaoType] || yaoType;
  },
});
