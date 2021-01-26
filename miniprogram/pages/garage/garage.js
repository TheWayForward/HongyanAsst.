// pages/garage/garage.js
Page({

  data: {

  },

  onLoad: function (options) {

  },

  goto_bicycle_for_rent_list: function () {
    wx.navigateTo({
      url: '../garage/bicycle_for_rent_list/bicycle_for_rent_list',
    })
  },

  goto_bicycle_for_sell_list: function () {
    wx.navigateTo({
      url: '../garage/bicycle_for_sell_list/bicycle_for_sell_list',
    })
  }

})