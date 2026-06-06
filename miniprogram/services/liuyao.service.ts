/**
 * 六爻占卜服务
 *
 * 算法流程：
 * 1. 抛3枚硬币6次 → 确定阴阳老变
 * 2. 构建本卦 → 查变爻 → 得变卦
 * 3. 定世应 → 配六亲 → 解卦
 */

import { DI_ZHI, DI_ZHI_WUXING, TIAN_GAN_WUXING } from './constants';
import { getDayGanZhi } from './calendar.service';
import type {
  CoinTossResult, YaoType, YaoPosition, LiuQin,
  Hexagram, LiuYaoResult, LiuYaoInterpretation,
  TianGan, WuXing, DiZhi,
} from './types';

/** 六十四卦缓存 */
let hexagramsCache: Hexagram[] | null = null;

function loadHexagrams(): Hexagram[] {
  if (hexagramsCache) return hexagramsCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    hexagramsCache = require('../data/liushisigua.json');
  } catch {
    hexagramsCache = [];
  }
  return hexagramsCache!;
}

/**
 * 模拟抛 3 枚硬币
 * 正面(字)为阳=3，反面(背)为阴=2
 * 3正=9=老阳（变爻），2正1反=7=少阳
 * 3反=6=老阴（变爻），2反1正=8=少阴
 */
export function tossCoins(): CoinTossResult {
  const faces: ['正面', '反面'] = ['正面', '反面'];
  const coins: ['正面', '反面'][] = [
    faces[Math.floor(Math.random() * 2)],
    faces[Math.floor(Math.random() * 2)],
    faces[Math.floor(Math.random() * 2)],
  ];

  const zhengCount = coins.filter(c => c === '正面').length;

  let yaoType: YaoType;
  let isChanging: boolean;

  switch (zhengCount) {
    case 3: yaoType = '老阳'; isChanging = true; break;
    case 2: yaoType = '少阳'; isChanging = false; break;
    case 1: yaoType = '少阴'; isChanging = false; break;
    case 0: yaoType = '老阴'; isChanging = true; break;
    default: yaoType = '少阳'; isChanging = false;
  }

  return { round: 0, faces: coins as [typeof faces[0], typeof faces[0], typeof faces[0]], yaoType, isChanging };
}

/**
 * 执行一次完整的六爻摇卦（6次抛硬币）
 */
export function performFullToss(): CoinTossResult[] {
  const results: CoinTossResult[] = [];
  for (let i = 0; i < 6; i++) {
    const result = tossCoins();
    result.round = i + 1; // 1=初爻, 6=上爻
    results.push(result);
  }
  return results;
}

/**
 * 根据六次抛硬币结果生成本卦和变卦
 */
export function buildHexagrams(tosses: CoinTossResult[]): {
  primary: Hexagram;
  transformed: Hexagram | null;
  changingLines: YaoPosition[];
} {
  // 构建本卦的六爻（从初爻到上爻，index 0-5）
  const primaryLines: boolean[] = tosses.map(t =>
    t.yaoType === '老阳' || t.yaoType === '少阳'
  );

  // 找变爻
  const changingLines: YaoPosition[] = [];
  tosses.forEach((t, i) => {
    if (t.isChanging) {
      changingLines.push(i as YaoPosition);
    }
  });

  // 查找本卦
  const primary = findHexagramByLines(primaryLines);

  // 生成变卦
  let transformed: Hexagram | null = null;
  if (changingLines.length > 0) {
    const transformedLines = [...primaryLines];
    changingLines.forEach(i => {
      transformedLines[i] = !transformedLines[i]; // 老阳→阴，老阴→阳
    });
    transformed = findHexagramByLines(transformedLines);
  }

  return { primary, transformed, changingLines };
}

/**
 * 根据六爻查找卦名
 */
export function findHexagramByLines(lines: boolean[]): Hexagram {
  const hexagrams = loadHexagrams();

  // 精确匹配
  for (const h of hexagrams) {
    if (arraysEqual(h.lines, lines)) {
      return h;
    }
  }

  // 如果没找到（理论上不应该），返回第一个卦
  return hexagrams[0];
}

/**
 * 定世应位置
 * 规则：根据本卦在八宫中的位置确定
 * 简化版：通过卦变推算
 */
export function determineShiYing(hexagram: Hexagram): { shi: YaoPosition; ying: YaoPosition } {
  // 简化算法：
  // 本宫卦（上下卦相同）：世在六爻(5)，应在三爻(2)
  // 一世卦：世在一爻(0)，应在四爻(3)
  // 二世卦：世在二爻(1)，应在五爻(4)
  // 三世卦：世在三爻(2)，应在上爻(5)
  // 四世卦：世在四爻(3)，应在初爻(0)
  // 五世卦：世在五爻(4)，应在二爻(1)
  // 游魂卦：世在四爻(3)，应在初爻(0)
  // 归魂卦：世在三爻(2)，应在上爻(5)

  const upper = hexagram.upperTrigram;
  const lower = hexagram.lowerTrigram;

  // 本宫卦：上下卦相同
  if (upper === lower) {
    return { shi: 5, ying: 2 };
  }

  // 简化：根据 palace 和上下卦差异推算
  // 对于非本宫卦，通过卦变规律计算
  const palace = hexagram.palace;
  const hexagrams = loadHexagrams();
  const palaceHexagrams = hexagrams.filter(h => h.palace === palace);

  // 找到当前卦在宫中的位置
  const indexInPalace = palaceHexagrams.findIndex(h => h.name === hexagram.name);

  if (indexInPalace === 0) {
    return { shi: 5, ying: 2 }; // 本宫卦
  } else if (indexInPalace <= 5) {
    return { shi: (indexInPalace - 1) as YaoPosition, ying: (indexInPalace + 2) as YaoPosition } as { shi: YaoPosition; ying: YaoPosition };
  } else if (indexInPalace === 6) {
    return { shi: 3, ying: 5 }; // 游魂卦
  } else {
    return { shi: 2, ying: 5 }; // 归魂卦
  }
}

