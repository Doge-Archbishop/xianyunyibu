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

/** 生成卦象深度解读 */
window.generateHexagramReading = function(hexagram, changingLines, transformed) {
  var wx = hexagram.wuxing || '金';
  var trigrams = (hexagram.upperTrigram || '') + '上' + (hexagram.lowerTrigram || '') + '下';

  // 卦象总体分析
  var summary = '本卦"' + hexagram.name + '"（' + trigrams + '），属' + hexagram.palace + '宫，五行' + wx + '。\n\n';
  summary += '📖 卦辞原文：' + (hexagram.judgement || '') + '\n\n';
  summary += '💬 白话解读：' + (hexagram.plainSummary || '') + '\n\n';

  // 分维度分析
  var wxTraits = {
    '金': {nature:'刚健果断', goodAt:'决断力强，适合竞争性强的领域', watch:'避免过于冷酷决绝，适当展示柔性一面'},
    '木': {nature:'积极向上', goodAt:'成长性强，适合需要持续发展的领域', watch:'避免急躁冲动，耐心等待开花结果'},
    '水': {nature:'智慧变通', goodAt:'思维灵活，适合需要沟通和变通的领域', watch:'避免心思太过动荡，选定方向就要坚持'},
    '火': {nature:'热情主动', goodAt:'感染力强，适合需要表现力和创造力的领域', watch:'避免热情来得快去得也快，保持恒心'},
    '土': {nature:'稳重包容', goodAt:'稳定性好，适合需要耐心和持续投入的领域', watch:'避免过于保守错失良机，适当冒险是必要的'}
  };
  var trait = wxTraits[wx] || wxTraits['土'];

  var careerAdvice = '💼 事业运势：' + trait.goodAt + '。' + trait.nature + '的卦性暗示在事业中应当' +
    (hexagram.index <= 16 ? '积极进取，把握当下的好势头。' :
     hexagram.index <= 32 ? '稳扎稳打，注重长期积累而非短期成果。' :
     hexagram.index <= 48 ? '灵活应变，在变化中寻找新的机会。' : '审时度势，在合适的时机做出关键决策。') +
    '需要注意：' + trait.watch + '。';

  var wealthAdvice = '💰 财运分析：此卦五行属' + wx + '，' +
    (wx === '金' || wx === '水' ? '财气流通较好，适合做流动性强的投资。但要注意节奏，不要贪快。' :
     wx === '木' || wx === '火' ? '财运有成长性，适合长期投资和积累。短期内可能看不到明显收益，但方向正确。' :
     '财运较为稳健，适合储蓄和保守型理财。不求暴富，但求稳步增长。') +
    (changingLines.length > 0 ? '变爻的存在提示财务上可能有变动，提前做好规划。' : '静卦无变爻，当前财务状况较为稳定。');

  var loveAdvice = '❤️ 感情运：' +
    (hexagram.index % 2 === 0 ? '此卦阴阳调和，感情运势较为和谐。适合表达真心、巩固关系。' :
     '此卦阴阳之间有一定张力，感情中可能会有小摩擦，但这也是增进了解的机会。') +
    (changingLines.length > 0 ? '变爻提示感情关系可能正在经历一个转变期，需要双方共同面对。' : '');

  var healthAdvice = '🏥 健康提示：' + wx + '主' + ({金:'肺与呼吸系统',木:'肝与神经系统',水:'肾与泌尿系统',火:'心脏与血液循环',土:'脾胃与消化系统'})[wx] +
    '，建议在相关方面多加注意。保持' + (wx === '火' || wx === '木' ? '心态平和，避免过度兴奋或焦虑。' : wx === '水' || wx === '金' ? '规律作息，避免寒凉侵袭。' : '饮食有节，避免暴饮暴食。');

  // 变卦解读
  var changeAnalysis = '';
  if (transformed && changingLines.length > 0) {
    changeAnalysis = '\n\n🌊 变化趋势：本卦变"' + transformed.name + '"（' + transformed.palace + '宫·' + transformed.wuxing + '）。' +
      '共有' + changingLines.length + '个爻发生变化，说明事情正在从' + hexagram.name + '的状态向' + transformed.name + '的状态转变。' +
      (changingLines.length === 1 ? '单爻变动，变化的方向比较明确。' :
       changingLines.length === 2 ? '两爻变动，变化中有反复，需要耐心等待局势明朗。' :
       '多爻变动，局势变化较大，要以开放的心态迎接新阶段。') +
      '\n变卦解读：' + (transformed.plainSummary || '');
  } else if (changingLines.length === 0) {
    changeAnalysis = '\n\n🔒 静卦：本卦无变爻，说明当前问的事情处于一个相对稳定的状态，短期内不会有大的变化。这是一个"守成"的时期，适合巩固现有成果而非开拓新方向。';
  }

  // 综合建议
  var advice = '';
  var idx = hexagram.index;
  if (idx <= 11) advice = '总体运势较强，宜主动出击、把握时机。但也要居安思危，避免得意忘形。';
  else if (idx <= 22) advice = '运势中等偏上，顺势而为即可。不必急于求成，稳扎稳打是上策。';
  else if (idx <= 33) advice = '运势有起伏，需要灵活应对。遇到困难时不妨换个角度看问题，柳暗花明又一村。';
  else if (idx <= 44) advice = '运势偏弱，宜守不宜攻。这段时间适合韬光养晦、积蓄力量，等待下一个上升周期。';
  else if (idx <= 55) advice = '运势向好，可以开始慢慢行动。从小事做起，逐步推进，不要急于求成。';
  else advice = '变化之中蕴含机遇，保持开放的心态。结束也是新的开始，勇于面对变化。';

  return {
    summary: summary,
    career: careerAdvice,
    wealth: wealthAdvice,
    love: loveAdvice,
    health: healthAdvice,
    change: changeAnalysis,
    advice: '💡 综合建议：' + advice
  };
};
