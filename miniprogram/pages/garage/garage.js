const app = getApp();
const db = wx.cloud.database();

Page({

  data: {

  },

  onLoad: function (options) {

  },

  goto_bicycle_for_rent_list: function () {
    wx.navigateTo({
      url: '../garage/bicycle_for_rent_list/bicycle_for_rent_list'
    })
  },

  goto_bicycle_for_sell_list: function () {
    wx.navigateTo({
      url: '../garage/bicycle_for_sell_list/bicycle_for_sell_list'
    })
  },

  goto_my_transactions: function () {
    if (!app.globalData.user._id) {
      wx.showModal({
        title: "提示",
        content: "注册后即可查看车辆详情，立即注册？",
        confirmText: "确定",
        cancelText: "取消",
        success(res) {
          if (res.cancel) return;
          else {
            wx.navigateTo({
              url: '../register/register',
            })
          }
        }
      })
      return;
    }
    wx.navigateTo({
      url: '../garage/my_transactions/my_transactions'
    })
  }

})