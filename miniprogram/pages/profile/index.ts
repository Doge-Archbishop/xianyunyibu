/**
 * 个人中心
 */

interface ProfilePageData {
  userInfo: WechatMiniprogram.UserInfo | null;
  isLoggedIn: boolean;
  stats: { module: string; name: string; count: number; icon: string }[];
  settings: { title: string; desc: string; key: string }[];
}

Page<ProfilePageData, {}>({
  data: {
    userInfo: null,
    isLoggedIn: false,
    stats: [
      { module: 'daily-fortune', name: '每日抽签', count: 0, icon: '🎋' },
      { module: 'liuyao', name: '六爻占卜', count: 0, icon: '☯' },
      { module: 'bazi', name: '八字命理', count: 0, icon: '📜' },
      { module: 'zwds', name: '紫微斗数', count: 0, icon: '🌟' },
      { module: 'meihua', name: '梅花易数', count: 0, icon: '🌸' },
    ],
    settings: [
      { title: '初学者模式', desc: '显示详细的术语解释和引导', key: 'beginnerMode' },
      { title: '深色模式', desc: '护眼的暗色界面', key: 'darkMode' },
      { title: '免责声明', desc: '关于占卜结果的说明', key: 'disclaimer' },
      { title: '关于道易', desc: '版本信息与致谢', key: 'about' },
    ],
  },

  onLoad() {
    this.checkLogin();
    this.loadStats();
  },

  onShow() {
    this.checkLogin();
  },

  /** 检查登录状态 */
  checkLogin() {
    const app = getApp<{ globalData: { isLoggedIn: boolean; userInfo: WechatMiniprogram.UserInfo | null } }>();
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo,
    });
  },

  /** 加载使用统计 */
  loadStats() {
    const cached = wx.getStorageSync('divination_history') || [];
    const counts: Record<string, number> = {};

    for (const item of cached) {
      counts[item.module] = (counts[item.module] || 0) + 1;
    }

    const stats = this.data.stats.map(s => ({
      ...s,
      count: counts[s.module] || 0,
    }));

    this.setData({ stats });
  },

  /** 微信登录 */
  onGetUserInfo(e: WechatMiniprogram.ButtonGetUserInfo) {
    if (e.detail.userInfo) {
      const app = getApp<{ globalData: { userInfo: WechatMiniprogram.UserInfo | null; isLoggedIn: boolean } }>();
      app.globalData.userInfo = e.detail.userInfo;
      app.globalData.isLoggedIn = true;
      wx.setStorageSync('userInfo', e.detail.userInfo);

      this.setData({
        userInfo: e.detail.userInfo,
        isLoggedIn: true,
      });
    }
  },

  /** 点击设置项 */
  onSettingTap(e: WechatMiniprogram.TouchEvent) {
    const { key } = e.currentTarget.dataset as { key: string };

    switch (key) {
      case 'beginnerMode':
        wx.showToast({ title: '初学者模式开发中', icon: 'none' });
        break;
      case 'darkMode':
        wx.showToast({ title: '深色模式开发中', icon: 'none' });
        break;
      case 'disclaimer':
        wx.showModal({
          title: '免责声明',
          content: '本小程序（道易）内容源自中国传统易学文化，仅供学习参考和娱乐。命运掌握在自己手中，请理性看待占卜结果。本程序的任何内容都不构成人生决策的依据。请勿沉迷占卜，脚踏实地过好每一天。',
          showCancel: false,
        });
        break;
      case 'about':
        wx.showModal({
          title: '关于道易',
          content: '道易 v1.0.0\n\n传承道家文化，探索易学智慧\n\n以现代技术呈现中国古代占卜术数，让更多人了解和欣赏中国传统文化的博大精深。\n\n⚠️ 仅供娱乐参考',
          showCancel: false,
        });
        break;
    }
  },
});
