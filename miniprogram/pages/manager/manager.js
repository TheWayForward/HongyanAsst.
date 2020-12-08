const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    console.log(app.globalData.wechat_version_min);
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
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