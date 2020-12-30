wx.cloud.init();
const app = getApp();
const db = wx.cloud.database();
var util = require("utils/util");
var dayTime = util.formatTime(new Date());

App({
  
  onLaunch: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.init({
      env: 'hongyancrew-pvmj1',
      traceUser:true
    })
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

    //get inside user info
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
            var t = new Date(user.birthday);
            //giving birthday string
            user.birthday_string = t.getFullYear().toString() + "/" + (t.getMonth() + 1).toString() + "/" + t.getDate().toString();
            //sorting event to time decending
            for(var i = 0; i < user.my_event.length; i++){
              user.my_event[i].precise_time = Date.parse(user.my_event[i].date);
            }
            function compare(p){
              return function(m,n){
                var a = m[p];
                var b = n[p];
                return a-b;
              }
            };
            user.my_event.sort(compare("precise_time"));
            user.my_event.reverse();
            that.globalData.user = user;
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
          wx.hideLoading({
            complete: (res) => {},
          })
        }
      });
    })

    //get miniprogram version
    db.collection("basic").where({
      _id: "version"
    }).get({
      success: function(res){
        that.globalData.miniprogram_version = res.data[0].version;
      }
    })

    //get wechat version requirement
    db.collection("basic").where({
      _id: "wechat_version_min"
    }).get({
      success: function(res){
        that.globalData.wechat_version_min = res.data[0].version;
      }
    })

    this.globalData = {};
  },

  globalData:{
    //miniprogram version
    miniprogram_version: "",
    //current wechat version
    wechat_version_min: "",
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
    //loading animation
    loading_animation: {
      thumbnail: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif"
    }
  },

})
