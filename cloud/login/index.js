/**
 * 登录云函数 — 获取用户 openid
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const openid = wxContext.OPENID;

  // 查找或创建用户记录
  const userCollection = db.collection('users');
  const existing = await userCollection.where({ openid }).get();

  if (existing.data.length === 0) {
    await userCollection.add({
      data: {
        openid,
        createTime: new Date(),
        lastVisit: new Date(),
      },
    });
  } else {
    await userCollection.doc(existing.data[0]._id).update({
      data: { lastVisit: new Date() },
    });
  }

  return {
    openid,
    isNewUser: existing.data.length === 0,
  };
};
