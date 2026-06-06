var Pages = Pages || {};
/**
 * 占卜页 — 历史记录 + 快速入口
 */
Pages.divine = function() {
  setActiveTab('divine');
  var history = Storage.get('divination_history', []);
  var isEmpty = history.length === 0;

  if (isEmpty) {
    renderPage('<div class="divine-page"><div class="empty-state"><span class="empty-icon">🧭</span><span class="empty-title">暂无占卜记录</span><span class="empty-desc">前往首页选择一种占卜方式，开始你的道家探索之旅吧</span></div>' +
      '<div class="quick-section"><div class="section-header"><span class="header-title">快速开始</span></div><div class="quick-grid">' +
      '<div class="quick-item" onclick="Router.navigate(\'/liuyao/coin-toss\')"><span class="quick-icon">☯</span><span class="quick-name">六爻</span></div>' +
      '<div class="quick-item" onclick="Router.navigate(\'/bazi/input\')"><span class="quick-icon">📜</span><span class="quick-name">八字</span></div>' +
      '<div class="quick-item" onclick="Router.navigate(\'/zwds/input\')"><span class="quick-icon">🌟</span><span class="quick-name">紫微</span></div>' +
      '<div class="quick-item" onclick="Router.navigate(\'/meihua/input\')"><span class="quick-icon">🌸</span><span class="quick-name">梅花</span></div></div></div></div>');
    return;
  }

  var names = { 'daily-fortune':'每日抽签','liuyao':'六爻占卜','bazi':'八字命理','zwds':'紫微斗数','meihua':'梅花易数' };
  var icons = { 'daily-fortune':'🎋','liuyao':'☯','bazi':'📜','zwds':'🌟','meihua':'🌸' };
  var itemsHtml = '';
  for (var i = 0; i < Math.min(history.length, 20); i++) {
    var h = history[i];
    itemsHtml += '<div class="history-item"><div class="item-icon">' + (icons[h.module] || '📋') + '</div>' +
      '<div class="item-info"><div class="item-header"><span class="item-module">' + (names[h.module] || h.module) + '</span>' +
      '<span class="item-time">' + formatTime(h.createTime) + '</span></div>' +
      '<span class="item-summary">' + esc(h.resultSummary || '') + '</span></div></div>';
  }

  renderPage('<div class="divine-page"><div class="section-header"><span class="header-title">占卜记录</span><span class="header-count">共' + history.length + '条</span></div>' +
    itemsHtml +
    '<div class="quick-section" style="margin-top:24px"><div class="section-header"><span class="header-title">快速开始</span></div><div class="quick-grid">' +
    '<div class="quick-item" onclick="Router.navigate(\'/liuyao/coin-toss\')"><span class="quick-icon">☯</span><span class="quick-name">六爻</span></div>' +
    '<div class="quick-item" onclick="Router.navigate(\'/bazi/input\')"><span class="quick-icon">📜</span><span class="quick-name">八字</span></div>' +
    '<div class="quick-item" onclick="Router.navigate(\'/meihua/input\')"><span class="quick-icon">🌸</span><span class="quick-name">梅花</span></div>' +
    '<div class="quick-item" onclick="Router.navigate(\'/daily-fortune/draw\')"><span class="quick-icon">🎋</span><span class="quick-name">抽签</span></div></div></div></div>');
};
