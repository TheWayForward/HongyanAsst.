const app = getApp();
const db = wx.cloud.database();

Page({

  data: {},

  onLoad: function (options) {},


  goto_event_release: function () {
    wx.navigateTo({
      url: '../manager/event_release/event_release',
    })
  },

  goto_article_release: function () {
    wx.navigateTo({
      url: '../manager/article_release/article_release',
    })
  },

  goto_progress_release: function () {
    wx.navigateTo({
      url: '../manager/progress_release/progress_release',
    })
  },

  goto_device_manage: function () {
    wx.navigateTo({
      url: '../manager/device_manage/device_manage',
    })
  },

  goto_index_info_manage: function () {
    wx.navigateTo({
      url: '../manager/index_info_manage/index_info_manage',
    })
  },

  goto_bicycle_censorship: function () {
    wx.navigateTo({
      url: '../manager/bicycle_censorship/bicycle_censorship',
    })
  },

  goto_bicycle_monitor: function () {
    wx.navigateTo({
      url: '../manager/bicycle_monitor/bicycle_monitor',
    })
  }
})