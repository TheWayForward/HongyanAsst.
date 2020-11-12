//adding comment for articles
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await new Promise((resolve, reject) => {
    db.collection('events').doc(event.taskId).update({
      data: {
        snapshots: event.my_snapshot
      }
    })
  }).then(console.log("[update_snapshots][updated successfully]"))
}