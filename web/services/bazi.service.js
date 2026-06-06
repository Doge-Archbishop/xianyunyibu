/**
 * 八字（四柱）命理服务 (JS 版本)
 */

/** 完整八字排盘 */
window.calculateBaZi = function(input) {
  var solarDate = input.solarDate, hourBranch = input.hourBranch, gender = input.gender;
  var yearGZ = getYearGanZhi(solarDate);
  var monthGZ = getMonthGanZhi(solarDate, yearGZ.gan);
  var dayGZ = getDayGanZhi(solarDate);
  var branchIdx = DI_ZHI.indexOf(hourBranch);
  var hour = branchIdx === 0 ? 0 : branchIdx * 2 + 1;
  var hourGZ = getHourGanZhi(hour, dayGZ.gan);

  var pillars = { year: yearGZ, month: monthGZ, day: dayGZ, hour: hourGZ };
  var dayMaster = dayGZ.gan;
  var dayWx = TIAN_GAN_WUXING[dayMaster];
  var nayin = getNayin(pillars);
  var hiddenStems = getCangGan(pillars);
  var shiShen = getShiShen(pillars, dayMaster);
  var wuxingCount = countWuxing(pillars);
  var daYun = calculateDaYun(solarDate, yearGZ, gender);

  return {
    input: input, pillars: pillars, dayMaster: dayMaster, dayMasterWuxing: dayWx,
    nayin: nayin, hiddenStems: hiddenStems, shiShen: shiShen,
    wuxingCount: wuxingCount, daYun: daYun,
    interpretation: interpretBaZi(pillars, dayMaster, dayWx, wuxingCount, daYun)
  };
};

function getNayin(pillars) {
  var all = [pillars.year, pillars.month, pillars.day, pillars.hour];
  return all.map(function(gz) {
    for (var i = 0; i < LIUSHI_JIAZI.length; i++) {
      if (LIUSHI_JIAZI[i].gan === gz.gan && LIUSHI_JIAZI[i].zhi === gz.zhi) return NAYIN_WUXING[i + 1] || '未知';
    }
    return '未知';
  });
}

function getCangGan(pillars) {
  return [
    ZANG_GAN[pillars.year.zhi] || [],
    ZANG_GAN[pillars.month.zhi] || [],
    ZANG_GAN[pillars.day.zhi] || [],
    ZANG_GAN[pillars.hour.zhi] || []
  ];
}

function isSheng(a, b) {
  return (a==='金'&&b==='水')||(a==='水'&&b==='木')||(a==='木'&&b==='火')||(a==='火'&&b==='土')||(a==='土'&&b==='金');
}
function isKe(a, b) {
  return (a==='金'&&b==='木')||(a==='木'&&b==='土')||(a==='土'&&b==='水')||(a==='水'&&b==='火')||(a==='火'&&b==='金');
}

function getShiShen(pillars, dayMaster) {
  var dayWx = TIAN_GAN_WUXING[dayMaster], dayYY = TIAN_GAN_YINYANG[dayMaster];
  return [pillars.year, pillars.month, pillars.day, pillars.hour].map(function(gz) {
    var oWx = TIAN_GAN_WUXING[gz.gan], oYY = TIAN_GAN_YINYANG[gz.gan];
    if (dayWx === oWx) return [dayYY === oYY ? '比肩' : '劫财'];
    if (isSheng(dayWx, oWx)) return [dayYY === oYY ? '食神' : '伤官'];
    if (isKe(dayWx, oWx)) return [dayYY === oYY ? '偏财' : '正财'];
    if (isKe(oWx, dayWx)) return [dayYY === oYY ? '七杀' : '正官'];
    return [dayYY === oYY ? '偏印' : '正印'];
  });
}

function countWuxing(pillars) {
  var counts = { '金':0,'木':0,'水':0,'火':0,'土':0 };
  var all = [pillars.year, pillars.month, pillars.day, pillars.hour];
  all.forEach(function(gz) {
    counts[TIAN_GAN_WUXING[gz.gan]]++;
    var mainQi = (ZANG_GAN[gz.zhi] || [])[0];
    if (mainQi) counts[TIAN_GAN_WUXING[mainQi]]++;
  });
  return counts;
}

