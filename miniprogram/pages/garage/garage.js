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
    wx.navigateTo({
      url: '../garage/my_transactions/my_transactions'
    })
  }

})