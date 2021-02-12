const db = wx.cloud.database();
const app = getApp();
var time_helper = require("../../utils/helpers/time_helper");
const versatile_helper = require("../../utils/helpers/versatile_helper");

Page({

  /**
   * Page initial data
   */
  data: {
    user: {
      avatar: "../../images/loading.gif"
    },
    show_top: true,
    watcher: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      user: versatile_helper.format_user(app.globalData.user),
    })
    wx.setNavigationBarTitle({
      title: `${that.data.user.nickname}`,
    })
    that.data.watcher = db.collection("user").where({
      openid: app.globalData.user.openid
    }).watch({
      onChange(e) {
        app.globalData.user = e.docChanges[0].doc;
        that.setData({
          user: versatile_helper.format_user(e.docChanges[0].doc)
        })
      },
      onError(e) {}
    })
  },

  onPageScroll: function (e) {
    if (e.scrollTop > 500) {
      this.setData({
        show_top: false
      })
    } else {
      //to top icon shown
      this.setData({
        show_top: true
      })
    }
  },

  go_top: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },

  onHide: function () {
    this.data.watcher.close();
  },

  onUnload: function () {
    this.data.watcher.close();
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  //update user info page
  goto_user_profile_update: function () {
    wx.navigateTo({
      url: '../user_profile/user_profile_update/user_profile_update',
    })
  },

  goto_user_bicycle_manage: function () {
    var that = this;
    if (!that.data.user.my_bicycle.length) {
      wx.navigateTo({
        url: '../../pages/user_profile/user_bicycle_add/user_bicycle_add',
      })
    } else {
      wx.navigateTo({
        url: '../../pages/user_profile/user_bicycle_manage/user_bicycle_manage',
      })
    }
  },

  //go to event page after getting the corresponded event
  goto_event: function (e) {
    var event_tapped = e.currentTarget.dataset.action;
    db.collection("events").where({
      _id: event_tapped._id
    }).get({
      success: function (res) {
        app.globalData.event = versatile_helper.format_event(res.data[0]);
        wx.navigateTo({
          url: '../../pages/eventlist/event/event',
        })
      }
    })
  },

  goto_eventlist: function () {
    wx.navigateTo({
      url: '../eventlist/eventlist',
    })
  }
})