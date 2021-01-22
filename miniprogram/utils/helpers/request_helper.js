var current_port = "6060";
var protocol = "http"

function select_bicycle_by_id(id) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${protocol}://82.156.64.201:${current_port}/select_by_id?id=${id}`,
      method: "GET",
      data: {
        'content-type': 'application/json'
      },
      success(res) {
        resolve(res.data.split("\n"))
      },
      fail(res) {
        reject({})
      }
    })
  })
}

function add_bicycle(bicycle) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${protocol}://82.156.64.201:${current_port}/insert?bicycle_name=${bicycle.bicycle_name}&id=${bicycle.bicycle_id}&seller_name=${bicycle.seller_name}&seller_id=${bicycle.seller_id}&status=${bicycle.status}&brand=${bicycle.brand}&type=${bicycle.type}&price=${bicycle.price}&manufacture_time=${bicycle.manufacture_time}`,
      method: 'GET',
      data: {
        'content-type': 'application/json'
      },
      success(res) {
        resolve(res)
      },
      fail(res) {
        reject({
        })
      }
    })
  })
}

module.exports = {
  select_bicycle_by_id: select_bicycle_by_id,
  add_bicycle: add_bicycle
}