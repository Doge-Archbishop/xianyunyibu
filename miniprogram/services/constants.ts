/**
 * 道易 — 常量定义
 * 天干、地支、五行、八卦等基础常量
 */

import type { TianGan, DiZhi, WuXing, YinYang } from './types';

// ═══════════════════════════════════════════
// 十天干
// ═══════════════════════════════════════════

export const TIAN_GAN: TianGan[] = [
  '甲', '乙', '丙', '丁', '戊',
  '己', '庚', '辛', '壬', '癸',
];

/** 天干 → 五行 */
export const TIAN_GAN_WUXING: Record<TianGan, WuXing> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/** 天干 → 阴阳 */
export const TIAN_GAN_YINYANG: Record<TianGan, YinYang> = {
  '甲': '阳', '乙': '阴',
  '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴',
};

// ═══════════════════════════════════════════
// 十二地支
// ═══════════════════════════════════════════

export const DI_ZHI: DiZhi[] = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥',
];

/** 地支 → 五行 */
export const DI_ZHI_WUXING: Record<DiZhi, WuXing> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

/** 地支 → 时辰 */
export const DI_ZHI_HOURS: Record<DiZhi, { name: string; hourRange: [number, number] }> = {
  '子': { name: '子时', hourRange: [23, 1] },
  '丑': { name: '丑时', hourRange: [1, 3] },
  '寅': { name: '寅时', hourRange: [3, 5] },
  '卯': { name: '卯时', hourRange: [5, 7] },
  '辰': { name: '辰时', hourRange: [7, 9] },
  '巳': { name: '巳时', hourRange: [9, 11] },
  '午': { name: '午时', hourRange: [11, 13] },
  '未': { name: '未时', hourRange: [13, 15] },
  '申': { name: '申时', hourRange: [15, 17] },
  '酉': { name: '酉时', hourRange: [17, 19] },
  '戌': { name: '戌时', hourRange: [19, 21] },
  '亥': { name: '亥时', hourRange: [21, 23] },
};

/** 地支 → 生肖 */
export const DI_ZHI_ZODIAC: Record<DiZhi, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
  '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪',
};

/** 地支 → 月令（从寅月开始） */
export const DI_ZHI_MONTHS: Record<DiZhi, string> = {
  '寅': '正月（立春~惊蛰）', '卯': '二月（惊蛰~清明）',
  '辰': '三月（清明~立夏）', '巳': '四月（立夏~芒种）',
  '午': '五月（芒种~小暑）', '未': '六月（小暑~立秋）',
  '申': '七月（立秋~白露）', '酉': '八月（白露~寒露）',
  '戌': '九月（寒露~立冬）', '亥': '十月（立冬~大雪）',
  '子': '十一月（大雪~小寒）', '丑': '十二月（小寒~立春）',
};

// ═══════════════════════════════════════════
// 五行生克
// ═══════════════════════════════════════════

/** 五行相生：key 生 value */
export const WUXING_SHENG: Record<WuXing, WuXing> = {
  '金': '水',
  '水': '木',
  '木': '火',
  '火': '土',
  '土': '金',
};

/** 五行相克：key 克 value */
export const WUXING_KE: Record<WuXing, WuXing> = {
  '金': '木',
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
};

/** 五行 → 颜色 */
export const WUXING_COLORS: Record<WuXing, string> = {
  '金': '#F5F0E0',
  '木': '#4CAF50',
  '水': '#2196F3',
  '火': '#F44336',
  '土': '#FF9800',
};

/** 五行 → 文字颜色 */
export const WUXING_TEXT_COLORS: Record<WuXing, string> = {
  '金': '#8B7530',
  '木': '#2E7D32',
  '水': '#1565C0',
  '火': '#C62828',
  '土': '#E65100',
};

// ═══════════════════════════════════════════
// 六十甲子
// ═══════════════════════════════════════════

/** 生成六十甲子表 */
export function buildLiuShiJiaZi(): { gan: TianGan; zhi: DiZhi; index: number }[] {
  const result: { gan: TianGan; zhi: DiZhi; index: number }[] = [];
  for (let i = 0; i < 60; i++) {
    result.push({
      gan: TIAN_GAN[i % 10],
      zhi: DI_ZHI[i % 12],
      index: i + 1,
    });
  }
  return result;
}

/** 六十甲子表（缓存） */
export const LIUSHI_JIAZI = buildLiuShiJiaZi();

/** 根据天干地支获取六十甲子序号 (1-60) */
export function getJiaZiIndex(gan: TianGan, zhi: DiZhi): number {
  const ganIdx = TIAN_GAN.indexOf(gan);
  const zhiIdx = DI_ZHI.indexOf(zhi);

  // 天干地支必须同奇偶（阳配阳、阴配阴）
  if (ganIdx % 2 !== zhiIdx % 2) {
    return -1; // 无效组合
  }

  for (const item of LIUSHI_JIAZI) {
    if (item.gan === gan && item.zhi === zhi) {
      return item.index;
    }
  }
  return -1;
}

