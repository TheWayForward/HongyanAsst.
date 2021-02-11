wx.cloud.init();
const db = wx.cloud.database();
var compare_helper = require("utils/helpers/compare_helper");
const notification_helper = require("./utils/helpers/notification_helper");

App({

  globalData: {
    //miniprogram version
    miniprogram_version: "",
    //minimum wechat version supported
    wechat_version_min: "",
    //clcying animation gif url
    cycling_animation: "",
    bulletin: "",
    //device system info
    system_info: {},
    vcode: null,
    //current user info
    user: {},
    my_transactions: [],
    my_bicycles: [],
    user_info: {},
    openid: "",
    article: {},
    //for page cancellation
    last_page_holder: "",
    //current event info
    event: {},
    //my bicycle info holder
    my_bicycle: {},
    my_transaction: {},
    my_bicycle_and_transaction: {}
  },

  onLaunch: function () {



    var that = this;
    //loading animation
    wx.showLoading({
      title: "加载中",
      mask: true
    })

    //init cloud environment
    wx.cloud.init({
      env: 'hongyancrew-pvmj1'
    })

    //cannot be done when user info is unauthorized
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo);
              that.globalData.user_info = res.userInfo;
            }
          })
        }
      }
    })

    //get account info from database
    wx.cloud.callFunction({
      name: 'get_openid',
    }).then(res => {
      that.globalData.openid = res.result.openid;
      db.collection("user").where({
        openid: res.result.openid
      }).get({
        success: function (res) {
          console.log(res.data[0]);
          //user exists
          if (res.data[0]) {
            var user = res.data[0];
            //sorting event to time decending
            for (var i = 0; i < user.my_event.length; i++) {
              user.my_event[i].precise_time = Date.parse(user.my_event[i].date);
            }
            user.my_event.sort(compare_helper.compare("precise_time")).reverse();
            //end processing
            that.globalData.user = user;
            db.collection("user").where({
              openid: res.data[0].openid
            }).watch({
              onChange(e) {
                console.log("[app][user]: data updated");
                that.globalData.user = e.docChanges[0].doc;
              },
              onError(e) {}
            })
          }
          //user do not exist
          else {
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
  },

  clear_vcode: function () {
    this.globalData.vcode = null;
  }

})