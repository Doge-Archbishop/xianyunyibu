/**
 * 八字页面
 */
Pages.bazi = {};

Pages.bazi.input = function() {
  renderPage('' +
    '<div class="bazi-page">' +
    '<div class="page-header"><span class="page-icon">📜</span><span class="page-title">八字排盘</span><span class="page-desc">四柱推命，五行平衡。根据出生年月日时推算命理。</span></div>' +
    '<div class="form-section">' +
    '<div class="form-group"><span class="form-label">出生日期（阳历）</span><input class="dao-input" id="bz-date" type="date" value="2000-01-01"></div>' +
    '<div class="form-group"><span class="form-label">出生时辰</span><select class="dao-input" id="bz-hour">' +
    '<option value="子">子时 (23:00-01:00)</option><option value="丑">丑时 (01:00-03:00)</option>' +
    '<option value="寅">寅时 (03:00-05:00)</option><option value="卯">卯时 (05:00-07:00)</option>' +
    '<option value="辰">辰时 (07:00-09:00)</option><option value="巳">巳时 (09:00-11:00)</option>' +
    '<option value="午" selected>午时 (11:00-13:00)</option><option value="未">未时 (13:00-15:00)</option>' +
    '<option value="申">申时 (15:00-17:00)</option><option value="酉">酉时 (17:00-19:00)</option>' +
    '<option value="戌">戌时 (19:00-21:00)</option><option value="亥">亥时 (21:00-23:00)</option>' +
    '</select></div>' +
    '<div class="form-group"><span class="form-label">性别</span>' +
    '<div class="gender-tabs" id="bz-gender">' +
    '<div class="gender-tab active" data-g="男">男</div><div class="gender-tab" data-g="女">女</div></div></div></div>' +
    '<button class="btn-primary" onclick="onBaziCalc()">开始排盘</button>' +
    '<div class="tip-card"><span class="tip-title">📖 八字小知识</span><span class="tip-text">八字以出生年月日时四个时间点换算成天干地支（共八个字），通过分析五行生克、十神关系来推演性格特征和命运走势。</span></div></div>');

  // 性别选择事件
  var genderTabs = document.querySelectorAll('#bz-gender .gender-tab');
  genderTabs.forEach(function(tab) {
    tab.onclick = function() {
      genderTabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
    };
  });
};

function onBaziCalc() {
  var date = document.getElementById('bz-date').value;
  var hourBranch = document.getElementById('bz-hour').value;
  var gender = document.querySelector('#bz-gender .gender-tab.active').getAttribute('data-g');

  var result = calculateBaZi({ solarDate: date, hourBranch: hourBranch, gender: gender });
  App.baziResult = result;
  Router.navigate('/bazi/result');
}

Pages.bazi.result = function() {
  var r = App.baziResult;
  if (!r) { Router.navigate('/bazi/input'); return; }
  var p = r.pillars;
  var wxC = r.wuxingCount;
  var maxC = Math.max(wxC['金']||0, wxC['木']||0, wxC['水']||0, wxC['火']||0, wxC['土']||0, 1);
  var colors = { '金':'#F5F0E0','木':'#4CAF50','水':'#2196F3','火':'#F44336','土':'#FF9800' };
  var barsHtml = '';
  ['金','木','水','火','土'].forEach(function(wx) {
    var pct = Math.round(((wxC[wx]||0) / maxC) * 100);
    barsHtml += '<div class="wuxing-bar"><span class="bar-label">' + wx + '</span><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + (colors[wx]||'#ccc') + '"></div></div><span class="bar-count">' + (wxC[wx]||0) + '</span></div>';
  });

  var dyHtml = '';
  for (var i = 0; i < Math.min(r.daYun.length, 5); i++) {
    var dy = r.daYun[i];
    dyHtml += '<div class="dayun-item' + (dy.isCurrent ? ' current' : '') + '"><span class="dy-age">' + dy.startAge + '岁</span><span class="dy-ganzhi">' + dy.ganzhi.gan + dy.ganzhi.zhi + '</span>' + (dy.isCurrent ? '<span class="dy-current">←当前</span>' : '') + '</div>';
  }

  renderPage('<div class="result-page">' +
    '<div class="page-title">八字排盘结果</div>' +
    '<div class="pillars-table"><div class="table-header"><span class="th">时柱</span><span class="th">日柱</span><span class="th">月柱</span><span class="th">年柱</span></div>' +
    '<div class="table-row gan-row"><span class="td">' + p.hour.gan + '</span><span class="td highlight">' + p.day.gan + '</span><span class="td">' + p.month.gan + '</span><span class="td">' + p.year.gan + '</span></div>' +
    '<div class="table-row zhi-row"><span class="td">' + p.hour.zhi + '</span><span class="td highlight">' + p.day.zhi + '</span><span class="td">' + p.month.zhi + '</span><span class="td">' + p.year.zhi + '</span></div>' +
    '<div class="table-row nayin-row"><span class="td sm">' + r.nayin[3] + '</span><span class="td sm">' + r.nayin[2] + '</span><span class="td sm">' + r.nayin[1] + '</span><span class="td sm">' + r.nayin[0] + '</span></div></div>' +
    '<div class="daymaster-card"><span class="dm-label">日主（你自己）</span><span class="dm-value">' + r.dayMaster + '（' + r.dayMasterWuxing + '）</span></div>' +
    '<div class="card"><span class="card-title">🎨 五行分布</span>' + barsHtml + '</div>' +
    '<div class="card"><span class="card-title">📅 大运</span><div class="dayun-list">' + dyHtml + '</div></div>' +
    '<button class="btn-primary" onclick="Router.navigate(\'/bazi/analysis\')">查看详细分析</button></div>');
};

Pages.bazi.analysis = function() {
  var r = App.baziResult;
  if (!r) { Router.navigate('/bazi/input'); return; }
  var interp = r.interpretation;

  renderPage('<div class="analysis-page">' +
    '<div class="page-title">八字详细分析</div>' +
    '<div class="card"><span class="card-title">🧑 日主分析</span><span class="card-text">' + esc(interp.dayMasterAnalysis) + '</span></div>' +
    '<div class="card"><span class="card-title">🎨 五行平衡</span><span class="card-text">' + esc(interp.wuxingBalance) + '</span></div>' +
    '<div class="card"><span class="card-title">💼 事业</span><span class="card-text">' + esc(interp.career) + '</span></div>' +
    '<div class="card"><span class="card-title">💰 财运</span><span class="card-text">' + esc(interp.wealth) + '</span></div>' +
    '<div class="card"><span class="card-title">❤️ 感情</span><span class="card-text">' + esc(interp.love) + '</span></div>' +
    '<div class="card"><span class="card-title">🏥 健康</span><span class="card-text">' + esc(interp.health) + '</span></div>' +
    '<div class="card highlight"><span class="card-title">📅 当前运势</span><span class="card-text">' + esc(interp.currentYun) + '</span></div>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/bazi/result\')">← 返回排盘</button>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/bazi/input\')">🔄 重新排盘</button>' +
    '<div class="disclaimer">以上分析仅供娱乐参考，命运掌握在自己手中</div></div>');
};
