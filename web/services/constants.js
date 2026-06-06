/**
 * 闲云一卜 — 常量定义 (JS 版本)
 */

// ═══ 十天干 ═══
window.TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

window.TIAN_GAN_WUXING = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土',
  '庚':'金','辛':'金','壬':'水','癸':'水'
};

window.TIAN_GAN_YINYANG = {
  '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳','己':'阴',
  '庚':'阳','辛':'阴','壬':'阳','癸':'阴'
};

// ═══ 十二地支 ═══
window.DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

window.DI_ZHI_WUXING = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'
};

window.DI_ZHI_HOURS = {
  '子':{name:'子时',hourRange:[23,1]},'丑':{name:'丑时',hourRange:[1,3]},
  '寅':{name:'寅时',hourRange:[3,5]},'卯':{name:'卯时',hourRange:[5,7]},
  '辰':{name:'辰时',hourRange:[7,9]},'巳':{name:'巳时',hourRange:[9,11]},
  '午':{name:'午时',hourRange:[11,13]},'未':{name:'未时',hourRange:[13,15]},
  '申':{name:'申时',hourRange:[15,17]},'酉':{name:'酉时',hourRange:[17,19]},
  '戌':{name:'戌时',hourRange:[19,21]},'亥':{name:'亥时',hourRange:[21,23]}
};

// ═══ 地支藏干 ═══
window.ZANG_GAN = {
  '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],'卯':['乙'],
  '辰':['戊','乙','癸'],'巳':['丙','庚','戊'],'午':['丁','己'],'未':['己','丁','乙'],
  '申':['庚','壬','戊'],'酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲']
};

// ═══ 纳音五行 ═══
window.NAYIN_WUXING = {
  1:'海中金',2:'炉中火',3:'大林木',4:'路旁土',5:'剑锋金',6:'山头火',7:'涧下水',8:'城头土',
  9:'白蜡金',10:'杨柳木',11:'泉中水',12:'屋上土',13:'霹雳火',14:'松柏木',15:'流年水',
  16:'砂石金',17:'山下火',18:'平地木',19:'壁上土',20:'金箔金',21:'佛灯火',22:'天河水',
  23:'大驿土',24:'钗环金',25:'桑柘木',26:'大溪水',27:'沙中土',28:'天上火',29:'石榴木',
  30:'大海水',31:'海中金',32:'炉中火',33:'大林木',34:'路旁土',35:'剑锋金',36:'山头火',
  37:'涧下水',38:'城头土',39:'白蜡金',40:'杨柳木',41:'泉中水',42:'屋上土',43:'霹雳火',
  44:'松柏木',45:'流年水',46:'砂石金',47:'山下火',48:'平地木',49:'壁上土',50:'金箔金',
  51:'佛灯火',52:'天河水',53:'大驿土',54:'钗环金',55:'桑柘木',56:'大溪水',57:'沙中土',
  58:'天上火',59:'石榴木',60:'大海水'
};

// ═══ 六十甲子 ═══
window.LIUSHI_JIAZI = (function() {
  var result = [];
  for (var i = 0; i < 60; i++) {
    result.push({ gan: TIAN_GAN[i % 10], zhi: DI_ZHI[i % 12], index: i + 1 });
  }
  return result;
})();

// ═══ 时辰换算 ═══
window.hourToDiZhi = function(hour) {
  var adjustedHour = (hour === 23 || hour === 0) ? 0 : Math.floor((hour + 1) / 2);
  return DI_ZHI[adjustedHour];
};

/**
 * 五鼠遁：日干 → 时干（子时起点）
 */
window.wuShuDun = function(dayGan, hourBranch) {
  var map = { '甲':'甲','己':'甲','乙':'丙','庚':'丙','丙':'戊','辛':'戊','丁':'庚','壬':'庚','戊':'壬','癸':'壬' };
  var startGan = map[dayGan];
  var startIdx = TIAN_GAN.indexOf(startGan);
  var hourIdx = DI_ZHI.indexOf(hourBranch);
  return TIAN_GAN[(startIdx + hourIdx) % 10];
};

/**
 * 五虎遁：年干 → 月干（寅月起点）
 */
window.wuHuDun = function(yearGan, monthBranch) {
  var map = { '甲':'丙','己':'丙','乙':'戊','庚':'戊','丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲' };
  var startGan = map[yearGan];
  var startIdx = TIAN_GAN.indexOf(startGan);
  var monthIdx = (DI_ZHI.indexOf(monthBranch) - 2 + 12) % 12;
  return TIAN_GAN[(startIdx + monthIdx) % 10];
};
