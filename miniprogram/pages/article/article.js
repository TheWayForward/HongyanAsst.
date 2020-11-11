const app = getApp();
const db = wx.cloud.database();
var util = require('../../utils/util.js');
var dayTime = util.formatTime(new Date());
var article_title;
var article_id;

Page({

  /**
   * Page initial data
   */
  data: {
    _id: "",
    time: " ",
    author: " ",
    view: " ",
    title: " ",
    isHide: true,
    comment: [],
    comment_array_1: [],
    comment_array_2: [],
    avatar: "",
    nickname: '',
    details: '',
    time: '',
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="http://m.qpic.cn/psc?/V10ldMks1Z5QlW/bqQfVz5yrrGYSXMvKr.cqTPtnUN7zJo2Kz37cZDcRRVc2vsiXputSKNVw*8pyqRyadlrvjrlbmkEtqNUG8hmTkJqtNAHKJgK8D*TrAEQeuk!/b&bo=9AFpAfQBaQECCS0!&rf=viewer_4">'
      },
    ],
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      complete: (res) => {
        that.setData({
          avatar: res.userInfo.avatarUrl,
          nickname: res.userInfo.nickName
        })
      },
    })
    article_title = app.globalData.article_title;
    db.collection("articles").where({
      title: article_title
    }).field({
      _id: "",
      author: true,
      comment: true,
      date: true,
      node: true,
      title: true,
      view: true
    }).get({
      success:function(res){
        var comment = res.data[0].comment;
        var comment_temp_1 = [];
        var comment_temp_2 = [];
        //dividing comments into 2 groups
        for(var i = 0; i < comment.length; i++){
          if(i % 2)
            comment_temp_1.push(comment[i]);
          else
            comment_temp_2.push(comment[i]);
        }
        var tempnode = [{
          _id: "1",
          index_id: "1",
          node: res.data[0].node
        }]
        wx.setNavigationBarTitle({
          title: res.data[0].title,
        })
        that.setData({
          _id: res.data[0]._id,
          title: res.data[0].title,
          author: res.data[0].author,
          comment: res.data[0].comment,
          comment_array_1: comment_temp_1,
          comment_array_2: comment_temp_2,
          time: res.data[0].date.toString().slice(0,16),
          hnode: tempnode,
          view: res.data[0].view,
          isHide: false,
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
    this.setData({
      hnode:0
    })
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

  input: function(e) {
    this.setData({
      details:e.detail.value
    })
  },

  submit_comment: function () {
    var that = this;
    if(!this.data.details)
    {
      wx.showModal({
        cancelColor: 'grey',
        title:'提示',
        content:'评论不能为空。',
        confirmText:'继续阅读',
        success: function (res) {
          if (res.cancel) 
          {
          } 
          else {
            wx.pageScrollTo({
              scrollTop: 0,
            })
          }
       },
      })
    }
    else
    {
      var now = dayTime.toString();
      now = now.slice(0,16);
      var article_id = that.data._id;
      var my_comment = new Object();
      my_comment.avatar = that.data.avatar;
      my_comment.detail = that.data.details;
      my_comment.name = that.data.nickname;
      my_comment.time = dayTime.toString().slice(0,16);
      my_comment.len = 0;
      var l = my_comment.detail.length;
      console.log(my_comment);
      if(l <= 20)
      {
        my_comment.len = 200;
      }
      else
      {
        my_comment.len = 600 * Math.floor(l / 10) / Math.sqrt(l) ;
      }
      var count = 0;
      var comment = that.data.comment;
      for(var i = 0; i< comment.length; i++)
      {
        if(comment[i].name == my_comment.name)
        {
          count++;
        }
      }
      if(count >= 3)
      {
        wx.showModal({
          cancelColor: 'grey',
          title:'提示',
          content:'抱歉，您评论过多，未提交该评论。',
          confirmText:'继续阅读',
          success: function (res) {
            if (res.cancel) 
            {
            }  
            else {
              wx.pageScrollTo({
                scrollTop: 0,
              })
            }
          },
        })
      }
      else
      {
        wx.cloud.callFunction({
          name:'s_check_text',
          data:{
          text:that.data.details
          }
        }).then(res => {
          var check = res.result.code
          if(check == 200)
          {
            comment.push(my_comment);
            wx.cloud.callFunction({
              name:'add_comment',
              data:{
                taskId: article_id.toString(),
                my_comment: comment,
              }
            }).then(res => {
              wx.showModal({
                cancelColor: 'grey',
                title:'😄',
                content:'您的评论提交成功。',
                confirmText:'继续阅读',
                success: function (res) {
                  if (res.cancel) 
                  {
                  } 
                  else 
                  {
                    wx.pageScrollTo({
                    scrollTop: 0,
                    })
                  }
                },
              })
            })
          }
          else
          {
            wx.showToast({
              title: '🚫包含敏感字哦!',
              icon: 'none',
              duration: 3000
            })
          }
        })
      }
     } 
  }
})