/**
 * 闲云一卜 — 紫微斗数排盘服务
 *
 * 12步排盘算法：
 * 1. 定农历日期 → 2. 定命宫 → 3. 定身宫 → 4. 排十二宫
 * 5. 定十二宫天干 → 6. 定五行局 → 7. 安紫微星
 * 8. 安十四主星 → 9. 安辅星 → 10. 定四化 → 11. 起大限
 */

/** 农历月份对应的数字（寅=1, 卯=2, ..., 丑=12） */
function lunarMonthNum(branch) {
  var map = { '寅':1,'卯':2,'辰':3,'巳':4,'午':5,'未':6,'申':7,'酉':8,'戌':9,'亥':10,'子':11,'丑':12 };
  return map[branch] || 1;
}

/** 时辰对应的地支序号（子=0, 丑=1, ..., 亥=11） */
function hourToBranchIndex(hour) {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

/** 五行局查找表：命宫干支 → 五行局 */
var WUJU_TABLE = {
  '甲子':'金四局','乙丑':'金四局','丙寅':'火六局','丁卯':'火六局','戊辰':'木三局','己巳':'木三局',
  '庚午':'土五局','辛未':'土五局','壬申':'水二局','癸酉':'水二局',
  '甲戌':'火六局','乙亥':'火六局','丙子':'水二局','丁丑':'水二局','戊寅':'土五局','己卯':'土五局',
  '庚辰':'金四局','辛巳':'金四局','壬午':'木三局','癸未':'木三局',
  '甲申':'水二局','乙酉':'水二局','丙戌':'土五局','丁亥':'土五局','戊子':'火六局','己丑':'火六局',
  '庚寅':'木三局','辛卯':'木三局','壬辰':'金四局','癸巳':'金四局',
  '甲午':'金四局','乙未':'金四局','丙申':'火六局','丁酉':'火六局','戊戌':'木三局','己亥':'木三局',
  '庚子':'土五局','辛丑':'土五局','壬寅':'水二局','癸卯':'水二局',
  '甲辰':'火六局','乙巳':'火六局','丙午':'水二局','丁未':'水二局','戊申':'土五局','己酉':'土五局',
  '庚戌':'金四局','辛亥':'金四局','壬子':'木三局','癸丑':'木三局',
  '甲寅':'水二局','乙卯':'水二局','丙辰':'土五局','丁巳':'土五局','戊午':'火六局','己未':'火六局',
  '庚申':'木三局','辛酉':'木三局','壬戌':'金四局','癸亥':'金四局'
};

/** 五行局 → 局数 */
var WUJU_NUMBER = { '水二局':2, '木三局':3, '金四局':4, '土五局':5, '火六局':6 };

/** 紫微星定位表：生日 ÷ 局数 = 商 + 余数，根据商和余数查表 */
function getZiWeiPosition(birthDay, wujuNum) {
  var quotient = Math.floor(birthDay / wujuNum);
  var remainder = birthDay % wujuNum;

  // 余数为0时，商减1，余数=局数
  if (remainder === 0) { quotient -= 1; remainder = wujuNum; }

  // 商的奇偶决定方向
  var pos;
  if (quotient % 2 === 0) {
    // 偶数：从寅起，顺数余数
    pos = (2 + remainder) % 12; // 寅=2，顺时针
  } else {
    // 奇数：从寅起，逆数（余数+局数-1）
    pos = (2 - remainder + 12) % 12;
  }

  return pos;
}

/** 紫微系主星位置（相对紫微星的偏移） */
var ZIWEI_SERIES = [
  { name:'紫微', offset:0 }, { name:'天机', offset:-1 }, { name:'', offset:0 },
  { name:'太阳', offset:-3 }, { name:'武曲', offset:-4 }, { name:'天同', offset:-5 },
  { name:'', offset:0 }, { name:'廉贞', offset:-8 }
];

/** 天府系主星位置（天府 = 紫微的对称位置，即 (4 - 紫微位置 + 12) % 12） */
var TIANFU_SERIES = [
  { name:'天府', offset:0 }, { name:'太阴', offset:1 }, { name:'贪狼', offset:2 },
  { name:'巨门', offset:3 }, { name:'天相', offset:4 }, { name:'天梁', offset:5 },
  { name:'七杀', offset:6 }, { name:'破军', offset:10 }
];

/** 四化表：年干 → 四化星 */
var SIHUA_TABLE = {
  '甲': { 化禄:'廉贞', 化权:'破军', 化科:'武曲', 化忌:'太阳' },
  '乙': { 化禄:'天机', 化权:'天梁', 化科:'紫微', 化忌:'太阴' },
  '丙': { 化禄:'天同', 化权:'天机', 化科:'文昌', 化忌:'廉贞' },
  '丁': { 化禄:'太阴', 化权:'天同', 化科:'天机', 化忌:'巨门' },
  '戊': { 化禄:'贪狼', 化权:'太阴', 化科:'右弼', 化忌:'天机' },
  '己': { 化禄:'武曲', 化权:'贪狼', 化科:'天梁', 化忌:'文曲' },
  '庚': { 化禄:'太阳', 化权:'武曲', 化科:'太阴', 化忌:'天同' },
  '辛': { 化禄:'巨门', 化权:'太阳', 化科:'文曲', 化忌:'文昌' },
  '壬': { 化禄:'天梁', 化权:'紫微', 化科:'左辅', 化忌:'武曲' },
  '癸': { 化禄:'破军', 化权:'巨门', 化科:'太阴', 化忌:'贪狼' }
};

/** 十二宫名称（从命宫起逆时针排列） */
var PALACE_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];

