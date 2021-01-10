const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  try {
    return await db.collection('user').where({
      openid: event.openid
    }).update({
      data: {
        my_snapshots: event.my_snapshots
      }
    })
      .then(console.log)
      .catch(console.error)
  } catch (e) {
    console.error(e)
  }
}