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
    show_transactions: {
      rentals_created: false,
      sales_created: false,
      rentals_involved: false,
      sales_involved: false
    },
    watcher: 0,
    show_top: true
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的交易',
    })
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
        time_created: true,
        type: true
      }).get({
        success(res) {
          that.data.bicycles.push(res.data);
          that.setData({
            bicycles: that.data.bicycles
          })
        }
      })
    }
    check();


    function check() {
      if (!app.globalData.user.my_transactions.length) {
        wx.hideLoading({
          success(res){
            notification_helper.show_toast_without_icon("您尚未进行过交易",2000);
            return;
          }
        })
      }
      if (that.data.transactions.length == app.globalData.user.my_transactions.length && that.data.bicycles.length == app.globalData.user.my_transactions.length) {
        //all transaction data ready
        for (var i = 0; i < that.data.transactions.length; i++) {
          that.data.transactions_and_bicycles.push({
            id: i,
            bicycle: {},
            transaction: that.data.transactions[i],
            time_created: null
          });
        }
        //join tables
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
        //classify transactions, involved or created, sale or rental, expired or valid
        for (var i = 0; i < that.data.transactions_and_bicycles.length; i++) {
          that.data.transactions_and_bicycles[i].transaction.date_time = time_helper.format_time(new Date(that.data.transactions_and_bicycles[i].transaction.time_created)).date_time;
          if (!that.data.transactions_and_bicycles[i].transaction.is_valid) {
            if (that.data.transactions_and_bicycles[i].transaction.is_expired) {
              that.data.transactions_and_bicycles[i].background = "#FA5159";
              that.data.transactions_and_bicycles[i].transaction.status = "已失效";
            } else {
              that.data.transactions_and_bicycles[i].background = "#188FC8";
              that.data.transactions_and_bicycles[i].transaction.status = "待确认";
            }
          } else {
            if (that.data.transactions_and_bicycles[i].transaction.is_expired) {
              that.data.transactions_and_bicycles[i].background = "#FF5535";
              that.data.transactions_and_bicycles[i].transaction.status = "已过期";
            } else {
              that.data.transactions_and_bicycles[i].background = "#07C160";
              that.data.transactions_and_bicycles[i].transaction.status = "已成交";
            }
          }
          switch (that.data.transactions_and_bicycles[i].transaction.type) {
            case ("rental"):
              that.data.transactions_and_bicycles[i].transaction.rental_date_start_string = time_helper.format_time(that.data.transactions_and_bicycles[i].transaction.rental_date_start).date;
              that.data.transactions_and_bicycles[i].transaction.rental_date_end_string = time_helper.format_time(that.data.transactions_and_bicycles[i].transaction.rental_date_end).date;
              if (that.data.transactions_and_bicycles[i].transaction.owner_id == app.globalData.user._id) {
                that.data.transactions_and_bicycles[i].transaction.type_detail = "rental_involved";
                that.data.rentals_involved.push(that.data.transactions_and_bicycles[i]);
              } else {
                that.data.transactions_and_bicycles[i].transaction.type_detail = "rental_created";
                that.data.rentals_created.push(that.data.transactions_and_bicycles[i]);
              }
              break;
            case ("sale"):
              that.data.transactions_and_bicycles[i].transaction.date_time = time_helper.format_time(new Date(that.data.transactions_and_bicycles[i].transaction.time_created)).date_time;
              if (that.data.transactions_and_bicycles[i].transaction.seller_id == app.globalData.user._id) {
                that.data.transactions_and_bicycles[i].transaction.type_detail = "sale_involved";
                that.data.sales_involved.push(that.data.transactions_and_bicycles[i]);
              } else {
                that.data.transactions_and_bicycles[i].transaction.type_detail = "sale_created";
                that.data.sales_created.push(that.data.transactions_and_bicycles[i]);
              }
              break;
          }
        }
        that.data.rentals_created.sort(compare_helper.compare("time_created"));
        that.data.rentals_involved.sort(compare_helper.compare("time_created"));
        that.data.sales_created.sort(compare_helper.compare("time_created"));
        that.data.sales_involved.sort(compare_helper.compare("time_created"));
        that.setData({
          rentals_created: that.data.rentals_created.reverse(),
          rentals_involved: that.data.rentals_involved.reverse(),
          sales_created: that.data.sales_created.reverse(),
          sales_involved: that.data.sales_involved.reverse()
        })
        wx.hideLoading({})
      } else {
        setTimeout(check, 500);
      }
    }
  },

  onShow: function (e) {
    var that = this;
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
    wx.stopPullDownRefresh({})
  },

  preview: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.action],
      current: e.currentTarget.dataset.action
    })
  },

  goto_transaction_detail: function (e) {
    app.globalData.my_bicycle_and_transaction = e.currentTarget.dataset.action;
    wx.navigateTo({
      url: '../my_transactions/transaction_detail/transaction_detail',
    })
  }

})