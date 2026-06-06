/**
 * 道易 — 全局类型定义
 */

// ═══════════════════════════════════════════
// 基础类型：天干、地支、五行、八卦
// ═══════════════════════════════════════════

/** 十天干 */
export type TianGan =
  | '甲' | '乙' | '丙' | '丁' | '戊'
  | '己' | '庚' | '辛' | '壬' | '癸';

/** 十二地支 */
export type DiZhi =
  | '子' | '丑' | '寅' | '卯' | '辰' | '巳'
  | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 五行 */
export type WuXing = '金' | '木' | '水' | '火' | '土';

/** 阴阳 */
export type YinYang = '阳' | '阴';

/** 八卦 */
export type BaGuaName =
  | '乾' | '兑' | '离' | '震'
  | '巽' | '坎' | '艮' | '坤';

/** 六十四卦 */
export interface Hexagram {
  /** 卦序号 (1-64) */
  index: number;
  /** 卦名 */
  name: string;
  /** 卦象（六爻从下到上，true=阳爻 false=阴爻） */
  lines: boolean[];
  /** 上卦（外卦） */
  upperTrigram: BaGuaName;
  /** 下卦（内卦） */
  lowerTrigram: BaGuaName;
  /** 所属宫 */
  palace: BaGuaName;
  /** 五行属性 */
  wuxing: WuXing;
  /** 卦辞 */
  judgement: string;
  /** 彖辞 */
  tuanCommentary: string;
  /** 象辞 */
  xiangCommentary: string;
  /** 六爻爻辞 */
  lineTexts: string[];
}

// ═══════════════════════════════════════════
// 每日抽签
// ═══════════════════════════════════════════

/** 签文类型 */
export type FortuneLevel = '上上' | '上吉' | '中吉' | '中平' | '下下';

/** 签文 */
export interface FortuneStick {
  /** 签号 1-100 */
  id: number;
  /** 签等 */
  level: FortuneLevel;
  /** 签题 */
  title: string;
  /** 签诗 */
  poem: string;
  /** 解曰 */
  explanation: string;
  /** 现代解读 */
  modern: FortuneModern;
}

export interface FortuneModern {
  summary: string;
  career: string;
  love: string;
  health: string;
  wealth: string;
  advice: string;
}

// ═══════════════════════════════════════════
// 六爻
// ═══════════════════════════════════════════

/** 硬币结果 */
export type CoinFace = '正面' | '反面';

/** 单次抛硬币结果（3枚） */
export interface CoinTossResult {
  /** 第几次抛（1-6） */
  round: number;
  /** 3枚硬币的正反面 */
  faces: [CoinFace, CoinFace, CoinFace];
  /** 阴阳结果 */
  yaoType: YaoType;
  /** 是否变爻 */
  isChanging: boolean;
}

/** 爻的类型 */
export type YaoType = '老阳' | '少阳' | '老阴' | '少阴';

/** 爻位索引（0=初爻, 5=上爻） */
export type YaoPosition = 0 | 1 | 2 | 3 | 4 | 5;

/** 六亲 */
export type LiuQin = '父母' | '兄弟' | '妻财' | '官鬼' | '子孙';

/** 六爻完整结果 */
export interface LiuYaoResult {
  /** 摇卦记录 */
  tosses: CoinTossResult[];
  /** 本卦 */
  primaryHexagram: Hexagram;
  /** 变卦（静卦时为本卦） */
  transformedHexagram: Hexagram | null;
  /** 变爻位置 */
  changingLines: YaoPosition[];
  /** 各爻六亲 */
  lineRelations: LiuQin[];
  /** 世爻位置 */
  shiYao: YaoPosition;
  /** 应爻位置 */
  yingYao: YaoPosition;
  /** 用神分析 */
  yongShen: YongShen;
  /** 解读 */
  interpretation: LiuYaoInterpretation;
}

export interface YongShen {
  /** 用神类型 */
  type: string;
  /** 所在爻位 */
  position: YaoPosition;
  /** 旺衰状态 */
  strength: '旺' | '相' | '休' | '囚' | '死';
}

export interface LiuYaoInterpretation {
  summary: string;
  hexagramMeaning: string;
  changingMeaning: string;
  lineByLine: string[];
  advice: string;
}

// ═══════════════════════════════════════════
// 八字（四柱）
// ═══════════════════════════════════════════

/** 天干+地支组合 */
export interface GanZhi {
  gan: TianGan;
  zhi: DiZhi;
}

/** 四柱 */
export interface BaZiPillars {
  year: GanZhi;
  month: GanZhi;
  day: GanZhi;
  hour: GanZhi;
}

/** 十神 */
export type ShiShen =
  | '比肩' | '劫财'
  | '食神' | '伤官'
  | '正财' | '偏财'
  | '正官' | '七杀'
  | '正印' | '偏印';

/** 八字完整结果 */
export interface BaZiResult {
  /** 出生信息 */
  input: BaZiInput;
  /** 四柱 */
  pillars: BaZiPillars;
  /** 日主（日干） */
  dayMaster: TianGan;
  /** 日主五行 */
  dayMasterWuxing: WuXing;
  /** 各柱纳音 */
  nayin: string[];
  /** 藏干 */
  hiddenStems: TianGan[][];
  /** 十神 */
  shiShen: ShiShen[][];
  /** 五行计数 */
  wuxingCount: Record<WuXing, number>;
  /** 大运 */
  daYun: DaYunResult[];
  /** 解读 */
  interpretation: BaZiInterpretation;
}

