const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../../utils/helpers/compare_helper");
var time_helper = require("../../../../utils/helpers/time_helper");
var verification_helper = require("../../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../../utils/helpers/notification_helper");

Page({

  data: {
    bicycle: {},
    user: {},
    is_hide: true,
    show_top: true
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '车辆详情',
    })
    wx.showLoading({
      title: "加载中",
      mask: true
    })
    var that = this;
    db.collection("bicycles").doc(app.globalData.my_bicycle._id).get({
      success(result) {
        db.collection("user").doc(app.globalData.my_bicycle.owner._id).field({
          QQ: true,
          avatar: true,
          birthday: true,
          campus: true,
          credit: true,
          detail: true,
          dept: true,
          email: true,
          is_manager: true,
          nickname: true,
          realname: true,
          my_bicycle: true,
          tel: true,
          total_distance: true
        }).get({
          success(res) {
            result.data.date_time = time_helper.format_time(result.data.time_created).date_time;
            result.data.distance_string = result.data.distance.toFixed(2);
            res.data.date = time_helper.format_time(res.data.birthday).date;
            res.data.distance = res.data.total_distance.toFixed(2);
            that.setData({
              bicycle: result.data,
              user: res.data,
              is_hide: false
            })
            wx.hideLoading({})
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
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },


  reject: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  reject: function () {
    var that = this;
    wx.showModal({
      title: "提示",
      content: `确认撤回用户${that.data.user.nickname}的车辆"${that.data.bicycle.name}"的审核？撤回后车辆将自商品列表中移除，并被锁定。`,
      confirmText: "确定",
      confirmColor: "#FA5159",
      cancelText: "取消",
      success(res) {
        if (res.cancel) return;
        else {
          wx.showLoading({
            title: "处理中",
            mask: true
          })
          wx.cloud.callFunction({
            name: "update_bicycle_state",
            data: {
              _id: that.data.bicycle._id,
              is_available: true,
              my_lock_state: true,
              my_sell_state: that.data.bicycle.is_sellable,
              my_rent_state: that.data.bicycle.is_rentable
            },
            success(res) {
              console.log("[cloudfunction][update_bicycle_state]: updated successfully");
              wx.showLoading({
                title: "数据更新中",
                mask: true
              })
              for (var i = 0; i < that.data.user.my_bicycle.length; i++) {
                if (that.data.bicycle._id == that.data.user.my_bicycle[i]._id) {
                  that.data.user.my_bicycle[i].is_locked = true;
                  break;
                }
              }
              wx.cloud.callFunction({
                name: "update_user_bicycle",
                data: {
                  _id: that.data.user._id,
                  my_bicycle: that.data.user.my_bicycle
                },
                success(res) {
                  console.log("[cloudfunction][update_user_bicycle]: updated successfully");
                  wx.hideLoading({
                    success(res) {
                      wx.showToast({
                        title: '已撤回审核',
                        icon: "none",
                        mask: true,
                        duration: 5000
                      })

                      function refresh() {
                        wx.reLaunch({
                          url: '../../../../pages/index/index',
                        })
                      }
                      setTimeout(refresh, 2000);
                    }
                  })
                },
                fail(res) {
                  console.log("[cloudfunction][update_user_bicycle]: failed to update");
                  notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                }
              })
            },
            fail(res) {
              console.log("[cloudfunction][update_bicycle_state]: failed to update");
              notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
            }
          })
        }
      }
    })
  }
})