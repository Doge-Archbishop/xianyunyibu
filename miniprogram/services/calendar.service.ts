/**
 * 日历服务 — 公历↔农历转换 + 节气查询
 *
 * 核心算法说明：
 * 1. 公历转农历：基于基准日推算，使用节气确定月柱边界
 * 2. 节气查询：预存数据（jieqi.json）+ 动态推算
 * 3. 日柱计算：基准日1900-01-01=甲子日，差值%60得六十甲子序号
 */

import { TIAN_GAN, DI_ZHI, DI_ZHI_HOURS, hourToDiZhi } from './constants';
import type { TianGan, DiZhi, GanZhi } from './types';

/** 基准日：1900年1月1日 = 甲子日（六十甲子第1日） */
const BASE_DATE = new Date(1900, 0, 1);
const BASE_JIAZI_INDEX = 1; // 甲子

/** 节气数据缓存 */
let jieqiCache: Record<string, Record<string, string>> | null = null;

/**
 * 加载节气数据
 */
function loadJieqiData(): Record<string, Record<string, string>> {
  if (jieqiCache) return jieqiCache;
  try {
    // 微信小程序中通过 require 加载 JSON
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jieqiCache = require('../data/jieqi.json').baseYears;
  } catch {
    jieqiCache = {};
  }
  return jieqiCache!;
}

/**
 * 公历日期 → 日柱（六十甲子序号）
 * 算法：计算目标日与基准日的天数差，模60
 */
export function getDayGanZhi(solarDate: string): GanZhi {
  const target = new Date(solarDate);
  const diffDays = Math.floor((target.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));

  // 1900-01-01 是甲子日（第1天）
  // diffDays=0 → index=1（甲子）
  // diffDays=1 → index=2（乙丑）
  const jiaziIndex = ((diffDays % 60) + 60) % 60;

  const ganIndex = jiaziIndex % 10;
  const zhiIndex = jiaziIndex % 12;

  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
  };
}

/**
 * 获取某一年的年柱
 * 年柱以立春为界：阳历日期在立春之前属上年，立春及之后属本年
 */
export function getYearGanZhi(solarDate: string): GanZhi {
  const date = new Date(solarDate);
  const year = date.getFullYear();

  // 获取该年的立春日期
  const lichunDate = getJieqiDate(year, '立春');

  // 如果日期在立春之前，年柱取上年
  const targetYear = date < new Date(lichunDate) ? year - 1 : year;

  // 1864年是甲子年
  const baseYear = 1864;
  const diff = targetYear - baseYear;
  const jiaziIndex = ((diff % 60) + 60) % 60;

  return {
    gan: TIAN_GAN[jiaziIndex % 10],
    zhi: DI_ZHI[jiaziIndex % 12],
  };
}

/**
 * 获取月柱
 * 月柱以节气为界：寅月=立春→惊蛰，卯月=惊蛰→清明，...
 */
export function getMonthGanZhi(solarDate: string, yearGan: TianGan): GanZhi {
  const date = new Date(solarDate);
  const year = date.getFullYear();

  // 12个月的节气边界
  const monthJieQi = [
    { branch: '寅' as DiZhi, jieqi: '立春' },
    { branch: '卯' as DiZhi, jieqi: '惊蛰' },
    { branch: '辰' as DiZhi, jieqi: '清明' },
    { branch: '巳' as DiZhi, jieqi: '立夏' },
    { branch: '午' as DiZhi, jieqi: '芒种' },
    { branch: '未' as DiZhi, jieqi: '小暑' },
    { branch: '申' as DiZhi, jieqi: '立秋' },
    { branch: '酉' as DiZhi, jieqi: '白露' },
    { branch: '戌' as DiZhi, jieqi: '寒露' },
    { branch: '亥' as DiZhi, jieqi: '立冬' },
    { branch: '子' as DiZhi, jieqi: '大雪' },
    { branch: '丑' as DiZhi, jieqi: '小寒' },
  ];

  // 找到日期所在的月
  let monthBranch: DiZhi = '寅';

  for (let i = monthJieQi.length - 1; i >= 0; i--) {
    const jieqiDate = getJieqiDate(year, monthJieQi[i].jieqi);
    if (date >= new Date(jieqiDate)) {
      monthBranch = monthJieQi[i].branch;
      break;
    }
    // 如果日期在所有节气之前（1月初），检查是否在上年的节气之后
    if (i === 0 && date < new Date(jieqiDate)) {
      // 检查上一年的小寒
      const prevXiaoHan = getJieqiDate(year - 1, '小寒');
      if (date >= new Date(prevXiaoHan)) {
        monthBranch = '丑';
      } else {
        monthBranch = '子';
      }
      break;
    }
  }

  // 五虎遁：根据年干推算月干
  const monthGan = getMonthGanByYearGan(yearGan, monthBranch);

  return { gan: monthGan, zhi: monthBranch };
}

