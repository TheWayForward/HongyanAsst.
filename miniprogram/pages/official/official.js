const db = wx.cloud.database()
var developers = [];
var progress = [];

Page({
  data: {
    p:0,
    d:0,
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif" crossorigin="anonymous" data-w="1080" data-type="jpeg" data-src="https://mmbiz.qpic.cn/mmbiz_jpg/VzFuMauwoqTc6bRD4ibOr9ib60UjMDe4jLVkxsI8zYVAibUfFdEibricL0C3fwrIFJlWCIAsZ0yULMvJgZggtOniaqGA/640?wx_fmt=jpeg" data-ratio="0.3740741" _width="862px" data-fail="0">'
    },
    ],
    developers_1:[],
    developers_2:[],
    isHide:true,
  },

  onLoad: function (options) {
    var that = this;

    function compare(p) {
      return function (m, n) {
        var a = m[p];
        var b = n[p];
        return a - b;
      }
    }

    //loading developer info, rendered initially
    var batchTimes_developer;
    var count_developer = db.collection("developer").count();

    count_developer.then(function (result) {
      count_developer = result.total;
      batchTimes_developer = Math.ceil(count_developer / 20)
      var arrayContainer = [], x = 0;
      for (var i = 0; i < batchTimes_developer; i++) {
        db.collection("developer").skip(i * 20).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
            }
            x++;
            if (x == batchTimes_developer) {
              arrayContainer.sort(compare("_id"));
              developers = arrayContainer;
              var odd = [];
              var even = [];
              for(var k = 0; k < arrayContainer.length; k++) {
                var l = arrayContainer[k].details.length;
                if(l <= 20)
                {
                arrayContainer[k].len = 200;
                }
                else
                {
                arrayContainer[k].len = 600 * Math.floor(l / 10) / Math.sqrt(l) ;
                }
                if(k % 2)
                {
                  even.push(arrayContainer[k]);
                }
                else
                {
                  odd.push(arrayContainer[k]);
                }
              }
              that.setData({
                developers_1: even,
                developers_2: odd,
                isHide:false,
              })
              //loading progress info
              var batchTimes;
              var count = db.collection("progress").count();

              count.then(function (result) {
              count = result.total;
              batchTimes = Math.ceil(count / 20)
              var arrayContainer = [], x = 0;
              for (var i = 0; i < batchTimes; i++) {
                db.collection("progress").skip(i * 20).get({
                  success: function (res) {
                    for (var j = 0; j < res.data.length; j++) {
                      arrayContainer.push(res.data[j]);
                    }
                    x++;
                    if (x == batchTimes) 
                    {
                      arrayContainer.sort(compare("_id"));
                      arrayContainer.reverse();
                      //assigning image(avatar) field for corresponded progress
                      for(var i = 0; i < arrayContainer.length; i++){
                        var progress = arrayContainer[i];
                        for(var j = 0; j < developers.length; j++){
                          var developer = developers[j];
                          if(progress.contributor == developer.name)
                          {
                            progress.avatar = developer.avatar;  
                            arrayContainer[i] = progress;
                          }
                        }
                      }
                      that.setData({
                        p: arrayContainer,
                      })
                    }
                  }
                })
              }
            });
            }
          }
        })
      }
    });

    
  },

  onReady: function () {
  },

  onShow: function () {
    
  },

  onHide: function () {
    
  },

  onUnload: function () {
    
  },

  onPullDownRefresh: function () {
    
  },

  onReachBottom: function () {
    
  },

  onShareAppMessage: function () {
    
  },

  preview: function (e) {
    wx.previewImage({
      current: e.target.dataset.action,
      urls: [e.target.dataset.action]
    })
  },
})