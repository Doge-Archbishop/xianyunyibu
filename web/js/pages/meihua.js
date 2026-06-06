/**
 * 梅花易数页面 — 观物取象，以数起卦
 */
Pages.meihua = {};

Pages.meihua.input = function() {
  renderPage('' +
    '<div class="meihua-page">' +
    '<div class="page-header"><span class="page-icon">🌸</span><span class="page-title">梅花易数</span>' +
    '<span class="page-desc">观物取象，以数起卦。万物皆可成为卜筮之机。</span></div>' +
    '<div class="method-tabs">' +
    '<div class="method-tab active" id="tab-time" onclick="switchMeihuaTab(\'time\')">⏰ 时间起卦</div>' +
    '<div class="method-tab" id="tab-manual" onclick="switchMeihuaTab(\'manual\')">✏️ 手动输入</div>' +
    '<div class="method-tab" id="tab-random" onclick="switchMeihuaTab(\'random\')">🎲 随机</div></div>' +
    '<div id="meihua-content"></div>' +
    '<button class="btn-primary" id="meihua-calc-btn" onclick="onMeihuaCalc()">🌿 开始起卦</button>' +
    '<div class="tip-card"><span class="tip-title">📖 梅花易数小知识</span>' +
    '<span class="tip-text">梅花易数由宋代大儒邵雍（邵康节）所创，是一种"观物取象、触机而发"的占卜方法。花开花落、鸟鸣云起、数字号码，皆可成为起卦的契机。因其灵动机变、不拘一格，被称为"易学中最活泼的方法"。</span></div></div>');

  window._meihuaMethod = 'time';
  renderMeihuaContent('time');
};

function switchMeihuaTab(method) {
  window._meihuaMethod = method;
  document.querySelectorAll('.method-tab').forEach(function(el) { el.classList.remove('active'); });
  var tabEl = document.getElementById('tab-' + method);
  if (tabEl) tabEl.classList.add('active');
  renderMeihuaContent(method);
}

function renderMeihuaContent(method) {
  var el = document.getElementById('meihua-content');
  if (!el) return;
  var html = '';
  if (method === 'time') {
    html = '<div class="time-display">' +
      '<span class="time-icon">🕐</span>' +
      '<span class="time-label">以当前日期时间自动起卦</span>' +
      '<span class="time-hint">系统将根据年、月、日、时四个维度自动推算上卦、下卦与动爻</span></div>';
  } else if (method === 'manual') {
    html = '<div class="input-group"><span class="input-label">第一个数（定上卦）</span>' +
      '<input class="dao-input" id="mh-n1" type="number" placeholder="输入任意正整数，如 3"></div>' +
      '<div class="input-group"><span class="input-label">第二个数（定下卦）</span>' +
      '<input class="dao-input" id="mh-n2" type="number" placeholder="输入任意正整数，如 8"></div>' +
      '<div class="input-group"><span class="input-label">第三个数（定动爻）</span>' +
      '<input class="dao-input" id="mh-n3" type="number" placeholder="输入任意正整数，如 6"></div>' +
      '<button class="btn-outline" onclick="randomMeihuaNums()" style="margin-top:8px">🎲 随机生成三个数</button>';
  } else {
    html = '<div class="random-display">' +
      '<span class="time-icon">🎲</span>' +
      '<span class="random-label">系统将自动生成三个随机数</span>' +
      '<span class="random-hint">静心冥想你要问的事情，然后点击下方起卦按钮</span></div>';
  }
  el.innerHTML = html;
}

function randomMeihuaNums() {
  var n1 = document.getElementById('mh-n1');
  var n2 = document.getElementById('mh-n2');
  var n3 = document.getElementById('mh-n3');
  if (n1) n1.value = Math.floor(Math.random() * 100) + 1;
  if (n2) n2.value = Math.floor(Math.random() * 100) + 1;
  if (n3) n3.value = Math.floor(Math.random() * 100) + 1;
}

function onMeihuaCalc() {
  var method = window._meihuaMethod || 'time';
  var input = { method: method };

  if (method === 'manual') {
    var n1El = document.getElementById('mh-n1');
    var n2El = document.getElementById('mh-n2');
    var n3El = document.getElementById('mh-n3');
    if (!n1El || !n2El || !n3El) { showToast('请先选择起卦方式'); return; }
    var n1 = parseInt(n1El.value);
    var n2 = parseInt(n2El.value);
    var n3 = parseInt(n3El.value);
    if (isNaN(n1) || isNaN(n2) || isNaN(n3) || n1 <= 0 || n2 <= 0 || n3 <= 0) {
      showToast('请输入三个正整数（大于0）'); return;
    }
    input.numbers = [n1, n2, n3];
  }

  // 显示加载动画
  var btn = document.getElementById('meihua-calc-btn');
  if (btn) { btn.textContent = '🌿 正在感应天地...'; btn.disabled = true; }

  setTimeout(function() {
    var result = calculateMeiHua(input);
    if (btn) { btn.textContent = '🌿 开始起卦'; btn.disabled = false; }
    if (!result) return;
    App.meihuaResult = result;
    Router.navigate('/meihua/result');
  }, 800);
}

