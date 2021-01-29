const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../../utils/helpers/compare_helper");
var time_helper = require("../../../../utils/helpers/time_helper");
var verification_helper = require("../../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../../utils/helpers/notification_helper");

Page({

  data: {
    transaction: {},
    bicycle: {},
    user_create: {},
    user_involve: {},
    is_hide: true,
    is_transaction_options_hide: true
  },

  onLoad: function (options) {
    wx.showLoading({
      title: "加载中",
    })
    var that = this;
    that.setData({
      transaction: app.globalData.my_bicycle_and_transaction.transaction,
      bicycle: app.globalData.my_bicycle_and_transaction.bicycle
    })
    if (app.globalData.my_bicycle_and_transaction.transaction.type_detail == "rental_created" || app.globalData.my_bicycle_and_transaction.transaction.type_detail == "sale_created") {
      //not my bicycle
      db.collection("user").doc(app.globalData.my_bicycle_and_transaction.bicycle.owner._id).field({
        _id: true,
        QQ: true,
        avatar: true,
        campus: true,
        dept: true,
        email: true,
        is_manager: true,
        my_bicycle: true,
        my_transactions: true,
        nickname: true,
        openid: true,
        realname: true,
        tel: true
      }).get({
        success(res) {
          that.setData({
            user_create: app.globalData.user,
            user_involve: res.data,
            is_hide: false
          })
          wx.hideLoading({})
        }
      })
    } else {
      //my bicycle
      if(!app.globalData.my_bicycle_and_transaction.transaction.is_valid && !app.globalData.my_bicycle_and_transaction.transaction.is_expired) {
        that.setData({
          is_transaction_options_hide: false
        })
      }
      db.collection("user").where({
        openid: app.globalData.my_bicycle_and_transaction.transaction.openid
      }).field({
        _id: true,
        QQ: true,
        avatar: true,
        campus: true,
        dept: true,
        email: true,
        is_manager: true,
        my_bicycle: true,
        my_transactions: true,
        nickname: true,
        openid: true,
        realname: true,
        tel: true
      }).get({
        success(res) {
          that.setData({
            user_create: res.data[0],
            user_involve: app.globalData.user,
            is_hide: false
          })
          wx.hideLoading({})
        }
      })
    }
    console.log(that.data);
  },

  onUnload: function () {
    app.globalData.my_bicycle_and_transaction = {};
  },

  approve_rental_involved: function () {
    console.log("[transaction_detail][approve_rental_involve]: called");
  },

  reject_rental_involved: function () {
    console.log("[transaction_detail][reject_rental_involved]: called");
    var that = this;
    wx.showModal({
      title: '提示',
      content: `拒绝${that.data.transaction.renter.realname}租赁您的车辆"${that.data.bicycle.name}"？`,
      cancelColor: 'gray',
      cancelText: '取消',
      confirmColor: '#E1251B',
      confirmText: '确定',
      success(res) {
        if (res.cancel) return;
        else {
          wx.showLoading({
            title: "数据更新中",
            mask: true
          })
          that.setData({
            is_transaction_options_hide: true
          })
          //set my transactions expired
          for (var i = 0; i < app.globalData.user.my_transactions.length; i++) {
            if (that.data.transaction._id == app.globalData.user.my_transactions[i].transaction_id) {
              app.globalData.user.my_transactions[i].is_expired = true;
              break;
            }
          }
          //set renter transactions expired
          for (var i = 0; i < that.data.user_create.my_transactions.length; i++) {
            if (that.data.transaction._id == that.data.user_create.my_transactions[i].transaction_id) {
              that.data.user_create.my_transactions[i].is_expired = true;
              break;
            }
          }
          //clear the renter
          that.data.bicycle.renter = {
              renter_id: null
            },
            wx.cloud.callFunction({
              name: "update_bicycle_renter",
              data: {
                _id: that.data.bicycle._id,
                renter: {
                  renter_id: null
                }
              },
              success(res) {
                console.log("[cloudfunction][update_bicycle_renter]: updated successfully");
                wx.cloud.callFunction({
                  name: "update_transaction_state",
                  data: {
                    _id: that.data.transaction._id,
                    is_valid: false,
                    is_expired: true
                  },
                  success(res) {
                    console.log("[cloudfunction][update_transaction_state]: updated successfully");
                    wx.cloud.callFunction({
                      name: "update_user_transactions",
                      data: {
                        _id: app.globalData.user._id,
                        my_transactions: app.globalData.user.my_transactions
                      },
                      success(res) {
                        console.log("[cloudfunction][update_user_transactions]: updated my transactions successfully");
                        wx.cloud.callFunction({
                          name: "update_user_transactions",
                          data: {
                            _id: that.data.user_create._id,
                            my_transactions: that.data.user_create.my_transactions
                          },
                          success(res) {
                            console.log("[cloudfunction][update_user_transactions]: updated renter's transactions successfully");
                            wx.hideLoading({
                              success(res) {
                                wx.showToast({
                                  title: "交易已取消",
                                  mask: true,
                                  duration: 5000
                                })

                                function refresh() {
                                  wx.reLaunch({
                                    url: '../../../index/index',
                                  })
                                }
                                setTimeout(refresh, 2000);
                              }
                            })
                          },
                          fail(res) {
                            console.log("[cloudfunction][update_user_transactions]: failed to update renter's transactions");
                            notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                          }
                        })
                      },
                      fail(res) {
                        console.log("[cloudfunction][update_user_transactions]: failed to update my transactions");
                        notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                      }
                    })
                  },
                  fail(res) {
                    console.log("[cloudfunction][update_transaction_state]: failed to update");
                    notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                  }
                })
              },
              fail(res) {
                console.log(res);
                console.log("[cloudfunction][update_bicycle_renter]: failed to update");
                notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
              }
            })
        }
      }
    })
  },

  approve_sale_involved: function () {
    console.log("[transaction_detail][approve_sale_involved]: called");
  },

  reject_sale_involved: function () {
    console.log("[transaction_detail][reject_sale_involved]: called");
  }

})