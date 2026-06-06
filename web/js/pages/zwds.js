/**
 * 紫微斗数页面
 */
Pages.zwds = {};

Pages.zwds.input = function() {
  renderPage('' +
    '<div class="zwds-page">' +
    '<div class="page-header"><span class="page-icon">🌟</span><span class="page-title">紫微斗数</span><span class="page-desc">群星列宿，天命有数。根据出生时间排布十二宫星盘。</span></div>' +
    '<div class="form-section">' +
    '<div class="form-group"><span class="form-label">出生日期（阳历）</span><input class="dao-input" id="zwds-date" type="date" value="2000-01-01"></div>' +
    '<div class="form-group"><span class="form-label">出生时间</span><input class="dao-input" id="zwds-hour" type="number" min="0" max="23" value="12" placeholder="0-23时"></div>' +
    '<div class="form-group"><span class="form-label">分钟</span><input class="dao-input" id="zwds-minute" type="number" min="0" max="59" value="0" placeholder="0-59分"></div>' +
    '<div class="form-group"><span class="form-label">性别</span>' +
    '<div class="gender-tabs" id="zwds-gender"><div class="gender-tab active" data-g="男">男</div><div class="gender-tab" data-g="女">女</div></div></div></div>' +
    '<button class="btn-primary" onclick="onZWDSCalc()">排紫微命盘</button>' +
    '<div class="tip-card"><span class="tip-title">📖 紫微斗数小知识</span>' +
    '<span class="tip-text">紫微斗数是传统命理学中最为精密的体系之一，以紫微星为北斗之首，统领诸星。命盘共十二宫，涵盖人生的方方面面：命宫（自己）、兄弟、夫妻、子女、财帛、疾厄、迁移、交友、官禄、田宅、福德、父母。每宫都有主星、辅星坐守，吉凶祸福由此而断。</span></div></div>');

  document.querySelectorAll('#zwds-gender .gender-tab').forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll('#zwds-gender .gender-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
    };
  });
};

function onZWDSCalc() {
  var date = document.getElementById('zwds-date').value;
  var hour = parseInt(document.getElementById('zwds-hour').value) || 12;
  var minute = parseInt(document.getElementById('zwds-minute').value) || 0;
  var gender = document.querySelector('#zwds-gender .gender-tab.active').getAttribute('data-g');

  var result = calculateZWDS({ solarDate: date, hour: hour, minute: minute, gender: gender });
  App.zwdsResult = result;
  Router.navigate('/zwds/chart');
}

/** 命盘展示页 */
Pages.zwds.chart = function() {
  var r = App.zwdsResult;
  if (!r) { Router.navigate('/zwds/input'); return; }

  var palaces = r.palaces;
  var isShunXing = r.isShunXing;

  // 十二宫按传统方位排列：命宫在上排居中，逆时针排
  // 布局：4列×3行，第0=命宫(上方), 1=兄弟, 2=夫妻, 3=子女, 4=财帛(右), 5=疾厄, 6=迁移(下方), 7=交友, 8=官禄(左), 9=田宅, 10=福德, 11=父母
  var gridOrder = [0, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6];
  // 实际：4×4 宫格，四角可以为空
  // (0,0)=福德(10)  (0,1)=父母(11)  (0,2)=命宫(0)  (0,3)=兄弟(1)
  // (1,0)=田宅(9)                                (1,3)=夫妻(2)
  // (2,0)=官禄(8)                                (2,3)=子女(3)
  // (3,0)=交友(7)  (3,1)=迁移(6)  (3,2)=疾厄(5)  (3,3)=财帛(4)

  var layout = [
    [{p:10},{p:11},{p:0},{p:1}],
    [{p:9},{p:-1},{p:-1},{p:2}],
    [{p:8},{p:-1},{p:-1},{p:3}],
    [{p:7},{p:6},{p:5},{p:4}]
  ];

  var cellsHtml = '';
  for (var row = 0; row < 4; row++) {
    for (var col = 0; col < 4; col++) {
      var cell = layout[row][col];
      if (cell.p < 0) {
        // 中间空白区域放太极图
        if (row === 1 && col === 1) {
          cellsHtml += '<div class="zwds-center" style="grid-row:' + (row+1) + ';grid-column:' + (col+1) + '"><div class="center-taiji">☯</div></div>';
        } else {
          cellsHtml += '<div class="zwds-cell empty" style="grid-row:' + (row+1) + ';grid-column:' + (col+1) + '"></div>';
        }
      } else {
        var p = palaces[cell.p];
        var starsHtml = '';
        // 主星
        for (var s = 0; s < p.mainStars.length; s++) {
          var cls = p.sihua && p.mainStars[s] === r.sihua[p.sihua] ? 'star sihua-' + p.sihua : 'star';
          starsHtml += '<span class="' + cls + '">' + p.mainStars[s] + '</span>';
        }
        // 辅星
        for (var a = 0; a < Math.min(p.assistantStars.length, 4); a++) {
          starsHtml += '<span class="star assist">' + p.assistantStars[a] + '</span>';
        }
        if (p.assistantStars.length > 4) starsHtml += '<span class="star assist">+' + (p.assistantStars.length - 4) + '</span>';

        var isMing = cell.p === r.mingGongIdx;
        var isShen = cell.p === r.shenGongIdx;
        var marker = isMing ? '命' : isShen ? '身' : '';

        cellsHtml += '<div class="zwds-cell' + (isMing ? ' ming-gong' : '') + (isShen && !isMing ? ' shen-gong' : '') + '" style="grid-row:' + (row+1) + ';grid-column:' + (col+1) + '" onclick="Router.navigate(\'/zwds/palace-detail\');App._zwdsSelectedPalace=' + cell.p + '">' +
          '<div class="cell-header"><span class="cell-palace-name">' + p.name + '</span>' + (marker ? '<span class="cell-marker">' + marker + '</span>' : '') + '</div>' +
          '<div class="cell-stems">' + p.stem + p.branch + '</div>' +
          '<div class="cell-stars">' + starsHtml + '</div>' +
          '<div class="cell-daxian">' + p.daXianStart + '-' + p.daXianEnd + '岁</div>' +
          '</div>';
      }
    }
  }

  renderPage('' +
    '<div class="zwds-chart-page">' +
    '<div class="chart-header">' +
    '<span class="chart-birth">' + r.yearGZ.gan + r.yearGZ.zhi + '年 ' + r.monthGZ.gan + r.monthGZ.zhi + '月 ' + r.dayGZ.gan + r.dayGZ.zhi + '日 ' + r.hourGZ.gan + r.hourGZ.zhi + '时</span>' +
    '<span class="chart-label">' + r.wujuName + ' · ' + (r.isShunXing ? '顺行' : '逆行') + '</span>' +
    '</div>' +
    '<div class="zwds-grid">' + cellsHtml + '</div>' +
    '<div class="chart-legend">' +
    '<span class="legend-item"><span class="legend-dot hl"></span>化禄</span>' +
    '<span class="legend-item"><span class="legend-dot hq"></span>化权</span>' +
    '<span class="legend-item"><span class="legend-dot hk"></span>化科</span>' +
    '<span class="legend-item"><span class="legend-dot hj"></span>化忌</span>' +
    '</div>' +
    '<div class="disclaimer">以上命盘仅供娱乐参考</div></div>');
};

