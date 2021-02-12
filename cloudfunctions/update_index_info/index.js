const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await db.collection('basic').doc(event._id).update({
    data: {
      content: event.content,
      modifier: event.modifier
    }
  })
}