/** 结果页 */
Pages.meihua.result = function() {
  var r = App.meihuaResult;
  if (!r) { Router.navigate('/meihua/input'); return; }

  var up = r.upperTrigram, low = r.lowerTrigram;
  var relClass = r.tiYongRelation === '体用比和' || r.tiYongRelation === '用生体' ? 'good' : r.tiYongRelation === '体克用' ? 'neutral' : 'bad';

  renderPage('<div class="result-page animate-in">' +
    '<div class="page-title">梅花易数 — 卦象</div>' +
    '<div class="numbers-row"><span class="num-label">起数：</span><span class="num-value">' + r.numbers.join(' · ') + '</span></div>' +
    '<div class="trigrams-row">' +
    '<div class="trigram-box upper"><span class="t-label">上卦</span><span class="t-name">' + up.name + '</span><span class="t-symbol">' + up.symbol + '</span><span class="t-wuxing">' + up.wuxing + '</span></div>' +
    '<span class="plus-sign">+</span>' +
    '<div class="trigram-box lower"><span class="t-label">下卦</span><span class="t-name">' + low.name + '</span><span class="t-symbol">' + low.symbol + '</span><span class="t-wuxing">' + low.wuxing + '</span></div></div>' +
    '<div class="hex-list">' +
    '<div class="hex-col"><span class="col-title">本卦</span>' + HexagramView.render({ primaryLines: r.primaryHexagram.lines, primaryName: r.primaryHexagram.name }) + '</div>' +
    '<div class="hex-col"><span class="col-title">互卦</span>' + HexagramView.render({ primaryLines: r.mutualHexagram.lines, primaryName: r.mutualHexagram.name }) + '</div>' +
    '<div class="hex-col"><span class="col-title">变卦</span>' + HexagramView.render({ primaryLines: r.transformedHexagram.lines, primaryName: r.transformedHexagram.name }) + '</div></div>' +
    '<div class="tiyong-card ' + relClass + '">' +
    '<span class="card-title">⚖️ 体用生克分析</span>' +
    '<div class="tiyong-row"><div class="tiyong-item"><span class="tiyong-label">体卦（你）</span><span class="tiyong-value">' + r.tiGua + '</span></div>' +
    '<span class="tiyong-arrow">vs</span>' +
    '<div class="tiyong-item"><span class="tiyong-label">用卦（事）</span><span class="tiyong-value">' + r.yongGua + '</span></div></div>' +
    '<span class="tiyong-relation"><b>' + r.tiYongRelation + '</b> — ' + r.tiYongJudgement.result + '</span>' +
    '<span class="tiyong-analysis">' + r.tiYongJudgement.desc + '</span></div>' +
    '<div class="actions">' +
    '<button class="btn-primary" onclick="Router.navigate(\'/meihua/detail\')">📋 查看详解</button>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/meihua/input\')">🔄 重新起卦</button></div></div>');
};

/** 详解页 */
Pages.meihua.detail = function() {
  var r = App.meihuaResult;
  if (!r) { Router.navigate('/meihua/input'); return; }
  renderPage('<div class="detail-page animate-in">' +
    '<div class="page-title">梅花易数 — 详解</div>' +
    '<div class="card"><span class="card-title">📖 本卦：' + r.primaryHexagram.name + '</span><span class="card-text">' + esc(r.primaryHexagram.judgement) + '</span></div>' +
    '<div class="card"><span class="card-title">🔄 互卦：' + r.mutualHexagram.name + '</span><span class="card-text">' + esc(r.mutualHexagram.judgement) + '</span></div>' +
    '<div class="card"><span class="card-title">🔮 变卦：' + r.transformedHexagram.name + '</span><span class="card-text">' + esc(r.transformedHexagram.judgement) + '</span></div>' +
    '<div class="card"><span class="card-title">⚡ 动爻（第' + r.changingLine + '爻）</span><span class="card-text">' + esc(r.primaryHexagram.lineTexts[r.changingLine - 1] || '') + '</span></div>' +
    '<div class="card highlight"><span class="card-title">⚖️ 体用判断</span><span class="card-text">' + r.tiYongJudgement.desc + '</span></div>' +
    '<div class="glossary"><span class="g-title">📚 体用生克速查</span>' +
    '<span class="g-text"><b>体卦</b> = 代表你自己 · <b>用卦</b> = 代表你问的事情</span>' +
    '<span class="g-text">体克用 = 你能驾驭事（吉·需努力）</span>' +
    '<span class="g-text">用克体 = 事对你不利（凶·需谨慎）</span>' +
    '<span class="g-text">体生用 = 你消耗自己成全事（泄气）</span>' +
    '<span class="g-text">用生体 = 事反过来帮了你（进益·吉）</span>' +
    '<span class="g-text">体用比和 = 你与事和谐一致（大吉）</span></div>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/meihua/result\')">← 返回卦象</button></div>');
};
