/**
 * 闲云一卜 — Hash 路由
 */

var Router = {
  routes: {},
  currentPage: null,

  register: function(path, handler) {
    this.routes[path] = handler;
  },

  navigate: function(path) {
    window.location.hash = path;
  },

  start: function() {
    var self = this;
    window.addEventListener('hashchange', function() { self.resolve(); });
    this.resolve();
  },

  resolve: function() {
    var hash = window.location.hash.replace('#', '') || '/home';
    var handler = this.routes[hash];

    if (handler && typeof handler === 'function') {
      this.currentPage = hash;
      try {
        handler();
      } catch(e) {
        console.error('页面渲染失败: ' + hash, e);
        document.getElementById('page-content').innerHTML = '<div style="padding:48px;text-align:center"><h2>出错了</h2><p>请刷新页面重试</p><p style="color:#A09888;font-size:0.8rem">' + e.message + '</p></div>';
      }
    } else {
      this.navigate('/home');
    }
  }
};
