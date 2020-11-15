//updating snapshots_count for the corresponded event
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await new Promise((resolve, reject) => {
    db.collection('events').doc(event.taskId).update({
      data: {
        snapshots_count: event.my_snapshot_count
      }
    })
  }).then(console.log("[update_snapshots][updated successfully]"))
}