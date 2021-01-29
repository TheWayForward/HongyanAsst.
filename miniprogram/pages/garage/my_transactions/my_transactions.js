const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var verification_helper = require("../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");

Page({

  data: {
    transactions: [],
    bicycles: [],
    transactions_and_bicycles: [],
    transactions_involved: [],
    transactions_created: [],
    rentals_created: [],
    rentals_involved: [],
    sales_created: [],
    sales_involved: [],
    watcher: 0,
    show_top: true
  },

  onLoad: function (options) {
    wx.showLoading({
      title: "加载中",
      mask: true
    })
    var that = this;
    that.setData({
      transactions: [],
      bicycles: [],
      transactions_and_bicycles: [],
      transactions_involved: [],
      transactions_created: [],
      rentals_created: [],
      rentals_involved: [],
      sales_created: [],
      sales_involved: [],
    })
    for (var i = 0; i < app.globalData.user.my_transactions.length; i++) {
      db.collection("transactions").doc(app.globalData.user.my_transactions[i].transaction_id).get({
        success(res) {
          that.data.transactions.push(res.data);
          that.setData({
            transactions: that.data.transactions
          })
        }
      })
      db.collection("bicycles").doc(app.globalData.user.my_transactions[i].bicycle_id).field({
        _id: true,
        brand: true,
        detail: true,
        device: true,
        distance: true,
        is_locked: true,
        manufacture_time: true,
        poster: true,
        name: true,
        owner: true,
        renter: true,
        time_created: true
      }).get({
        success(res) {
          that.data.bicycles.push(res.data);
          that.setData({
            bicycles: that.data.bicycles
          })
        }
      })
    }
    if (!app.globalData.user.my_transactions[0]) {
      wx.hideLoading({
        success(res) {
          notification_helper.show_toast_without_icon("您尚未进行过交易", 2000);
        }
      })
    } else {
      check();
    }

    function check() {
      if (that.data.transactions.length == app.globalData.user.my_transactions.length && that.data.bicycles.length == app.globalData.user.my_transactions.length) {
        for (var i = 0; i < that.data.transactions.length; i++) {
          if (that.data.transactions[i].type == "rental") {
            that.data.transactions[i].date_time = time_helper.format_time(new Date(that.data.transactions[i].time_created)).date_time;
            that.data.transactions[i].rental_date_start_string = time_helper.format_time(that.data.transactions[i].rental_date_start).date;
            that.data.transactions[i].rental_date_end_string = time_helper.format_time(that.data.transactions[i].rental_date_end).date;
            if (!that.data.transactions[i].is_valid) {
              if (that.data.transactions[i].is_expired) {
                that.data.transactions[i].status = "已失效";
              } else {
                that.data.transactions[i].status = "待确认";
              }
            } else {
              if (that.data.transactions[i].is_expired) {
                that.data.transactions[i].status = "已过期";
              } else {
                that.data.transactions[i].status = "已确认";
              }
            }
            that.data.transactions_and_bicycles.push({
              bicycle: {},
              transaction: that.data.transactions[i],
              time_created: null
            });
          }
        }
        for (var i = 0; i < that.data.transactions_and_bicycles.length; i++) {
          for (var j = 0; j < that.data.bicycles.length; j++) {
            if (that.data.transactions_and_bicycles[i].transaction.bicycle_id == that.data.bicycles[j]._id) {
              that.data.transactions_and_bicycles[i].bicycle = that.data.bicycles[j];
              break;
            }
          }
          that.data.transactions_and_bicycles[i].time_created = that.data.transactions_and_bicycles[i].transaction.time_created;
        }
        that.setData({
          transactions_and_bicycles: that.data.transactions_and_bicycles
        })
        for (var i = 0; i < that.data.transactions_and_bicycles.length; i++) {
          if (that.data.transactions_and_bicycles[i].bicycle.owner.openid == app.globalData.user.openid) {
            that.data.transactions_involved.push(that.data.transactions_and_bicycles[i]);
            if (that.data.transactions_and_bicycles[i].transaction.type == "rental") {
              that.data.transactions_and_bicycles[i].transaction.type_detail = "rental_involved";
              that.data.rentals_involved.push(that.data.transactions_and_bicycles[i]);
            }
            //sale
          } else {
            that.data.transactions_created.push(that.data.transactions_and_bicycles[i]);
            if (that.data.transactions_and_bicycles[i].transaction.type == "rental") {
              that.data.transactions_and_bicycles[i].transaction.type_detail = "rental_created";
              that.data.rentals_created.push(that.data.transactions_and_bicycles[i]);
            }
            //sale
          }
        }
        that.data.transactions_involved.sort(compare_helper.compare("time_created"));
        that.data.transactions_created.sort(compare_helper.compare("time_created"));
        that.data.rentals_created.sort(compare_helper.compare("time_created"));
        that.data.rentals_involved.sort(compare_helper.compare("time_created"));
        that.data.sales_created.sort(compare_helper.compare("time_created"));
        that.data.sales_involved.sort(compare_helper.compare("time_created"));
        that.setData({
          transactions_involved: that.data.transactions_involved.reverse(),
          transactions_created: that.data.transactions_created.reverse(),
          rentals_created: that.data.rentals_created.reverse(),
          rentals_involved: that.data.rentals_involved.reverse(),
          sales_created: that.data.sales_created.reverse(),
          sales_involved: that.data.sales_involved.reverse()
        })
        console.log(that.data);
        wx.hideLoading({})
      } else {
        setTimeout(check, 500);
      }
    }

  },

  onShow: function (e) {

  },

  onPageScroll: function (e) {
    var that = this;
    that.setData({
      show_top: e.scrollTop > 500 ? false : true
    })
  },

  go_top: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },

  onPullDownRefresh: function (e) {
    this.onLoad();
  },

  goto_transaction_detail: function (e) {
    app.globalData.my_bicycle_and_transaction = e.currentTarget.dataset.action;
    wx.navigateTo({
      url: '../my_transactions/transaction_detail/transaction_detail',
    })
  }

})