const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");
var timer_onLoad;

Page({

  data: {
    event: {},
    //toFixed cannot be applied in html
    swiper: [],
    date: "加载中",
    distance: "加载中",
    //difficulty stars
    difficulty: "加载中",
    //participants
    participants: [],
    leader_openid: "",
    tip: "▼",
    isHide: true,
    is_participants_hide: true,
    can_sign: true,
    is_sign_up_hide: false,
    //button
    is_locate_permissible: false,
    button_text:"加载中",
  },

  onLoad: function () {
    var that = this;
    //get the event tapped
    var event = app.globalData.event;
    db.collection("events").where({
      name: event.name
    }).field({
      participants: true,
      participants_count: true,
      leader_openid: true,
      snapshots_count: true,
      snapshots: true,
      device: true
    }).get({
      success: function(res){
        event.participants = res.data[0].participants;
        event.participants_count = res.data[0].participants_count;
        event.leader_openid = res.data[0].leader_openid;
        event.snapshots_count = res.data[0].snapshots_count;
        event.snapshots = res.data[0].snapshots;
        event.device = res.data[0].device;
        event.swiper = [event.poster];
        //set swiper image array
        for(var i = 0; i < event.snapshots.length; i++){
          event.swiper.push(event.snapshots[i].url);
          if(i > 5) break;
        }
        //bold and hi-light
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
        console.log(timer_onLoad);
        that.setData({
          event: event,
          distance: event.distance.toFixed(2) + " km",
          difficulty: versatile_helper.difficulty_to_stars(event.difficulty),
          date: `${event.date}(${event.day})`,
          participants: event.participants,
          leader_openid: res.data[0].leader_openid,
          can_sign: compare_helper.compare_time_for_event_sign(event.time, new Date()),
          is_locate_permissible: compare_helper.compare_time_for_event_locate(event.time,new Date()) ? true : false,
          button_text: compare_helper.compare_time_for_event_locate(event.time,new Date()) ? (event.snapshots_count ? `动态追踪(${event.snapshots_count})` : "动态追踪(暂无)") : "活动尚未开始",
          isHide: false,
        })
      }
    })
  },

  onShow: function(){
    timer_onLoad = setInterval(this.onLoad,5000);
  },

  onPullDownRefresh: function () {
    wx.showLoading({
      title: '活动刷新中',
    })
    var that = this;
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

  onUnload: function(){
    clearInterval(timer_onLoad);
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
    var that = this;
    this.setData({
      is_participants_hide: that.data.is_participants_hide ? false : true,
      tip: that.data.is_participants_hide ? "▲" : "▼"
    })
  },

  //sign up for the event
  sign_up: function(){
    var that = this;
    wx.showModal({
      title: '提示',
      content: `确认报名参加活动"${that.data.event.name}"?`,
      cancelText: '取消',
      confirmText: '确定',
      success(res){
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

  goto_locate: function(){
    wx.navigateTo({
      url: '../event/locate/locate',
    })
  }
})