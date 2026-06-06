/**
 * 收藏/取消收藏占卜结果
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { historyId, isFavorite } = event;

  try {
    await db.collection('divination_history')
      .where({ _id: historyId, openid })
      .update({
        data: { isFavorite },
      });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
