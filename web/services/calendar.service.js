/**
 * 日历服务 — 公历↔农历转换 + 节气查询 (JS 版本)
 */

var BASE_DATE = new Date(1900, 0, 1); // 1900-01-01 = 甲子日

/** 公历日期 → 日柱干支 */
window.getDayGanZhi = function(solarDate) {
  var target = new Date(solarDate);
  var diffDays = Math.floor((target.getTime() - BASE_DATE.getTime()) / 86400000);
  var jiaziIndex = ((diffDays % 60) + 60) % 60;
  return {
    gan: TIAN_GAN[jiaziIndex % 10],
    zhi: DI_ZHI[jiaziIndex % 12]
  };
};

/** 获取年柱（立春为界） */
window.getYearGanZhi = function(solarDate) {
  var date = new Date(solarDate);
  var year = date.getFullYear();
  var lichun = getJieqiDate(year, '立春');
  var targetYear = date < new Date(lichun) ? year - 1 : year;
  var baseYear = 1864;
  var diff = targetYear - baseYear;
  var jiaziIndex = ((diff % 60) + 60) % 60;
  return {
    gan: TIAN_GAN[jiaziIndex % 10],
    zhi: DI_ZHI[jiaziIndex % 12]
  };
};

/** 获取月柱（节气为界） */
window.getMonthGanZhi = function(solarDate, yearGan) {
  var date = new Date(solarDate);
  var year = date.getFullYear();

  var monthJieQi = [
    {branch:'寅',jieqi:'立春'},{branch:'卯',jieqi:'惊蛰'},{branch:'辰',jieqi:'清明'},
    {branch:'巳',jieqi:'立夏'},{branch:'午',jieqi:'芒种'},{branch:'未',jieqi:'小暑'},
    {branch:'申',jieqi:'立秋'},{branch:'酉',jieqi:'白露'},{branch:'戌',jieqi:'寒露'},
    {branch:'亥',jieqi:'立冬'},{branch:'子',jieqi:'大雪'},{branch:'丑',jieqi:'小寒'}
  ];

  var monthBranch = '寅';
  for (var i = monthJieQi.length - 1; i >= 0; i--) {
    var jq = getJieqiDate(year, monthJieQi[i].jieqi);
    if (date >= new Date(jq)) { monthBranch = monthJieQi[i].branch; break; }
    if (i === 0 && date < new Date(jq)) {
      var prevXiaoHan = getJieqiDate(year - 1, '小寒');
      monthBranch = date >= new Date(prevXiaoHan) ? '丑' : '子';
    }
  }

  var monthGan = wuHuDun(yearGan, monthBranch);
  return { gan: monthGan, zhi: monthBranch };
};

/** 计算时柱 */
window.getHourGanZhi = function(hour, dayGan) {
  var branch = hourToDiZhi(hour);
  var startMap = { '甲':'甲','己':'甲','乙':'丙','庚':'丙','丙':'戊','辛':'戊','丁':'庚','壬':'庚','戊':'壬','癸':'壬' };
  var startGan = startMap[dayGan];
  var startIdx = TIAN_GAN.indexOf(startGan);
  var hourIdx = DI_ZHI.indexOf(branch);
  return { gan: TIAN_GAN[(startIdx + hourIdx) % 10], zhi: branch };
};

/** 获取节气日期（预存数据 + 近似值） */
window.getJieqiDate = function(year, name) {
  // 预存的节气数据（2020-2026）
  var data = window._JIEQI_DATA;
  if (!data) return approximateJieqi(year, name);

  var yearStr = String(year);
  // 处理小寒大寒跨年
  if ((name === '小寒' || name === '大寒') && data[String(year + 1)] && data[String(year + 1)][name]) {
    var md = data[String(year + 1)][name];
    if (parseInt(md.split('-')[0]) === 1) return (year + 1) + '-' + md;
  }
  if (data[yearStr] && data[yearStr][name]) return year + '-' + data[yearStr][name];

  return approximateJieqi(year, name);
};

function approximateJieqi(year, name) {
  var approx = {
    '立春':'02-04','雨水':'02-19','惊蛰':'03-06','春分':'03-21',
    '清明':'04-05','谷雨':'04-20','立夏':'05-06','小满':'05-21',
    '芒种':'06-06','夏至':'06-21','小暑':'07-07','大暑':'07-23',
    '立秋':'08-07','处暑':'08-23','白露':'09-08','秋分':'09-23',
    '寒露':'10-08','霜降':'10-24','立冬':'11-07','小雪':'11-22',
    '大雪':'12-07','冬至':'12-22','小寒':'01-06','大寒':'01-20'
  };
  return year + '-' + (approx[name] || '01-01');
}

