const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../utils/helpers/compare_helper");
var notification_helper = require("../../utils/helpers/notification_helper");
var location_helper = require("../../utils/helpers/location_helper");

Page({
  data: {
    ch: "加载中...",
    showTop: true,
    isHide: true,
    //version check
    wechat_version: "",
    wechat_version_min: "",
    update_required: false,
    logo: "../../images/loading.gif",
    length: 0,
    window_width: 0,
    bulletin_text: "........................公告加载中........................",
    pace: 0.5,
    distance: 0,
    margin: 0,
    size: 25,
    interval: 15, 
  },

  onLoad: function () {


    var that = this;
    //get device system info, such as batterylevel, screen, system version, etc.
    wx.getSystemInfo({
      success(res) {
        app.globalData.system_info = res;
      }
    })

    //get dynamic info
    db.collection("basic").get({
      success: function (res) {
        app.globalData.miniprogram_version = res.data[0].version;
        app.globalData.wechat_version_min = res.data[1].version;
        app.globalData.cycling_animation = res.data[2].url;
        app.globalData.bulletin = res.data[3].content;
        that.setData({
          ch: compare_helper.compare_version(app.globalData.system_info.version, app.globalData.wechat_version_min) ? `微信当前版本${app.globalData.system_info.version}，建议升级至${app.globalData.wechat_version_min}以上版本。` : "欢迎使用测试版。",
          length: app.globalData.bulletin.length * that.data.size,
          window_width: wx.getSystemInfoSync().windowWidth,
          logo: "cloud://hongyancrew-pvmj1.686f-hongyancrew-pvmj1-1303885697/essentials/hongyancrew.png",
          bulletin_text: app.globalData.bulletin 
        });
        that.scroll_text();
      }
    })
  },

  onShow: function () {
    var that = this;

    function refresh() {
      if (app.globalData.user) {
        that.setData({
          ch: "欢迎使用测试版。",
        })
      } else {
        if (!app.globalData.user_info) {
          that.setData({
            ch: '点击"我的车协"进行注册，方可使用。',
          })
        }
      }
    }
    setTimeout(refresh, 5000);
  },

  onPullDownRefresh: function () {
    var that = this;
    wx.showLoading({
      title: '刷新中',
    })
    that.onLoad();
    that.onShow();
    wx.stopPullDownRefresh({
      success: (res) => {
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '刷新成功',
            })
          },
        })
      },
    })
  },

  scroll_text: function () {
    var that = this;
    if (that.data.length > that.data.window_width) {
      var interval = setInterval(function () {
        if (that.data.distance < (that.data.length + that.data.margin)) {
          that.setData({
            distance: that.data.distance + that.data.pace
          })
        } else {
          that.setData({
            distance: 0
          });
          clearInterval(interval);
          that.scroll_text();
        }
      }, that.data.interval);
    } else {
      that.setData({
        margin: 100
      });
    }
  },

  goto_articlelist: function () {
    wx.navigateTo({
      url: '../../pages/articlelist/articlelist',
    })
  },

  goto_gallery: function () {
    wx.navigateTo({
      url: '../../pages/gallery/gallery',
    })
  },

  goto_user_profile: function () {
    if (!app.globalData.user_info) {
      notification_helper.show_toast_without_icon("暂未获取到用户信息", 2000);
    } else {
      if (!app.globalData.user.openid) {
        wx.navigateTo({
          url: '../register/register',
        })
      } else {
        wx.navigateTo({
          url: '../user_profile/user_profile',
        })
      }
    }
  },

  goto_eventlist: function () {
    if (!app.globalData.user) {
      notification_helper.show_toast_without_icon("暂未获取到用户信息", 2000);
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true,
        success(res) {
          wx.navigateTo({
            url: '../../pages/eventlist/eventlist',
          })
        }
      })
    }
  },

  goto_manager: function () {
    if (!app.globalData.user) {
      notification_helper.show_toast_without_icon("暂未获取到用户信息", 2000);
    } else {
      if (!app.globalData.user.is_manager) {
        notification_helper.show_toast_without_icon("未授权管理员", 2000);
      } else {
        wx.navigateTo({
          url: '../manager/manager',
        })
      }
    }
  },

  goto_event_test: function () {
    if (!app.globalData.user) {
      notification_helper.show_toast_without_icon("暂未获取到用户信息", 2000);
      return;
    }
    wx.showLoading({
      title: 'title',
      mask: true
    })
    db.collection("events").where({
      name: "蟒山骑行"
    }).get({
      success: function (res) {
        app.globalData.event = res.data[0];
        //test valid forever
        app.globalData.event.precise_time = Date.now();
        wx.reLaunch({
          url: '../eventlist/event/locate/locate',
        })
      }
    })
  },

  goto_feedback: function () {
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  }
})