const app = getApp();
const db = wx.cloud.database();
var time_helper = require("../../../utils/helpers/time_helper");

Page({

  data: {
    my_bicycle: [],
    watcher: 0,
    show_top: true
  },

  onLoad: function () {
    wx.showLoading({
      title: "加载中",
      mask: "true"
    })
    var that = this;
    db.collection("bicycles").where({
      openid: app.globalData.user.openid,
      is_available: true,
    }).get({
      success(res) {
        for (var i = 0; i < res.data.length; i++) {
          res.data[i].is_info_hide = true;
          res.data[i].tip = "详情";
          res.data[i].precise_time = res.data[i].time_created.getTime();
          res.data[i].distance = res.data[i].distance.toFixed(2);
        }
        that.setData({
          my_bicycle: res.data
        })
        wx.hideLoading({})
      }
    })
  },

  onShow: function () {
    var that = this;
    that.setData({
      watcher: db.collection("bicycles").where({
        openid: app.globalData.user.openid,
        is_available: true
      }).watch({
        onChange(e) {
          wx.showLoading({
            title: "加载中",
            mask: true
          })
          for (var i = 0; i < e.docs.length; i++) {
            e.docs[i].is_info_hide = true;
            e.docs[i].tip = "详情";
            e.docs[i].precise_time = e.docs[i].time_created.getTime();
            e.docs[i].distance = e.docs[i].distance.toFixed(2);
          }
          that.setData({
            my_bicycle: e.docs
          })
          wx.hideLoading({})
        },
        onError(e) {}
      })
    })
  },

  onHide: function () {
    this.data.watcher.close();
  },

  onUnload: function () {
    this.data.watcher.close();
  },

  onPageScroll: function (e) {
    if (e.scrollTop > 500) {
      this.setData({
        show_top: false
      })
    } else {
      //to top icon shown
      this.setData({
        show_top: true
      })
    }
  },

  preview: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.action],
      current: e.currentTarget.dataset.action
    })
  },

  go_top: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },

  show_info: function (e) {
    var that = this;
    for (var i = 0; i < that.data.my_bicycle.length; i++) {
      if (that.data.my_bicycle[i]._id == e.currentTarget.dataset.action._id) {
        that.data.my_bicycle[i].is_info_hide = !that.data.my_bicycle[i].is_info_hide;
        that.data.my_bicycle[i].tip == "详情" ? that.data.my_bicycle[i].tip = "收起" : that.data.my_bicycle[i].tip = "详情";
        break;
      }
    }
    that.setData({
      my_bicycle: that.data.my_bicycle
    })
    wx.pageScrollTo({
      selector: `#${e.currentTarget.dataset.action._id}`,
      duration: 500
    })
  },

  goto_user_bicycle_update: function (e) {
    app.globalData.my_bicycle = e.currentTarget.dataset.action;
    wx.navigateTo({
      url: '../user_bicycle_manage/user_bicycle_update/user_bicycle_update',
    })
  },

  goto_bicycle_add: function (e) {
    wx.navigateTo({
      url: '../user_bicycle_add/user_bicycle_add',
    })
  }
})