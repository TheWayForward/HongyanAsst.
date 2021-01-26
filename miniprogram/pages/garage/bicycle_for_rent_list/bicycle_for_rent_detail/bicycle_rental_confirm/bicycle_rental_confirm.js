const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../../../utils/helpers/compare_helper");
var time_helper = require("../../../../../utils/helpers/time_helper");
var verification_helper = require("../../../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../../../utils/helpers/notification_helper");

Page({

  data: {

  },

  onLoad: function (options) {
    console.log(app.globalData.my_transaction);
  },

})