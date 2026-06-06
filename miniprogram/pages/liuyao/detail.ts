/**
 * 六爻 — 逐爻详解页面
 */

import type { LiuYaoResult } from '../../services/types';

Page({
  data: {
    result: null as LiuYaoResult | null,
    lineDetails: [] as { label: string; desc: string }[],
  },

  onLoad() {
    const app = getApp<{ globalData: Record<string, unknown> }>();
    const result = app.globalData.liuyaoResult as LiuYaoResult | undefined;

    if (result) {
      this.setData({ result });

      // 构建逐爻解析
      const primary = result.primaryHexagram;
      const lineNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
      const details = lineNames.map((name, i) => {
        const rel = result.lineRelations[i] || '';
        const isChanging = result.changingLines.includes(i as never);
        const isShi = result.shiYao === i;
        const isYing = result.yingYao === i;
        const label = `${name}${isShi ? '（世·你）' : ''}${isYing ? '（应·对方）' : ''}${isChanging ? '【动】' : ''}`;
        return {
          label,
          desc: `${primary.lineTexts[i] || ''}\n六亲：${rel}${isChanging ? '\n此爻变动，为本卦关键爻。' : ''}`,
        };
      });

      this.setData({ lineDetails: details });
    }
  },
});
