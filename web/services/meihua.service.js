/**
 * 梅花易数服务 (JS 版本)
 */

var BAGUA_NAMES = ['乾','兑','离','震','巽','坎','艮','坤'];

/** 时间起卦 */
function getNumbersFromTime() {
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth() + 1, day = now.getDate(), hour = now.getHours();
  var hourNumber = (hour === 0 || hour === 23) ? 1 : Math.floor((hour + 1) / 2) + 1;
  return [year + month + day, year + month + day + hourNumber, year + month + day + hourNumber];
}

/** 上下卦 → 六爻 */
function buildLinesFromTrigrams(upper, lower) {
  var bagua = window._BAGUA || {};
  return (bagua[lower] ? bagua[lower].lines : []).concat(bagua[upper] ? bagua[upper].lines : []);
}

function getTiYongRelation(tiWx, yongWx) {
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
  return map[rel] || { result:'', desc:'' };
}

/** 梅花易数完整计算 */
window.calculateMeiHua = function(input) {
  var numbers;
  if (input.method === 'time') numbers = getNumbersFromTime();
  else if (input.method === 'manual' && input.numbers) numbers = input.numbers;
  else numbers = [Math.floor(Math.random()*1000)+1, Math.floor(Math.random()*1000)+1, Math.floor(Math.random()*1000)+1];

  var n1 = numbers[0], n2 = numbers[1], n3 = numbers[2];
  var upperIdx = (n1 % 8 === 0) ? 7 : (n1 % 8) - 1;
  var lowerIdx = (n2 % 8 === 0) ? 7 : (n2 % 8) - 1;
  var upperName = BAGUA_NAMES[upperIdx], lowerName = BAGUA_NAMES[lowerIdx];
  var changingLine = n3 % 6 === 0 ? 6 : n3 % 6;

  var primaryLines = buildLinesFromTrigrams(upperName, lowerName);
  var primary = findHexagramByLines(primaryLines);

  var mutualLower = [primaryLines[1], primaryLines[2], primaryLines[3]];
  var mutualUpper = [primaryLines[2], primaryLines[3], primaryLines[4]];
  var mutual = findHexagramByLines(mutualLower.concat(mutualUpper));

  var tLines = primaryLines.slice();
  tLines[changingLine - 1] = !tLines[changingLine - 1];
  var transformed = findHexagramByLines(tLines);

  var movingInUpper = changingLine > 3;
  var tiName = movingInUpper ? lowerName : upperName;
  var yongName = movingInUpper ? upperName : lowerName;

  var bagua = window._BAGUA || {};
  var tiGua = bagua[tiName] || {}, yongGua = bagua[yongName] || {};
  var tiYongRel = getTiYongRelation(tiGua.wuxing, yongGua.wuxing);
  var judgement = getTiYongJudgement(tiYongRel);

  return {
    numbers: numbers,
    upperTrigram: bagua[upperName],
    lowerTrigram: bagua[lowerName],
    primaryHexagram: primary,
    mutualHexagram: mutual,
    transformedHexagram: transformed,
    changingLine: changingLine,
    tiGua: tiName, yongGua: yongName,
    tiYongRelation: tiYongRel,
    tiYongJudgement: judgement
  };
};
