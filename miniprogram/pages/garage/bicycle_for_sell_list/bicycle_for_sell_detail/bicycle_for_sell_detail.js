const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../../utils/helpers/compare_helper");
var time_helper = require("../../../../utils/helpers/time_helper");
var verification_helper = require("../../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../../utils/helpers/notification_helper");

Page({

  data: {
    bicycle: {},
    user: {
      avatar: "../../../../images/loading.gif",
      nickname: "加载中",
      realname: "加载中"
    },
    bicycle_image_opacity: 1,
    bicycle_image_scale: 1,
    bicycle_image_border_radius: 20,
    is_mine: false,
    is_hide: true,
    is_sale_options_hide: true,
    show_top: true
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: app.globalData.my_bicycle.name,
    })
    wx.showLoading({
      title: "加载中",
      mask: true
    })
    var that = this;
    db.collection("bicycles").doc(app.globalData.my_bicycle._id).get({
      success(result) {
        db.collection("user").doc(app.globalData.my_bicycle.owner._id).field({
          QQ: true,
          openid: true,
          avatar: true,
          birthday: true,
          campus: true,
          credit: true,
          detail: true,
          dept: true,
          my_transactions: true,
          email: true,
          is_manager: true,
          nickname: true,
          realname: true,
          my_bicycle: true,
          tel: true,
          total_distance: true,
        }).get({
          success(res) {
            result.data.date_time = time_helper.format_time(result.data.time_created).date_time;
            result.data.distance_string = result.data.distance.toFixed(2);
            res.data.birthday_string = time_helper.format_time(res.data.birthday).date;
            res.data.distance = res.data.total_distance.toFixed(2);
            that.setData({
              bicycle: result.data,
              user: res.data,
              is_mine: res.data.openid == app.globalData.user.openid ? true : false,
              is_sale_options_hide: (res.data.openid == app.globalData.user.openid || result.data.renter.renter_id) ? true : false,
              is_hide: false
            })
            wx.hideLoading({})
          }
        })
      }
    })
  },

  onPageScroll: function (e) {
    var that = this;
    that.setData({
      bicycle_image_opacity: e.scrollTop < 300 ? 1 - e.scrollTop / 300 : 0,
      bicycle_image_scale: e.scrollTop < 300 ? 1 + e.scrollTop / 300 : 2,
      bicycle_image_border_radius: e.scrollTop < 300 ? 20 + e.scrollTop : 320,
      show_top: e.scrollTop > 500 ? false : true
    })
  },

  onShareTimeline(res) {
    var that = this;
    return {
      title: `鸿雁车库：${that.data.bicycle.name}售卖中！`,
      path: '../bicycle_for_sell_detail/bicycle_for_sell_detail',
      imageUrl: that.data.bicycle.poster
    }
  },

  onShareAppMessage: function (ops) {
    var that = this;
    return {
      title: `鸿雁车库：${that.data.bicycle.name}售卖中！`,
      path: '../bicycle_for_sell_detail/bicycle_for_sell_detail',
    }
  },

  go_top: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  share: function () {
    notification_helper.show_toast_without_icon('点击右上角"..."进行分享',2000);
  },

  submit: function (e) {
    var that = this;
    if (!app.globalData.user._id) {
      notification_helper.show_toast_without_icon("请注册后进行交易",2000);
      return;
    }
    app.globalData.my_transaction = {
      type: "sale",
      seller: {
        _id: that.data.user._id,
        openid: that.data.user.openid,
        realname: that.data.user.realname,
        birthday: that.data.user.birthday,
        avatar: that.data.user.avatar
      },
      seller_openid: that.data.user.openid,
      seller_id: that.data.user._id,
      seller_transactions: that.data.user.my_transactions,
      buyer: {
        _id: app.globalData.user._id,
        openid: app.globalData.user.openid,
        realname: app.globalData.user.realname,
        birthday: app.globalData.user.birthday,
        avatar: app.globalData.user.avatar
      },
      buyer_openid: app.globalData.user.openid,
      buyer_id: app.globalData.user._id,
      bicycle: that.data.bicycle
    }
    wx.navigateTo({
      url: '../bicycle_for_sell_detail/bicycle_sale_confirm/bicycle_sale_confirm',
    })
  }
})