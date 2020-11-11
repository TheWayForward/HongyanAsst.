const db = wx.cloud.database();
const app = getApp();
const now = new Date();

Page({

  /**
   * Page initial data
   */
  data: {
    isHide: true,
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif" crossorigin="anonymous" data-w="1080" data-type="jpeg" data-src="https://mmbiz.qpic.cn/mmbiz_jpg/VzFuMauwoqTc6bRD4ibOr9ib60UjMDe4jLVkxsI8zYVAibUfFdEibricL0C3fwrIFJlWCIAsZ0yULMvJgZggtOniaqGA/640?wx_fmt=jpeg" data-ratio="0.3740741" _width="862px" data-fail="0">'
    },
    ],
    events: [],
    previous_event: [],
    coming_event: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
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
          poster: true,
          difficulty: true,
          time: true,
          leader: true
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
              var coming_event = [];
              for(var i = 0; i < arrayContainer.length; i++){
                arrayContainer[i].date = arrayContainer[i].time.toLocaleDateString();
                //there are bugs in date object transfer, so set up a millisecond time in order to recover
                arrayContainer[i].precise_time = Date.parse(arrayContainer[i].time);
                if(arrayContainer[i].time <= now)
                {
                  console.log("previous event");
                  previous_event.push(arrayContainer[i]);
                }
                else
                {
                  console.log("coming event");
                  coming_event.push(arrayContainer[i]);
                }
              }
              that.setData({
                events: arrayContainer,
                previous_event: previous_event.reverse(),
                coming_event: coming_event.reverse(),
                isHide: false
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
    var event_status_code;
    //set event status code
    if(event.time <= now)
    {
      //if previous event, set status code as 1
      console.log("previous event",event);
      event_status_code = 1;
    }
    else
    {
      //if coming event, set status code as 2
      console.log("coming event",event);
      event_status_code = 2
    }
    app.globalData.event_status_code = event_status_code;
    wx.navigateTo({
      url: '../../pages/event/event',
    })
  }
})