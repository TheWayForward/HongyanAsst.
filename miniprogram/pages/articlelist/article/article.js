const app = getApp();
const db = wx.cloud.database();
var time_helper = require('../../../utils/helpers/time_helper');

Page({

  data: {
    _id: "",
    time: "",
    author: "",
    view: 0,
    title: "",
    comment_count: "",
    isHide: true,
    is_comment_submission_hide: true,
    is_granted: true,
    show_top: true,
    is_submission_available: true,
    //double comment stream
    comment: [],
    comment_array_1: [],
    comment_array_2: [],
    event_show: {},
    userinfo: {},
    avatar: "",
    nickname: "",
    input_value: "",
    details: "",
    time: "",
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="http://m.qpic.cn/psc?/V10ldMks1Z5QlW/bqQfVz5yrrGYSXMvKr.cqTPtnUN7zJo2Kz37cZDcRRVc2vsiXputSKNVw*8pyqRyadlrvjrlbmkEtqNUG8hmTkJqtNAHKJgK8D*TrAEQeuk!/b&bo=9AFpAfQBaQECCS0!&rf=viewer_4">'
      },
    ],
  },

  onLoad: function (options) {
    var that = this;
    var article_id = app.globalData.article._id;
    //get article by id
    db.collection("articles").where({
      _id: article_id
    }).field({
      _id: true,
      author: true,
      comment: true,
      date: true,
      event__id: true,
      node: true,
      openid: true,
      tag: true,
      title: true,
      view: true
    }).get({
      success:function(res){
        app.globalData.article = res.data[0];
        wx.setNavigationBarTitle({
          title: res.data[0].title,
        })
        //comment division
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
        //get event bound
        db.collection("events").where({
          _id: res.data[0].event__id
        }).field({
          poster: true,
          time: true,
          name: true,
          participants_count: true
        }).get({
          success: function(res){
            res.data[0].date = time_helper.format_time(res.data[0].time).date;
            that.setData({
              event_show: res.data[0]
            })
          }
        })
        that.setData({
          _id: res.data[0]._id,
          title: res.data[0].title,
          author: res.data[0].author,
          comment: res.data[0].comment,
          comment_array_1: comment_temp_1,
          comment_array_2: comment_temp_2,
          comment_count: comment[0] ? `共${comment.length}条评论` : "暂无评论",
          time: time_helper.format_time(res.data[0].date).date_time,
          hnode: [{
            _id: "1",
            index_id: "1",
            node: res.data[0].node
          }],
          view: res.data[0].view,
          isHide: false,
        })
        wx.getUserInfo({
          success: (res) => {
            that.setData({
              userinfo: res.userInfo,
              is_comment_submission_hide: false
            })
          },
          fail: (res) => {
            wx.showToast({
              title: '未授权用户信息',
              icon: 'none',
              duration: 2000,
            })
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

  onPageScroll: function(e){
    if(e.scrollTop > 500)
    {
      this.setData({
        show_top: false
      })
    }
    else
    {
      //to top icon shown
      this.setData({
        show_top: true
      })
    }
  },

  onPullDownRefresh: function(){
    var that = this;
    wx.showLoading({
      title: '资讯刷新中',
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

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },

  preview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  input: function(e){
    this.setData({
      details:e.detail.value
    })
  },

  go_top: function(){
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  goto_event: function(e){
    if(!app.globalData.user)
    {
      wx.showModal({
        title: "提示",
        content: "请在注册后参加活动。",
        cancelText: "取消",
        confirmText: "立即注册",
        success(res){
          if(res.confirm)
          {
            wx.reLaunch({
              url: '../../register/register',
            })
          }
        }
      })
      return;
    }
    var event_tapped = e.currentTarget.dataset.action;
    db.collection("events").where({
      _id: event_tapped._id
    }).get({
      success: function(res){
        app.globalData.event = res.data[0];
        app.globalData.event.date = time_helper.format_time(res.data[0].time).date;
        app.globalData.event.date_time = time_helper.format_time(res.data[0].time).date_time;
        app.globalData.event.precise_time = time_helper.format_time(res.data[0].time).precise_time;
        app.globalData.event.day = time_helper.format_time(res.data[0].time).weekday;
        wx.navigateTo({
          url: '../../eventlist/event/event',
        })
      }
    })
  },

  get_userinfo: function(e){
    console.log(e);
    if(e.detail.errMsg == "getUserInfo:fail auth deny")
    {
      wx.showToast({
        title: '授权失败',
        duration: 2000
      })
    }
    else
    {
      this.setData({
        userinfo: e.detail.userInfo,
        is_comment_submission_hide: false
      })
    }
  },   

  submit_comment: function () {
    var that = this;
    if(!this.data.details)
    {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    else
    {
      //show loading
      wx.showLoading({
        title: '评论提交中',
      })
      //disable the button to prevent from double-submission
      this.setData({
        is_submission_available: false
      })
      //initialize comment with detail
      var my_comment = {};
      my_comment.avatar = that.data.userinfo.avatarUrl;
      my_comment.nickname = that.data.userinfo.nickName;
      my_comment.detail = that.data.details;
      my_comment.openid = app.globalData.openid;
      my_comment.time = time_helper.format_time(new Date()).date_time;
      my_comment.len = 0;
      if(my_comment.detail.length <= 20)
      {
        my_comment.len = 200;
      }
      else
      {
        my_comment.len = 600 * Math.floor(my_comment.detail.length / 10) / Math.sqrt(my_comment.detail.length) ;
      }
      wx.cloud.callFunction({
        name:'s_check_text',
        //sensitivity check
        data:{
          text:that.data.details
        }
      }).then(res => {
        var check = res.result.code
        if(check == 200)
        {
          var comment = that.data.comment;
          comment.push(my_comment);
          wx.cloud.callFunction({
            name: "add_article_comment",
            data: {
              //get article by id
              taskId: that.data._id,
              my_comment: comment
            },
            success(res){
              that.onLoad();
              wx.hideLoading({
                success: (res) => {
                  wx.showToast({
                    title: '提交成功',
                    duration: 2000
                  })
                },
              })
              that.setData({
                is_submission_available: true,
                input_value: "",
                details: ""
              })
            }
          })
        }
        else
        {
          wx.showToast({
            title: '评论包含敏感字',
            icon: 'none',
            duration: 3000
          })
        }
      })
     } 
  }
})