function calculateDaYun(solarDate, yearGZ, gender) {
  var date = new Date(solarDate), year = date.getFullYear();
  var isYangYear = TIAN_GAN_YINYANG[yearGZ.gan] === '阳';
  var isShunPai = (isYangYear && gender === '男') || (!isYangYear && gender === '女');
  var jqNames = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
  var targetDate = null;

  if (isShunPai) {
    for (var i = 0; i < jqNames.length; i++) {
      var jqD = new Date(getJieqiDate(year, jqNames[i]));
      if (jqD >= date) { targetDate = jqD; break; }
    }
    if (!targetDate) targetDate = new Date(getJieqiDate(year + 1, '立春'));
  } else {
    for (var j = jqNames.length - 1; j >= 0; j--) {
      var jqD2 = new Date(getJieqiDate(year, jqNames[j]));
      if (jqD2 < date) { targetDate = jqD2; break; }
    }
    if (!targetDate) targetDate = new Date(getJieqiDate(year - 1, '小寒'));
  }

  var diffDays = Math.abs(date.getTime() - targetDate.getTime()) / 86400000;
  var startAge = Math.max(1, Math.floor(diffDays / 3));
  var monthGZ = getMonthGanZhi(solarDate, yearGZ.gan);
  var mGi = TIAN_GAN.indexOf(monthGZ.gan), mZi = DI_ZHI.indexOf(monthGZ.zhi);
  var daYun = [], currentAge = new Date().getFullYear() - year;

  for (var k = 0; k < 10; k++) {
    var step = isShunPai ? k + 1 : -(k + 1);
    var age = startAge + k * 10;
    daYun.push({
      startAge: age,
      ganzhi: { gan: TIAN_GAN[((mGi + step) % 10 + 10) % 10], zhi: DI_ZHI[((mZi + step) % 12 + 12) % 12] },
      isCurrent: currentAge >= age && currentAge < age + 10
    });
  }
  return daYun;
}

function interpretBaZi(pillars, dayMaster, dayWx, wxC, daYun) {
  var count = wxC[dayWx] || 0;
  var strength = count >= 3 ? '强' : count === 2 ? '中等' : '弱';
  var favWx = strength === '弱' ? {金:'土',水:'金',木:'水',火:'木',土:'火'}[dayWx] : {金:'火',水:'土',木:'金',火:'水',土:'木'}[dayWx];
  var avWx = strength === '强' ? dayWx : {金:'木',水:'火',木:'土',火:'金',土:'水'}[dayWx];
  var bodyMap = {金:'肺和呼吸系统',木:'肝和神经系统',水:'肾和泌尿系统',火:'心脏和血液循环',土:'脾胃和消化系统'};
  var curDY = null;
  for (var i = 0; i < daYun.length; i++) { if (daYun[i].isCurrent) { curDY = daYun[i]; break; } }

  return {
    dayMasterAnalysis: '你的日主为"' + dayMaster + '"（' + dayWx + '），力量' + strength + '。' + (strength==='强'?'个性较强，独立自主。':strength==='中等'?'个性温和，适应力好。':'可能比较内向，需要借助他人力量。'),
    wuxingBalance: '五行分布：金'+(wxC['金']||0)+'、木'+(wxC['木']||0)+'、水'+(wxC['水']||0)+'、火'+(wxC['火']||0)+'、土'+(wxC['土']||0)+'。喜'+(favWx||'?')+'，忌'+(avWx||'?')+'。',
    career: '事业上，'+(strength==='强'?'适合管理和决断类职业。':'适合协作沟通类工作。')+'多接触'+favWx+'相关行业。',
    wealth: '财运上，'+(strength==='强'?'能扛财，适合主动投资。':'宜稳健理财。'),
    love: '感情上，日主' + dayMaster + TIAN_GAN_YINYANG[dayMaster] + '性，' + (strength==='强'?'在感情中较主动。':'可能较被动。'),
    health: '健康上，' + dayWx + '主' + bodyMap[dayWx] + '，需注意相关保养。' + (strength==='弱'?('多补'+favWx+'增强体质。'):'保持平衡即可。'),
    currentYun: curDY ? ('你正行' + curDY.startAge + '岁起的"' + curDY.ganzhi.gan + curDY.ganzhi.zhi + '"大运。十年一大运，把握好当下的运势节奏。') : ''
  };
}