/** 辅星安放规则 */
function placeAssistantStars(lunarMonth, hourBranchIdx, yearZhi, yearGan) {
  // 返回 12 个宫位的辅星数组
  var result = [];
  for (var i = 0; i < 12; i++) { result.push([]); }

  // 左辅：辰上起正月，顺数到生月
  var zuofuPos = (4 + lunarMonth - 1) % 12; // 辰=4
  result[zuofuPos].push('左辅');

  // 右弼：戌上起正月，逆数到生月
  var youbiPos = (10 - lunarMonth + 1 + 12) % 12; // 戌=10
  result[youbiPos].push('右弼');

  // 文昌：戌上起子时，逆数到生时
  var wenchangPos = (10 - hourBranchIdx + 12) % 12;
  result[wenchangPos].push('文昌');

  // 文曲：辰上起子时，顺数到生时
  var wenquPos = (4 + hourBranchIdx) % 12;
  result[wenquPos].push('文曲');

  // 天魁：年干
  var tiankuiMap = { '甲':'丑','戊':'丑','庚':'丑','乙':'子','己':'子','辛':'午','丙':'亥','丁':'酉','壬':'卯','癸':'巳' };
  var tkBranch = tiankuiMap[yearGan];
  if (tkBranch) result[DI_ZHI.indexOf(tkBranch)].push('天魁');

  // 天钺：年干
  var tianyueMap = { '甲':'未','戊':'未','庚':'未','乙':'申','己':'申','辛':'寅','丙':'酉','丁':'亥','壬':'巳','癸':'卯' };
  var tyBranch = tianyueMap[yearGan];
  if (tyBranch) result[DI_ZHI.indexOf(tyBranch)].push('天钺');

  // 禄存：年干
  var lucunMap = { '甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子' };
  var lcBranch = lucunMap[yearGan];
  if (lcBranch) result[DI_ZHI.indexOf(lcBranch)].push('禄存');

  // 擎羊（禄存前一位）和陀罗（禄存后一位）
  if (lcBranch) {
    var lcIdx = DI_ZHI.indexOf(lcBranch);
    result[(lcIdx + 1) % 12].push('擎羊');
    result[(lcIdx - 1 + 12) % 12].push('陀罗');
  }

  return result;
}

/**
 * 完整紫微斗数排盘
 */
