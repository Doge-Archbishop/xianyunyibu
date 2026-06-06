/**
 * 道易 — 道教占卜小程序
 * 应用入口
 */

interface GlobalData {
  userInfo: WechatMiniprogram.UserInfo | null;
  isLoggedIn: boolean;
  openid: string;
  dailyDrawStatus: 'available' | 'used' | 'loading';
  dailyFortuneToday: DailyFortuneCache | null;
}

interface DailyFortuneCache {
  fortuneId: number;
  drawDate: string;
}

App<GlobalData>({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    openid: '',
    dailyDrawStatus: 'loading',
    dailyFortuneToday: null,
  },

  onLaunch() {
    console.log('[道易] 应用启动');

    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'dao-fortune-0gabc123', // TODO: 替换为实际云环境 ID
        traceUser: true,
      });
    }

    // 检查登录态
    this.checkLoginStatus();

    // 检查今日抽签状态
    this.refreshDailyDrawStatus();
  },

  onShow() {
    // 从后台切回时刷新每日抽签状态
    this.refreshDailyDrawStatus();
  },

  /**
   * 检查微信登录状态
   */
  checkLoginStatus() {
    const cachedUser = wx.getStorageSync('userInfo');
    if (cachedUser) {
      this.globalData.userInfo = cachedUser;
      this.globalData.isLoggedIn = true;
    }
    this.doLogin();
  },

  /**
   * 执行微信登录，获取 openid
   */
  doLogin() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: (res) => {
        const result = res.result as { openid: string };
        if (result && result.openid) {
          this.globalData.openid = result.openid;
          this.globalData.isLoggedIn = true;
          console.log('[道易] 登录成功');
        }
      },
      fail: (err) => {
        console.error('[道易] 登录失败:', err);
        // 非云开发模式下降级处理
        this.globalData.openid = 'dev-user';
        this.globalData.isLoggedIn = true;
      },
    });
  },

  /**
   * 刷新每日抽签状态
   */
  refreshDailyDrawStatus() {
    // 先检查本地缓存
    const today = this.getTodayStr();
    const cached = wx.getStorageSync('dailyDrawDate');

    if (cached === today) {
      this.globalData.dailyDrawStatus = 'used';
      const fortune = wx.getStorageSync('dailyFortune');
      if (fortune) {
        this.globalData.dailyFortuneToday = fortune;
      }
      return;
    }

    // 通过云函数检查
    if (this.globalData.openid) {
      wx.cloud.callFunction({
        name: 'check-daily-draw',
        data: { date: today },
        success: (res) => {
          const result = res.result as { drawn: boolean; fortuneId?: number };
          if (result && result.drawn) {
            this.globalData.dailyDrawStatus = 'used';
          } else {
            this.globalData.dailyDrawStatus = 'available';
          }
        },
        fail: () => {
          // 降级：仅依赖本地缓存
          this.globalData.dailyDrawStatus = 'available';
        },
      });
    } else {
      this.globalData.dailyDrawStatus = 'available';
    }
  },

  /**
   * 获取今天的日期字符串 YYYY-MM-DD
   */
  getTodayStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },
});
