/**
 * 梅花易数服务
 *
 * 算法：
 * 1. 取三个数 → 上卦(数1%8)、下卦(数2%8)、动爻(数3%6)
 * 2. 生成本卦 → 互卦 → 变卦
 * 3. 体用分析 → 生克判断
 */

import type {
  MeiHuaInput, MeiHuaResult, MeiHuaInterpretation,
  Hexagram, BaGuaName, BaGua, TiYongRelation, WuXing,
} from './types';
import { findHexagramByLines } from './liuyao.service';
import { DI_ZHI_WUXING } from './constants';

/** 八卦缓存 */
let baguaCache: Record<string, BaGua> | null = null;

function loadBagua(): Record<string, BaGua> {
  if (baguaCache) return baguaCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    baguaCache = require('../data/bagua.json');
  } catch {
    baguaCache = {} as Record<string, BaGua>;
  }
  return baguaCache!;
}

/** 八卦名称 → 先天数 */
const BAGUA_NAMES: BaGuaName[] = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

/**
 * 时间起卦：用当前日期时间计算三个数
 */
function getNumbersFromTime(): [number, number, number] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();

  // 时辰数：子=1, 丑=2, ..., 亥=12
  const hourNumber = hour === 0 || hour === 23 ? 1 : Math.floor((hour + 1) / 2) + 1;

  const upper = year + month + day;
  const lower = year + month + day + hourNumber;
  const moving = year + month + day + hourNumber;

  return [upper, lower, moving];
}

/**
 * 梅花易数完整计算
 */
export function calculateMeiHua(input: MeiHuaInput): MeiHuaResult {
  let numbers: [number, number, number];

  if (input.method === 'time') {
    numbers = getNumbersFromTime();
  } else if (input.method === 'manual' && input.numbers) {
    numbers = input.numbers;
  } else {
    // 随机
    numbers = [
      Math.floor(Math.random() * 1000) + 1,
      Math.floor(Math.random() * 1000) + 1,
      Math.floor(Math.random() * 1000) + 1,
    ];
  }

  const [n1, n2, n3] = numbers;

  // 上卦 = n1 % 8 (余数0=8=坤)
  const upperIndex = n1 % 8 === 0 ? 7 : (n1 % 8) - 1;
  const upperTrigramName = BAGUA_NAMES[upperIndex];

  // 下卦 = n2 % 8
  const lowerIndex = n2 % 8 === 0 ? 7 : (n2 % 8) - 1;
  const lowerTrigramName = BAGUA_NAMES[lowerIndex];

  // 动爻 = n3 % 6 (0=6=上爻)
  const changingLine = n3 % 6 === 0 ? 6 : n3 % 6;

  // 生成本卦
  const primaryLines = buildLinesFromTrigrams(upperTrigramName, lowerTrigramName);
  const primaryHexagram = findHexagramByLines(primaryLines);

  // 生成互卦（二三四爻为下互卦，三四五爻为上互卦）
  const mutualLowerLines = [primaryLines[1], primaryLines[2], primaryLines[3]];
  const mutualUpperLines = [primaryLines[2], primaryLines[3], primaryLines[4]];
  const mutualLines = [...mutualLowerLines, ...mutualUpperLines];
  const mutualHexagram = findHexagramByLines(mutualLines);

  // 生成变卦（动爻变动后的卦）
  const transformedLines = [...primaryLines];
  transformedLines[changingLine - 1] = !transformedLines[changingLine - 1];
  const transformedHexagram = findHexagramByLines(transformedLines);

  // 体用分析
  // 动爻所在卦为用卦，另一个为体卦
  const movingInUpper = changingLine > 3; // 4,5,6爻在上卦
  const tiName = movingInUpper ? lowerTrigramName : upperTrigramName;
  const yongName = movingInUpper ? upperTrigramName : lowerTrigramName;

  const bagua = loadBagua();
  const tiGua = bagua[tiName];
  const yongGua = bagua[yongName];

  const tiYongRelation = getTiYongRelation(tiGua.wuxing, yongGua.wuxing);

  // 解读
  const interpretation = interpretMeiHua(
    primaryHexagram, mutualHexagram, transformedHexagram,
    changingLine, tiName, yongName, tiYongRelation,
  );

  return {
    numbers,
    upperTrigram: bagua[upperTrigramName],
    lowerTrigram: bagua[lowerTrigramName],
    primaryHexagram,
    mutualHexagram,
    transformedHexagram,
    changingLine,
    tiGua: tiName,
    yongGua: yongName,
    tiYongRelation,
    interpretation,
  };
}

