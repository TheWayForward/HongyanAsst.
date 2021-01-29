const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await db.collection('transactions').doc(event._id).update({
    data: {
      is_valid: event.is_valid,
      is_expired: event.is_expired
    }
  })
}