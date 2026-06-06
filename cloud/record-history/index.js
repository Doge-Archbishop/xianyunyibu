/**
 * 保存占卜历史记录
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { module, input, resultSummary } = event;

  try {
    const res = await db.collection('divination_history').add({
      data: {
        openid,
        module,
        input: input || {},
        resultSummary: resultSummary || '',
        createTime: new Date(),
        isFavorite: false,
      },
    });

    return { success: true, id: res._id };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
