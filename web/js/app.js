/**
 * 道易 — 应用初始化
 */

// ═══ 全局状态 ═══
const App = {
  dailyDrawStatus: 'available', // 'available' | 'used'
  dailyFortuneToday: null,
  liuyaoResult: null,
  meihuaResult: null,
  baziResult: null,
  zwdsResult: null,

  init() {
    // 检查今日抽签状态
    const today = getTodayStr();
    const cached = Storage.get('dailyDrawDate');
    if (cached === today) {
      this.dailyDrawStatus = 'used';
      this.dailyFortuneToday = Storage.get('dailyFortune');
    }

    // 注册路由
    Router.register('/home', Pages.home);
    Router.register('/daily-fortune/draw', Pages.dailyFortune.draw);
    Router.register('/daily-fortune/result', Pages.dailyFortune.result);
    Router.register('/liuyao/coin-toss', Pages.liuyao.coinToss);
    Router.register('/liuyao/result', Pages.liuyao.result);
    Router.register('/liuyao/detail', Pages.liuyao.detail);
    Router.register('/meihua/input', Pages.meihua.input);
    Router.register('/meihua/result', Pages.meihua.result);
    Router.register('/meihua/detail', Pages.meihua.detail);
    Router.register('/bazi/input', Pages.bazi.input);
    Router.register('/bazi/result', Pages.bazi.result);
    Router.register('/bazi/analysis', Pages.bazi.analysis);
    Router.register('/zwds/input', Pages.zwds.input);
    Router.register('/zwds/chart', Pages.zwds.chart);
    Router.register('/zwds/palace-detail', Pages.zwds.palaceDetail);
    Router.register('/divine', Pages.divine);
    Router.register('/profile', Pages.profile);

    // 启动路由
    Router.start();
  }
};

// ═══ 启动 ═══
document.addEventListener('DOMContentLoaded', () => App.init());
