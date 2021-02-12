const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");


Page({

  data: {
    id: "加载中",
    name: "",
    deviceid: "",
    apikey: "",
    devices: [],
    is_submission_available: false
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '设备管理',
    })
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var batchTimes;
    var count = db.collection("devices").count();
    count.then(function (result) {
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],
        x = 0;
      for (var i = 0; i < batchTimes; i++) {
        db.collection("devices").skip(i * 20).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
              x++;
              if (x == batchTimes) {
                arrayContainer.sort(compare_helper.compare("_id"));
                that.setData({
                  devices: arrayContainer,
                  id: "" + ++count,
                  is_submission_available: true
                })
                wx.hideLoading({
                  complete: (res) => {},
                })
              }
            }
          }
        })
      }
    })
  },

  input_name: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  input_deviceid: function (e) {
    this.setData({
      deviceid: e.detail.value
    })
  },

  input_apikey: function (e) {
    this.setData({
      apikey: e.detail.value
    })
  },

  submit: function () {
    var that = this;
    if (!that.data.name) {
      notification_helper.show_toast_without_icon("未填写设备名称", 2000);
      return;
    }
    if (!that.data.deviceid) {
      notification_helper.show_toast_without_icon("未填写DeviceId", 2000);
      return;
    }
    if (!that.data.apikey) {
      notification_helper.show_toast_without_icon("未填写APIKey", 2000);
      return;
    }
    wx.showModal({
      title: '提示',
      content: `确定添加设备"${that.data.name}"吗？`,
      cancelText: '取消',
      confirmText: '确定',
      success: function (res) {
        if (res.cancel) {
          return;
        } else {
          that.setData({
            is_submission_available: false
          })
          wx.showLoading({
            title: '设备添加中',
          })
          db.collection("devices").add({
            data: {
              _id: that.data.id,
              name: that.data.name,
              deviceid: that.data.deviceid,
              apikey: that.data.apikey,
            },
            success: function (res) {
              wx.hideLoading({
                complete: (res) => {
                  wx.showToast({
                    title: '设备添加成功',
                    duration: 2000,
                    success: function (res) {
                      wx.reLaunch({
                        url: '../../manager/manager',
                      })
                    }
                  })
                },
              })
            }
          })
        }
      }
    })
  }
})