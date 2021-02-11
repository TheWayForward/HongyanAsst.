const app = getApp();
const db = wx.cloud.database();

Page({

  data: {
    event_release_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEFVEAe1Zx8T.YFcxIBPd5HKaBwxvsuOFulq*dsjyCz4UhKQKQJkxJxGL.JCbXlW4hqKJm20pCPIVsCiDnJl4Vb0!/b&bo=uAEXArgBFwIDFzI!&rf=viewer_4",
    article_release_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEH2K2.By3Y8E6vf8rIW4oEREYe3v0EViWw42lsUTv4XXy2kCae.HGP6tRIwS6oIvinps4SuSthj*EZUvh8yqeFc!/b&bo=uAEtArgBLQIDFzI!&rf=viewer_4",
    progress_release_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEOV7NPoKMog4eJplmn33VRXOgqh6WY70bVJWtWGBBFYb4H*dSBMjUMEFH1alQNPQdFu5hmWWdWKRvn2Ti406ppE!/b&bo=uAEtArgBLQIDFzI!&rf=viewer_4",
    device_manage_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEGdYicdZDbAD54iLhALqnp*vQJ7ttNetvavsq14NIR5FyqVbrlUogYKPgdGftaE*jlow2CXXwlyPljq7qLug74g!/b&bo=uAEtArgBLQIDFzI!&rf=viewer_4",
    index_info_manage_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEIHCFCOpD59CMGeChskelLc*TbM1ZmncLFqH0KZxCxqqb5xyHB6d0dGl3rN2eeaAVhIEQpmZ9ixLkfN*Vy8eE6c!/b&bo=owEXAqMBFwIDFzI!&rf=viewer_4",
    bicycle_censorship_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEGDPLQiAYLqRmBxu8mNV*b.2FGBkDBausrtspiJb.aar1CpHmRCA683oGQ5ykflT1G*IWC.zMcOMggo4Js2sp8Y!/b&bo=owEYAqMBGAIDFzI!&rf=viewer_4",
    bicycle_monitor_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrELFcnEFNQebRWSI1GPESU6H0tozm5dGUPc66FMNPG7GPt4rZNsE0YYTMlA9L3Z1pX2prN4G8Cuese*lSm9fxRSc!/b&bo=owEUAqMBFAIDFzI!&rf=viewer_4"

  },

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