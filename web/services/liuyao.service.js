/**
 * 六爻占卜服务 (JS 版本)
 */

/** 模拟抛 3 枚硬币 */
function tossCoins() {
  var coins = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5];
  var zhengCount = coins.filter(function(c) { return c; }).length;
  var yaoType, isChanging;
  switch (zhengCount) {
    case 3: yaoType = '老阳'; isChanging = true; break;
    case 2: yaoType = '少阳'; isChanging = false; break;
    case 1: yaoType = '少阴'; isChanging = false; break;
    case 0: yaoType = '老阴'; isChanging = true; break;
    default: yaoType = '少阳'; isChanging = false;
  }
  return { round: 0, yaoType: yaoType, isChanging: isChanging };
}

/** 完整摇卦 6 次 */
window.performFullToss = function() {
  var results = [];
  for (var i = 0; i < 6; i++) {
    var r = tossCoins();
    r.round = i + 1;
    results.push(r);
  }
  return results;
};

/** 根据六爻查找六十四卦 */
window.findHexagramByLines = function(lines) {
  var hexagrams = window._HEXAGRAMS || [];
  for (var i = 0; i < hexagrams.length; i++) {
    if (arraysEqual(hexagrams[i].lines, lines)) return hexagrams[i];
  }
  return hexagrams[0];
};

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
  return true;
}

/** 生成本卦和变卦 */
window.buildHexagrams = function(tosses) {
  var primaryLines = tosses.map(function(t) { return t.yaoType === '老阳' || t.yaoType === '少阳'; });
  var changingLines = [];
  tosses.forEach(function(t, i) { if (t.isChanging) changingLines.push(i); });

  var primary = findHexagramByLines(primaryLines);
  var transformed = null;
  if (changingLines.length > 0) {
    var tLines = primaryLines.slice();
    changingLines.forEach(function(i) { tLines[i] = !tLines[i]; });
    transformed = findHexagramByLines(tLines);
  }
  return { primary: primary, transformed: transformed, changingLines: changingLines };
};

/** 定世应（简化版） */
window.determineShiYing = function(hexagram) {
  if (hexagram.upperTrigram === hexagram.lowerTrigram) return { shi: 5, ying: 2 };
  var hexagrams = window._HEXAGRAMS || [];
  var palaceHexagrams = hexagrams.filter(function(h) { return h.palace === hexagram.palace; });
  var idx = -1;
  for (var i = 0; i < palaceHexagrams.length; i++) { if (palaceHexagrams[i].name === hexagram.name) { idx = i; break; } }
  if (idx === 0) return { shi: 5, ying: 2 };
  if (idx <= 5) return { shi: idx - 1, ying: idx + 2 };
  return idx === 6 ? { shi: 3, ying: 5 } : { shi: 2, ying: 5 };
};

/** 配六亲 */
window.assignLiuQin = function(hexagram) {
  var myWuxing = hexagram.wuxing;
  var lineBranches = ['子','丑','寅','卯','辰','巳'];
  var lineWuxing = lineBranches.map(function(b) { return DI_ZHI_WUXING[b]; });
  return lineWuxing.map(function(lw) { return getLiuQinRelation(myWuxing, lw); });
};

function getLiuQinRelation(my, other) {
  if (my === other) return '兄弟';
  if ((my==='金'&&other==='水')||(my==='水'&&other==='木')||(my==='木'&&other==='火')||(my==='火'&&other==='土')||(my==='土'&&other==='金')) return '子孙';
  if ((my==='金'&&other==='木')||(my==='木'&&other==='土')||(my==='土'&&other==='水')||(my==='水'&&other==='火')||(my==='火'&&other==='金')) return '妻财';
  if ((other==='金'&&my==='木')||(other==='木'&&my==='土')||(other==='土'&&my==='水')||(other==='水'&&my==='火')||(other==='火'&&my==='金')) return '官鬼';
  return '父母';
}

/** 执行完整六爻占卜 */
window.performLiuYao = function() {
  var tosses = performFullToss();
  var built = buildHexagrams(tosses);
  var shiYing = determineShiYing(built.primary);
  var relations = assignLiuQin(built.primary);
  return {
    tosses: tosses,
    primaryHexagram: built.primary,
    transformedHexagram: built.transformed,
    changingLines: built.changingLines,
    lineRelations: relations,
    shiYao: shiYing.shi,
    yingYao: shiYing.ying
  };
};
