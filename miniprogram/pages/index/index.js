const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../utils/helpers/compare_helper");
var notification_helper = require("../../utils/helpers/notification_helper");

Page({
  data: {
    ch: "加载中...",
    showTop: true,
    isHide: true,
    //version check
    wechat_version: "",
    wechat_version_min: "",
    update_required: false
  },

  onLoad: function() {
    var that = this;
    //get device system info, such as batterylevel, screen, system version, etc.
    wx.getSystemInfo({
      success(res){
        app.globalData.system_info = res;
      }
    })
    
    //get dynamic info
    db.collection("basic").get({
      success: function(res){
        app.globalData.miniprogram_version = res.data[0].version;
        app.globalData.wechat_version_min = res.data[1].version;
        app.globalData.cycling_animation = res.data[2].url;
        if(compare_helper.compare_version(app.globalData.system_info.version,app.globalData.wechat_version_min))
        {
          //system version lower than minimum version required
          console.log("[index]: wechat update required");
          that.setData({
            ch: `微信当前版本${app.globalData.system_info.version}，建议升级至${app.globalData.wechat_version_min}以上版本。`
          })
        }
        else
        {
          //system version meets requirement

        }
      }
    })
  },

  onShow: function(){
    var that = this;
    function refresh(){
      if(app.globalData.user)
      {
        that.setData({
        ch: "欢迎使用测试版。",
        })
      }
      else
      {
        if(!app.globalData.user_info)
        {
          that.setData({
            ch: '点击"我的车协"进行注册，方可使用。',
          })
        }
      }
    }
    setTimeout(refresh,5000);
  },

  onPullDownRefresh: function(){
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

  goto_articlelist: function(){
    wx.navigateTo({
      url: '../../pages/articlelist/articlelist',
    })
  },

  goto_gallery: function(){
    notification_helper.show_toast_without_icon("页面建设中",2000);
  },

  goto_user_profile: function(){
    if(!app.globalData.user_info)
    {
      notification_helper.show_toast_without_icon("暂未获取到用户信息",2000);
    }
    else
    {
      if(!app.globalData.user)
      {
        wx.navigateTo({
          url: '../register/register',
        })
      }
      else
      {
        wx.navigateTo({
          url: '../user_profile/user_profile',
        })
      }
    }
  },

  goto_eventlist: function(){
    if(!app.globalData.user)
    {
      notification_helper.show_toast_without_icon("暂未获取到用户信息",2000);
    }
    else
    {
      wx.showLoading({
        title: '加载中',
        mask: true,
        success(res){
          wx.navigateTo({
            url: '../../pages/eventlist/eventlist',
          })
        }
      })
    }
  },

  goto_manager: function(){
    if(!app.globalData.user)
    {
      notification_helper.show_toast_without_icon("暂未获取到用户信息",2000);
    }
    else
    {
      if(!app.globalData.user.is_manager)
      {
        notification_helper.show_toast_without_icon("未授权管理员",2000);
      }
      else
      {
        wx.navigateTo({
          url: '../manager/manager',
        })
      }
    }
  },

  goto_event_test: function(){
    if(!app.globalData.user)
    {
      notification_helper.show_toast_without_icon("暂未获取到用户信息",2000);
      return;
    }
    wx.showLoading({
      title: 'title',
      mask: true
    })
    db.collection("events").where({
      name: "蟒山骑行"
    }).get({
      success: function(res){
        app.globalData.event = res.data[0];
        //test valid forever
        app.globalData.event.precise_time = Date.now();
        wx.reLaunch({
          url: '../eventlist/event/locate/locate',
        })
      }
    })
  },

  goto_feedback: function(){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  }
})
