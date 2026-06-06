/**
 * 可折叠解释面板 — 结果展示中的详细解读区域
 */

Component({
  properties: {
    title: { type: String, value: '' },
    expanded: { type: Boolean, value: false },
    icon: { type: String, value: '📋' },
  },

  data: {
    isExpanded: false,
  },

  lifetimes: {
    attached() {
      this.setData({ isExpanded: this.properties.expanded });
    },
  },

  methods: {
    onToggle() {
      this.setData({ isExpanded: !this.data.isExpanded });
    },
  },
});
