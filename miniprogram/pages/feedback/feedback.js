const app = getApp();
var notification_helper = require("../../utils/helpers/notification_helper");

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    chatRoomCollection: 'chatroom',
    chatRoomGroupId: 'all',
    chatRoomGroupName: '问题反馈',
    height: 0,

    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '问题反馈',
    })
    var that = this;
    this.setData({
      height: wx.getSystemInfoSync().screenHeight * 0.9
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(res) {
              that.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        } else {
          notification_helper.show_toast_without_icon("点击下方按钮登录，登录后可发送消息", 2000);
        }
      }
    })

    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })

    wx.getSystemInfo({
      success: res => {
        if (res.safeArea) {
          const {
            top,
            bottom
          } = res.safeArea
          this.setData({
            containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 10 : 20) + top}px; padding-bottom: ${20 + res.windowHeight - bottom}px`,
          })
        }
      },
    })
  },

  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  getOpenID: async function () {
    if (app.globalData.user.openid) {
      return this.openid
    } else return 0;
  },

  onShareAppMessage() {
    return {
      title: "北邮鸿雁车协助手-问题反馈",
      path: '../../pages/feedback/feedback',

    }
  },

  onShareTimeline(res) {
    return {
      title: `北邮鸿雁车协-问题反馈`,
      path: '../../pages/feedback/feedback',
      imageUrl: 'http://m.qpic.cn/psc?/V10ldMks1MA0AI/TmEUgtj9EK6.7V8ajmQrEM33fgSgkSqlV8rj43ChW*6aSuucHBR0gAUuojw3dksjcfwJBqSH4fDRpmZocAUGLjspMCKzVxSriPIaVR66mUs!/b&bo=WAFYAVgBWAEBFzA!&rf=viewer_4'
    }
  },
})