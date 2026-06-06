/**
 * 占卜页 — 历史记录 + 快速入口
 */

interface DivinePageData {
  history: DivinationRecord[];
  isEmpty: boolean;
}

interface DivinationRecord {
  id: string;
  module: string;
  moduleName: string;
  icon: string;
  resultSummary: string;
  createTime: string;
}

Page<DivinePageData, {}>({
  data: {
    history: [],
    isEmpty: true,
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  /** 加载占卜历史 */
  loadHistory() {
    // 从本地缓存读取
    const cached = wx.getStorageSync('divination_history') || [];
    const mapped: DivinationRecord[] = cached.map((item: { module: string; resultSummary: string; createTime: number; id: string }) => ({
      ...item,
      moduleName: this.getModuleName(item.module),
      icon: this.getModuleIcon(item.module),
      createTime: this.formatTime(item.createTime),
    }));

    this.setData({
      history: mapped.slice(0, 20), // 最近 20 条
      isEmpty: mapped.length === 0,
    });
  },

  /** 模块名称映射 */
  getModuleName(module: string): string {
    const map: Record<string, string> = {
      'daily-fortune': '每日抽签',
      'liuyao': '六爻占卜',
      'bazi': '八字命理',
      'zwds': '紫微斗数',
      'meihua': '梅花易数',
    };
    return map[module] || module;
  },

  /** 模块图标映射 */
  getModuleIcon(module: string): string {
    const map: Record<string, string> = {
      'daily-fortune': '🎋',
      'liuyao': '☯',
      'bazi': '📜',
      'zwds': '🌟',
      'meihua': '🌸',
    };
    return map[module] || '📋';
  },

  /** 格式化时间 */
  formatTime(timestamp: number): string {
    const d = new Date(timestamp);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}-${day} ${h}:${min}`;
  },

  /** 点击历史记录 */
  onHistoryTap(e: WechatMiniprogram.TouchEvent) {
    const { id, module } = e.currentTarget.dataset as { id: string; module: string };
    // TODO: 跳转到对应的历史详情页
    console.log('查看历史:', id, module);
  },

  /** 快速入口 */
  onQuickEntry(e: WechatMiniprogram.TouchEvent) {
    const { url } = e.currentTarget.dataset as { url: string };
    wx.navigateTo({ url });
  },
});
