const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  try {
    return await db.collection('user').where({
      openid: event.openid
    }).update({
      data: {
        campus: event.my_campus,
        dept: event.my_dept,
        nickname: event.my_nickname,
        QQ: event.my_QQ,
        tel: event.my_tel,
        detail: event.my_detail,
        avatar: event.my_avatar,
        email: event.my_email,
        last_modified: event.my_last_modified
      }
    })
      .then(console.log)
      .catch(console.error)
  } catch (e) {
    console.error(e)
  }
}