export interface BaZiInput {
  /** 阳历出生日期 */
  solarDate: string;
  /** 出生时辰（地支） */
  hourBranch: DiZhi;
  /** 性别 */
  gender: '男' | '女';
}

export interface DaYunResult {
  /** 起始年龄 */
  startAge: number;
  /** 天干地支 */
  ganzhi: GanZhi;
  /** 是否当前大运 */
  isCurrent: boolean;
}

export interface BaZiInterpretation {
  dayMasterAnalysis: string;
  wuxingBalance: string;
  career: string;
  wealth: string;
  love: string;
  health: string;
  currentYun: string;
}

// ═══════════════════════════════════════════
// 紫微斗数
// ═══════════════════════════════════════════

/** 紫微斗数输入 */
export interface ZWDSInput {
  solarDate: string;
  hour: number;   // 0-23 时
  minute: number; // 0-59 分
  gender: '男' | '女';
}

/** 十二宫 */
export type PalaceName =
  | '命宫' | '兄弟' | '夫妻' | '子女'
  | '财帛' | '疾厄' | '迁移' | '交友'
  | '官禄' | '田宅' | '福德' | '父母';

/** 宫位 */
export interface Palace {
  name: PalaceName;
  /** 宫位地支 */
  branch: DiZhi;
  /** 宫位天干 */
  stem: TianGan;
  /** 大限起始年龄 */
  daXianStart: number;
  /** 大限结束年龄 */
  daXianEnd: number;
  /** 该宫主星 */
  mainStars: Star[];
  /** 该宫辅星 */
  assistantStars: Star[];
  /** 四化标记 */
  sihua?: SiHuaType;
}

/** 星宿 */
export interface Star {
  name: string;
  type: '主星' | '辅星' | '杂曜';
  wuxing?: WuXing;
  brightness?: '庙' | '旺' | '得' | '利' | '平' | '不' | '陷';
}

/** 四化类型 */
export type SiHuaType = '化禄' | '化权' | '化科' | '化忌';

/** 紫微斗数完整结果 */
export interface ZWDSResult {
  input: ZWDSInput;
  /** 农历日期 */
  lunarDate: string;
  /** 命宫 */
  mingGong: Palace;
  /** 身宫 */
  shenGong: Palace;
  /** 十二宫 */
  palaces: Palace[];
  /** 四化分布 */
  sihuaMap: Record<string, SiHuaType>;
  /** 身主 */
  shenZhu: string;
}

// ═══════════════════════════════════════════
// 梅花易数
// ═══════════════════════════════════════════

/** 梅花易数输入 */
export interface MeiHuaInput {
  /** 起卦方式 */
  method: 'time' | 'manual' | 'random';
  /** 三个数字（时间方式自动计算） */
  numbers?: [number, number, number];
}

/** 梅花易数结果 */
export interface MeiHuaResult {
  /** 起卦数字 */
  numbers: [number, number, number];
  /** 上卦 */
  upperTrigram: BaGua;
  /** 下卦 */
  lowerTrigram: BaGua;
  /** 本卦 */
  primaryHexagram: Hexagram;
  /** 互卦 */
  mutualHexagram: Hexagram;
  /** 变卦 */
  transformedHexagram: Hexagram;
  /** 动爻位置 (1-6) */
  changingLine: number;
  /** 体卦 */
  tiGua: BaGuaName;
  /** 用卦 */
  yongGua: BaGuaName;
  /** 体用生克 */
  tiYongRelation: TiYongRelation;
  /** 解读 */
  interpretation: MeiHuaInterpretation;
}

/** 八卦详细信息 */
export interface BaGua {
  name: BaGuaName;
  symbol: string;
  wuxing: WuXing;
  direction: string;
  nature: string;
  familyMember: string;
  bodyPart: string;
  animal: string;
  /** 先天数 */
  xiantianNumber: number;
  /** 爻象（从下到上，true=阳） */
  lines: [boolean, boolean, boolean];
}

/** 体用生克关系 */
export type TiYongRelation =
  | '体克用' | '用克体'
  | '体生用' | '用生体'
  | '体用比和';

export interface MeiHuaInterpretation {
  summary: string;
  primaryMeaning: string;
  mutualMeaning: string;
  transformedMeaning: string;
  lineMeaning: string;
  tiYongAnalysis: string;
  advice: string;
}

// ═══════════════════════════════════════════
// 通用类型
// ═══════════════════════════════════════════

/** 占卜历史记录 */
export interface DivinationRecord {
  id: string;
  module: 'daily-fortune' | 'liuyao' | 'bazi' | 'zwds' | 'meihua';
  input: unknown;
  resultSummary: string;
  isFavorite: boolean;
  createTime: number;
}

/** 用户设置 */
export interface UserSettings {
  theme: 'auto' | 'light' | 'dark';
  fontSize: 'small' | 'normal' | 'large';
  showBeginnerTips: boolean;
}
