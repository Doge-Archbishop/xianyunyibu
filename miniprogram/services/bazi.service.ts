/**
 * 八字（四柱）命理服务
 *
 * 算法流程：
 * 1. 输入阳历出生日期+时辰+性别
 * 2. 年柱（立春分界）→ 月柱（节气分界）→ 日柱（基准日推算）→ 时柱（五鼠遁）
 * 3. 藏干 → 十神 → 五行统计 → 大运
 */

import { TIAN_GAN, DI_ZHI, TIAN_GAN_WUXING, TIAN_GAN_YINYANG, ZANG_GAN, LIUSHI_JIAZI, NAYIN_WUXING } from './constants';
import { getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi, getJieqiDate } from './calendar.service';
import type {
  TianGan, DiZhi, WuXing, GanZhi,
  BaZiInput, BaZiResult, BaZiPillars, DaYunResult,
  BaZiInterpretation, ShiShen,
} from './types';

/**
 * 完整八字排盘
 */
export function calculateBaZi(input: BaZiInput): BaZiResult {
  const { solarDate, hourBranch, gender } = input;

  // 四柱
  const yearGanZhi = getYearGanZhi(solarDate);
  const monthGanZhi = getMonthGanZhi(solarDate, yearGanZhi.gan);
  const dayGanZhi = getDayGanZhi(solarDate);

  // 从 hourBranch 确定小时数（取时辰的中间值）
  const branchIndex = DI_ZHI.indexOf(hourBranch);
  let hour = branchIndex * 2 + 1; // 子时1点，丑时3点...
  if (branchIndex === 0) hour = 0; // 子时用0点
  const hourGanZhi = getHourGanZhi(hour, dayGanZhi.gan);

  const pillars: BaZiPillars = {
    year: yearGanZhi,
    month: monthGanZhi,
    day: dayGanZhi,
    hour: hourGanZhi,
  };

  const dayMaster = dayGanZhi.gan;
  const dayMasterWuxing = TIAN_GAN_WUXING[dayMaster];

  // 纳音
  const nayin = getNayin(pillars);

  // 藏干
  const hiddenStems = getCangGan(pillars);

  // 十神
  const shiShen = getShiShen(pillars, dayMaster);

  // 五行统计
  const wuxingCount = countWuxing(pillars);

  // 大运
  const daYun = calculateDaYun(solarDate, yearGanZhi, gender);

  // 解读
  const interpretation = interpretBaZi(pillars, dayMaster, dayMasterWuxing, wuxingCount, daYun);

  return {
    input,
    pillars,
    dayMaster,
    dayMasterWuxing,
    nayin,
    hiddenStems,
    shiShen,
    wuxingCount,
    daYun,
    interpretation,
  };
}

/**
 * 获取四柱纳音
 */
function getNayin(pillars: BaZiPillars): string[] {
  const allGanZhi = [pillars.year, pillars.month, pillars.day, pillars.hour];
  return allGanZhi.map(gz => {
    const index = LIUSHI_JIAZI.findIndex(item => item.gan === gz.gan && item.zhi === gz.zhi);
    return index >= 0 ? NAYIN_WUXING[index + 1] || '未知' : '未知';
  });
}

/**
 * 获取四柱藏干
 */
function getCangGan(pillars: BaZiPillars): TianGan[][] {
  return [
    ZANG_GAN[pillars.year.zhi],
    ZANG_GAN[pillars.month.zhi],
    ZANG_GAN[pillars.day.zhi],
    ZANG_GAN[pillars.hour.zhi],
  ];
}

/**
 * 计算十神
 * 返回 4（柱）× 各柱天干数的十神
 */
function getShiShen(pillars: BaZiPillars, dayMaster: TianGan): ShiShen[][] {
  const dayYinYang = TIAN_GAN_YINYANG[dayMaster];
  const dayWuxing = TIAN_GAN_WUXING[dayMaster];

  return [pillars.year, pillars.month, pillars.day, pillars.hour].map(gz => {
    return [gz.gan].map(gan => {
      const ganYinYang = TIAN_GAN_YINYANG[gan];
      const ganWuxing = TIAN_GAN_WUXING[gan];
      return calcShiShen(dayMaster, gan, dayWuxing, ganWuxing, dayYinYang, ganYinYang);
    });
  });
}

/**
 * 计算单个十神关系
 */
