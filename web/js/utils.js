/**
 * 闲云一卜 — 通用工具函数
 */

// ═══ Storage ═══
const Storage = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch { return defaultValue; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

// ═══ Toast ═══
function showToast(msg, duration = 2000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ═══ Modal ═══
function showModal({ title, content, onConfirm, onCancel, confirmText = '确定', cancelText = '取消' }) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = content;
  document.getElementById('modal-confirm').textContent = confirmText;
  document.getElementById('modal-cancel').textContent = cancelText;

  modal.style.display = 'flex';

  const close = () => { modal.style.display = 'none'; };

  document.getElementById('modal-confirm').onclick = () => { close(); if (onConfirm) onConfirm(); };
  document.getElementById('modal-cancel').onclick = () => { close(); if (onCancel) onCancel(); };
}

// ═══ 日期工具 ═══
function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(ts) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}-${day} ${h}:${min}`;
}

// ═══ HTML 转义 ═══
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══ 渲染页面（带过渡动画） ═══
function renderPage(html) {
  var content = document.getElementById('page-content');
  content.classList.add('switching');
  setTimeout(function() {
    content.innerHTML = html;
    content.classList.remove('switching');
    window.scrollTo(0, 0);
    // 触发错落动画
    setTimeout(function() {
      var cards = content.querySelectorAll('.stagger-card');
      cards.forEach(function(c, i) { c.style.animationDelay = (i * 0.08) + 's'; });
    }, 50);
  }, 200);
}

// ═══ 撒花庆祝（上上签/大吉时触发） ═══
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

// ═══ 高亮当前 tab ═══
function setActiveTab(tab) {
  document.querySelectorAll('#tab-bar .tab-item').forEach(el => el.classList.remove('active'));
  const el = document.querySelector(`[data-tab="${tab}"]`);
  if (el) el.classList.add('active');
}
