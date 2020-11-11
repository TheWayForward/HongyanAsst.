//adding comment for articles
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await new Promise((resolve, reject) => {
    db.collection('articles').doc(event.taskId).update({
      data: {
        comment: event.my_comment
      }
    })
  })
}