/** 单宫详解 */
Pages.zwds.palaceDetail = function() {
  var idx = App._zwdsSelectedPalace;
  var r = App.zwdsResult;
  if (r === undefined || idx === undefined || !r) { Router.navigate('/zwds/chart'); return; }

  var p = r.palaces[idx];
  var starsHtml = '';
  for (var i = 0; i < p.mainStars.length; i++) {
    starsHtml += '<div class="star-detail-item"><span class="sd-name">' + p.mainStars[i] + '</span><span class="sd-type">主星</span></div>';
  }
  for (var j = 0; j < p.assistantStars.length; j++) {
    starsHtml += '<div class="star-detail-item"><span class="sd-name">' + p.assistantStars[j] + '</span><span class="sd-type">辅星</span></div>';
  }

  renderPage('' +
    '<div class="palace-detail-page">' +
    '<div class="pd-header"><span class="pd-palace-name">' + p.name + '</span><span class="pd-stems">' + p.stem + p.branch + '</span></div>' +
    (p.sihua ? '<div class="pd-sihua">' + p.sihua + '</div>' : '') +
    '<div class="card"><span class="card-title">⭐ 坐守星宿</span>' + (starsHtml || '<span class="card-text">此宫无主星坐守</span>') + '</div>' +
    '<div class="card"><span class="card-title">📅 大限</span><span class="card-text">' + p.daXianStart + '岁 至 ' + p.daXianEnd + '岁</span></div>' +
    '<div class="card"><span class="card-title">🏰 宫位含义</span><span class="card-text">' + getPalaceMeaning(p.name) + '</span></div>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/zwds/chart\')">返回命盘</button></div>');
};

function getPalaceMeaning(name) {
  var map = {
    '命宫':'命宫是十二宫之首，代表你的先天命运、性格特质和人生格局。从这里可以看到一个人的"命"是什么底色。',
    '兄弟':'兄弟宫代表兄弟姐妹缘分、同辈朋友关系、合作伙伴的相处模式。',
    '夫妻':'夫妻宫看婚姻状况、配偶特质、感情生活。未婚者看恋爱缘分，已婚者看婚姻质量。',
    '子女':'子女宫代表子女缘分、生育能力，也关联创造力、娱乐和投资运。',
    '财帛':'财帛宫主财运状况、赚钱能力、理财方式。显示财富的来源和运用。',
    '疾厄':'疾厄宫看身体健康、疾病倾向，也反映心理承受力。',
    '迁移':'迁移宫主外出运、旅行、环境变动、社交能力。也代表你给外人的印象。',
    '交友':'交友宫看朋友、同事、下属等社交关系。',
    '官禄':'官禄宫主事业运、职业发展，适合的行业和成就大小。',
    '田宅':'田宅宫看房产运、家庭环境、居住品质。也反映家庭背景。',
    '福德':'福德宫主精神生活、福气、内心世界和晚年生活品质。',
    '父母':'父母宫代表与父母、长辈、上司的关系，也关联学业文书运。'
  };
  return map[name] || '十二宫之一，紫微斗数命盘的重要组成部分。';
}
