const app = getApp();
const db = wx.cloud.database();

Page({

  data: {
  },

  onLoad: function (options) {
  },

  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },

  goto_event_release: function(){
    wx.navigateTo({
      url: '../manager/event_release/event_release',
    })
  },

  goto_article_release: function(){
    wx.navigateTo({
      url: '../manager/article_release/article_release',
    })
  },

  goto_progress_release: function(){
    wx.navigateTo({
      url: '../manager/progress_release/progress_release',
    })
  },

  goto_device_manage: function(){
    wx.navigateTo({
      url: '../manager/device_manage/device_manage',
    })
  },

  goto_bicycle_manage: function(){
    wx.navigateTo({
      url: '../manager/bicycle_manage/bicycle_manage',
    })
  }
})