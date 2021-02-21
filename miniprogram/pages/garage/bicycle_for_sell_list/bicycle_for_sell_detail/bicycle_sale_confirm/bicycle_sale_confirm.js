const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../../../utils/helpers/compare_helper");
var time_helper = require("../../../../../utils/helpers/time_helper");
var verification_helper = require("../../../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../../../utils/helpers/notification_helper");
var transaction_helper = require("../../../../../utils/helpers/transaction_helper");

Page({

  data: {
    transaction: {},
    serial_number: transaction_helper.generate_serial_number_for_sale(),
    password: "",
    is_submission_available: false
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '购单确认',
    })
    var that = this;
    that.setData({
      transaction: app.globalData.my_transaction
    })
    console.log(app.globalData.my_transaction)
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  input_password: function (e) {
    this.setData({
      password: e.detail.value,
      is_submission_available: e.detail.value ? true : false
    })
  },

  submit: function () {
    var that = this;
    if (that.data.password != that.data.transaction.bicycle.password) {
      notification_helper.show_toast_without_icon("车辆密钥错误", 2000);
      return;
    }
    wx.showModal({
      title: "提示",
      content: `确认提交订单？`,
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) return;
        else {
          that.setData({
            is_submission_available: false
          })
          wx.showLoading({
            title: "订单提交中",
            mask: true
          })
          var count = db.collection("transactions").count();
          count.then(function (result) {
            count = "" + ++result.total;
            var time_created = Date.now();
            db.collection("transactions").add({
              data: {
                _id: count,
                openid: app.globalData.user.openid,
                type: "sale",
                serial_number: that.data.serial_number,
                seller: that.data.transaction.seller,
                seller_openid: that.data.transaction.seller_openid,
                seller_id: that.data.transaction.seller_id,
                buyer: that.data.transaction.buyer,
                buyer_openid: that.data.transaction.buyer_openid,
                buyer_id: that.data.transaction.buyer_id,
                bicycle_id: that.data.transaction.bicycle._id,
                is_valid: false,
                is_expired: false,
                time_created: time_created
              },
              success(res){
                console.log("[database][transactions]: add successfully");
                wx.showLoading({
                  title: "数据更新中",
                  mask: true
                })
                var transaction_new = {
                  transaction_id: count,
                  serial_number: that.data.serial_number,
                  type: "sale",
                  buyer_openid: that.data.transaction.buyer_openid,
                  buyer_id: that.data.transaction.buyer_id,
                  seller_openid: that.data.transaction.seller_openid,
                  seller_id: that.data.transaction.seller_id,
                  bicycle_id: that.data.transaction.bicycle._id,
                  time_created: time_created,
                  is_valid: false,
                  is_expired: false
                }
                app.globalData.user.my_transactions.push(transaction_new);
                that.data.transaction.seller_transactions.push(transaction_new);
                wx.cloud.callFunction({
                  name: "update_user_transactions",
                  data: {
                    _id: app.globalData.user._id,
                    my_transactions: app.globalData.user.my_transactions
                  },
                  success(res) {
                    console.log("[cloudfunction][update_user_transactions]: updated renter successfully");
                    wx.cloud.callFunction({
                      name: "update_user_transactions",
                      data: {
                        _id: that.data.transaction.seller_id,
                        my_transactions: that.data.transaction.seller_transactions
                      },
                      success(res) {
                        console.log("[cloudfunction][update_user_transactions]: updated owner successfully");
                        wx.cloud.callFunction({
                          name: "update_bicycle_renter",
                          data: {
                            _id: that.data.transaction.bicycle._id,
                            renter: {
                              transaction_id: count,
                              transaction_serial_number: that.data.serial_number,
                              renter_openid: that.data.transaction.buyer_openid,
                              renter_id: that.data.transaction.buyer_id,
                              rental_date_start: 0,
                              rental_date_end: 0,
                              rental_duration: 0                 
                            }
                          },
                          success(res) {
                            console.log("[cloudfunction][update_bicycle_renter]: updated successfully");
                            wx.hideLoading({
                              success(res) {
                                wx.showToast({
                                  title: "订单已提交",
                                  mask: true,
                                  duration: 5000
                                })

                                function refresh() {
                                  wx.reLaunch({
                                    url: '../../../../index/index',
                                  })
                                }
                                setTimeout(refresh, 2000);
                              }
                            })
                          },
                          fail(res) {
                            console.log(res);
                            console.log("[cloudfunction][update_bicycle_renter]: failed to update");
                            notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                          }
                        })
                      },
                      fail(res) {
                        console.log(res);
                        console.log("[cloudfunction][update_user_transactions]: failed to update owner");
                        notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                      }
                    })
                  },
                  fail(res) {
                    console.log(res);
                    console.log("[cloudfunction][update_user_transactions]: failed to update renter");
                    notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                  }
                })
              },
              fail(res){
                console.log(res);
                console.log("[database][transactions]: failed to add");
                notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
              }
            })
          })
        }
      }
    })
  }

})