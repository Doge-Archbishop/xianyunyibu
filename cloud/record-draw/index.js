/**
 * 记录每日抽签结果（使用事务防止重复）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { fortuneId } = event;

  if (!fortuneId) {
    return { success: false, error: '缺少 fortuneId' };
  }

  const today = getTodayStr();

  try {
    // 使用事务确保原子性
    const transaction = await db.startTransaction();

    // 检查是否已抽
    const existing = await transaction.collection('daily_draws')
      .where({ openid, drawDate: today })
      .count();

    if (existing.total > 0) {
      await transaction.rollback();
      return { success: false, error: '今日已抽签' };
    }

    // 写入记录
    await transaction.collection('daily_draws').add({
      data: {
        openid,
        drawDate: today,
        fortuneId,
        createTime: new Date(),
      },
    });

    await transaction.commit();

    return { success: true, fortuneId, date: today };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
