const notification_helper = require("../../../utils/helpers/notification_helper");
const time_helper = require("../../../utils/helpers/time_helper");

const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    current_version: "加载中…",
    developers: [],
    developers_name: [],
    current_developer_name: "加载中…",
    current_developer: {},
    detail: "",
    //can't choose until the developer info's been got
    is_developers_got: false,
    //dynamic counter
    text_counter: "0/100",
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    that.setData({
      current_version: app.globalData.miniprogram_version
    })
    var count = db.collection("developers").count();
    var batchTimes;
    count.then(function (result) {
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],
        x = 0;
      var nameContainer = [];
      for (var i = 0; i < batchTimes; i++) {
        db.collection("developers").skip(i * 20).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
              nameContainer.push(res.data[j].name);
            }
            x++;
            if (x == batchTimes) {
              that.setData({
                developers: arrayContainer,
                developers_name: nameContainer,
                current_developer_name: "选择开发者",
                is_developers_got: true
              })
              wx.hideLoading({
                complete: (res) => {},
              })
            }
          }
        })
      }
    })
  },

  bind_developer_change: function (e) {
    this.setData({
      current_developer: this.data.developers[e.detail.value],
      current_developer_name: this.data.developers_name[e.detail.value]
    })
  },

  //input detail and change text counter
  input_detail: function (e) {
    this.setData({
      detail: e.detail.value,
      text_counter: `${e.detail.value.length}/100`
    });
    if (e.detail.value.length == 100) {
      notification_helper.show_toast_without_icon("文字数量已达上限", 2000);
    }
  },

  submit: function () {
    var that = this;
    if (this.data.current_developer_name == "选择开发者") {
      notification_helper.show_toast_without_icon("未选择开发者", 2000);
      return;
    }
    if (!this.data.detail) {
      notification_helper.show_toast_without_icon("未填写日志内容", 2000);
      return;
    }
    wx.showModal({
      title: "提示",
      content: "确认发布开发日志？",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) {
          return;
        } else {
          that.setData({
            is_developers_got: false
          })
          var count = db.collection("progress").count();
          count.then(function (result) {
            count = result.total;
            db.collection("progress").add({
              data: {
                _id: "" + ++count,
                contributor: that.data.current_developer_name,
                date: time_helper.format_time(new Date()).date,
                year: time_helper.format_time(new Date()).year,
                version: that.data.current_version,
                details: that.data.detail
              },
              success: function (res) {
                wx.showToast({
                  title: '发布成功',
                  mask: true,
                  duration: 2000,
                  success: function (res) {
                    wx.reLaunch({
                      url: '../../official/official',
                    })
                  }
                })
              }
            }, )
          })
        }
      }
    })
  }
})