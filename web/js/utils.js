/**
 * 闲云一卜 — 通用工具函数
 */

var Storage = {
  get: function(key, defaultValue) {
    if (defaultValue === undefined) defaultValue = null;
    try {
      var val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch(e) { return defaultValue; }
  },
  set: function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: function(key) {
    localStorage.removeItem(key);
  }
};

function showToast(msg, duration) {
  if (!duration) duration = 2000;
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, duration);
}

function showModal(opts) {
  var title = opts.title || '';
  var content = opts.content || '';
  var onConfirm = opts.onConfirm;
  var onCancel = opts.onCancel;
  var confirmText = opts.confirmText || '确定';
  var cancelText = opts.cancelText || '取消';

  var modal = document.getElementById('modal');
  if (!modal) return;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = content;
  document.getElementById('modal-confirm').textContent = confirmText;
  document.getElementById('modal-cancel').textContent = cancelText;
  modal.style.display = 'flex';

  function close() { modal.style.display = 'none'; }

  document.getElementById('modal-confirm').onclick = function() { close(); if (onConfirm) onConfirm(); };
  document.getElementById('modal-cancel').onclick = function() { close(); if (onCancel) onCancel(); };
}

function getTodayStr() {
  var now = new Date();
  var y = now.getFullYear();
  var m = String(now.getMonth() + 1);
  if (m.length < 2) m = '0' + m;
  var d = String(now.getDate());
  if (d.length < 2) d = '0' + d;
  return y + '-' + m + '-' + d;
}

function formatTime(ts) {
  var d = new Date(ts);
  var m = String(d.getMonth() + 1);
  if (m.length < 2) m = '0' + m;
  var day = String(d.getDate());
  if (day.length < 2) day = '0' + day;
  var h = String(d.getHours());
  if (h.length < 2) h = '0' + h;
  var min = String(d.getMinutes());
  if (min.length < 2) min = '0' + min;
  return m + '-' + day + ' ' + h + ':' + min;
}

function esc(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderPage(html) {
  var content = document.getElementById('page-content');
  if (!content) return;
  content.classList.add('switching');
  setTimeout(function() {
    content.innerHTML = html;
    content.classList.remove('switching');
    window.scrollTo(0, 0);
    setTimeout(function() {
      var cards = content.querySelectorAll('.stagger-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.animationDelay = (i * 0.08) + 's';
      }
    }, 50);
  }, 200);
}

function celebrate() {
  var container = document.createElement('div');
  container.className = 'confetti-container';
  var colors = ['#C62828','#FFD700','#FF9800','#4CAF50','#2196F3','#E91E63'];
  for (var i = 0; i < 40; i++) {
    var confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = -(Math.random() * 40) + 'px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 1.5 + 's';
    confetti.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    confetti.style.width = (6 + Math.random() * 8) + 'px';
    confetti.style.height = (6 + Math.random() * 8) + 'px';
    container.appendChild(confetti);
  }
  document.body.appendChild(container);
  setTimeout(function() { container.remove(); }, 4000);
}

function setActiveTab(tab) {
  var items = document.querySelectorAll('#tab-bar .tab-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.remove('active');
  }
  var el = document.querySelector('[data-tab="' + tab + '"]');
  if (el) el.classList.add('active');
}
