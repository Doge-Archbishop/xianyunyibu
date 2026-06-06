/**
 * 检查今日是否已抽签
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const today = event.date || getTodayStr();

  const result = await db.collection('daily_draws')
    .where({ openid, drawDate: today })
    .limit(1)
    .get();

  return {
    drawn: result.data.length > 0,
    fortuneId: result.data.length > 0 ? result.data[0].fortuneId : null,
    date: today,
  };
};

function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
