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
    '<div class="qiantong-area" id="qiantong-area">' +
    '<div class="qiantong" id="qiantong"><span class="qiantong-icon">🏺</span><div class="stick s1"></div><div class="stick s2"></div><div class="stick s3"></div></div>' +
    '<span class="draw-hint">点击签筒抽取今日运势签</span><span class="draw-note">每日仅可抽一次</span></div>' +
    '<div id="loading-area" class="animation-area" style="display:none">' +
    '<div class="incense-burner"><span class="burner-icon">🪔</span></div>' +
    '<span class="anim-text" id="loading-text">焚香祈愿中...</span></div></div></div>');

  // 绑定抽签事件
  document.getElementById('qiantong-area').onclick = function() {
    document.getElementById('qiantong-area').style.display = 'none';
    document.getElementById('loading-area').style.display = 'flex';

    setTimeout(function() { document.getElementById('loading-text').textContent = '签筒摇晃中...'; }, 1000);
    setTimeout(function() { document.getElementById('loading-text').textContent = '一支签正在落下...'; }, 2000);
    setTimeout(function() {
      var fortune = drawFortune();
      if (fortune) {
        saveTodayDraw(fortune);
        App.dailyDrawStatus = 'used';
        App.dailyFortuneToday = fortune;
        Pages.dailyFortune.draw();
      }
    }, 3000);
  };
};

Pages.dailyFortune.result = function() {
  var fortune = getTodayCachedFortune();
  if (!fortune) { Router.navigate('/daily-fortune/draw'); return; }

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
    '<div class="actions"><button class="btn-outline" onclick="Router.navigate(\'/daily-fortune/draw\')">返回</button></div>' +
    '<div class="disclaimer">仅供娱乐参考，命运掌握在自己手中</div></div></div>');
};
