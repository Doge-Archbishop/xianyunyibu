/**
 * 首页 — 功能导航 + 今日运势
 */

import type { FortuneStick } from '../../services/types';

interface IndexPageData {
  dailyFortuneStatus: 'available' | 'used' | 'loading';
  todayFortune: FortuneStick | null;
  fortuneModules: FortuneModule[];
  taoistTip: { title: string; content: string };
  disclaimer: string;
}

interface FortuneModule {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  url: string;
  color: string;
}

/** 道家小知识库 */
const TAOIST_TIPS = [
  { title: '太极', content: '太极图以阴阳鱼象征宇宙间阴阳两种基本力量的消长与平衡。白中黑点表示阳中有阴，黑中白点表示阴中有阳，阴阳并非绝对对立，而是相互包含、相互转化的关系。' },
  { title: '八卦', content: '八卦由阳爻（⚊）和阴爻（⚋）组成，每卦三爻，共八种组合。乾☰为天、坤☷为地、震☳为雷、巽☴为风、坎☵为水、离☲为火、艮☶为山、兑☱为泽，象征自然界的八种基本现象。' },
  { title: '五行', content: '五行指金、木、水、火、土五种元素及其运动变化。相生：金生水、水生木、木生火、火生土、土生金。相克：金克木、木克土、土克水、水克火、火克金。万物皆在五行生克中运行。' },
  { title: '天干地支', content: '十天干（甲乙丙丁戊己庚辛壬癸）与十二地支（子丑寅卯辰巳午未申酉戌亥）组合成六十甲子，是中国传统历法和命理学的计时体系。每个天干地支都有其五行属性和阴阳属性。' },
  { title: '易经', content: '《易经》又称《周易》，是中国最古老的经典之一，被誉为"群经之首"。它以六十四卦为核心，通过卦象、卦辞、爻辞来阐述宇宙万物的变化规律。孔子曰："加我数年，五十以学易，可以无大过矣。"' },
  { title: '道家思想', content: '道家以"道"为最高范畴，主张道法自然、无为而治。老子《道德经》开篇："道可道，非常道；名可名，非常名。"道家追求人与自然的和谐统一，强调顺应自然规律而非强行干预。' },
  { title: '阴阳', content: '阴阳是中国哲学最基本的概念之一。阳代表光明、温暖、向上、外向；阴代表黑暗、寒冷、向下、内向。阴阳平衡是健康与和谐的基础。《素问》云："阴阳者，天地之道也。"' },
];

Page<IndexPageData, {}>({
  data: {
    dailyFortuneStatus: 'loading',
    todayFortune: null,
    fortuneModules: [
      {
        id: 'daily-fortune',
        name: '每日抽签',
        subtitle: '日签一卦，趋吉避凶',
        icon: '🎋',
        url: '/pages/daily-fortune/draw',
        color: '#C9A96E',
      },
      {
        id: 'liuyao',
        name: '六爻占卜',
        subtitle: '金钱起卦，六爻断事',
        icon: '☯',
        url: '/pages/liuyao/coin-toss',
        color: '#8B1A1A',
      },
      {
        id: 'bazi',
        name: '八字命理',
        subtitle: '四柱推命，五行平衡',
        icon: '📜',
        url: '/pages/bazi/input',
        color: '#5C6BC0',
      },
      {
        id: 'zwds',
        name: '紫微斗数',
        subtitle: '群星列宿，天命有数',
        icon: '🌟',
        url: '/pages/zwds/input',
        color: '#7B1FA2',
      },
      {
        id: 'meihua',
        name: '梅花易数',
        subtitle: '观物取象，以数起卦',
        icon: '🌸',
        url: '/pages/meihua/input',
        color: '#C2185B',
      },
    ],
    taoistTip: TAOIST_TIPS[0],
    disclaimer: '本小程序内容源自中国传统易学文化，仅供学习参考和娱乐。命运掌握在自己手中，请理性看待占卜结果。',
  },

  onLoad() {
    this.refreshDailyFortune();
    this.pickRandomTip();
  },

  onShow() {
    this.refreshDailyFortune();
  },

  /** 刷新每日抽签状态 */
  refreshDailyFortune() {
    const app = getApp<{ globalData: { dailyDrawStatus: string; dailyFortuneToday: FortuneStick | null } }>();
    const status = app.globalData.dailyDrawStatus;

    this.setData({
      dailyFortuneStatus: status as 'available' | 'used' | 'loading',
      todayFortune: app.globalData.dailyFortuneToday || null,
    });
  },

  /** 随机选取一条道家小知识 */
  pickRandomTip() {
    const index = Math.floor(Math.random() * TAOIST_TIPS.length);
    this.setData({ taoistTip: TAOIST_TIPS[index] });
  },

  /** 点击功能卡片跳转 */
  onModuleTap(e: WechatMiniprogram.TouchEvent) {
    const { url } = e.currentTarget.dataset as { url: string };
    wx.navigateTo({ url });
  },

  /** 每日抽签入口 */
  onDailyFortuneTap() {
    if (this.data.dailyFortuneStatus === 'used') {
      // 已抽过，跳转到结果页
      wx.navigateTo({ url: '/pages/daily-fortune/result' });
    } else {
      wx.navigateTo({ url: '/pages/daily-fortune/draw' });
    }
  },

  /** 换一条小知识 */
  onRefreshTip() {
    this.pickRandomTip();
  },

  /** 分享 */
  onShareAppMessage() {
    return {
      title: '道易 — 传承道家文化，探索易学智慧',
      path: '/pages/index/index',
    };
  },
});
