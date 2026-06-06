/**
 * 道家风格加载动画 — 旋转太极图 + 文案
 */

Component({
  properties: {
    text: { type: String, value: '正在感应天地气数...' },
    duration: { type: Number, value: 3000 },
  },

  data: {
    isAnimating: false,
  },

  lifetimes: {
    attached() {
      this.setData({ isAnimating: true });
    },
  },

  methods: {
    /** 停止动画 */
    stop() {
      this.setData({ isAnimating: false });
    },
  },
});
