wx.cloud.init();
const db = wx.cloud.database();
var compare_helper = require("utils/helpers/compare_helper");

App({

  onLaunch: function () {

    var that = this;
    //loading animation
    wx.showLoading({
      title: '加载中',
    })

    //init cloud environment
    wx.cloud.init({
      env: 'hongyancrew-pvmj1',
      traceUser:true
    })

    //cannot be done when user info is unauthorized
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo);
              this.globalData.user_info = res.userInfo
            }
          })
        }
      }
    })

    //get account info from database
    wx.cloud.callFunction({
      name:'get_openid',
    }).then(res => {
      var openid = res.result.openid;
      that.globalData.openid = openid;
      console.log(openid);
      db.collection("user").where({
        openid: openid
      }).get({
        success: function(res){
          console.log(res.data[0]);
          //user exists
          if(res.data[0])
          {
            var user = res.data[0];
            //sorting event to time decending
            for(var i = 0; i < user.my_event.length; i++){
              user.my_event[i].precise_time = Date.parse(user.my_event[i].date);
            }
            user.my_event.sort(compare_helper.compare("precise_time")).reverse();
            //end processing
            that.globalData.user = user;
          }
          //user do not exist
          else
          {
            console.log("[app][user_validation]: Do not exist");
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '您尚未注册，将以游客模式登录',
                  icon: 'none',
                  duration: 3000
                })
              },
            })
          }
          wx.hideLoading({
            complete: (res) => {},
          })
        }
      });
    })

    //init globalData
    this.globalData = {};
  },

  globalData:{
    //miniprogram version
    miniprogram_version: "",
    //minimum wechat version supported
    wechat_version_min: "",
    //clcying animation gif url
    cycling_animation: "",
    //device system info
    system_info: {},
    //current user info
    user: {},
    user_info: {},
    openid: "",
    article: {},
    //for page cancellation
    last_page_holder: "",
    //current event info
    event: {},
  },

})
