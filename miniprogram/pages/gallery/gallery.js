const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../utils/helpers/compare_helper");
var notification_helper = require("../../utils/helpers/notification_helper");
var location_helper = require("../../utils/helpers/location_helper");
var time_helper = require("../../utils/helpers/time_helper");
var versatile_helper = require("../../utils/helpers/versatile_helper");

Page({
  data: {
    events_and_snapshots: [],
    events_and_snapshots_shown: [],
    is_show_more_hide: true,
    show_top: true,
  },

  onLoad: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    var batchTimes;
    var count = db.collection("events").count();
    count.then(function (result) {
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],
        x = 0;
      for (var i = 0; i < batchTimes; i++) {
        db.collection("events").skip(i * 20).field({
          _id: true,
          name: true,
          poster: true,
          detail: true,
          snapshots: true,
          snapshots_count: true,
          time: true
        }).get({
          success(res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
            }
            x++;
            if (x == batchTimes) {
              arrayContainer.sort(compare_helper.compare("time")).reverse();
              var events_and_snapshots = [];
              for (var i = 0; i < arrayContainer.length; i++) {
                for (var j = 0; j < arrayContainer[i].snapshots_count; j++) {
                  arrayContainer[i].snapshots[j]._id = arrayContainer[i]._id;
                }
                events_and_snapshots.push({
                  _id: arrayContainer[i]._id,
                  name: arrayContainer[i].name,
                  detail: arrayContainer[i].detail,
                  poster: arrayContainer[i].poster,
                  snapshots: arrayContainer[i].snapshots,
                  tip: arrayContainer[i].snapshots_count ? `共${arrayContainer[i].snapshots_count}张图片` : "暂无图片"
                });
              }
              that.setData({
                events_and_snapshots: events_and_snapshots,
                events_and_snapshots_shown: [events_and_snapshots[0], events_and_snapshots[1]],
                is_show_more_hide: false
              })
              wx.hideLoading({})
            }
          }
        })
      }
    })
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

  go_top: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },

  preview: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.action],
      current: e.currentTarget.dataset.action
    })
  },

  preview_group: function (e) {
    var that = this;
    var current = [],
      current_urls = [];
    for (var i = 0; i < that.data.events_and_snapshots.length; i++) {
      if (that.data.events_and_snapshots[i]._id == e.currentTarget.dataset.group._id) {
        current = that.data.events_and_snapshots[i].snapshots;
        break;
      }
    }
    for (var i = 0; i < current.length; i++) {
      current_urls.push(current[i].url);
    }
    wx.previewImage({
      urls: current_urls,
      current: e.currentTarget.dataset.action
    })
  },

  show_more: function () {
    var that = this;
    if (that.data.events_and_snapshots_shown.length == that.data.events_and_snapshots.length) {
      that.setData({
        is_show_more_hide: true
      })
    } else {
      that.data.events_and_snapshots_shown.push(that.data.events_and_snapshots[that.data.events_and_snapshots_shown.length]);
      that.setData({
        events_and_snapshots_shown: that.data.events_and_snapshots_shown,
        is_show_more_hide: that.data.events_and_snapshots_shown.length == that.data.events_and_snapshots.length ? true : false
      })
      wx.pageScrollTo({
        selector: '#end',
        duration: 200
      })
    }
  }

})