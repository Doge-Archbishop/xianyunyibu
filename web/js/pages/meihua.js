/**
 * 梅花易数页面
 */
Pages.meihua = {};

Pages.meihua.input = function() {
  renderPage('' +
    '<div class="meihua-page">' +
    '<div class="page-header"><span class="page-icon">🌸</span><span class="page-title">梅花易数</span><span class="page-desc">观物取象，以数起卦。万物皆可成为占卜的依据。</span></div>' +
    '<div class="method-tabs">' +
    '<div class="method-tab active" id="tab-time" onclick="switchMeihuaTab(\'time\')">时间起卦</div>' +
    '<div class="method-tab" id="tab-manual" onclick="switchMeihuaTab(\'manual\')">手动输入</div>' +
    '<div class="method-tab" id="tab-random" onclick="switchMeihuaTab(\'random\')">随机</div></div>' +
    '<div id="meihua-content"></div>' +
    '<button class="btn-primary" onclick="onMeihuaCalc()" style="margin-top:24rpx">开始起卦</button>' +
    '<div class="tip-card"><span class="tip-title">📖 梅花易数小知识</span>' +
    '<span class="tip-text">梅花易数由宋代邵雍所创，是一种"观物取象"的占卜方法。万物皆可为卦象所取，花开花落、鸟鸣云起，皆可作为起卦的依据。</span></div></div>');

  window._meihuaMethod = 'time';
  renderMeihuaContent('time');
};

function switchMeihuaTab(method) {
  window._meihuaMethod = method;
  document.querySelectorAll('.method-tab').forEach(function(el) { el.classList.remove('active'); });
  document.getElementById('tab-' + method).classList.add('active');
  renderMeihuaContent(method);
}

function renderMeihuaContent(method) {
  var html = '';
  if (method === 'time') {
    html = '<div class="time-display"><span class="time-label">以当前日期时间起卦</span><span class="time-hint">自动计算上卦、下卦和动爻</span></div>';
  } else if (method === 'manual') {
    html = '<div class="input-group"><span class="input-label">第一个数（上卦）</span><input class="dao-input" id="mh-n1" type="number" placeholder="输入数字"></div>' +
      '<div class="input-group"><span class="input-label">第二个数（下卦）</span><input class="dao-input" id="mh-n2" type="number" placeholder="输入数字"></div>' +
      '<div class="input-group"><span class="input-label">第三个数（动爻）</span><input class="dao-input" id="mh-n3" type="number" placeholder="输入数字"></div>' +
      '<button class="btn-outline" onclick="randomMeihuaNums()">🎲 随机生成数字</button>';
  } else {
    html = '<div class="random-display"><span class="random-label">系统将自动生成三个随机数</span><span class="random-hint">静心冥想你要问的事，然后点击起卦</span></div>';
  }
  document.getElementById('meihua-content').innerHTML = html;
}

function randomMeihuaNums() {
  document.getElementById('mh-n1').value = Math.floor(Math.random() * 100) + 1;
  document.getElementById('mh-n2').value = Math.floor(Math.random() * 100) + 1;
  document.getElementById('mh-n3').value = Math.floor(Math.random() * 100) + 1;
}

function onMeihuaCalc() {
  var method = window._meihuaMethod;
  var input = { method: method };

  if (method === 'manual') {
    var n1 = parseInt(document.getElementById('mh-n1').value);
    var n2 = parseInt(document.getElementById('mh-n2').value);
    var n3 = parseInt(document.getElementById('mh-n3').value);
    if (isNaN(n1) || isNaN(n2) || isNaN(n3) || n1 <= 0 || n2 <= 0 || n3 <= 0) {
      showToast('请输入三个正整数'); return;
    }
    input.numbers = [n1, n2, n3];
  }

  App.meihuaResult = calculateMeiHua(input);
  Router.navigate('/meihua/result');
}

