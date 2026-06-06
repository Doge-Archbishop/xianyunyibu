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
  var strength = count >= 3 ? '偏强' : count === 2 ? '中和' : '偏弱';
  var favWx = strength === '偏弱' ? ({金:'土',水:'金',木:'水',火:'木',土:'火'})[dayWx] : ({金:'火',水:'土',木:'金',火:'水',土:'木'})[dayWx];
  var avWx = strength === '偏强' ? dayWx : ({金:'木',水:'火',木:'土',火:'金',土:'水'})[dayWx];
  var bodyMap = {金:'肺与呼吸系统',木:'肝与神经系统',水:'肾与泌尿系统',火:'心脏与血液循环',土:'脾胃与消化系统'};
  var curDY = null;
  for (var i = 0; i < daYun.length; i++) { if (daYun[i].isCurrent) { curDY = daYun[i]; break; } }

  var ganYY = TIAN_GAN_YINYANG[dayMaster];
  var wxNames = {金:'金',木:'木',水:'水',火:'火',土:'土'};
  var wxTraits = {
    木: {强:'性格刚直，有进取心，像大树一样挺拔向上。有领导才能，做事有魄力，但也有固执己见的倾向。',弱:'性格温和柔顺，像藤蔓一样灵活应变。善解人意但有时缺乏主见，需要他人支持。',中:'刚柔并济，既有原则性又能灵活变通，是比较理想的性格状态。'},
    火: {强:'热情奔放，精力充沛，像太阳一样充满能量。有感染力，善交际，但可能急躁冲动。',弱:'内心敏感，情感丰富但容易波动。想像力好但执行力偏弱，需要外力推动。',中:'温暖而不灼人，热情而有分寸，是人际关系中的润滑剂。'},
    土: {强:'稳重踏实，诚信可靠，像大地一样承载万物。做事有条理，但可能过于保守。',弱:'心思细腻，善解人意但容易患得患失。需要安全感和稳定的环境。',中:'稳重而不失灵活，包容而有原则，是团队中的稳定力量。'},
    金: {强:'果断刚毅，有决断力，像金属一样坚硬锋利。适合竞争环境，但可能显得冷酷。',弱:'内心敏感，追求完美但容易焦虑。有艺术气质，需要他人的肯定。',中:'刚柔适度，既有决断力又能体恤他人，是比较理想的性格。'},
    水: {强:'智慧深沉，思维敏捷，像水流一样灵活变通。学习能力强，但可能心思多变。',弱:'内向沉静，情感细腻但容易消沉。有深刻的洞察力，需要独处的时间。',中:'灵动而不漂浮，深刻而不消沉，是比较好的状态。'}
  };
  var trait = wxTraits[dayWx] || wxTraits['土'];
  var personality = trait[strength === '偏强' ? '强' : strength === '偏弱' ? '弱' : '中'];

  var wxIndustry = {
    金:'金融、法律、机械、汽车、珠宝、军事、工程技术',
    木:'教育、文化、医疗、林业、设计、出版、环保',
    水:'物流、贸易、旅游、传媒、渔业、咨询、航海',
    火:'能源、餐饮、娱乐、互联网、美容、电力、航空',
    土:'房地产、建筑、农业、矿产、陶瓷、仓储、管理'
  };

  // 分析五行分布
  var wxAnalysis = '';
  var totalWx = 0;
  ['金','木','水','火','土'].forEach(function(w) { totalWx += (wxC[w] || 0); });
  var missing = [];
  var tooMany = [];
  ['金','木','水','火','土'].forEach(function(w) {
    var c = wxC[w] || 0;
    var pct = Math.round(c / Math.max(totalWx, 1) * 100);
    if (c === 0) missing.push(w);
    if (pct > 35) tooMany.push(w);
  });
  if (missing.length > 0) wxAnalysis += '你的八字中缺少' + missing.join('、') + '元素，这并不一定是坏事，只是说明在这些五行代表的方面（' + missing.map(function(w){return w+'主'+({金:'决断力',木:'仁爱心',水:'智慧',火:'热情',土:'诚信'})[w];}).join('、') + '）需要后天有意识地培养和补足。';
  if (tooMany.length > 0) wxAnalysis += '八字中' + tooMany.join('、') + '过旺，需要适当平衡，避免这些五行所代表的负面特质过于突出。';
  if (missing.length === 0 && tooMany.length === 0) wxAnalysis += '你的八字五行分布较为均衡，这是一个良好的基础。五行均衡的人往往适应性较强，各方面发展较为协调。';

  var careerAnalysis = '从八字来看，你的日主' + dayMaster + '（' + dayWx + '）' + strength + '。' +
    '适合的行业方向：' + (wxIndustry[favWx] || '综合行业') + '等与' + favWx + '相关的领域。' +
    (strength === '偏强' ? '你天生具有领导潜质，适合在组织中承担管理角色。但要注意听取他人意见，不要独断专行。创业或独立工作也是不错的选择。' :
     strength === '偏弱' ? '你更适合在稳定的大环境中发展，借助团队和平台的力量。不需要做最耀眼的那个，但要成为不可或缺的一环。随着年龄增长和运势变化，能力会越来越强。' :
     '你的适应能力很强，既能在团队中发挥作用，也能独立完成任务。选择面较宽，关键是找到自己真正热爱的方向。');

  var wealthAnalysis = '财运方面，' +
    (strength === '偏强' ? '你的命格能扛得住财，意思是赚钱的能力和守财的能力都比较好。适合主动出击，投资创业皆可考虑。但八字偏强者要警惕贪多嚼不烂，过度扩张反而有风险。' :
     strength === '偏弱' ? '你的财运属于细水长流型。不太适合高风险的投资方式，稳健理财、长期积累更适合你。好消息是，随着大运流转，中晚年的财运往往会越来越好。关键在于量入为出，养成储蓄习惯。' :
     '财运平稳，正财收入是主要来源。你对金钱的态度比较理性，不贪婪也不挥霍，这种稳健的金钱观本身就是一种财富。');

  var loveAnalysis = '感情方面，日主' + dayMaster + '属' + ganYY + '性' + dayWx + '。' +
    (ganYY === '阳' ? '阳性的你，在感情中往往扮演主动和保护者的角色。你像太阳一样温暖对方，但也要注意给对方空间，不要过于强势。寻找一个能欣赏你热情、同时帮你降温的伴侣是最理想的。' :
     '阴性的你，在感情中偏被动和细腻。你像月亮一样温柔包容，善于照顾对方的感受。但也需要表达自己的需求，不要一味忍让。找一个能懂你心思、给你安全感的伴侣最重要。') +
    (strength === '偏强' ? '由于日主偏强，在亲密关系中要学会"示弱"，太过强势反而会让对方感到压力。' :
     strength === '偏弱' ? '日主偏弱的你在感情中需要一个能给你力量和支持的伴侣，但也不要过度依赖。' :
     '你感情的平衡感较好，既不会太黏也不会太冷，是比较理想的伴侣类型。');

  var healthAnalysis = '健康重点关注的方面：' + dayWx + '主' + bodyMap[dayWx] + '，这是你体质中需要特别关注的部分。' +
    (strength === '偏弱' ? '由于日主偏弱，整体体质可能偏虚，建议多接触' + favWx + '性的食物和环境来调理。规律作息、适度运动对你特别重要。' :
     strength === '偏强' ? '日主偏强者精力通常较好，但容易透支。注意劳逸结合，不要因为身体好就忽视休息。' :
     '体质总体平衡，保持现有生活习惯即可。随年龄增长，仍需关注' + bodyMap[dayWx] + '的保养。');

  var currentYunAnalysis = '';
  if (curDY) {
    var yunGan = curDY.ganzhi.gan, yunZhi = curDY.ganzhi.zhi;
    var yunWx = TIAN_GAN_WUXING[yunGan];
    var relationToDay = '';
    if (yunWx === dayWx) relationToDay = '此运与你的日主五行相同，是"比劫运"，十年中竞争与合作并存，适合借助朋友、同事的力量共同发展。';
    else if ((dayWx==='金'&&yunWx==='水')||(dayWx==='水'&&yunWx==='木')||(dayWx==='木'&&yunWx==='火')||(dayWx==='火'&&yunWx==='土')||(dayWx==='土'&&yunWx==='金')) relationToDay = '此运为你所生之五行，是"食伤运"，十年中适合发挥才华、创新求变，是展示个人能力的好时期。';
    else if ((dayWx==='金'&&yunWx==='木')||(dayWx==='木'&&yunWx==='土')||(dayWx==='土'&&yunWx==='水')||(dayWx==='水'&&yunWx==='火')||(dayWx==='火'&&yunWx==='金')) relationToDay = '此运为你所克之五行，是"财运"，十年中财运较好，适合发展事业、积累财富。但也要量力而行。';
    else if ((yunWx==='金'&&dayWx==='木')||(yunWx==='木'&&dayWx==='土')||(yunWx==='土'&&dayWx==='水')||(yunWx==='水'&&dayWx==='火')||(yunWx==='火'&&dayWx==='金')) relationToDay = '此运为克你之五行，是"官杀运"，十年中压力与机遇并存，适合在体制内发展，注意处理好人际关系和职场规则。';
    else relationToDay = '此运为生你之五行，是"印运"，十年中学习运和贵人运较好，适合进修深造、积累知识、获得长辈或上级的支持。';
    currentYunAnalysis = '你目前正行' + curDY.startAge + '岁起的"' + yunGan + yunZhi + '"大运（' + yunWx + '运）。' + relationToDay + '十年一运，把握好这十年的主旋律，顺势而为方能事半功倍。';
  }

  return {
    dayMasterAnalysis: '你的日主（代表你自己）是"' + dayMaster + '"（' + dayWx + '），在八字中的力量属于' + strength + '状态。\n\n性格特点：' + personality + '\n\n日主的强弱不代表好坏，而是一种天生的气质倾向。了解自己的日主特质，可以帮助你更好地发挥优势、规避短板。',
    wuxingBalance: '五行统计：金' + (wxC['金']||0) + '个、木' + (wxC['木']||0) + '个、水' + (wxC['水']||0) + '个、火' + (wxC['火']||0) + '个、土' + (wxC['土']||0) + '个（天干+地支主气共8个）。\n\n' + wxAnalysis + '\n\n喜用神（对你有益的五行）：' + (favWx||'?') + '\n忌神（对你不利的五行）：' + (avWx||'?') + '\n\n💡 生活中可以多接触' + favWx + '属性的事物——穿' + favWx + '色系的衣服、从事与' + favWx + '相关的活动，避开' + avWx + '属性的过强影响。',
    career: careerAnalysis,
    wealth: wealthAnalysis,
    love: loveAnalysis,
    health: healthAnalysis,
    currentYun: currentYunAnalysis
  };
}
