//adding participant for the corresponded event
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await new Promise((resolve, reject) => {
    db.collection('events').doc(event.taskId).update({
      data: {
        participants: event.my_participants,
        participants_count: event.my_participants_count
      }
    })
  })
}