/**
 * 根据上下卦名称构建六爻
 */
function buildLinesFromTrigrams(upper: BaGuaName, lower: BaGuaName): boolean[] {
  const bagua = loadBagua();
  const upp = bagua[upper];
  const low = bagua[lower];
  return [...low.lines, ...upp.lines];
}

/**
 * 体用生克关系判断
 */
function getTiYongRelation(tiWuXing: WuXing, yongWuXing: WuXing): TiYongRelation {
  // 五行相同 = 比和
  if (tiWuXing === yongWuXing) return '体用比和';

  // 体克用
  if (
    (tiWuXing === '金' && yongWuXing === '木') ||
    (tiWuXing === '木' && yongWuXing === '土') ||
    (tiWuXing === '土' && yongWuXing === '水') ||
    (tiWuXing === '水' && yongWuXing === '火') ||
    (tiWuXing === '火' && yongWuXing === '金')
  ) return '体克用';

  // 用克体
  if (
    (yongWuXing === '金' && tiWuXing === '木') ||
    (yongWuXing === '木' && tiWuXing === '土') ||
    (yongWuXing === '土' && tiWuXing === '水') ||
    (yongWuXing === '水' && tiWuXing === '火') ||
    (yongWuXing === '火' && tiWuXing === '金')
  ) return '用克体';

  // 体生用
  if (
    (tiWuXing === '金' && yongWuXing === '水') ||
    (tiWuXing === '水' && yongWuXing === '木') ||
    (tiWuXing === '木' && yongWuXing === '火') ||
    (tiWuXing === '火' && yongWuXing === '土') ||
    (tiWuXing === '土' && yongWuXing === '金')
  ) return '体生用';

  // 用生体
  return '用生体';
}

/**
 * 体用生克 → 吉凶判断 + 通俗解释
 */
function getTiYongJudgement(relation: TiYongRelation): { result: string; desc: string } {
  const map: Record<TiYongRelation, { result: string; desc: string }> = {
    '体克用': { result: '吉', desc: '你（体）克制事情（用），你能掌控局势，事情大概率按照你的意愿发展。但需要付出努力。' },
    '用克体': { result: '凶', desc: '事情（用）克制了你（体），局势对你不利，可能会遇到阻碍和困难。需要谨慎应对。' },
    '体生用': { result: '泄', desc: '你（体）在消耗自己来推动事情（用）。结果对事情有利但可能消耗你很多精力。付出多回报少。' },
    '用生体': { result: '吉', desc: '事情（用）在滋养你（体），环境对你有利。做事容易得到助力，结果对你有益。' },
    '体用比和': { result: '大吉', desc: '你（体）和事情（用）五行相同，你与事情和谐一致，诸事顺利。这是最理想的状态。' },
  };
  return map[relation];
}

/**
 * 梅花易数解读
 */
function interpretMeiHua(
  primary: Hexagram,
  mutual: Hexagram,
  transformed: Hexagram,
  changingLine: number,
  tiName: BaGuaName,
  yongName: BaGuaName,
  tiYongRelation: TiYongRelation,
): MeiHuaInterpretation {
  const tiYongJudgement = getTiYongJudgement(tiYongRelation);
  const bagua = loadBagua();

  return {
    summary: `本卦"${primary.name}"，${tiYongJudgement.result}。${primary.plainSummary}`,
    primaryMeaning: `本卦代表事情的初始状态。${primary.judgement}`,
    mutualMeaning: `互卦代表事情的发展过程。${mutual.judgement}`,
    transformedMeaning: `变卦代表事情的最终结果。${transformed.judgement}`,
    lineMeaning: `动爻在第${changingLine}爻：${primary.lineTexts[changingLine - 1]}`,
    tiYongAnalysis: `体卦为${tiName}(${bagua[tiName]?.wuxing})，用卦为${yongName}(${bagua[yongName]?.wuxing})。${tiYongRelation}。${tiYongJudgement.desc}`,
    advice: tiYongRelation === '体用比和' || tiYongRelation === '用生体'
      ? '运势较好，适合主动出击，把握机会。'
      : tiYongRelation === '体克用'
        ? '需要付出努力才能成功，不要懈怠。'
        : '目前运势略显不利，建议保守行事，等待更好的时机。',
  };
}
