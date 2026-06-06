/**
 * 卦象可视化组件 — 展示六爻卦象（本卦 + 变卦并排）
 */

Component({
  properties: {
    /** 本卦六爻（从下到上，true=阳爻） */
    primaryLines: {
      type: Array,
      value: [true, true, true, true, true, true],
    },
    /** 变卦六爻 */
    transformedLines: {
      type: Array,
      value: null,
    },
    /** 变爻位置 (0-5) */
    changingLines: {
      type: Array,
      value: [],
    },
    /** 本卦名 */
    primaryName: {
      type: String,
      value: '',
    },
    /** 变卦名 */
    transformedName: {
      type: String,
      value: '',
    },
    /** 各爻六亲 */
    lineRelations: {
      type: Array,
      value: [],
    },
    /** 世爻位置 */
    shiYao: {
      type: Number,
      value: -1,
    },
    /** 应爻位置 */
    yingYao: {
      type: Number,
      value: -1,
    },
    /** 是否显示六亲标签 */
    showLiuQin: {
      type: Boolean,
      value: true,
    },
    /** 是否显示世应标记 */
    showShiYing: {
      type: Boolean,
      value: true,
    },
    /** 标题 */
    title: {
      type: String,
      value: '',
    },
  },

  data: {
    yaoNames: ['上九', '九五', '六四', '九三', '六二', '初九'] as string[],
    lineLabels: [] as {
      index: number;
      name: string;
      primaryYang: boolean;
      transformedYang: boolean;
      isChanging: boolean;
      relation: string;
      isShi: boolean;
      isYing: boolean;
    }[],
  },

  observers: {
    'primaryLines, transformedLines, changingLines, lineRelations, shiYao, yingYao'(
      primaryLines: boolean[],
      transformedLines: boolean[] | null,
      changingLines: number[],
      lineRelations: string[],
      shiYao: number,
      yingYao: number,
    ) {
      this.buildLineLabels(primaryLines, transformedLines, changingLines, lineRelations, shiYao, yingYao);
    },
  },

  lifetimes: {
    attached() {
      const props = this.properties;
      const pl = props.primaryLines as boolean[];
      const tl = props.transformedLines as boolean[] | null;
      const cl = props.changingLines as number[];
      const lr = props.lineRelations as string[];
      this.buildLineLabels(pl, tl, cl, lr, props.shiYao, props.yingYao);
    },
  },

  methods: {
    buildLineLabels(
      primaryLines: boolean[],
      transformedLines: boolean[] | null,
      changingLines: number[],
      lineRelations: string[],
      shiYao: number,
      yingYao: number,
    ) {
      const fullNames = ['初', '二', '三', '四', '五', '上'];
      const labels = [];

      // 从上往下显示（上爻在上，初爻在下）
      for (let i = 5; i >= 0; i--) {
        const pYang = primaryLines[i];
        const tYang = transformedLines ? transformedLines[i] : pYang;
        const isChanging = changingLines.includes(i);

        // 爻名
        let yaoName = fullNames[i];
        if (pYang) {
          yaoName = yaoName === '上' ? '上九' : `${yaoName}九`;
        } else {
          yaoName = yaoName === '上' ? '上六' : `${yaoName}六`;
        }

        labels.push({
          index: i,
          name: yaoName,
          primaryYang: pYang,
          transformedYang: tYang,
          isChanging,
          relation: lineRelations[i] || '',
          isShi: i === shiYao,
          isYing: i === yingYao,
        });
      }

      this.setData({ lineLabels: labels });
    },
  },
});
