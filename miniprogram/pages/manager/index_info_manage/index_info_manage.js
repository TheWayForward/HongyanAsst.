const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");

Page({

  data: {
    bulletin: "",
    bulletin_previous: "",
    text_counter: "...",
    is_submission_available: false
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '首页信息',
    })
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    db.collection("basic").doc("bulletin").get({
      success(res) {
        that.setData({
          bulletin: res.data.content,
          bulletin_previous: res.data.content,
          text_counter: `${res.data.content.length}/100`,
          is_submission_available: true
        })
        wx.hideLoading({})
      }
    })
  },

  input_bulletin: function (e) {
    this.setData({
      bulletin: e.detail.value,
      text_counter: `${e.detail.value.length}/100`,
      is_submission_available: e.detail.value.length ? true : false
    })
  },

  input_clear: function (e) {
    this.setData({
      bulletin: "",
      text_counter: "0/100",
      is_submission_available: false
    })
  },

  submit: function () {
    var that = this;
    if (!that.data.bulletin) {
      notification_helper.show_toast_without_icon("公告不能为空", 2000);
      return;
    } else if (that.data.bulletin == that.data.bulletin_previous) {
      notification_helper.show_toast_without_icon("公告未更改", 2000);
      return;
    }
    if (that.data.bulletin.length < 10) {
      notification_helper.show_toast_without_icon("公告长度10字以上", 2000);
    }
    that.setData({
      is_submission_available: false
    })
    wx.showModal({
      title: "提示",
      content: "确认更新首页公告栏？",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) {
          return;
        } else {
          wx.showLoading({
            title: '数据更新中',
            mask: true
          })
          wx.cloud.callFunction({
            name: 's_check_text',
            //sensitivity check
            data: {
              text: that.data.bulletin
            }
          }).then(res => {
            if (res.result.code == 200) {
              wx.cloud.callFunction({
                name: "update_index_info",
                data: {
                  _id: "bulletin",
                  content: that.data.bulletin,
                  modifier: {
                    modifier_id: app.globalData.user._id,
                    modifier_openid: app.globalData.user.openid,
                    modifier_realname: app.globalData.user.realname,
                    time_modified: Date.now()
                  }
                },
                success(res) {
                  console.log("[cloudfunction][update_index_info]: updated successfully");
                  wx.showToast({
                    title: '发布成功',
                    duration: 2000,
                    mask: true,
                    success(res) {
                      function refresh() {
                        wx.reLaunch({
                          url: '../../index/index',
                        })
                      }
                      setTimeout(refresh, 2000);
                    }
                  })
                },
                fail(res) {
                  console.log("[cloudfunction][update_index_info]: failed to update");
                  notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                }
              })
            } else {
              notification_helper.show_toast_without_icon("评论包含敏感字", 2000);
              that.setData({
                is_submission_available: true
              })
              return;
            }
          })
        }
      }
    })
  }
})