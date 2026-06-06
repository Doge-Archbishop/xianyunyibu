/**
 * 获取占卜历史
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { limit = 20, skip = 0 } = event;

  try {
    const result = await db.collection('divination_history')
      .where({ openid })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get();

    return { success: true, data: result.data, total: result.data.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
