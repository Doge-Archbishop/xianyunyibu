var Pages = Pages || {};
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
          var cls = 'star star-twinkle';
          if (p.sihua) {
            for (var sh in r.sihua) {
              if (r.sihua[sh] === p.mainStars[s]) cls += ' sihua-' + sh;
            }
          }
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
    '<div class="zwds-chart-page animate-in">' +
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

  // 三方四正
  var sanFang = getSanFang(idx);
  var duiGong = (idx + 6) % 12;
  var siZhengNames = sanFang.map(function(i) { return r.palaces[i].name; }).join('、') + '、' + r.palaces[duiGong].name;

  // 主星解读
  var starsHtml = '';
  for (var i = 0; i < p.mainStars.length; i++) {
    var starName = p.mainStars[i];
    var starInfo = getStarInfo(starName);
    starsHtml += '<div class="star-detail-card">' +
      '<div class="sd-header"><span class="sd-name">' + starName + '</span><span class="sd-type main-star">主星</span></div>' +
      '<span class="sd-meaning">' + (starInfo.meaning || '') + '</span>' +
      '<span class="sd-in-palace">在此宫：' + (starInfo.inPalace || getDefaultStarInPalace(starName, p.name)) + '</span></div>';
  }
  for (var j = 0; j < p.assistantStars.length; j++) {
    var astName = p.assistantStars[j];
    var astInfo = getStarInfo(astName);
    starsHtml += '<div class="star-detail-card assist">' +
      '<div class="sd-header"><span class="sd-name">' + astName + '</span><span class="sd-type assist-star">辅星</span></div>' +
      '<span class="sd-meaning">' + (astInfo.meaning || '') + '</span></div>';
  }
  if (!starsHtml) starsHtml = '<div class="star-detail-card empty"><span class="sd-meaning">此宫无主星坐守（空宫），需参考对宫（' + r.palaces[duiGong].name + '）的星曜来辅助判断。</span></div>';

  var sihuaText = '';
  if (p.sihua) {
    var shMap = { '化禄':'财运和机遇增强，此宫所主之事较为顺遂。', '化权':'权力和能力彰显，此宫需要主动掌握。', '化科':'名声和学识提升，此宫有优雅和谐之气。', '化忌':'困扰和阻碍所在，此宫是需要注意和努力的领域。' };
    sihuaText = '<div class="card highlight"><span class="card-title">' + p.sihua + '</span><span class="card-text">' + (shMap[p.sihua] || '') + '</span></div>';
  }

  renderPage('' +
    '<div class="palace-detail-page animate-in">' +
    '<div class="pd-header"><span class="pd-palace-name">' + p.name + '</span>' +
    '<span class="pd-stems">' + p.stem + p.branch + ' · ' + (r.wujuName || '') + '</span></div>' +
    sihuaText +
    '<div class="card stagger-card"><span class="card-title">⭐ 坐守星曜</span>' + starsHtml + '</div>' +
    '<div class="card stagger-card"><span class="card-title">🔗 三方四正</span>' +
    '<span class="card-text">此宫的三方（' + sanFang.map(function(i) { return r.palaces[i].name; }).join('、') + '）和对宫（' + r.palaces[duiGong].name + '）共同影响此宫的吉凶。\n\n三方四正合称"' + siZhengNames + '"，在看任何一宫时都要参考这四个宫位的星曜配置，综合判断才更准确。</span></div>' +
    '<div class="card stagger-card"><span class="card-title">📅 大限</span>' +
    '<span class="card-text">' + p.daXianStart + '岁 至 ' + p.daXianEnd + '岁行此宫大限。这十年中，此宫所主的方面（' + getPalaceDomain(p.name) + '）将成为人生的重点领域。' + (p.daXianStart <= 30 ? '这是人生较早的阶段，此宫的事务会在年轻时就有体现。' : p.daXianStart <= 50 ? '这是人生的中年阶段，此宫的事务在事业和家庭的成熟期发挥作用。' : '这是人生的后期阶段，此宫的事务会在阅历丰富之后得以彰显。') + '</span></div>' +
    '<div class="card stagger-card"><span class="card-title">🏰 宫位详解</span><span class="card-text">' + getPalaceMeaning(p.name) + '</span></div>' +
    '<button class="btn-outline" onclick="Router.navigate(\'/zwds/chart\')">← 返回命盘</button>' +
    '<div class="disclaimer">以上命盘分析仅供娱乐参考</div></div>');
};

/** 三方：相隔4个宫位（顺时针第5个宫）的两宫 + 本宫 */
function getSanFang(idx) {
  return [(idx + 4) % 12, (idx + 8) % 12];
}

function getPalaceDomain(name) {
  var map = {
    '命宫':'性格与命运格局','兄弟':'兄弟姐妹与同辈关系','夫妻':'婚姻与感情生活',
    '子女':'子女与创造力','财帛':'财富与理财','疾厄':'健康与疾病',
    '迁移':'外出与社交','交友':'朋友与人际关系','官禄':'事业与职业发展',
    '田宅':'房产与家庭环境','福德':'精神生活与福气','父母':'父母与长辈关系'
  };
  return map[name] || '人生';
}

