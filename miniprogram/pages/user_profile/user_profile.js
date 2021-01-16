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
    isHide: false,
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
    that.data.watcher = db.collection("user").where({
      openid: app.globalData.user.openid
    }).watch({
      onChange(e){
        that.setData({
          user: versatile_helper.format_user(e.docChanges[0].doc)
        })
      },
      onError(e){}
    })
  },

  onShow: function () {
    
  },

  onUnload: function(){
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
  }
})