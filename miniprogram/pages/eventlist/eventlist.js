const db = wx.cloud.database();
const app = getApp();
var compare_helper = require("../../utils/helpers/compare_helper");
var time_helper = require("../../utils/helpers/time_helper");
var notification_helper = require("../../utils/helpers/notification_helper");

Page({

  data: {
    isHide: true,
    events: [],
    previous_event: [{poster: "../../images/loading.gif"}],
    current_event: [{poster: "../../images/loading.gif"}],
    coming_event: [{poster: "../../images/loading.gif"}],
  },

  onLoad: function () {
    if(!this.data.events[0])
    {
      wx.showLoading({
        title: '活动加载中',
      })
    }
    var that = this;
    //maximum batch 5, we create a batch getter
    var batchTimes;
    var count = db.collection("events").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [], x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("events").skip(i * 20).field({
          name: true,
          detail: true,
          distance: true,
          difficulty: true,
          name_start: true,
          name_return: true,
          poster: true,
          participants_count: true,
          time: true,
          leader: true,
          view: true
        }).get({
          success:function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
            }
            x++;
            if(x == batchTimes)
            {
              arrayContainer.sort(compare_helper.compare("time"));
              //previous, current and coming, in accordance with time comparison
              var previous_event = [];
              var current_event = [];
              var coming_event = [];
              for(var i = 0; i < arrayContainer.length; i++){
                arrayContainer[i].date = time_helper.format_time(arrayContainer[i].time).date;
                arrayContainer[i].date_time = time_helper.format_time(arrayContainer[i].time).time.slice(0,5);
                arrayContainer[i].precise_time = time_helper.format_time(arrayContainer[i].time).precise_time;
                arrayContainer[i].day = time_helper.format_time(arrayContainer[i].time).day_to_ch();
                switch(compare_helper.compare_time_for_event(arrayContainer[i].time,new Date())){
                  case("previous_event"):
                    previous_event.push(arrayContainer[i]);
                    break;
                  case("current_event"):
                    current_event.push(arrayContainer[i]);
                    break;
                  case("coming_event"):
                    coming_event.push(arrayContainer[i]);
                    break;
                }
              }
              that.setData({
                events: arrayContainer,
                previous_event: previous_event.reverse(),
                current_event: current_event.reverse(),
                coming_event: coming_event.reverse(),
                isHide: false
              })
              wx.hideLoading({
                complete: (res) => {},
              })
            }
          }
        })
      }
    });
  },

  onShow: function(){
  },

  onPullDownRefresh: function(){
    var that = this;
    wx.showLoading({
      title: '活动刷新中',
      success: function(){
      }
    })
    function refresh(){
      that.onLoad();
      wx.hideLoading({
        complete: (res) => {
          wx.showToast({
            title: '刷新成功',
          })
          wx.stopPullDownRefresh({
            complete: (res) => {},
          })
        },
      })
    }
    setTimeout(refresh,2000);
  },

  preview: function (e) {
    wx.previewImage({
      current: e.target.dataset.action,
      urls: [e.target.dataset.action]
    })
  },

  //send data to event page
  goto_event: function(e){
    wx.showLoading({
      title: '活动加载中',
      mask: true
    })
    //get event from tap
    var event = e.target.dataset.action;
    //event date recovery
    event.time = new Date(event.precise_time);
    app.globalData.event = event;
    wx.cloud.callFunction({
      name: 'add_event_view',
      data: {
        taskId: app.globalData.event._id,
        view: ++event.view
      },
      success(res){
        console.log("[cloudfunction][add_event_view]: add successfully");
        wx.hideLoading({
          success: (res) => {
            wx.navigateTo({
              url: '../eventlist/event/event',
            })
          },
        })
      },
      fail(res){
        console.log("[cloudfunction][add_event_view]: failed to add");
        wx.hideLoading({
          success: (res) => {
            notification_helper.show_toast_without_icon("获取数据失败，请下拉刷新页面后访问活动",2000);
          },
        })
      }
    })
  }
})