/** 星曜详细信息 */
function getStarInfo(name) {
  var stars = {
    '紫微': { meaning:'帝星，代表尊贵、领导力、权威。紫微坐命者往往天生带有不凡气质，有领导才能，但也可能孤高自许。', inPalace:'紫微在此宫，赋予此宫事务一种"帝王之气"——有主导权和影响力，但也需要承担相应的责任。' },
    '天机': { meaning:'智星，代表智慧、谋略、变动。天机星坐守者头脑灵活、反应敏捷，善于谋划但有时想法太多难以抉择。', inPalace:'天机在此宫，意味着此宫事务需要灵活应变，不宜固守成规。' },
    '太阳': { meaning:'阳星，代表光明、热情、付出。太阳星坐守者性格开朗大方，乐于助人，但有时过于热心而忽略自己。', inPalace:'太阳在此宫，此宫事务会比较公开和光明正大，适合正面发展。' },
    '武曲': { meaning:'财星，代表刚毅、财富、果断。武曲坐命者做事果决有魄力，对金钱嗅觉敏锐。', inPalace:'武曲在此宫，此宫与财富和决策密切相关，适合果断处理财务问题。' },
    '天同': { meaning:'福星，代表温和、享福、知足。天同坐命者性格温和，喜欢享受生活，是知足常乐之人。', inPalace:'天同在此宫，此宫事务较为平顺，不需要太费心力就能有所收获。' },
    '廉贞': { meaning:'囚星，代表执着、才华、极端。廉贞坐命者富有才华但也容易执着偏激，能量强烈。', inPalace:'廉贞在此宫，此宫事务需要把握好度，既发挥才华又避免走极端。' },
    '天府': { meaning:'库星，代表包容、稳定、管理。天府坐命者善于管理和收纳，性格稳重包容。', inPalace:'天府在此宫，此宫事务稳定有序，适合长远规划和管理。' },
    '太阴': { meaning:'阴星，代表温柔、细腻、感情。太阴坐命者情感丰富细腻，有母性光辉。', inPalace:'太阴在此宫，此宫事务需要感性对待，温柔和耐心是最好的策略。' },
    '贪狼': { meaning:'桃花星，代表欲望、交际、才艺。贪狼坐命者社交能力强，多才多艺，但也可能欲望较强。', inPalace:'贪狼在此宫，此宫事务充满活力和吸引力，但也需要注意节制。' },
    '巨门': { meaning:'暗星，代表口才、是非、深度。巨门坐命者口才好、思考深，但也容易招惹口舌。', inPalace:'巨门在此宫，此宫事务需要谨慎沟通，避免误解和是非。' },
    '天相': { meaning:'印星，代表辅助、正直、服务。天相坐命者公正有服务精神，适合做辅助和协调工作。', inPalace:'天相在此宫，此宫事务适合以服务和协调的方式处理。' },
    '天梁': { meaning:'寿星，代表长者、庇荫、稳重。天梁坐命者稳重可靠，有长者之风。', inPalace:'天梁在此宫，此宫事务有贵人庇荫，较为稳妥。' },
    '七杀': { meaning:'将星，代表魄力、竞争、独立。七杀坐命者魄力十足，但人生起伏较大。', inPalace:'七杀在此宫，此宫事务需要独立面对和竞争，适合展现魄力。' },
    '破军': { meaning:'耗星，代表破旧立新、冒险。破军坐命者敢于打破常规，有开创精神。', inPalace:'破军在此宫，此宫事务可能经历大的变动，破旧方能立新。' },
    '文昌': { meaning:'文星，主文学、考试、才华。有这颗星的人学业运好，适合读书考试。'},
    '文曲': { meaning:'艺星，主艺术、口才、交际。有这颗星的人多才多艺，善于表达。'},
    '左辅': { meaning:'贵人星，代表帮助和支持。困难时容易得到他人帮助。'},
    '右弼': { meaning:'贵人星，与左辅配合力量更强。'},
    '天魁': { meaning:'贵星，代表遇到有地位有能力的贵人。'},
    '天钺': { meaning:'贵星，代表贵人提携，科甲运好。'},
    '禄存': { meaning:'财星，代表储蓄运，财富能稳定积累。'},
    '擎羊': { meaning:'刑星，代表竞争和冲突，有锐气但也容易与人起冲突。'},
    '陀罗': { meaning:'忌星，代表事情的拖延和反复。'},
    '火星': { meaning:'煞星，代表突然的变化和爆发性的能量。'},
    '铃星': { meaning:'煞星，代表暗中的麻烦和慢性问题。'}
  };
  return stars[name] || { meaning:'此星曜在紫微斗数中发挥作用，需结合所在宫位和同宫星曜综合判断。' };
}

function getDefaultStarInPalace(starName, palaceName) {
  return starName + '在' + palaceName + '，会影响此宫所主的人生领域。具体影响需结合三方四正和四化综合判断。';
}

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
