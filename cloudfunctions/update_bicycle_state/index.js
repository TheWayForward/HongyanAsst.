const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database()
const com = db.command

exports.main = async (event, context) => {
  return await db.collection('bicycles').doc(event._id).update({
    data: {
      is_available: event.my_availability_state,
      is_locked: event.my_lock_state,
      is_rentable: event.my_rent_state
    }
  })
}