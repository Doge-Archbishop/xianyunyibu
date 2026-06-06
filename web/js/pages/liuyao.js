/**
 * 六爻占卜页面
 */
Pages.liuyao = {};

var _tossData = { currentRound: 0, tosses: [], isComplete: false };

Pages.liuyao.coinToss = function() {
  _tossData = { currentRound: 0, tosses: [], isComplete: false };
  renderTossPage();
};

function renderTossPage() {
  var d = _tossData;
  var progressHtml = '';
  for (var i = 1; i <= 6; i++) {
    var cls = 'progress-dot' + (d.currentRound >= i ? ' filled' : '') + (i === d.currentRound + 1 ? ' current' : '');
    progressHtml += '<span class="' + cls + '">' + i + '</span>';
  }

  var historyHtml = '';
  if (d.tosses.length > 0) {
    historyHtml = '<div class="yao-history"><span class="history-title">已摇的爻（从下往上）</span>';
    for (var j = 0; j < d.tosses.length; j++) {
      historyHtml += '<div class="history-item"><span>第' + d.tosses[j].round + '爻</span><span class="' + (d.tosses[j].isChanging ? 'changing' : '') + '">' + d.tosses[j].yaoType + '</span></div>';
    }
    historyHtml += '</div>';
  }

  var areaHtml;
  if (d.isComplete) {
    areaHtml = '<div class="complete-section"><span class="complete-icon">✅</span><span class="complete-text">六爻已成，请查看卦象</span>' +
      '<button class="btn-primary" onclick="viewLiuyaoResult()">查看卦象结果</button>' +
      '<button class="btn-outline" onclick="Pages.liuyao.coinToss()">重新摇卦</button></div>';
  } else {
    areaHtml = '<div class="toss-area"><div class="toss-btn" id="toss-btn" onclick="doTossCoins()">' +
      '<span class="toss-btn-text">' + (d.currentRound === 0 ? '抛第一次' : '抛第' + (d.currentRound + 1) + '次') + '</span>' +
      '<span class="toss-hint">点击抛三枚铜钱</span></div></div>';
  }

  renderPage('<div class="liuyao-page">' +
    '<div class="page-header"><span class="page-icon">☯</span><span class="page-title">六爻占卜</span>' +
    '<span class="page-desc">心中默念问题，抛掷铜钱六次，得卦断吉凶。</span></div>' +
    '<div class="progress-bar">' + progressHtml + '</div>' +
    areaHtml + historyHtml +
    '<div class="disclaimer">仅供娱乐参考</div></div>');
}

function doTossCoins() {
  var d = _tossData;
  var btn = document.getElementById('toss-btn');
  if (btn) { btn.classList.add('animating'); setTimeout(function() { btn.classList.remove('animating'); }, 200); }

  // 随机抛硬币
  var zhengC = 0;
  for (var i = 0; i < 3; i++) { if (Math.random() > 0.5) zhengC++; }
  var yaoType, isChanging;
  if (zhengC === 3) { yaoType = '老阳'; isChanging = true; }
  else if (zhengC === 2) { yaoType = '少阳'; isChanging = false; }
  else if (zhengC === 1) { yaoType = '少阴'; isChanging = false; }
  else { yaoType = '老阴'; isChanging = true; }

  d.tosses.push({ round: d.tosses.length + 1, yaoType: yaoType, isChanging: isChanging });
  d.currentRound = d.tosses.length;
  if (d.currentRound >= 6) d.isComplete = true;

  renderTossPage();
}

function viewLiuyaoResult() {
  var result = performLiuYao();
  App.liuyaoResult = result;
  Router.navigate('/liuyao/result');
}

Pages.liuyao.result = function() {
  var r = App.liuyaoResult;
  if (!r) { Router.navigate('/liuyao/coin-toss'); return; }
  var p = r.primaryHexagram, t = r.transformedHexagram;

  var hexHtml = HexagramView.render({ primaryLines: p.lines, transformedLines: t ? t.lines : null, changingLines: r.changingLines, primaryName: p.name, transformedName: t ? t.name : '', showLiuQin: true, lineRelations: r.lineRelations, shiYao: r.shiYao, yingYao: r.yingYao });

  var infoHtml = '<div class="info-row"><span class="info-label">本卦</span><span class="info-value">' + p.name + '</span><span class="info-sub">(' + p.palace + '宫·' + p.wuxing + ')</span></div>';
  if (t) infoHtml += '<div class="info-row"><span class="info-label">变卦</span><span class="info-value">' + t.name + '</span><span class="info-sub">(' + t.palace + '宫·' + t.wuxing + ')</span></div>';
  if (r.changingLines.length > 0) infoHtml += '<div class="info-row"><span class="info-label">变爻</span><span class="info-value">第' + (r.changingLines[0] + 1) + '爻' + (r.changingLines.length > 1 ? '等' + r.changingLines.length + '爻' : '') + '</span></div>';

  renderPage('<div class="result-page">' +
    '<div class="hexagram-area"><span class="area-title">卦象</span>' + hexHtml + '</div>' +
    '<div class="info-section">' + infoHtml + '</div>' +
    '<div class="card"><span class="card-title">📖 卦辞</span><span class="card-text">' + esc(p.judgement) + '</span>' + (t ? '<span class="card-text mt">变卦：' + esc(t.judgement) + '</span>' : '') + '</div>' +
    '<div class="card"><span class="card-title">💬 通俗解读</span><span class="card-text">' + esc(p.plainSummary) + '</span></div>' +
    '<div class="actions"><button class="btn-primary" onclick="Router.navigate(\'/liuyao/detail\')">逐爻详解</button>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/liuyao/coin-toss\')">重新摇卦</button></div></div>');
};

Pages.liuyao.detail = function() {
  var r = App.liuyaoResult;
  if (!r) { Router.navigate('/liuyao/coin-toss'); return; }
  var p = r.primaryHexagram;
  var names = ['初爻','二爻','三爻','四爻','五爻','上爻'];
  var cardsHtml = '';
  for (var i = 0; i < 6; i++) {
    var isC = r.changingLines.indexOf(i) >= 0, isS = r.shiYao === i, isY = r.yingYao === i;
    var label = names[i] + (isS ? '（世·你）' : '') + (isY ? '（应·对方）' : '') + (isC ? '【动】' : '');
    cardsHtml += '<div class="line-card' + (isC ? ' changing' : '') + '"><span class="line-label">' + label + '</span>' +
      '<span class="line-desc">' + esc(p.lineTexts[i] || '') + '\n六亲：' + (r.lineRelations[i] || '') + (isC ? '\n此爻变动，为本卦关键爻。' : '') + '</span></div>';
  }

  renderPage('<div class="detail-page">' +
    '<div class="page-title">逐爻详解</div>' + cardsHtml +
    '<div class="glossary"><span class="glossary-title">📚 六亲说明</span>' +
    '<span class="glossary-text">父母：庇护你的人事物（长辈、文书、房屋）</span>' +
    '<span class="glossary-text">兄弟：与你同行的人（兄弟姐妹、同辈朋友）</span>' +
    '<span class="glossary-text">妻财：你掌控的资源（财富、资产）</span>' +
    '<span class="glossary-text">官鬼：约束你的力量（上司、规则、压力）</span>' +
    '<span class="glossary-text">子孙：你创造的事物（下属、子女、创造力）</span></div></div>');
};
