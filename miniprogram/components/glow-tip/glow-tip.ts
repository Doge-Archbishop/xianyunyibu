/**
 * 术语悬浮解释组件 — 道家术语的首次出现自动弹 tooltip
 */

Component({
  properties: {
    /** 术语名称 */
    term: { type: String, value: '' },
    /** 通俗解释 */
    plainText: { type: String, value: '' },
    /** 是否默认展开 */
    expandByDefault: { type: Boolean, value: false },
    /** 提示位置 */
    position: { type: String, value: 'top' }, // top | bottom
  },

  data: {
    isVisible: false,
  },

  lifetimes: {
    attached() {
      if (this.properties.expandByDefault) {
        this.setData({ isVisible: true });
      }
    },
  },

  methods: {
    onToggle() {
      this.setData({ isVisible: !this.data.isVisible });
    },
    onClose() {
      this.setData({ isVisible: false });
    },
  },
});