function calcShiShen(
  dayGan: TianGan, otherGan: TianGan,
  dayWuxing: WuXing, otherWuxing: WuXing,
  dayYY: string, otherYY: string,
): ShiShen {
  const sameWuxing = dayWuxing === otherWuxing;
  const sameYY = dayYY === otherYY;

  // 同我
  if (sameWuxing) return sameYY ? '比肩' : '劫财';

  // 我生
  if (isSheng(dayWuxing, otherWuxing)) return sameYY ? '食神' : '伤官';

  // 我克
  if (isKe(dayWuxing, otherWuxing)) return sameYY ? '偏财' : '正财';

  // 克我
  if (isKe(otherWuxing, dayWuxing)) return sameYY ? '七杀' : '正官';

  // 生我
  return sameYY ? '偏印' : '正印';
}

function isSheng(a: WuXing, b: WuXing): boolean {
  return (a === '金' && b === '水') || (a === '水' && b === '木') ||
         (a === '木' && b === '火') || (a === '火' && b === '土') ||
         (a === '土' && b === '金');
}

function isKe(a: WuXing, b: WuXing): boolean {
  return (a === '金' && b === '木') || (a === '木' && b === '土') ||
         (a === '土' && b === '水') || (a === '水' && b === '火') ||
         (a === '火' && b === '金');
}

/**
 * 统计五行分布
 */
function countWuxing(pillars: BaZiPillars): Record<WuXing, number> {
  const counts: Record<WuXing, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };

  const allGanZhi = [pillars.year, pillars.month, pillars.day, pillars.hour];
  allGanZhi.forEach(gz => {
    counts[TIAN_GAN_WUXING[gz.gan]]++;
    // 地支也计五行（通过地支藏干的主气）
    const mainQi = ZANG_GAN[gz.zhi][0];
    counts[TIAN_GAN_WUXING[mainQi]]++;
  });

  return counts;
}

/**
 * 计算大运
 */
