/**
 * 闲云一卜 — Hash 路由
 */

var Router = {
  routes: {},
  currentPage: null,
  _started: false,

  register: function(path, handler) {
    if (typeof handler === 'function') {
      this.routes[path] = handler;
    }
  },

  navigate: function(path) {
    window.location.hash = path;
  },

  start: function() {
    if (this._started) return;
    this._started = true;
    var self = this;
    window.addEventListener('hashchange', function() { self.resolve(); });
    // 延迟一帧确保DOM就绪
    setTimeout(function() { self.resolve(); }, 50);
  },

  resolve: function() {
    var raw = window.location.hash || '';
    var hash = raw.replace('#', '') || '/home';
    var handler = this.routes[hash];

    if (handler) {
      this.currentPage = hash;
      try {
        handler();
      } catch(e) {
        var content = document.getElementById('page-content');
        if (content) {
          content.innerHTML = '<div style="padding:48px;text-align:center"><h2>页面出错了</h2><p style="color:#C62828">' + (e.message || '未知错误') + '</p><p style="color:#A09888;font-size:0.85rem">请刷新页面重试</p></div>';
        }
      }
    } else if (hash !== '/home') {
      // 未注册的路由，跳回首页
      this.navigate('/home');
    }
    // 如果 /home 也没注册，什么都不做，避免死循环
  }
};
