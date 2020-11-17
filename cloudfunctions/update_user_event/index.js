//add or delete the event user participated

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
        my_event: event.my_event
      }
    })
      .then(console.log)
      .catch(console.error)
  } catch (e) {
    console.error(e)
  }
}