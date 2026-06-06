/**
 * 每日抽签服务 (JS 版本)
 */

/** 随机抽签 */
window.drawFortune = function() {
  var fortunes = window._FORTUNES || [];
  if (!fortunes.length) return null;
  return fortunes[Math.floor(Math.random() * fortunes.length)];
};

/** 根据签号获取 */
window.getFortuneById = function(id) {
  var fortunes = window._FORTUNES || [];
  for (var i = 0; i < fortunes.length; i++) {
    if (fortunes[i].id === id) return fortunes[i];
  }
  return null;
};

/** 签文等级 → 颜色 */
window.getFortuneLevelColor = function(level) {
  var map = { '上上':'#C62828','上吉':'#E65100','中吉':'#FF9800','中平':'#4CAF50','下下':'#2196F3' };
  return map[level] || '#666';
};

/** 签文等级 → Emoji */
window.getFortuneLevelEmoji = function(level) {
  var map = { '上上':'🌟','上吉':'✨','中吉':'🍀','中平':'🌿','下下':'💧' };
  return map[level] || '📋';
};

/** 记录今日抽签 (localStorage) */
window.saveTodayDraw = function(fortune) {
  Storage.set('dailyDrawDate', getTodayStr());
  Storage.set('dailyFortune', fortune);
};

/** 检查今日是否已抽 */
window.hasDrawnToday = function() {
  return Storage.get('dailyDrawDate') === getTodayStr();
};

/** 获取今日缓存签文 */
window.getTodayCachedFortune = function() {
  if (!hasDrawnToday()) return null;
  return Storage.get('dailyFortune');
};
