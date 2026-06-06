/**
 * 梅花易数服务 (JS 版本)
 */

var BAGUA_NAMES = ['乾','兑','离','震','巽','坎','艮','坤'];

/** 获取八卦数据（防御性） */
function getBaguabyName(name) {
  var bagua = window._BAGUA || {};
  return bagua[name] || { name:name, symbol:'?', wuxing:'土', lines:[false,false,false] };
}

/** 时间起卦 */
function getNumbersFromTime() {
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth() + 1, day = now.getDate(), hour = now.getHours();
  var hourNum = (hour === 0 || hour === 23) ? 1 : Math.floor((hour + 1) / 2) + 1;
  return [year + month + day, year + month + day + hourNum, year + month + day + hourNum];
}

/** 上下卦合成六爻 */
function buildLinesFromTrigrams(upperName, lowerName) {
  var upper = getBaguabyName(upperName);
  var lower = getBaguabyName(lowerName);
  return lower.lines.concat(upper.lines);
}

function getTiYongRelation(tiWx, yongWx) {
  if (!tiWx || !yongWx) return '体用比和';
  if (tiWx === yongWx) return '体用比和';
  if ((tiWx==='金'&&yongWx==='木')||(tiWx==='木'&&yongWx==='土')||(tiWx==='土'&&yongWx==='水')||(tiWx==='水'&&yongWx==='火')||(tiWx==='火'&&yongWx==='金')) return '体克用';
  if ((yongWx==='金'&&tiWx==='木')||(yongWx==='木'&&tiWx==='土')||(yongWx==='土'&&tiWx==='水')||(yongWx==='水'&&tiWx==='火')||(yongWx==='火'&&tiWx==='金')) return '用克体';
  if ((tiWx==='金'&&yongWx==='水')||(tiWx==='水'&&yongWx==='木')||(tiWx==='木'&&yongWx==='火')||(tiWx==='火'&&yongWx==='土')||(tiWx==='土'&&yongWx==='金')) return '体生用';
  return '用生体';
}

function getTiYongJudgement(rel) {
  var map = {
    '体克用': { result:'吉', desc:'你（体）克制事情（用），你能掌控局势，但需要付出努力。' },
    '用克体': { result:'凶', desc:'事情（用）克制了你（体），局势对你不利，需谨慎应对。' },
    '体生用': { result:'泄', desc:'你在消耗自己来推动事情，付出多回报少。' },
    '用生体': { result:'吉', desc:'事情在滋养你，环境对你有利，容易得到助力。' },
    '体用比和': { result:'大吉', desc:'你与事情和谐一致，诸事顺利，这是最理想的状态。' }
  };
  return map[rel] || { result:'中', desc:'体用关系模糊，需结合卦象具体分析。' };
}

/** 梅花易数完整计算 */
window.calculateMeiHua = function(input) {
  // 1. 取数
  var numbers;
  if (input.method === 'time') {
    numbers = getNumbersFromTime();
  } else if (input.method === 'manual' && input.numbers && input.numbers.length === 3) {
    numbers = input.numbers;
  } else {
    numbers = [Math.floor(Math.random()*999)+1, Math.floor(Math.random()*999)+1, Math.floor(Math.random()*999)+1];
  }

  var n1 = numbers[0], n2 = numbers[1], n3 = numbers[2];

  // 2. 定八卦（1-8，余数0=8=坤）
  var upperIdx = (n1 % 8 === 0) ? 7 : (n1 % 8) - 1;
  var lowerIdx = (n2 % 8 === 0) ? 7 : (n2 % 8) - 1;
  var upperName = BAGUA_NAMES[upperIdx];
  var lowerName = BAGUA_NAMES[lowerIdx];

  // 3. 定动爻（1-6，余数0=6=上爻）
  var changingLine = n3 % 6 === 0 ? 6 : n3 % 6;

  // 4. 生成本卦
  var primaryLines = buildLinesFromTrigrams(upperName, lowerName);
  var primary = findHexagramByLines(primaryLines);
  if (!primary) {
    // 防御：如果找不到卦象，返回错误
    showToast('起卦失败，请刷新页面重试');
    return null;
  }

  // 5. 生成互卦
  var mutualLower = [primaryLines[1], primaryLines[2], primaryLines[3]];
  var mutualUpper = [primaryLines[2], primaryLines[3], primaryLines[4]];
  var mutual = findHexagramByLines(mutualLower.concat(mutualUpper)) || primary;

  // 6. 生成变卦
  var tLines = primaryLines.slice();
  tLines[changingLine - 1] = !tLines[changingLine - 1];
  var transformed = findHexagramByLines(tLines) || primary;

  // 7. 体用分析
  var movingInUpper = changingLine > 3;
  var tiName = movingInUpper ? lowerName : upperName;
  var yongName = movingInUpper ? upperName : lowerName;

  var tiGua = getBaguabyName(tiName);
  var yongGua = getBaguabyName(yongName);
  var tiYongRel = getTiYongRelation(tiGua.wuxing, yongGua.wuxing);
  var judgement = getTiYongJudgement(tiYongRel);

  return {
    numbers: numbers,
    upperTrigram: getBaguabyName(upperName),
    lowerTrigram: getBaguabyName(lowerName),
    primaryHexagram: primary,
    mutualHexagram: mutual,
    transformedHexagram: transformed,
    changingLine: changingLine,
    tiGua: tiName, yongGua: yongName,
    tiYongRelation: tiYongRel,
    tiYongJudgement: judgement
  };
};
