/**
 * 个人中心
 */
Pages.profile = function() {
  setActiveTab('profile');
  var history = Storage.get('divination_history', []);
  var counts = {};
  for (var i = 0; i < history.length; i++) { var m = history[i].module; counts[m] = (counts[m] || 0) + 1; }

  var stats = [
    { module:'daily-fortune', name:'每日抽签', icon:'🎋' },
    { module:'liuyao', name:'六爻占卜', icon:'☯' },
    { module:'bazi', name:'八字命理', icon:'📜' },
    { module:'zwds', name:'紫微斗数', icon:'🌟' },
    { module:'meihua', name:'梅花易数', icon:'🌸' }
  ];

  var statsHtml = stats.map(function(s) {
    return '<div class="stat-item"><span class="stat-icon">' + s.icon + '</span><span class="stat-count">' + (counts[s.module] || 0) + '</span><span class="stat-name">' + s.name + '</span></div>';
  }).join('');

  renderPage('<div class="profile-page">' +
    '<div class="user-card"><div class="avatar-wrap"><div class="avatar-placeholder">👤</div></div>' +
    '<div class="user-info"><span class="nickname">道易用户</span><span class="user-status">本地模式</span></div></div>' +
    '<div class="stats-section"><div class="section-title"><span>📊 占卜统计</span></div><div class="stats-grid">' + statsHtml + '</div></div>' +
    '<div class="settings-section"><div class="section-title"><span>⚙️ 设置</span></div>' +
    '<div class="setting-item" onclick="showModal({title:\'免责声明\',content:\'本网页内容源自中国传统易学文化，仅供学习参考和娱乐。命运掌握在自己手中，请理性看待占卜结果。任何内容都不构成人生决策的依据。\'})"><div class="setting-info"><span class="setting-title">免责声明</span><span class="setting-desc">关于占卜结果的说明</span></div><span class="setting-arrow">›</span></div>' +
    '<div class="setting-item" onclick="showModal({title:\'关于道易\',content:\'道易 v1.0.0\\n传承道家文化，探索易学智慧\\n\\n以现代技术呈现中国古代占卜术数，让更多人了解和欣赏中国传统文化的博大精深。\\n\\n⚠️ 仅供娱乐参考\'})"><div class="setting-info"><span class="setting-title">关于道易</span><span class="setting-desc">版本信息</span></div><span class="setting-arrow">›</span></div>' +
    '<div class="setting-item" onclick="if(confirm(\'确定清除所有本地数据？\')){localStorage.clear();showToast(\'数据已清除\');setTimeout(function(){Pages.profile()},1000)}"><div class="setting-info"><span class="setting-title">清除数据</span><span class="setting-desc">清除所有本地存储的占卜记录</span></div><span class="setting-arrow">›</span></div></div>' +
    '<div class="footer"><span class="footer-text">道易 — 传承道家文化</span><span class="footer-text">仅供娱乐参考</span></div></div>');
};
