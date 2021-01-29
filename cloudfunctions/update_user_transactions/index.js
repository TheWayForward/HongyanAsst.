const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await db.collection('user').doc(event._id).update({
    data: {
      my_transactions: event.my_transactions,
    }
  })
}