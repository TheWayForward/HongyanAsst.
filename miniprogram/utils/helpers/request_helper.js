var current_port = "6060";

function select_bicycle_by_id(id) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `http://82.156.64.201:${current_port}/select_by_id?id=${id}`,
      method: "GET",
      data: {
        'content-type': 'application/json'
      },
      success(res) {
        resolve({
          result: res
        })
      },
      fail(res) {
        reject({})
      }
    })
  })
}

function add_bicycle() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `http://82.156.64.201:${current_port}/insert?`,
      method: 'GET',
      data: {
        'content-type': 'application/json'
      },
      success(res) {
        resolve({
        })
      },
      fail(res) {
        reject({
        })
      }
    })
  })
}

module.exports = {
  select_bicycle_by_id: select_bicycle_by_id
}