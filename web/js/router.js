/**
 * 闲云一卜 — Hash 路由
 */

const Router = {
  routes: {},
  currentPage: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    window.location.hash = path;
  },

  start() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },

  resolve() {
    const hash = window.location.hash.replace('#', '') || '/home';
    const handler = this.routes[hash];

    if (handler) {
      this.currentPage = hash;
      handler();
    } else {
      // 默认跳首页
      this.navigate('/home');
    }
  }
};
