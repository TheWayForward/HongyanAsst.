const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");

Page({

  data: {
    user: {}
  },

  onLoad: function(){
    var that = this;
    that.setData({
      user: app.globalData.user
    })
  }

})