function calculateDaYun(solarDate: string, yearGanZhi: GanZhi, gender: '男' | '女'): DaYunResult[] {
  const date = new Date(solarDate);
  const year = date.getFullYear();
  const yearGan = yearGanZhi.gan;
  const yearYY = TIAN_GAN_YINYANG[yearGan];

  // 阳年：甲丙戊庚壬；阴年：乙丁己辛癸
  const isYangYear = yearYY === '阳';

  // 阳男阴女顺排，阴男阳女逆排
  const isShunPai = (isYangYear && gender === '男') || (!isYangYear && gender === '女');

  // 找下一个/上一个节气
  const jieQiNames = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
  let targetJieqi: string | null = null;
  let targetDate: Date | null = null;

  if (isShunPai) {
    // 找出生日之后的第一个节气
    for (const name of jieQiNames) {
      const jqDate = new Date(getJieqiDate(year, name));
      if (jqDate >= date) {
        targetJieqi = name;
        targetDate = jqDate;
        break;
      }
    }
    // 如果今年的节气都过了，取明年立春
    if (!targetDate) {
      targetDate = new Date(getJieqiDate(year + 1, '立春'));
    }
  } else {
    // 找出生日之前的最后一个节气
    for (let i = jieQiNames.length - 1; i >= 0; i--) {
      const jqDate = new Date(getJieqiDate(year, jieQiNames[i]));
      if (jqDate < date) {
        targetDate = jqDate;
        break;
      }
    }
    if (!targetDate) {
      targetDate = new Date(getJieqiDate(year - 1, '小寒'));
    }
  }

  // 起运年龄 = 距离节气的天数 / 3
  const diffDays = Math.abs(date.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
  const startAge = Math.max(1, Math.floor(diffDays / 3));

  // 月柱为起点，推10步大运
  const monthGanZhi = getMonthGanZhi(solarDate, yearGanZhi.gan);
  const monthGanIdx = TIAN_GAN.indexOf(monthGanZhi.gan);
  const monthZhiIdx = DI_ZHI.indexOf(monthGanZhi.zhi);

  const daYun: DaYunResult[] = [];
  const now = new Date();
  const currentAge = now.getFullYear() - year;
  // 粗略检查，不精确到月日
  let hasSetCurrent = false;

  for (let i = 0; i < 10; i++) {
    const step = isShunPai ? i + 1 : -(i + 1);
    const age = startAge + i * 10;

    daYun.push({
      startAge: age,
      ganzhi: {
        gan: TIAN_GAN[((monthGanIdx + step) % 10 + 10) % 10],
        zhi: DI_ZHI[((monthZhiIdx + step) % 12 + 12) % 12],
      },
      isCurrent: false,
    });
  }

  // 标记当前大运
  for (const dy of daYun) {
    if (!hasSetCurrent && currentAge >= dy.startAge && currentAge < dy.startAge + 10) {
      dy.isCurrent = true;
      hasSetCurrent = true;
    }
  }

  return daYun;
}

/**
 * 八字解读
 */
function interpretBaZi(
  pillars: BaZiPillars,
  dayMaster: TianGan,
  dayMasterWuxing: WuXing,
  wuxingCount: Record<WuXing, number>,
  daYun: DaYunResult[],
): BaZiInterpretation {
  // 强弱的简单判断
  const count = wuxingCount[dayMasterWuxing];
  const strength = count >= 3 ? '强' : count === 2 ? '中等' : '弱';

  // 日主分析
  const dayMasterAnalysis = `你的日主为"${dayMaster}"（${dayMasterWuxing}），代表你自己。在八字中，${dayMasterWuxing}的五行力量${strength}。${strength === '强' ? '说明你个性较强，独立自主，有主见。' : strength === '中等' ? '说明你个性温和，既不过强也不过弱，适应能力好。' : '说明你可能比较内向或柔弱，需要借助他人的力量来发展。'}`;

  // 找喜用神和忌神（简化）
  const favoriteWuxing = getFavoriteWuxing(dayMasterWuxing, strength);
  const avoidWuxing = getAvoidWuxing(dayMasterWuxing, strength);

  // 当前大运
  const currentDaYun = daYun.find(dy => dy.isCurrent);
  const currentYunText = currentDaYun
    ? `你目前正行${currentDaYun.startAge}岁起的"${currentDaYun.ganzhi.gan}${currentDaYun.ganzhi.zhi}"大运，此运为${TIAN_GAN_WUXING[currentDaYun.ganzhi.gan]}运。`
    : '';

  return {
    dayMasterAnalysis,
    wuxingBalance: `你的五行中，金${wuxingCount['金']}、木${wuxingCount['木']}、水${wuxingCount['水']}、火${wuxingCount['火']}、土${wuxingCount['土']}。喜${favoriteWuxing}，忌${avoidWuxing}。`,
    career: `事业方面，${strength === '强' ? '适合做管理工作和需要决断力的职业。' : '适合从事需要协作和沟通的工作。'}五行方面，多接触${favoriteWuxing}相关的行业更为有利。`,
    wealth: `财运方面，你的财富格局与日主${dayMaster}的强弱密切相关。${strength === '强' ? '能扛财，适合主动投资和创业。' : '宜守不宜攻，稳健理财为上。'}`,
    love: `感情方面，需根据具体十神配置来看。日主${dayMaster}${TIAN_GAN_YINYANG[dayMaster]}性，${strength === '强' ? '在感情中可能比较主动。' : '在感情中可能比较被动，需要对方带动。'}`,
    health: `健康方面，${dayMasterWuxing}主${getWuxingBodyPart(dayMasterWuxing)}，需注意相关方面的保养。${strength === '弱' ? `多补${favoriteWuxing}来增强体质。` : '保持平衡即可。'}`,
    currentYun: currentYunText + '十年一大运，把握好当下的运势节奏。',
  };
}

function getFavoriteWuxing(dayWuxing: WuXing, strength: string): string {
  if (strength === '弱') {
    // 生我者
    const shengMap: Record<WuXing, WuXing> = { '金': '土', '水': '金', '木': '水', '火': '木', '土': '火' };
    return shengMap[dayWuxing];
  }
  // 克我生我
  const keMap: Record<WuXing, WuXing> = { '金': '火', '水': '土', '木': '金', '火': '水', '土': '木' };
  return keMap[dayWuxing];
}

function getAvoidWuxing(dayWuxing: WuXing, strength: string): string {
  if (strength === '强') {
    return dayWuxing; // 太强忌同我
  }
  // 我克者
  const keMap: Record<WuXing, WuXing> = { '金': '木', '水': '火', '木': '土', '火': '金', '土': '水' };
  return keMap[dayWuxing];
}

function getWuxingBodyPart(wuxing: WuXing): string {
  const map: Record<WuXing, string> = {
    '金': '肺和呼吸系统',
    '木': '肝和神经系统',
    '水': '肾和泌尿系统',
    '火': '心脏和血液循环',
    '土': '脾胃和消化系统',
  };
  return map[wuxing];
}
