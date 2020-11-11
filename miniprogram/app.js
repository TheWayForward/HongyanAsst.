wx.cloud.init();
const app = getApp();
const db = wx.cloud.database();
var util = require("utils/util");
var dayTime = util.formatTime(new Date());

App({

  onLaunch: function () {

    //set date
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
    //login status
    data_status: false,
    //date
    date: "",
    //current user info
    openid: "",
    QQ: "",
    avatar: "",
    birthday: "",
    campus: "",
    credit: 0,
    dept: "",
    detail: "",
    gender: "",
    my_bicycle: [],
    my_event: [],
    name: "",
    tel: "",
    user: {},
    total_distance: 0,
    userInfo: null,
    title: 0,
    article_title: "",
    article_id: "",
    last_page_holder: "",
    //current event info
    event: {},
    //status code definition
    //0: initial status
    //1: previous event
    //2: coming event
    //3: coming event(has signed)
    event_status_code: 0,
    
  }

})
