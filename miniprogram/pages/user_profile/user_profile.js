const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    user: {avatar:"../../images/loading.gif"},
    isHide: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    var user = app.globalData.user;
    var t = new Date(user.birthday);
    //giving birthday string
    user.birthday_string = t.getFullYear().toString() + "/" + (t.getMonth() + 1).toString() + "/" + t.getDate().toString();
    that.setData({
      user: user,
    })
    console.log(that.data.user);
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