/** 获取时辰信息 */
window.getShiChen = function(hour) {
  var branch = hourToDiZhi(hour);
  var info = DI_ZHI_HOURS[branch];
  return { name: info.name, branch: branch, timeRange: info.hourRange[0] + ':00-' + info.hourRange[1] + ':00' };
};

/** 获取农历年份（基于立春） */
window.getLunarYear = function(solarDate) {
  var date = new Date(solarDate);
  var year = date.getFullYear();
  var lichun = getJieqiDate(year, '立春');
  return date < new Date(lichun) ? year - 1 : year;
};

// ═══ 加载节气数据 ═══
(function() {
  // 从 JSON 加载（内联数据作为后备）
  window._JIEQI_DATA = {
    "2020":{"立春":"02-04","雨水":"02-19","惊蛰":"03-05","春分":"03-20","清明":"04-04","谷雨":"04-19","立夏":"05-05","小满":"05-20","芒种":"06-05","夏至":"06-21","小暑":"07-06","大暑":"07-22","立秋":"08-07","处暑":"08-22","白露":"09-07","秋分":"09-22","寒露":"10-08","霜降":"10-23","立冬":"11-07","小雪":"11-22","大雪":"12-07","冬至":"12-21","小寒":"01-06","大寒":"01-20"},
    "2021":{"立春":"02-03","雨水":"02-18","惊蛰":"03-05","春分":"03-20","清明":"04-04","谷雨":"04-20","立夏":"05-05","小满":"05-21","芒种":"06-05","夏至":"06-21","小暑":"07-07","大暑":"07-22","立秋":"08-07","处暑":"08-23","白露":"09-07","秋分":"09-23","寒露":"10-08","霜降":"10-23","立冬":"11-07","小雪":"11-22","大雪":"12-07","冬至":"12-21","小寒":"01-05","大寒":"01-20"},
    "2022":{"立春":"02-04","雨水":"02-19","惊蛰":"03-05","春分":"03-20","清明":"04-05","谷雨":"04-20","立夏":"05-05","小满":"05-21","芒种":"06-06","夏至":"06-21","小暑":"07-07","大暑":"07-23","立秋":"08-07","处暑":"08-23","白露":"09-07","秋分":"09-23","寒露":"10-08","霜降":"10-23","立冬":"11-07","小雪":"11-22","大雪":"12-07","冬至":"12-22","小寒":"01-05","大寒":"01-20"},
    "2023":{"立春":"02-04","雨水":"02-19","惊蛰":"03-06","春分":"03-21","清明":"04-05","谷雨":"04-20","立夏":"05-06","小满":"05-21","芒种":"06-06","夏至":"06-21","小暑":"07-07","大暑":"07-23","立秋":"08-08","处暑":"08-23","白露":"09-08","秋分":"09-23","寒露":"10-08","霜降":"10-24","立冬":"11-08","小雪":"11-22","大雪":"12-07","冬至":"12-22","小寒":"01-06","大寒":"01-20"},
    "2024":{"立春":"02-04","雨水":"02-19","惊蛰":"03-05","春分":"03-20","清明":"04-04","谷雨":"04-19","立夏":"05-05","小满":"05-20","芒种":"06-05","夏至":"06-21","小暑":"07-06","大暑":"07-22","立秋":"08-07","处暑":"08-22","白露":"09-07","秋分":"09-22","寒露":"10-08","霜降":"10-23","立冬":"11-07","小雪":"11-22","大雪":"12-06","冬至":"12-21","小寒":"01-06","大寒":"01-20"},
    "2025":{"立春":"02-03","雨水":"02-18","惊蛰":"03-05","春分":"03-20","清明":"04-04","谷雨":"04-20","立夏":"05-05","小满":"05-21","芒种":"06-05","夏至":"06-21","小暑":"07-07","大暑":"07-22","立秋":"08-07","处暑":"08-23","白露":"09-07","秋分":"09-23","寒露":"10-08","霜降":"10-23","立冬":"11-07","小雪":"11-22","大雪":"12-07","冬至":"12-21","小寒":"01-05","大寒":"01-20"},
    "2026":{"立春":"02-04","雨水":"02-18","惊蛰":"03-05","春分":"03-20","清明":"04-05","谷雨":"04-20","立夏":"05-05","小满":"05-21","芒种":"06-05","夏至":"06-21","小暑":"07-07","大暑":"07-22","立秋":"08-07","处暑":"08-23","白露":"09-07","秋分":"09-23","寒露":"10-08","霜降":"10-23","立冬":"11-07","小雪":"11-22","大雪":"12-07","冬至":"12-22","小寒":"01-05","大寒":"01-20"}
  };
})();
