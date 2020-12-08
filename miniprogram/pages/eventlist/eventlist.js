const db = wx.cloud.database();
const app = getApp();
const now = new Date();

Page({

  /**
   * Page initial data
   */
  data: {
    isHide: true,
    is_loading_hide: false,
    loading_animation: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif",
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif" crossorigin="anonymous" data-w="1080" data-type="jpeg" data-src="https://mmbiz.qpic.cn/mmbiz_jpg/VzFuMauwoqTc6bRD4ibOr9ib60UjMDe4jLVkxsI8zYVAibUfFdEibricL0C3fwrIFJlWCIAsZ0yULMvJgZggtOniaqGA/640?wx_fmt=jpeg" data-ratio="0.3740741" _width="862px" data-fail="0">'
    },
    ],
    events: [],
    previous_event: [],
    current_event: [],
    coming_event: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '获取活动中',
    })
    var that = this;
    //maximum batch 5, we create a batch getter
    var batchTimes;
    var count = db.collection("events").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count/20);
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
              function compare(p){
                return function(m,n){
                  var a = m[p];
                  var b = n[p];
                  return a-b;
                }
              };
              arrayContainer.sort(compare("_id"));
              //arrayContainer.reverse();
              //previous and coming, in accordance with time comparison
              var previous_event = [];
              var current_event = [];
              var coming_event = [];
              for(var i = 0; i < arrayContainer.length; i++){
                var t = arrayContainer[i].time;
                //reformat date, don't forget about the shit getMonth + 1
                arrayContainer[i].date = t.getFullYear().toString() + "/" + (t.getMonth() + 1).toString() + "/" + t.getDate().toString();
                //padstart function, adding zero to digits
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
                arrayContainer[i].date_time = padstart(t.getHours().toString()) + ":" + padstart(t.getMinutes().toString());
                //reformat day
                switch(t.getDay()){
                  case(0):
                    arrayContainer[i].day = "星期日";
                  break;
                  case(1):
                    arrayContainer[i].day = "星期一";
                  break;
                  case(2):
                    arrayContainer[i].day = "星期二";
                  break;
                  case(3):
                    arrayContainer[i].day = "星期三";
                  break;
                  case(4):
                    arrayContainer[i].day = "星期四";
                  break;
                  case(5):
                    arrayContainer[i].day = "星期五";
                  break;
                  case(6):
                    arrayContainer[i].day = "星期六";
                  break;
                  default:
                    arrayContainer[i].day = "获取日期出错";
                  break;
                }
                //there are bugs in date object transfer, so set up a millisecond time in order to recover
                arrayContainer[i].precise_time = Date.parse(t);
                if(now - t >= (86400000) )
                {
                  previous_event.push(arrayContainer[i]);
                }
                else if((t - now < (86400000 / 2)) && ((now - t) < 86400000))
                {
                  current_event.push(arrayContainer[i]);
                }
                else
                {
                  coming_event.push(arrayContainer[i]);
                }
              }
              previous_event.sort(compare("precise_time"));
              current_event.sort(compare("precise_time"));
              coming_event.sort(compare("precise_time"));
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

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  onShow: function(){

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

  preview: function (e) {
    wx.previewImage({
      current: e.target.dataset.action,
      urls: [e.target.dataset.action]
    })
  },

  //send data to event page
  goto_event: function(e){
    var event = e.target.dataset.action;
    //event date recovery
    var d = new Date();
    d.setTime(event.precise_time);
    event.time = new Date();
    event.time = d;
    app.globalData.event = event;
    console.log(event);
    var _id = event.id;
    var view = event.view + 1;
    wx.navigateTo({
      url: '../eventlist/event/event',
    })
    wx.cloud.callFunction({
      name:'add_event_view',
      data:{
        taskId: app.globalData.event._id,
        view: view
       }
       })
      .then(res => {
      })
  }
})