window.calculateZWDS = function(input) {
  var solarDate = input.solarDate;
  var hour = input.hour || 12;
  var minute = input.minute || 0;
  var gender = input.gender || '男';

  // 1. 获取年月日时干支
  var yearGZ = getYearGanZhi(solarDate);
  var monthGZ = getMonthGanZhi(solarDate, yearGZ.gan);
  var dayGZ = getDayGanZhi(solarDate);

  // 时辰
  var hourBranchIdx = hourToBranchIndex(hour);
  var hourBranch = DI_ZHI[hourBranchIdx];
  var hourGan = wuShuDun(dayGZ.gan, hourBranch);

  // 农历月份（用月支推算）
  var lunarMonth = lunarMonthNum(monthGZ.zhi);
  var lunarDay = parseInt(solarDate.split('-')[2]) + 1; // 近似（精确需要农历转换）

  // 2. 定命宫：寅上起正月，顺数到生月，逆数到生时
  var mingGongIdx = (2 + lunarMonth - 1) % 12; // 寅=2，顺数到生月
  mingGongIdx = (mingGongIdx - hourBranchIdx + 12) % 12; // 逆数到生时

  // 3. 定身宫：寅上起正月，顺数到生月，顺数到生时
  var shenGongIdx = (2 + lunarMonth - 1) % 12;
  shenGongIdx = (shenGongIdx + hourBranchIdx) % 12;

  // 4. 排十二宫：从命宫起逆时针排列
  var palaces = [];
  for (var i = 0; i < 12; i++) {
    var idx = (mingGongIdx - i + 12) % 12;
    palaces.push({
      name: PALACE_NAMES[i],
      branch: DI_ZHI[idx],
      branchIdx: idx,
      stem: '',        // 第5步填充
      mainStars: [],   // 第8步填充
      assistantStars: [], // 第9步填充
      sihua: null,     // 第10步填充
      wuju: ''         // 第6步填充
    });
  }

  // 5. 定十二宫天干：生年年干，五虎遁
  for (var j = 0; j < 12; j++) {
    palaces[j].stem = wuHuDun(yearGZ.gan, palaces[j].branch);
  }

  // 6. 定五行局：命宫干支查表
  var mingGong = palaces[0];
  var wujuKey = mingGong.stem + mingGong.branch;
  var wujuName = WUJU_TABLE[wujuKey] || '木三局';
  var wujuNum = WUJU_NUMBER[wujuName] || 3;
  mingGong.wuju = wujuName;

  // 7. 安紫微星
  var ziweiIdx = getZiWeiPosition(lunarDay, wujuNum);
  var ziweiPalaceIdx = -1;
  for (var k = 0; k < 12; k++) { if (palaces[k].branchIdx === ziweiIdx) { ziweiPalaceIdx = k; break; } }

  // 8. 安十四主星
  if (ziweiPalaceIdx >= 0) {
    // 紫微系
    for (var z = 0; z < ZIWEI_SERIES.length; z++) {
      if (!ZIWEI_SERIES[z].name) continue;
      var pIdx = (ziweiPalaceIdx + ZIWEI_SERIES[z].offset + 12) % 12;
      palaces[pIdx].mainStars.push(ZIWEI_SERIES[z].name);
    }
    // 天府系（天府 = 紫微的对称宫位）
    var tianfuPalaceIdx = (ziweiPalaceIdx + 4) % 12; // 寅→申对称
    // 简化：天府位置 = (4 - ziweiIdx + 12) % 12 的宫位
    var tfBranchIdx = (4 - ziweiIdx + 12) % 12;
    var tfPalaceIdx = -1;
    for (var t = 0; t < 12; t++) { if (palaces[t].branchIdx === tfBranchIdx) { tfPalaceIdx = t; break; } }
    if (tfPalaceIdx >= 0) {
      for (var f = 0; f < TIANFU_SERIES.length; f++) {
        var pIdx2 = (tfPalaceIdx + TIANFU_SERIES[f].offset) % 12;
        palaces[pIdx2].mainStars.push(TIANFU_SERIES[f].name);
      }
    }
  }

  // 9. 安辅星
  var astStars = placeAssistantStars(lunarMonth, hourBranchIdx, yearGZ.zhi, yearGZ.gan);
  for (var a = 0; a < 12; a++) {
    palaces[a].assistantStars = astStars[a] || [];
  }

  // 10. 定四化
  var sihua = SIHUA_TABLE[yearGZ.gan] || {};
  for (var s = 0; s < 12; s++) {
    for (var starName in sihua) {
      if (palaces[s].mainStars.indexOf(sihua[starName]) >= 0) {
        palaces[s].sihua = starName;
      }
      if (palaces[s].assistantStars.indexOf(sihua[starName]) >= 0) {
        palaces[s].sihua = palaces[s].sihua || starName;
      }
    }
  }

  // 11. 起大限
  var isYangYear = TIAN_GAN_YINYANG[yearGZ.gan] === '阳';
  var isShunXing = (isYangYear && gender === '男') || (!isYangYear && gender === '女');
  for (var d = 0; d < 12; d++) {
    var ageStart;
    if (isShunXing) {
      ageStart = d * 10 + 1;
    } else {
      ageStart = (11 - d) * 10 + 1;
    }
    palaces[d].daXianStart = ageStart;
    palaces[d].daXianEnd = ageStart + 9;
  }

  return {
    input: input,
    yearGZ: yearGZ,
    monthGZ: monthGZ,
    dayGZ: dayGZ,
    hourGZ: { gan: hourGan, zhi: hourBranch },
    mingGongIdx: mingGongIdx,
    shenGongIdx: shenGongIdx,
    mingGong: mingGong,
    palaces: palaces,
    sihua: sihua,
    wujuName: wujuName,
    isShunXing: isShunXing
  };
};
