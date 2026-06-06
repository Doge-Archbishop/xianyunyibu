/**
 * 道易 — 通用工具函数
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

// ═══ 渲染页面 ═══
function renderPage(html) {
  document.getElementById('page-content').innerHTML = html;
  // 滚动到顶部
  window.scrollTo(0, 0);
}

// ═══ 高亮当前 tab ═══
function setActiveTab(tab) {
  document.querySelectorAll('#tab-bar .tab-item').forEach(el => el.classList.remove('active'));
  const el = document.querySelector(`[data-tab="${tab}"]`);
  if (el) el.classList.add('active');
}