/**
 * 五虎遁：根据年干推算月干
 */
function getMonthGanByYearGan(yearGan: TianGan, monthBranch: DiZhi): TianGan {
  const startGanMap: Record<string, TianGan> = {
    '甲': '丙', '己': '丙',
    '乙': '戊', '庚': '戊',
    '丙': '庚', '辛': '庚',
    '丁': '壬', '壬': '壬',
    '戊': '甲', '癸': '甲',
  };

  const startGan = startGanMap[yearGan];
  const startGanIdx = TIAN_GAN.indexOf(startGan);

  // 寅月是第0个月
  const monthIdx = (DI_ZHI.indexOf(monthBranch) - 2 + 12) % 12;
  return TIAN_GAN[(startGanIdx + monthIdx) % 10];
}

/**
 * 计算时柱
 */
export function getHourGanZhi(hour: number, dayGan: TianGan): GanZhi {
  const hourBranch = hourToDiZhi(hour);

  // 五鼠遁：根据日干推算时干
  const startGanMap: Record<string, TianGan> = {
    '甲': '甲', '己': '甲',
    '乙': '丙', '庚': '丙',
    '丙': '戊', '辛': '戊',
    '丁': '庚', '壬': '庚',
    '戊': '壬', '癸': '壬',
  };

  const startGan = startGanMap[dayGan];
  const startGanIdx = TIAN_GAN.indexOf(startGan);
  const hourIdx = DI_ZHI.indexOf(hourBranch);

  return {
    gan: TIAN_GAN[(startGanIdx + hourIdx) % 10],
    zhi: hourBranch,
  };
}

/**
 * 获取节气日期
 */
export function getJieqiDate(year: number, jieqiName: string): string {
  const data = loadJieqiData();
  const yearStr = String(year);

  // 处理小寒和大寒的特殊情况（可能属于上一年）
  if (jieqiName === '小寒' || jieqiName === '大寒') {
    // 小寒和大寒通常在当年1月，但节气数据存在上年key中
    const possibleYear = String(year);
    const nextYear = String(year + 1);

    if (data[possibleYear] && data[possibleYear][jieqiName]) {
      // 如果是1月份的节气，日期使用当前年
      const md = data[possibleYear][jieqiName];
      const month = parseInt(md.split('-')[0]);
      if (month === 1) {
        return `${year}-${md}`;
      }
    }
    if (data[nextYear] && data[nextYear][jieqiName]) {
      // 可能是下一年1月份
      const md = data[nextYear][jieqiName];
      return `${year + 1}-${md}`;
    }
  }

  if (data[yearStr] && data[yearStr][jieqiName]) {
    return `${year}-${data[yearStr][jieqiName]}`;
  }

  // 如果数据不存在，用近似值
  return approximateJieqi(year, jieqiName);
}

/**
 * 节气近似值（当精确数据不可用时）
 */
function approximateJieqi(year: number, name: string): string {
  const approx: Record<string, string> = {
    '立春': '02-04', '雨水': '02-19', '惊蛰': '03-06', '春分': '03-21',
    '清明': '04-05', '谷雨': '04-20', '立夏': '05-06', '小满': '05-21',
    '芒种': '06-06', '夏至': '06-21', '小暑': '07-07', '大暑': '07-23',
    '立秋': '08-07', '处暑': '08-23', '白露': '09-08', '秋分': '09-23',
    '寒露': '10-08', '霜降': '10-24', '立冬': '11-07', '小雪': '11-22',
    '大雪': '12-07', '冬至': '12-22', '小寒': '01-06', '大寒': '01-20',
  };
  return `${year}-${approx[name] || '01-01'}`;
}

/**
 * 计算24小时制的小时对应的时辰
 */
export function getShiChen(hour: number): { name: string; branch: DiZhi; timeRange: string } {
  const branch = hourToDiZhi(hour);
  const info = DI_ZHI_HOURS[branch];
  return {
    name: info.name,
    branch,
    timeRange: `${info.hourRange[0]}:00-${info.hourRange[1]}:00`,
  };
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.floor(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
}

/**
 * 获取农历年份（简化版，基于立春）
 */
export function getLunarYear(solarDate: string): number {
  const date = new Date(solarDate);
  const year = date.getFullYear();
  const lichun = getJieqiDate(year, '立春');
  if (date < new Date(lichun)) {
    return year - 1;
  }
  return year;
}
