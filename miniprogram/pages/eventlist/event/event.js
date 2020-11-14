const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    event: {},
    //toFixed cannot be applied in html
    date: "加载中",
    distance: "加载中",
    //difficulty stars
    difficulty: "加载中",
    //participants
    participants: [],
    tip: "点击展开",
    isHide: true
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    //get the event tapped
    var event = app.globalData.event;
    db.collection("events").where({
      name: event.name
    }).field({
      participants: true
    }).get({
      success: function(res){
        event.participants = res.data[0].participants;
        that.setData({
          participants: res.data[0].participants
        })
      }
    })
    //giving stars
    var difficulty = "";
    switch(event.difficulty){
      case(1):
        difficulty = "★☆☆☆☆";
      break;
      case(2):
        difficulty = "★★☆☆☆";
      break;
      case(3):
        difficulty = "★★★☆☆";
      break;
      case(4):
        difficulty = "★★★★☆";
      break;
      case(5):
        difficulty = "★★★★★";
      break;
      default:
        difficulty = "警告：未知难度！";
      break;
    }
    var date = event.date + " (" + event.day + ")";
    if(!event.participants_count)
    {
      this.setData({
        tip: "暂无"
      })
    }
    this.setData({
      event: event,
      distance: event.distance.toFixed(2) + " km",
      difficulty: difficulty,
      date: date,
    })
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

  //preview image
  preview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  //show more participants
  show_participants: function(){
    if(!this.data.event.participants_count) return;
    if(this.data.isHide)
    {
      this.setData({
        isHide: false,
        tip: "收起"
      })
    }
    else
    {
      this.setData({
        isHide: true,
        tip: "点击展开"
      })
    }
  },

  goto_locate: function(){
    wx.navigateTo({
      url: '../../eventlist/event/locate/locate',
    })
  }
})