Pages.meihua.result = function() {
  var r = App.meihuaResult;
  if (!r) { Router.navigate('/meihua/input'); return; }

  var bagua = window._BAGUA || {};
  var up = r.upperTrigram, low = r.lowerTrigram;
  var relClass = r.tiYongRelation === '体用比和' || r.tiYongRelation === '用生体' ? 'good' : r.tiYongRelation === '体克用' ? 'neutral' : 'bad';

  renderPage('<div class="result-page">' +
    '<div class="page-title">梅花易数 — 卦象</div>' +
    '<div class="numbers-row"><span class="num-label">起数：</span><span class="num-value">' + r.numbers.join(' · ') + '</span></div>' +
    '<div class="trigrams-row">' +
    '<div class="trigram-box"><span class="t-label">上卦</span><span class="t-name">' + (up ? up.name : '?') + '</span><span class="t-symbol">' + (up ? up.symbol : '') + '</span></div>' +
    '<span class="plus-sign">+</span>' +
    '<div class="trigram-box"><span class="t-label">下卦</span><span class="t-name">' + (low ? low.name : '?') + '</span><span class="t-symbol">' + (low ? low.symbol : '') + '</span></div></div>' +
    '<div class="hex-list"><div class="hex-col"><span class="col-title">本卦</span>' + HexagramView.render({ primaryLines: r.primaryHexagram.lines, primaryName: r.primaryHexagram.name }) + '</div>' +
    '<div class="hex-col"><span class="col-title">互卦</span>' + HexagramView.render({ primaryLines: r.mutualHexagram.lines, primaryName: r.mutualHexagram.name }) + '</div>' +
    '<div class="hex-col"><span class="col-title">变卦</span>' + HexagramView.render({ primaryLines: r.transformedHexagram.lines, primaryName: r.transformedHexagram.name }) + '</div></div>' +
    '<div class="tiyong-card ' + relClass + '"><span class="card-title">⚖️ 体用分析</span>' +
    '<div class="tiyong-row"><div class="tiyong-item"><span class="tiyong-label">体卦（你）</span><span class="tiyong-value">' + r.tiGua + '</span></div>' +
    '<span class="tiyong-arrow">vs</span>' +
    '<div class="tiyong-item"><span class="tiyong-label">用卦（事）</span><span class="tiyong-value">' + r.yongGua + '</span></div></div>' +
    '<span class="tiyong-relation"><b>' + r.tiYongRelation + '</b> — ' + r.tiYongJudgement.result + '</span>' +
    '<span class="tiyong-analysis">' + r.tiYongJudgement.desc + '</span></div>' +
    '<button class="btn-primary" onclick="Router.navigate(\'/meihua/detail\')">查看详解</button>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/meihua/input\')">重新起卦</button></div>');
};

Pages.meihua.detail = function() {
  var r = App.meihuaResult;
  if (!r) { Router.navigate('/meihua/input'); return; }
  renderPage('<div class="detail-page">' +
    '<div class="page-title">梅花易数 — 详解</div>' +
    '<div class="card"><span class="card-title">📖 本卦：' + r.primaryHexagram.name + '</span><span class="card-text">' + esc(r.primaryHexagram.judgement) + '</span></div>' +
    '<div class="card"><span class="card-title">🔄 互卦：' + r.mutualHexagram.name + '</span><span class="card-text">' + esc(r.mutualHexagram.judgement) + '</span></div>' +
    '<div class="card"><span class="card-title">🔮 变卦：' + r.transformedHexagram.name + '</span><span class="card-text">' + esc(r.transformedHexagram.judgement) + '</span></div>' +
    '<div class="card"><span class="card-title">⚡ 动爻（第' + r.changingLine + '爻）</span><span class="card-text">' + esc(r.primaryHexagram.lineTexts[r.changingLine - 1] || '') + '</span></div>' +
    '<div class="card highlight"><span class="card-title">⚖️ 体用判断</span><span class="card-text">' + r.tiYongJudgement.desc + '</span></div>' +
    '<div class="glossary"><span class="g-title">📚 体用生克</span>' +
    '<span class="g-text">体卦 = 你自己 · 用卦 = 你问的事</span>' +
    '<span class="g-text">体克用=你驾驭事（吉·需努力）| 用克体=事对你不利（凶）</span>' +
    '<span class="g-text">体生用=你消耗自己（泄）| 用生体=事帮了你（吉）| 比和=和谐（大吉）</span></div></div>');
};
