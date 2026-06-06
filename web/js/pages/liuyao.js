/**
 * 六爻占卜页面 — 铜钱摇卦，一键得卦
 */
Pages.liuyao = {};

var _tossData = { currentRound: 0, tosses: [], isComplete: false };

Pages.liuyao.coinToss = function() {
  _tossData = { currentRound: 0, tosses: [], isComplete: false };
  _renderTossPage();
};

function _renderTossPage() {
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
      var yc = d.tosses[j].isChanging ? ' changing' : '';
      historyHtml += '<div class="history-item"><span>第' + d.tosses[j].round + '爻</span><span class="' + yc + '">' + d.tosses[j].yaoType + '</span></div>';
    }
    historyHtml += '</div>';
  }

  var areaHtml;
  if (d.isComplete) {
    areaHtml = '<div class="complete-section animate-in">' +
      '<div class="hexagram-mini" id="hexagram-mini"></div>' +
      '<span class="complete-text">六爻已成，请查看卦象</span>' +
      '<button class="btn-primary" onclick="viewLiuyaoResult()">🔮 查看卦象结果</button>' +
      '<button class="btn-outline" onclick="Pages.liuyao.coinToss()">🔄 重新摇卦</button></div>';
  } else {
    areaHtml = '<div class="toss-area">' +
      '<div class="toss-btn" id="toss-btn" onclick="doTossCoins()">' +
      '<span class="toss-btn-icon">🪙</span>' +
      '<span class="toss-btn-text">' + (d.currentRound === 0 ? '开始摇卦' : '第' + (d.currentRound + 1) + '次') + '</span>' +
      '<span class="toss-hint">点击抛三枚铜钱</span></div></div>';
  }

  renderPage('<div class="liuyao-page">' +
    '<div class="page-header"><span class="page-icon">☯</span><span class="page-title">六爻占卜</span>' +
    '<span class="page-desc">心中默念问题，诚心抛掷铜钱六次，自下而上得卦。</span></div>' +
    '<div class="progress-bar">' + progressHtml + '</div>' +
    areaHtml + historyHtml +
    '<div class="disclaimer">仅供娱乐参考</div></div>');

  // 六次完成时，预先展示卦象小图
  if (d.isComplete) {
    setTimeout(function() {
      var el = document.getElementById('hexagram-mini');
      if (el) {
        var lines = d.tosses.map(function(t) { return t.yaoType === '老阳' || t.yaoType === '少阳'; });
        el.innerHTML = HexagramView.render({ primaryLines: lines, primaryName: '', showLiuQin: false, showShiYing: false });
      }
    }, 100);
  }
}

function doTossCoins() {
  var d = _tossData;
  var btn = document.getElementById('toss-btn');
  if (btn) {
    btn.classList.add('tossing');
    setTimeout(function() { btn.classList.remove('tossing'); }, 600);
  }

  // 三枚铜钱结果
  var faces = 0;
  for (var i = 0; i < 3; i++) { if (Math.random() > 0.5) faces++; }
  var yaoType, isChanging;
       if (faces === 3) { yaoType = '老阳'; isChanging = true; }
  else if (faces === 2) { yaoType = '少阳'; isChanging = false; }
  else if (faces === 1) { yaoType = '少阴'; isChanging = false; }
  else                  { yaoType = '老阴'; isChanging = true; }

  d.tosses.push({ round: d.tosses.length + 1, yaoType: yaoType, isChanging: isChanging });
  d.currentRound = d.tosses.length;
  if (d.currentRound >= 6) d.isComplete = true;

  _renderTossPage();
}

/** 查看结果 — 使用用户实际摇出的爻 */
function viewLiuyaoResult() {
  var result = buildLiuYaoResult(_tossData.tosses);
  if (!result) { showToast('出错了，请重新摇卦'); return; }
  App.liuyaoResult = result;
  Router.navigate('/liuyao/result');
}