/**
 * 配六亲
 * 以卦宫五行为"我"，各爻地支五行为"他"
 */
export function assignLiuQin(hexagram: Hexagram): LiuQin[] {
  // 简化版：基于卦的五行和爻位分配
  const myWuxing = hexagram.wuxing;

  // 每个爻位对应的地支（简化映射）
  // 实际应根据纳甲规则，这里用简化版
  const lineBranches: DiZhi[] = ['子', '丑', '寅', '卯', '辰', '巳'];
  const lineWuxing: WuXing[] = lineBranches.map(b => DI_ZHI_WUXING[b]);

  return lineWuxing.map(lw => getLiuQinRelation(myWuxing, lw));
}

/**
 * 五行生克 → 六亲
 */
function getLiuQinRelation(my: WuXing, other: WuXing): LiuQin {
  if (my === other) return '兄弟';

  // 我生 = 子孙
  if (
    (my === '金' && other === '水') || (my === '水' && other === '木') ||
    (my === '木' && other === '火') || (my === '火' && other === '土') ||
    (my === '土' && other === '金')
  ) return '子孙';

  // 我克 = 妻财
  if (
    (my === '金' && other === '木') || (my === '木' && other === '土') ||
    (my === '土' && other === '水') || (my === '水' && other === '火') ||
    (my === '火' && other === '金')
  ) return '妻财';

  // 克我 = 官鬼
  if (
    (other === '金' && my === '木') || (other === '木' && my === '土') ||
    (other === '土' && my === '水') || (other === '水' && my === '火') ||
    (other === '火' && my === '金')
  ) return '官鬼';

  // 生我 = 父母
  return '父母';
}

/**
 * 完整的六爻占卜
 */
export function performLiuYao(): LiuYaoResult {
  const tosses = performFullToss();
  const { primary, transformed, changingLines } = buildHexagrams(tosses);
  const { shi, ying } = determineShiYing(primary);
  const lineRelations = assignLiuQin(primary);

  // 获取今日日干用于用神分析
  const today = new Date().toISOString().split('T')[0];
  const dayGanZhi = getDayGanZhi(today);

  const interpretation = interpretLiuYao(primary, transformed, changingLines, lineRelations, shi, ying);

  return {
    tosses,
    primaryHexagram: primary,
    transformedHexagram: transformed,
    changingLines,
    lineRelations,
    shiYao: shi,
    yingYao: ying,
    yongShen: {
      type: '妻财', // 默认问财运
      position: 2,
      strength: '旺',
    },
    interpretation,
  };
}

/**
 * 六爻解读
 */
function interpretLiuYao(
  primary: Hexagram,
  transformed: Hexagram | null,
  changingLines: YaoPosition[],
  lineRelations: LiuQin[],
  shi: YaoPosition,
  ying: YaoPosition,
): LiuYaoInterpretation {
  const lineByLine = lineRelations.map((rel, i) => {
    const yaoLabel = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][i];
    const shiYingLabel = i === shi ? '（世爻·你）' : i === ying ? '（应爻·对方）' : '';
    const changeLabel = changingLines.includes(i as YaoPosition) ? '【动爻】' : '';
    return `${yaoLabel}${shiYingLabel}${changeLabel}：${rel}，代表${getLiuQinPlainText(rel)}`;
  });

  return {
    summary: `本卦"${primary.name}"${transformed ? `，变卦"${transformed.name}"` : '（静卦）'}。${primary.plainSummary}`,
    hexagramMeaning: primary.judgement,
    changingMeaning: transformed ? transformed.judgement : '本卦无变爻，为静卦。',
    lineByLine,
    advice: transformed
      ? `有${changingLines.length}个变爻，事情正在发生变化。${transformed.plainSummary}`
      : '这是静卦，事情不会发生大的变化，以当前的状态为主。',
  };
}

/**
 * 六亲 → 通俗解释
 */
function getLiuQinPlainText(liuqin: LiuQin): string {
  const map: Record<LiuQin, string> = {
    '父母': '庇护你的人事物（如长辈、文书、房屋）',
    '兄弟': '与你同行的人（如兄弟姐妹、同辈、朋友）',
    '妻财': '你掌控的资源（如财富、资产）',
    '官鬼': '约束你的力量（如上位者、规则、压力）',
    '子孙': '你所创造/生发的事物（如下属、子女、创造力）',
  };
  return map[liuqin];
}

function arraysEqual(a: boolean[], b: boolean[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
