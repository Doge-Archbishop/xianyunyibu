/**
 * 首页
 */
var Pages = Pages || {};

Pages.home = function() {
  setActiveTab('home');
  var status = App.dailyDrawStatus;
  var fortune = App.dailyFortuneToday;

  var fortuneHtml;
  if (status === 'loading') {
    fortuneHtml = '<div class="daily-body"><span class="daily-hint">正在感应天地气数...</span></div>';
  } else if (status === 'available') {
    fortuneHtml = '<div class="daily-body"><span class="daily-hint">今日尚未抽签</span><div class="daily-action" onclick="Router.navigate(\'/daily-fortune/draw\')"><span>点击抽取今日运势签 →</span></div></div>';
  } else {
    fortuneHtml = '<div class="daily-body used"><div class="daily-fortune-preview"><span class="fortune-level">' + (fortune ? fortune.level : '') + '</span><span class="fortune-title">' + (fortune ? fortune.title : '') + '</span></div><span class="daily-hint">今日已抽签，<a href="#/daily-fortune/result">点击查看详情</a></span></div>';
  }

  var modules = [
    { id:'daily-fortune', name:'每日抽签', sub:'日签一卦，趋吉避凶', icon:'🎋', url:'/daily-fortune/draw', color:'#C9A96E' },
    { id:'liuyao', name:'六爻占卜', sub:'金钱起卦，六爻断事', icon:'☯', url:'/liuyao/coin-toss', color:'#8B1A1A' },
    { id:'bazi', name:'八字命理', sub:'四柱推命，五行平衡', icon:'📜', url:'/bazi/input', color:'#5C6BC0' },
    { id:'zwds', name:'紫微斗数', sub:'群星列宿，天命有数', icon:'🌟', url:'/zwds/input', color:'#7B1FA2' },
    { id:'meihua', name:'梅花易数', sub:'观物取象，以数起卦', icon:'🌸', url:'/meihua/input', color:'#C2185B' }
  ];

  var modsHtml = modules.map(function(m) {
    return '<div class="module-card" style="border-top-color:' + m.color + '" onclick="Router.navigate(\'' + m.url + '\')">' +
      '<div class="module-icon-wrap" style="background-color:' + m.color + '20">' +
      '<span class="module-icon">' + m.icon + '</span></div>' +
      '<span class="module-name">' + m.name + '</span>' +
      '<span class="module-subtitle">' + m.sub + '</span></div>';
  }).join('');

  var tips = [
    { title:'太极', content:'太极图以阴阳鱼象征宇宙间阴阳两种基本力量的消长与平衡。白中黑点表示阳中有阴，黑中白点表示阴中有阳。' },
    { title:'八卦', content:'八卦由阳爻（⚊）和阴爻（⚋）组成，每卦三爻，共八种组合。乾☰天、坤☷地、震☳雷、巽☴风、坎☵水、离☲火、艮☶山、兑☱泽。' },
    { title:'五行', content:'五行指金、木、水、火、土及其运动变化。相生：金生水、水生木、木生火、火生土、土生金。相克：金克木、木克土、土克水、水克火、火克金。' }
  ];
  var tip = tips[Math.floor(Math.random() * tips.length)];

  var html = '' +
    '<div class="index-page">' +
    '<div class="daily-section"><div class="daily-card ' + status + '" onclick="' + (status === 'used' ? "Router.navigate('/daily-fortune/result')" : "Router.navigate('/daily-fortune/draw')") + '">' +
    '<div class="daily-header"><span class="daily-icon">🏮</span><span class="daily-title">今日运势</span></div>' + fortuneHtml + '</div></div>' +
    '<div class="modules-section"><div class="section-title"><span class="title-text">占卜之法</span></div>' +
    '<div class="modules-grid">' + modsHtml + '</div></div>' +
    '<div class="tip-section"><div class="tip-card">' +
    '<div class="tip-header"><span class="tip-label">📖 道学小识</span><span class="tip-refresh" onclick="Pages.home()">换一条 ↻</span></div>' +
    '<span class="tip-title">' + tip.title + '</span><span class="tip-content">' + tip.content + '</span></div></div>' +
    '<div class="disclaimer">本网页内容源自中国传统易学文化，仅供学习参考和娱乐。</div></div>';

  renderPage(html);
};
