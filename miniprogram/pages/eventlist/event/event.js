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
    leader_openid: "",
    tip: "点击展开",
    isHide: true,
    can_sign: true,
    is_sign_up_hide: false,
    //button
    is_locate_permissible: false,
    button_text:"加载中",
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
      participants: true,
      leader_openid: true,
      snapshots_count: true,
      device: true
    }).get({
      success: function(res){
        event.participants = res.data[0].participants;
        event.leader_openid = res.data[0].leader_openid;
        event.snapshots_count = res.data[0].snapshots_count;
        event.device = res.data[0].device;
        console.log(event);
        //app.globalData.event = event;
        that.setData({
          participants: res.data[0].participants,
          leader_openid: res.data[0].leader_openid
        })
        for(var i = 0; i < res.data[0].participants.length; i++){
          //set default color as white
          event.participants[i].background = "#FFFFFF";
          if(app.globalData.openid == res.data[0].participants[i].openid)
          {
            //hi-light your self
            event.participants[i].background = "#F6F6F6"
            that.setData({
              is_sign_up_hide: true
            })
          }
          if(res.data[0].leader_openid == res.data[0].participants[i].openid)
          {
            //bold the leader
            event.participants[i].bold = "bold";
          }
        }
        that.setData({
          participants: event.participants
        })
        var now = new Date();
        if((event.time - now) / 86400000 < 0.041)
        {
          //can't sign or un-sign after the hr before the event starts
          that.setData({
            can_sign: false
          })
        }
        if((event.time - now) / 86400000 < 1)
        {
          //can enter locate page
          that.setData({
            is_locate_permissible: true
          })
          if(event.snapshots_count)
          {
            //totality
            that.setData({
            button_text: "动态追踪" + "(" + event.snapshots_count + ")"
            })
          }
          else
          {
            //no snapshots yet
            that.setData({
            button_text: "动态追踪(暂无)"
            })
          }
        }
        else
        {
          that.setData({
            //post time, cannot enter locate page
            is_locate_permissible: false,
            button_text: "活动尚未开始"
          })
        }
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
    //if no participant, show "no participants yet"
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

  //sign up for the event
  sign_up: function(){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认报名参加活动"' + that.data.event.name + '"?',
      cancelColor: 'gray',
      cancelText: '取消',
      confirmText: '确定',
      success: function(res){
        if(res.cancel)
        {
          //cancelled
        }
        else
        {
          //get sign-up necessities from globalData
          var participant = {};
          participant.avatar = app.globalData.user.avatar;
          participant.nickname = app.globalData.user.nickname;
          participant.openid = app.globalData.user.openid;
          participant.realname = app.globalData.user.realname;
          participant.time = Date.now();
          that.data.participants.push(participant);
          console.log(that.data.participants);
          var event = that.data.event;
          //add an event to user
          app.globalData.user.my_event.push({
            _id: event._id,
            name: event.name,
            poster: event.poster,
            date: event.date,
            distance: event.distance,
            is_signed: false
          });
          console.log(app.globalData.user.my_event);
          wx.cloud.callFunction({
            name: 'update_participants',
              data: {
                taskId: that.data.event._id,
                my_participants: that.data.participants,
                my_participants_count: that.data.participants.length
              }
          })
          wx.cloud.callFunction(
            {
              name: "update_user_event",
              data: {
                openid: app.globalData.user.openid,
                my_event: app.globalData.user.my_event
              }
            }
          ).then(res => {
            wx.showToast({
              title: '报名成功',
              duration:3000,
              success: function(res){
                wx.reLaunch({
                  url: '../eventlist'
                })
              }
            })
          })
        }
      }
    })
  },

  //unsign this event
  un_sign_up: function(){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '不再参加活动"' + that.data.event.name + '"?',
      cancelColor: 'gray',
      cancelText: '取消',
      //warning color
      confirmColor: '#FA5159',
      confirmText: '确定',
      success: function(res){
        if(res.cancel)
        {
          //cancelled
        }
        else
        {
          //matching
          //var event = that.data.event;
          var index_event = null;
          var participants = that.data.participants;
          var index_participant = null;
          for(var i = 0; i < participants.length; i++){
            var p = participants[i];
            if(app.globalData.openid == that.data.leader_openid)
            {
              wx.showToast({
                title: '您是领骑，不能取消报名！',
                icon: 'none'
              })
              return;
            }
            if(app.globalData.openid == p.openid)
            {
              console.log("participant found");
              index_participant = i;
            }
          }
          console.log(participants);
          participants.splice(index_participant,1);
          for(var i = 0; i < app.globalData.user.my_event.length; i++){
            var e = app.globalData.user.my_event[i];
            if(e._id == that.data.event._id)
            {
              console.log("event found");
              index_event = i;
            }
          }
          app.globalData.user.my_event.splice(index_event,1);
          console.log(app.globalData.user.my_event);
          wx.cloud.callFunction({
            name: "update_user_event",
            data: {
              openid: app.globalData.user.openid,
              my_event: app.globalData.user.my_event
            }
          })
          wx.cloud.callFunction({
            name: 'update_participants',
            data: {
              taskId: that.data.event._id,
              my_participants: participants,
              my_participants_count: participants.length
            }
          }).then(res => {
            wx.showToast({
              title: '已取消报名',
              icon: 'none',
              duration: 3000,
              success: function(res){
                wx.reLaunch({
                  url: '../eventlist'
                })
              }
            })
          })
        }
      }
    })
  },

  //goto event tracking page
  goto_locate: function(){
    wx.navigateTo({
      url: '../event/locate/locate',
    })
  }
})