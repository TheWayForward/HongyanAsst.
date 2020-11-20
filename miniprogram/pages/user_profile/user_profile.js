const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    user: {},
    isHide: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    if(!app.globalData.user)
    {
      console.log("user_profile: Do not exist");
      this.setData({
        isHide: true
      })
      wx.showModal({
        title: '提示',
        content: '非注册用户。',
        cancelColor: 'gray',
        cancelText: '取消',
        confirmText: '立即注册',
        success: function(res){
          if(res.cancel)
          {
            wx.navigateTo({
              url: '../../pages/index/index',
            })
          }
          else
          {
            wx.navigateTo({
              url: '../../pages/register/register',
            })
          }
        }

      })
    }
    else
    {
      that.setData({
        user: app.globalData.user
      })
      console.log(that.data.user);
    }
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    //if the user came back from the register page
    if(app.globalData.last_page_holder == "register")
    {
      app.globalData.last_page_holder = "";
      // jump to index
      wx.navigateTo({
        url: '../../pages/index/index',
      })
    }
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  preview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  //update user info page
  goto_user_profile_update: function(){
    wx.navigateTo({
      url: '../user_profile/user_profile_update/user_profile_update',
    })
  },

  //go to event page after getting the corresponded event
  goto_event: function(e){
    var event_tapped = e.currentTarget.dataset.action;
    db.collection("events").where({
      _id: event_tapped._id
    }).get({
      success: function(res){
        app.globalData.event = res.data[0];
        var t = res.data[0].time;
        app.globalData.event.date = t.getFullYear().toString() + "/" + (t.getMonth() + 1).toString() + "/" + t.getDate().toString();
        function padstart(time){
          if(time.length == 1)
          {
            return ("0" + time);
          }
          else
          {
            return time;
          }
        }
        app.globalData.event.date_time = padstart(t.getHours().toString()) + ":" + padstart(t.getMinutes().toString());
        app.globalData.event.precise_time = t.getTime();
        //reformat day
        switch(t.getDay()){
          case(0):
            app.globalData.event.day = "星期日";
          break;
          case(1):
            app.globalData.event.day = "星期一";
          break;
          case(2):
            app.globalData.event.day = "星期二";
          break;
          case(3):
            app.globalData.event.day = "星期三";
          break;
          case(4):
            app.globalData.event.day = "星期四";
          break;
          case(5):
            app.globalData.event.day = "星期五";
          break;
          case(6):
            app.globalData.event.day = "星期六";
          break;
          default:
            app.globalData.event.day = "获取日期出错";
          break;
        }
        wx.navigateTo({
          url: '../../pages/eventlist/event/event',
        })
      }
    })
  }
})