const app = getApp();
const db = wx.cloud.database();

Page({

  data: {
    bicycle_for_rent_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEITWAy*sa9.WkEB*tMCACvzTI*O2*s7jFIzXlRqbk6FGTfoRUeTsDj5q1Lctb1nRYdzwRwpeOJY9bX6*.T5zn90!/b&bo=wwJcAcMCXAEDFzI!&rf=viewer_4",
    bicycle_for_sell_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEKEs*Xv*TkANcUrjkuff0kwyhDRpu0NCQ*duB.tAE48GT6lNbJvua58E25UbE82OotFxio.GYdAE8Ink9j4Y1qw!/b&bo=wgJcAcICXAEDFzI!&rf=viewer_4",
    my_transactions_image: "http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEGuIVCAVtAi0rCemHfNJuizsfwKk*OIvwN6fevfaFeTOltDdylGacYre9C3fLRyDVKMgWA4b3sKQ.bK5RkMBHfA!/b&bo=wwJbAcMCWwEDFzI!&rf=viewer_4"
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '鸿雁车库',
    })
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