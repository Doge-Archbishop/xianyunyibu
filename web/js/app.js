/**
 * 闲云一卜 — 应用初始化
 */

var App = {
  dailyDrawStatus: 'available',
  dailyFortuneToday: null,
  liuyaoResult: null,
  meihuaResult: null,
  baziResult: null,
  zwdsResult: null,
  darkMode: false,

  init: function() {
    // 读取深色模式设置
    this.darkMode = Storage.get('darkMode', false);
    if (this.darkMode) document.body.classList.add('dark');

    // 今日抽签状态
    var today = getTodayStr();
    var cached = Storage.get('dailyDrawDate');
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
    Router.register('/knowledge', Pages.knowledge);

    // 启动路由
    Router.start();

    // 添加深色模式切换按钮
    this.addDarkToggle();
  },

  /** 切换深色模式 */
  toggleDark: function() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    Storage.set('darkMode', this.darkMode);
  },

  /** 添加深色模式按钮 */
  addDarkToggle: function() {
    var btn = document.createElement('button');
    btn.className = 'dark-toggle';
    btn.textContent = this.darkMode ? '☀️' : '🌙';
    btn.title = '切换深色/浅色模式';
    btn.onclick = function() {
      App.toggleDark();
      btn.textContent = App.darkMode ? '☀️' : '🌙';
    };
    document.body.appendChild(btn);
  },

  /** 保存占卜历史 */
  saveHistory: function(module, summary) {
    var history = Storage.get('divination_history', []);
    history.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      module: module,
      resultSummary: summary,
      createTime: Date.now(),
      isFavorite: false
    });
    // 最多保留 50 条
    if (history.length > 50) history = history.slice(0, 50);
    Storage.set('divination_history', history);
  },

  /** 生成分享文本 */
  getShareText: function(module) {
    var texts = {
      'daily-fortune': '我刚在闲云一卜抽了今日运势签，来看看你的运势如何？',
      'liuyao': '我刚在闲云一卜摇了六爻卦，来试试你的卦象？',
      'meihua': '我刚在闲云一卜起了梅花易数卦，你也来测测？',
      'bazi': '我刚在闲云一卜排了八字命盘，来看看你的命理？',
      'zwds': '我刚在闲云一卜排了紫微命盘，群星列宿，来看看你的天命？'
    };
    return texts[module] || '闲云一卜 — 传承道家文化，探索易学智慧';
  }
};

document.addEventListener('DOMContentLoaded', function() { App.init(); });
