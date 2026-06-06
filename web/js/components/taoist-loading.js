/**
 * 道家加载动画组件
 */
var TaoistLoading = {
  render: function(text, duration) {
    text = text || '正在感应天地气数...';
    return '<div class="dao-loading">' +
      '<div class="taiji-wrap spinning"><div class="taiji"><div class="taiji-half white"></div><div class="taiji-half black"></div><div class="taiji-dot white-dot"></div><div class="taiji-dot black-dot"></div></div></div>' +
      '<div class="incense"><div class="smoke s1"></div><div class="smoke s2"></div><div class="smoke s3"></div></div>' +
      '<span class="loading-text">' + text + '</span></div>';
  }
};