/** 根据六十甲子序号获取天干地支 */
export function getJiaZiByIndex(index: number): { gan: TianGan; zhi: DiZhi } | null {
  const normalizedIndex = ((index - 1) % 60 + 60) % 60;
  return LIUSHI_JIAZI[normalizedIndex] || null;
}

// ═══════════════════════════════════════════
// 五鼠遁（日干 → 时干）
// ═══════════════════════════════════════════

/**
 * 五鼠遁：根据日干推算时干
 * 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途。
 */
export function wuShuDun(dayGan: TianGan, hourBranch: DiZhi): TianGan {
  const startGanMap: Record<TianGan, TianGan> = {
    '甲': '甲', '己': '甲',  // 甲己还加甲
    '乙': '丙', '庚': '丙',  // 乙庚丙作初
    '丙': '戊', '辛': '戊',  // 丙辛从戊起
    '丁': '庚', '壬': '庚',  // 丁壬庚子居
    '戊': '壬', '癸': '壬',  // 戊癸何方发，壬子是真途
  };

  const startGan = startGanMap[dayGan];
  const startGanIdx = TIAN_GAN.indexOf(startGan);
  const hourIdx = DI_ZHI.indexOf(hourBranch);

  return TIAN_GAN[(startGanIdx + hourIdx) % 10];
}

/**
 * 五虎遁：根据年干推算月干
 * 甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，更有戊癸何方觅，甲寅之上好追求。
 */
export function wuHuDun(yearGan: TianGan, monthBranch: DiZhi): TianGan {
  const startGanMap: Record<TianGan, TianGan> = {
    '甲': '丙', '己': '丙',  // 甲己之年丙作首
    '乙': '戊', '庚': '戊',  // 乙庚之岁戊为头
    '丙': '庚', '辛': '庚',  // 丙辛必定寻庚起
    '丁': '壬', '壬': '壬',  // 丁壬壬位顺行流
    '戊': '甲', '癸': '甲',  // 戊癸何方觅，甲寅之上好追求
  };

  const startGan = startGanMap[yearGan];
  const startGanIdx = TIAN_GAN.indexOf(startGan);

  // 寅月是第0个月
  const monthIdx = (DI_ZHI.indexOf(monthBranch) - 2 + 12) % 12;

  return TIAN_GAN[(startGanIdx + monthIdx) % 10];
}

// ═══════════════════════════════════════════
// 地支藏干
// ═══════════════════════════════════════════

/** 地支藏干（每个地支藏1-3个天干） */
export const ZANG_GAN: Record<DiZhi, TianGan[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// ═══════════════════════════════════════════
// 纳音五行
// ═══════════════════════════════════════════

/** 六十甲子 → 纳音五行 */
export const NAYIN_WUXING: Record<number, string> = {
  1: '海中金', 2: '炉中火', 3: '大林木', 4: '路旁土', 5: '剑锋金',
  6: '山头火', 7: '涧下水', 8: '城头土', 9: '白蜡金', 10: '杨柳木',
  11: '泉中水', 12: '屋上土', 13: '霹雳火', 14: '松柏木', 15: '流年水',
  16: '砂石金', 17: '山下火', 18: '平地木', 19: '壁上土', 20: '金箔金',
  21: '佛灯火', 22: '天河水', 23: '大驿土', 24: '钗环金', 25: '桑柘木',
  26: '大溪水', 27: '沙中土', 28: '天上火', 29: '石榴木', 30: '大海水',
  31: '海中金', 32: '炉中火', 33: '大林木', 34: '路旁土', 35: '剑锋金',
  36: '山头火', 37: '涧下水', 38: '城头土', 39: '白蜡金', 40: '杨柳木',
  41: '泉中水', 42: '屋上土', 43: '霹雳火', 44: '松柏木', 45: '流年水',
  46: '砂石金', 47: '山下火', 48: '平地木', 49: '壁上土', 50: '金箔金',
  51: '佛灯火', 52: '天河水', 53: '大驿土', 54: '钗环金', 55: '桑柘木',
  56: '大溪水', 57: '沙中土', 58: '天上火', 59: '石榴木', 60: '大海水',
};

// ═══════════════════════════════════════════
// 时辰换算
// ═══════════════════════════════════════════

/** 将 24 小时制的小时数转换为时辰地支 */
export function hourToDiZhi(hour: number): DiZhi {
  // 子时：23:00-00:59 → 子(0)
  // 丑时：01:00-02:59 → 丑(1)
  // ...
  // 亥时：21:00-22:59 → 亥(11)
  const adjustedHour = hour === 23 || hour === 0 ? 0 : Math.floor((hour + 1) / 2);
  return DI_ZHI[adjustedHour];
}

/** 时辰地支 → 时辰序号（子=0, 丑=1, ..., 亥=11） */
export function diZhiToHourIndex(zhi: DiZhi): number {
  return DI_ZHI.indexOf(zhi);
}
