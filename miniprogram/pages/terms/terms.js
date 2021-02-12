const app = getApp();
const db = wx.cloud.database();
const notification_helper = require("../../utils/helpers/notification_helper");
var verification_helper = require("../../utils/helpers/verification_helper");

Page({

  data: {
    is_hide: true,
    hnode: []
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '使用条款',
    })
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    db.collection("basic").doc("terms").get({
      success(res) {
        that.setData({
          hnode: [{
            _id: "1",
            index_id: "1",
            node: res.data.node
          }],
          is_hide: false
        })
        wx.hideLoading({})
      }
    })
  },

  

})