/** 结果页 */
Pages.liuyao.result = function() {
  var r = App.liuyaoResult;
  if (!r) { Router.navigate('/liuyao/coin-toss'); return; }
  var p = r.primaryHexagram;
  if (!p) { showToast('卦象数据异常，请重新摇卦'); Router.navigate('/liuyao/coin-toss'); return; }
  var t = r.transformedHexagram;

  var hexHtml = HexagramView.render({
    primaryLines: p.lines,
    transformedLines: t ? t.lines : null,
    changingLines: r.changingLines,
    primaryName: p.name,
    transformedName: t ? t.name : '',
    showLiuQin: true,
    lineRelations: r.lineRelations,
    shiYao: r.shiYao,
    yingYao: r.yingYao
  });

  var infoHtml = '<div class="info-row"><span class="info-label">本卦</span><span class="info-value">' + p.name + '</span><span class="info-sub">（' + p.palace + '宫·' + p.wuxing + '）</span></div>';
  if (t) infoHtml += '<div class="info-row"><span class="info-label">变卦</span><span class="info-value">' + t.name + '</span><span class="info-sub">（' + t.palace + '宫·' + t.wuxing + '）</span></div>';
  if (r.changingLines.length > 0) {
    var clText = r.changingLines.map(function(i) { return '第' + (i+1) + '爻'; }).join('、');
    infoHtml += '<div class="info-row"><span class="info-label">变爻</span><span class="info-value">' + clText + '</span></div>';
  } else {
    infoHtml += '<div class="info-row"><span class="info-label">状态</span><span class="info-value" style="color:#4CAF50">静卦（无变爻）</span></div>';
  }

  var reading = generateHexagramReading(p, r.changingLines, t);

  renderPage('<div class="result-page animate-in">' +
    '<div class="hexagram-area"><span class="area-title">卦象</span>' + hexHtml + '</div>' +
    '<div class="info-section">' + infoHtml + '</div>' +
    '<div class="card"><span class="card-title">📖 卦辞原文</span><span class="card-text">' + esc(p.judgement) + '</span></div>' +
    '<div class="card"><span class="card-title">💬 综合解读</span><span class="card-text" style="white-space:pre-line">' + esc(reading.summary) + '</span></div>' +
    '<div class="card"><span class="card-title">💼 事业</span><span class="card-text">' + esc(reading.career) + '</span></div>' +
    '<div class="card"><span class="card-title">💰 财运</span><span class="card-text">' + esc(reading.wealth) + '</span></div>' +
    '<div class="card"><span class="card-title">❤️ 感情</span><span class="card-text">' + esc(reading.love) + '</span></div>' +
    '<div class="card"><span class="card-title">🏥 健康</span><span class="card-text">' + esc(reading.health) + '</span></div>' +
    (reading.change ? '<div class="card highlight"><span class="card-title">🌊 变化趋势</span><span class="card-text" style="white-space:pre-line">' + esc(reading.change) + '</span></div>' : '') +
    '<div class="card" style="background:#FAF3E6;border:1px solid #C9A96E"><span class="card-title">💡 综合建议</span><span class="card-text">' + esc(reading.advice) + '</span></div>' +
    '<div class="actions">' +
    '<button class="btn-primary" onclick="Router.navigate(\'/liuyao/detail\')">📋 逐爻详解</button>' +
    '<button class="btn-outline" onclick="Pages.liuyao.coinToss()">🔄 重新摇卦</button></div>' +
    '<div class="disclaimer">仅供娱乐参考</div></div>');
};

/** 逐爻详解 */
Pages.liuyao.detail = function() {
  var r = App.liuyaoResult;
  if (!r) { Router.navigate('/liuyao/coin-toss'); return; }
  var p = r.primaryHexagram;
  var names = ['初爻','二爻','三爻','四爻','五爻','上爻'];
  var cardsHtml = '';
  for (var i = 0; i < 6; i++) {
    var isC = r.changingLines.indexOf(i) >= 0;
    var isS = r.shiYao === i;
    var isY = r.yingYao === i;
    var label = names[i] + (isS ? ' <span class="marker-shi">世·你</span>' : '') + (isY ? ' <span class="marker-ying">应·对方</span>' : '') + (isC ? ' <span class="marker-changing">动爻</span>' : '');
    var yaoType = r.tosses[i] ? r.tosses[i].yaoType : '';
    cardsHtml += '<div class="line-card' + (isC ? ' changing' : '') + '">' +
      '<div class="line-label">' + label + ' <span class="yao-type-tag">' + yaoType + '</span></div>' +
      '<span class="line-desc">' + esc(p.lineTexts[i] || '') + '\n六亲：' + (r.lineRelations[i] || '') + (isC ? '\n此爻为动爻，是本卦变化的关键所在。' : '') + '</span></div>';
  }

  renderPage('<div class="detail-page animate-in">' +
    '<div class="page-title">逐爻详解</div>' + cardsHtml +
    '<div class="glossary"><span class="glossary-title">📚 六亲速查</span>' +
    '<span class="glossary-text"><b>父母</b>：庇护你的人事物（长辈、文书、房屋）</span>' +
    '<span class="glossary-text"><b>兄弟</b>：与你同行的人（兄弟姐妹、同辈朋友）</span>' +
    '<span class="glossary-text"><b>妻财</b>：你掌控的资源（财富、资产）</span>' +
    '<span class="glossary-text"><b>官鬼</b>：约束你的力量（上司、规则、压力）</span>' +
    '<span class="glossary-text"><b>子孙</b>：你创造的事物（下属、子女、创造力）</span></div>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/liuyao/result\')">← 返回卦象</button></div>');
};
