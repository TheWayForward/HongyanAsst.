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
    date_start: time_helper.get_time_for_picker(0),
    date_start_tomorrow: time_helper.get_time_for_picker(1),
    date_end: time_helper.get_time_for_picker(9),
    date_end_tomorrow: time_helper.get_time_for_picker(10),
    rental_date_start: "请选择日期",
    rental_date_end: "请选择日期",
    rental_duration: 0,
    bicycle_image_opacity: 1,
    bicycle_image_scale: 1,
    bicycle_image_border_radius: 20,
    is_mine: false,
    is_hide: true,
    show_top: true
  },

  onLoad: function (options) {
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

  bind_rental_date_start_change: function (e) {
    var that = this;
    if (that.data.rental_date_end != "请选择日期" && time_helper.set_date_from_string(that.data.rental_date_end) - time_helper.set_date_from_string(e.detail.value) < 86400000) {
      notification_helper.show_toast_without_icon("起始日期不可晚于归还日期",2000);
      return;
    }
    if (that.data.rental_date_end == "请选择日期"){
      wx.pageScrollTo({
        selector: "#date_end",
        duration: 500
      })
    }
    that.setData({
      rental_date_start: e.detail.value,
      date_start_tomorrow: time_helper.get_time_tomorrow_for_picker(e.detail.value),
      rental_duration: Math.floor((time_helper.set_date_from_string(that.data.rental_date_end) - time_helper.set_date_from_string(e.detail.value)) / 86400000)
    })
  },

  bind_rental_date_end_change: function (e) {
    var that = this;
    if (time_helper.set_date_from_string(e.detail.value) - time_helper.set_date_from_string(that.data.rental_date_start) < 86400000) {
      notification_helper.show_toast_without_icon("归还日期不可早于起始日期",2000);
      return;
    }
    that.setData({
      rental_date_end: e.detail.value,
      rental_duration: Math.floor((time_helper.set_date_from_string(e.detail.value) - time_helper.set_date_from_string(that.data.rental_date_start)) / 86000000)
    })
    wx.pageScrollTo({
      selector: "#end",
      duration: 500,
    })
  },

  submit: function (e) {
    var that = this;
    app.globalData.my_transaction = {
      type: "rental",
      rental_date_start: that.data.rental_date_start,
      rental_date_end: that.data.rental_date_end,
      owner: {
        _id: that.data.user._id,
        openid: that.data.user.openid,
        realname: that.data.user.realname,
        birthday: that.data.user.birthday,
        avatar: that.data.user.avatar
      },
      owner_openid: that.data.user.openid,
      owner__id: that.data.user._id,
      renter: {
        _id: app.globalData.user._id,
        openid: app.globalData.user.openid,
        realname: app.globalData.user.realname,
        birthday: app.globalData.user.birthday,
        avatar: app.globalData.user.avatar
      },
      renter_openid: app.globalData.user.openid,
      renter__id: app.globalData.user._id,
      bicycle: that.data.bicycle
    }
    wx.navigateTo({
      url: '../bicycle_for_rent_detail/bicycle_rental_confirm/bicycle_rental_confirm',
    })
  }
})