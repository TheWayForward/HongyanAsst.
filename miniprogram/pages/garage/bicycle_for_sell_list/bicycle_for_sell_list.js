const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var verification_helper = require("../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");

Page({

  data: {
    bicycles_for_sell: [],
    search_bicycles_for_sell_1: [],
    search_bicycles_for_sell_2: [],
    is_hide: true,
    watcher: 0
  },

  onLoad: function (options) {
    wx.showLoading({
      title: "加载中",
      mask: true
    })
    var that = this;
    var batchTimes;
    //bicycles for rent
    var count = db.collection("bicycles").where({
      is_available: true,
      is_locked: false,
      is_sellable: true,
    }).count();
    count.then(function (result) {
      count = result.total;
      if (!count) {
        wx.hideLoading({})
      }
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],
        arrayContainer1 = [],
        arrayContainer2 = [],
        x = 0;
      for (var i = 0; i < batchTimes; i++) {
        db.collection("bicycles").skip(i * 20).where({
          is_available: true,
          is_locked: false,
          is_sellable: true,
        }).field({
          _id: true,
          brand: true,
          name: true,
          poster: true,
          time_created: true,
          type: true,
          owner: true,
          renter: true
        }).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
            }
            x++;
            if (x == batchTimes) {
              for (var i = 0; i < arrayContainer.length; i++) {
                arrayContainer[i].date = time_helper.format_time(arrayContainer[i].time_created).date;
              }
              arrayContainer.sort(compare_helper.compare("time_created")).reverse();
              for (var i = 0; i < arrayContainer.length; i++) {
                i % 2 ? arrayContainer1.push(arrayContainer[i]) : arrayContainer2.push(arrayContainer[i]);
              }
              that.setData({
                bicycles_for_sell: arrayContainer,
                search_bicycles_for_sell_1: arrayContainer1,
                search_bicycles_for_sell_2: arrayContainer2,
                is_hide: false,
              })
              wx.hideLoading({})
            }
          }
        })
      }
    })
  },

  onShow: function () {
    var that = this;
    that.setData({
      watcher: db.collection("bicycles").where({
        is_available: true,
        is_locked: false,
        is_sellable: true,
      }).watch({
        onChange(e) {
          that.onLoad();
        },
        onError(e) {

        }
      })
    })
  },

  onHide: function (e) {
    this.data.watcher.close();
  },

  onUnload: function (e) {
    this.data.watcher.close();
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  goto_bicycle_for_sell_detail: function (e) {
    if (!app.globalData.user._id) {
      wx.showModal({
        title: "提示",
        content: "注册后即可查看车辆详情，立即注册？",
        confirmText: "确定",
        cancelText: "取消",
        success(res) {
          if (res.cancel) return;
          else {
            wx.navigateTo({
              url: '../../register/register',
            })
          }
        }
      })
      return;
    }
    app.globalData.my_bicycle = e.currentTarget.dataset.action;
    wx.navigateTo({
      url: '../bicycle_for_sell_list/bicycle_for_sell_detail/bicycle_for_sell_detail',
    })
  }

})