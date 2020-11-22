wx.cloud.init();
const app = getApp();
const db = wx.cloud.database();
var util = require("utils/util");
var dayTime = util.formatTime(new Date());

App({

  onLaunch: function () {
    wx.cloud.init({
      env: 'hongyancrew-pvmj1',
      traceUser:true
    })
    var that = this;
    wx.login({
      success: res => {
      }
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo);
              this.globalData.userInfo = res.userInfo,
              this.globalData.date = dayTime.slice(0,11)
            }
          })
        }
      }
    })

    if (!wx.cloud) {
      console.error('nocloud')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

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
            that.globalData.user = res.data[0];
            //set true in order to view
            that.globalData.data_status = true;
          }
          //user do not exist
          else
          {
            console.log("app: Do not exist");
            //set true in order to register
            that.globalData.data_status = true;
          }
        }
      });
    })

    this.globalData = {}
  },

  globalData:{
    //device
    height: 0,
    //login status
    data_status: false,
    //date
    date: "",
    //current user info
    user: {},
    userInfo: null,
    article: {},
    last_page_holder: "",
    //current event info
    event: {},
    //status code definition
    //0: initial status
    //1: previous event
    //2: coming event
    //3: coming event(has signed)
    event_status_code: 0,
    //loading animation
    loading_animation: {
      thumbnail: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif"
    }
  },

})
