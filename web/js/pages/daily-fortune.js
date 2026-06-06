var Pages = Pages || {};
/**
 * 每日抽签页面
 */
Pages.dailyFortune = {};

Pages.dailyFortune.draw = function() {
  var drawn = hasDrawnToday();
  var cached = drawn ? getTodayCachedFortune() : null;

  if (drawn && cached) {
    var lc = getFortuneLevelColor(cached.level);
    renderPage('' +
      '<div class="draw-page"><div class="result-preview">' +
      '<div class="result-level" style="background:' + lc + '"><span class="level-text">' + cached.level + '</span></div>' +
      '<span class="result-title">' + cached.title + '</span>' +
      '<span class="result-poem">' + esc(cached.poem) + '</span>' +
      '<div class="card"><span class="summary-label">📖 签诗大意</span><span class="summary-text">' + esc(cached.modern.summary) + '</span></div>' +
      '<div class="actions"><button class="btn-primary" onclick="Router.navigate(\'/daily-fortune/result\')">查看详细解读</button></div></div></div>');
    return;
  }

  renderPage('' +
    '<div class="draw-page"><div class="draw-section">' +
    '<div class="draw-header"><span class="draw-icon">🏮</span><span class="draw-title">每日抽签</span><span class="draw-subtitle">诚心祈愿，心诚则灵</span></div>' +
    '<div class="shrine-area">' +
    '  <div class="incense-holders">' +
    '    <span class="incense-stick" id="incense1">🪔</span>' +
    '    <span class="incense-stick" id="incense2">🪔</span>' +
    '    <span class="incense-stick" id="incense3">🪔</span>' +
    '  </div>' +
    '  <div class="smoke-container" id="smoke-container" style="display:none">' +
    '    <span class="smoke-particle" id="sp1"></span>' +
    '    <span class="smoke-particle" id="sp2"></span>' +
    '    <span class="smoke-particle" id="sp3"></span>' +
    '    <span class="smoke-particle" id="sp4"></span>' +
    '    <span class="smoke-particle" id="sp5"></span>' +
    '  </div>' +
    '</div>' +
    '<div class="qiantong-area" id="qiantong-area">' +
    '  <div class="qiantong" id="qiantong">' +
    '    <span class="qiantong-icon">🏺</span>' +
    '    <div class="sticks-bundle" id="sticks-bundle">' +
    '      <div class="stick-in-tube" style="transform:rotate(-8deg)"></div>' +
    '      <div class="stick-in-tube" style="transform:rotate(-3deg)"></div>' +
    '      <div class="stick-in-tube" style="transform:rotate(0deg)"></div>' +
    '      <div class="stick-in-tube" style="transform:rotate(3deg)"></div>' +
    '      <div class="stick-in-tube" style="transform:rotate(7deg)"></div>' +
    '      <div class="stick-in-tube falling" id="falling-stick"></div>' +
    '    </div>' +
    '  </div>' +
    '  <span class="draw-hint" id="draw-hint">点击签筒抽取今日运势签</span>' +
    '  <span class="draw-note">每日仅可抽一次</span>' +
    '</div>' +
    '<div id="loading-text" class="anim-text" style="display:none"></div></div></div>');

  // 绑定抽签事件
  document.getElementById('qiantong-area').onclick = function() {
    var qiantong = document.getElementById('qiantong');
    var hint = document.getElementById('draw-hint');
    var loadingText = document.getElementById('loading-text');
    var smoke = document.getElementById('smoke-container');
    var fallingStick = document.getElementById('falling-stick');
    var incenseSticks = [
      document.getElementById('incense1'),
      document.getElementById('incense2'),
      document.getElementById('incense3')
    ];

    // 阶段1：签筒摇晃 (0-2s)
    hint.textContent = '签筒摇晃中...';
    qiantong.classList.add('shaking');

    // 点燃香
    incenseSticks.forEach(function(s) { s.classList.add('lit'); });
    smoke.style.display = 'flex';

    // 阶段2：一支签跳出 (2s-3.5s)
    setTimeout(function() {
      qiantong.classList.remove('shaking');
      loadingText.style.display = 'block';
      loadingText.textContent = '一支签正在落下...';
      fallingStick.classList.add('jumping');
    }, 1800);

    // 阶段3：展示结果 (3.5s)
    setTimeout(function() {
      smoke.style.display = 'none';
      loadingText.style.display = 'none';
      var fortune = drawFortune();
      if (fortune) {
        saveTodayDraw(fortune);
        App.dailyDrawStatus = 'used';
        App.dailyFortuneToday = fortune;
        Pages.dailyFortune.draw();
      } else {
        showToast('抽签失败，请刷新页面重试');
      }
    }, 3200);
  };
};

Pages.dailyFortune.result = function() {
  var fortune = getTodayCachedFortune();
  if (!fortune) { Router.navigate('/daily-fortune/draw'); return; }
  // 上上签撒花
  if (fortune.level === '上上') { setTimeout(celebrate, 600); }

  var lc = getFortuneLevelColor(fortune.level);
  var emoji = getFortuneLevelEmoji(fortune.level);

  renderPage('' +
    '<div class="result-page"><div class="result-content">' +
    '<div class="result-header" style="background:linear-gradient(135deg,' + lc + ',' + lc + '88)">' +
    '<span class="header-emoji">' + emoji + '</span><span class="header-level">' + fortune.level + '</span>' +
    '<span class="header-title">' + fortune.title + '</span></div>' +
    '<div class="poem-section card"><span class="section-label">📜 签诗</span><span class="poem-text">' + esc(fortune.poem) + '</span></div>' +
    '<div class="modern-section"><div class="section-title">📖 现代解读</div>' +
    '<div class="interpret-item"><span class="item-label">📋 总览</span><span class="item-text">' + esc(fortune.modern.summary) + '</span></div>' +
    '<div class="interpret-grid">' +
    '<div class="inter-item"><span class="item-label">💼 事业</span><span class="item-text">' + esc(fortune.modern.career) + '</span></div>' +
    '<div class="inter-item"><span class="item-label">💰 财运</span><span class="item-text">' + esc(fortune.modern.wealth) + '</span></div>' +
    '<div class="inter-item"><span class="item-label">❤️ 感情</span><span class="item-text">' + esc(fortune.modern.love) + '</span></div>' +
    '<div class="inter-item"><span class="item-label">🏥 健康</span><span class="item-text">' + esc(fortune.modern.health) + '</span></div></div>' +
    '<div class="advice-item"><span class="item-label">💡 建议</span><span class="item-text advice-text">' + esc(fortune.modern.advice) + '</span></div></div>' +
    '<div class="explanation-section card"><span class="section-label">🔍 解曰</span><span class="explanation-text">' + esc(fortune.explanation) + '</span></div>' +
    '<div class="actions"><button class="btn-outline" onclick="Router.navigate(\'/home\')">← 返回首页</button></div>' +
    '<div class="disclaimer">仅供娱乐参考，命运掌握在自己手中</div></div></div>');
};
