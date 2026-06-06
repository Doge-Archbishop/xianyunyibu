/**
 * 每日抽签服务
 */

import type { FortuneStick } from './types';

/** 签文数据缓存 */
let fortunesCache: FortuneStick[] | null = null;

/**
 * 加载签文数据
 */
function loadFortunes(): FortuneStick[] {
  if (fortunesCache) return fortunesCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fortunesCache = require('../data/daily-fortunes.json');
  } catch {
    fortunesCache = [];
  }
  return fortunesCache!;
}

/**
 * 随机抽取一支签
 * @returns 签文对象
 */
export function drawFortune(): FortuneStick | null {
  const fortunes = loadFortunes();
  if (fortunes.length === 0) return null;

  const index = Math.floor(Math.random() * fortunes.length);
  return fortunes[index];
}

/**
 * 根据签号获取签文
 * @param id 签号 (1-100)
 */
export function getFortuneById(id: number): FortuneStick | null {
  const fortunes = loadFortunes();
  return fortunes.find(f => f.id === id) || null;
}

/**
 * 获取所有签文
 */
export function getAllFortunes(): FortuneStick[] {
  return loadFortunes();
}

/**
 * 根据签等筛选签文
 */
export function getFortunesByLevel(level: string): FortuneStick[] {
  const fortunes = loadFortunes();
  return fortunes.filter(f => f.level === level);
}

/**
 * 获取签文等级的颜色
 */
export function getFortuneLevelColor(level: string): string {
  const colorMap: Record<string, string> = {
    '上上': '#C62828', // 红
    '上吉': '#E65100', // 橙红
    '中吉': '#FF9800', // 橙
    '中平': '#4CAF50', // 绿
    '下下': '#2196F3', // 蓝
  };
  return colorMap[level] || '#666666';
}

/**
 * 获取签文等级的emoji
 */
export function getFortuneLevelEmoji(level: string): string {
  const emojiMap: Record<string, string> = {
    '上上': '🌟',
    '上吉': '✨',
    '中吉': '🍀',
    '中平': '🌿',
    '下下': '💧',
  };
  return emojiMap[level] || '📋';
}

/**
 * 记录今日抽签（本地存储）
 */
export function saveTodayDraw(fortune: FortuneStick): void {
  const today = getTodayStr();
  wx.setStorageSync('dailyDrawDate', today);
  wx.setStorageSync('dailyFortune', fortune);
}

/**
 * 检查今日是否已抽签（本地）
 */
export function hasDrawnToday(): boolean {
  const today = getTodayStr();
  const cached = wx.getStorageSync('dailyDrawDate');
  return cached === today;
}

/**
 * 获取今日缓存的签文
 */
export function getTodayCachedFortune(): FortuneStick | null {
  if (!hasDrawnToday()) return null;
  return wx.getStorageSync('dailyFortune') || null;
}

/**
 * 获取今天的日期字符串
 */
function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
