/**
 * 六爻占卜服务 (JS 版本)
 */

/** 根据六爻查找六十四卦 */
window.findHexagramByLines = function(lines) {
  if (!lines || lines.length !== 6) return null;
  var hexagrams = window._HEXAGRAMS || [];
  for (var i = 0; i < hexagrams.length; i++) {
    if (arraysEqual(hexagrams[i].lines, lines)) return hexagrams[i];
  }
  return hexagrams.length > 0 ? hexagrams[0] : null;
};

function arraysEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
  return true;
}

/** 根据用户摇出的六爻(tosses数组)生成卦象结果 */
window.buildLiuYaoResult = function(tosses) {
  if (!tosses || tosses.length !== 6) return null;

  // 生成本卦六爻
  var primaryLines = [];
  var changingLines = [];
  for (var i = 0; i < 6; i++) {
    var t = tosses[i];
    var isYang = t.yaoType === '老阳' || t.yaoType === '少阳';
    primaryLines.push(isYang);
    if (t.isChanging) changingLines.push(i);
  }

  var primary = findHexagramByLines(primaryLines);
  if (!primary) return null;

  var transformed = null;
  if (changingLines.length > 0) {
    var tLines = primaryLines.slice();
    for (var j = 0; j < changingLines.length; j++) {
      tLines[changingLines[j]] = !tLines[changingLines[j]];
    }
    transformed = findHexagramByLines(tLines);
  }

  var shiYing = determineShiYing(primary);
  var relations = assignLiuQin(primary);

  return {
    tosses: tosses,
    primaryHexagram: primary,
    transformedHexagram: transformed,
    changingLines: changingLines,
    lineRelations: relations,
    shiYao: shiYing.shi,
    yingYao: shiYing.ying
  };
};

/** 定世应 */
function determineShiYing(hexagram) {
  if (!hexagram) return { shi: 5, ying: 2 };
  if (hexagram.upperTrigram === hexagram.lowerTrigram) return { shi: 5, ying: 2 };
  var hexagrams = window._HEXAGRAMS || [];
  var samePalace = [];
  for (var i = 0; i < hexagrams.length; i++) {
    if (hexagrams[i].palace === hexagram.palace) samePalace.push(hexagrams[i]);
  }
  var idx = -1;
  for (var j = 0; j < samePalace.length; j++) {
    if (samePalace[j].name === hexagram.name) { idx = j; break; }
  }
  if (idx === 0) return { shi: 5, ying: 2 };
  if (idx >= 1 && idx <= 5) return { shi: idx - 1, ying: idx + 2 };
  if (idx === 6) return { shi: 3, ying: 5 };
  return { shi: 2, ying: 5 };
}

/** 配六亲 */
function assignLiuQin(hexagram) {
  if (!hexagram) return ['兄弟','兄弟','兄弟','兄弟','兄弟','兄弟'];
  var myWx = hexagram.wuxing;
  var branches = ['子','丑','寅','卯','辰','巳'];
  var rels = [];
  for (var i = 0; i < 6; i++) {
    var otherWx = DI_ZHI_WUXING[branches[i]] || '土';
    rels.push(getLiuQinRelation(myWx, otherWx));
  }
  return rels;
}

function getLiuQinRelation(my, other) {
  if (my === other) return '兄弟';
  if ((my==='金'&&other==='水')||(my==='水'&&other==='木')||(my==='木'&&other==='火')||(my==='火'&&other==='土')||(my==='土'&&other==='金')) return '子孙';
  if ((my==='金'&&other==='木')||(my==='木'&&other==='土')||(my==='土'&&other==='水')||(my==='水'&&other==='火')||(my==='火'&&other==='金')) return '妻财';
  if ((other==='金'&&my==='木')||(other==='木'&&my==='土')||(other==='土'&&my==='水')||(other==='水'&&my==='火')||(other==='火'&&my==='金')) return '官鬼';
  return '父母';
}
