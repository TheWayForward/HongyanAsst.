const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    en: "loading...",
    ch: "加载中...",
    articles: [],
    search_articles: [],
    showTop: true,
    isHide: true,
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif" crossorigin="anonymous" data-w="1080" data-type="jpeg" data-src="https://mmbiz.qpic.cn/mmbiz_jpg/VzFuMauwoqTc6bRD4ibOr9ib60UjMDe4jLVkxsI8zYVAibUfFdEibricL0C3fwrIFJlWCIAsZ0yULMvJgZggtOniaqGA/640?wx_fmt=jpeg" data-ratio="0.3740741" _width="862px" data-fail="0">'
    }, ],
  },

  onLoad: function () {},

  onShow: function () {
    var that = this;

    function refresh() {
      if (app.globalData.user) {
        that.setData({
          ch: "欢迎使用测试版。",
          en: "Welcome."
        })
      } else {
        that.setData({
          ch: '点击"账户系统"进行注册，方可使用。',
          en: "Sign up before using."
        })
      }
    }
    setTimeout(refresh, 5000);
  },

  onPageScroll: function (e) {
    if (e.scrollTop > 500) {
      this.setData({
        showTop: false
      })
    } else {
      this.setData({
        showTop: true
      })
    }
  },

  showinfo: function () {
    console.log(this.data.articles);
  },

  preview: function (e) {
    wx.previewImage({
      current: e.target.dataset.action,
      urls: [e.target.dataset.action]
    })
  },

  getUserInfo: function () {
    var that = this;
    wx.login({
      success: res => {}
    })
    wx.getSetting({
        success: function (res) {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {}
            })
          } else {

            wx.showToast({
              title: '⊗您拒绝了授权',
              icon: 'none'
            })
          }
        }
      }),

      function _getUserInfo() {
        wx.getUserInfo({
          success: function (res) {
            console.log(res.data);
          }
        })
      }
  },

  goTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  goto_articlelist: function () {
    wx.navigateTo({
      url: '../../pages/articlelist/articlelist',
    })
  },

  goto_gallery: function () {
    wx.showToast({
      title: '页面建设中！',
      icon: 'none'
    })
  },

  goto_user_profile: function () {
    if (!app.globalData.data_status) {
      wx.showToast({
        title: '暂未获取到用户信息',
        icon: "none"
      })
    } else {
      wx.navigateTo({
        url: '../../pages/user_profile/user_profile',
      })
    }
  },

  goto_eventlist: function () {
    if (!app.globalData.user) {
      wx.showToast({
        title: '暂未获取到用户信息',
        icon: "none"
      })
    } else {
      wx.navigateTo({
        url: '../../pages/eventlist/eventlist',
      })
    }
  },

  goto_manager: function () {
    if (!app.globalData.user) {
      wx.showToast({
        title: '暂未获取到用户信息',
        icon: "none"
      })
    } else {
      if (!app.globalData.user.is_manager) {
        wx.showToast({
          title: '未授权管理员',
          icon: 'none'
        })
      } else {
        wx.navigateTo({
          url: '../manager/manager',
        })
      }
    }
  },

  goto_chatroom: function () {
    wx.showToast({
      title: '页面建设中！',
      icon: 'none'
    })
  },

  goto_locationtest: function () {
    wx.navigateTo({
      url: '../../pages/locationtest/index',
    })
  }
})