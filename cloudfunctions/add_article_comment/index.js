//adding comment for articles
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()

exports.main = async (event, context) => {
  return await new Promise((resolve, reject) => {
    db.collection('articles').doc(event.taskId).update({
      data: {
        comment: event.my_comment,
        comment_count: event.my_comment_count
      }
    })
  })
}