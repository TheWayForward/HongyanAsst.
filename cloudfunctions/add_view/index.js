const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  try {
    return await db.collection('articles').doc(event.taskId).update({
      data: {
        view: event.view
      }
    })
      .then(console.log)
      .catch(console.error)
  } catch (e) {
    console.error(e)
  }
}