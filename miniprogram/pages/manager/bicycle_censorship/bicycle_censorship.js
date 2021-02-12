const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var verification_helper = require("../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");

Page({

  data: {
    bicycles: [],
    bicycles_rentable: [],
    bicycles_sellable: [],
    bicycles_sellable_and_rentable: [],
    is_hide: true,
    is_bicycles_rentable_hide: true,
    is_bicycles_sellable_hide: true,
    is_bicycles_sellable_and_rentable_hide: true,
    show_top: true,
    watcher: 0
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '车辆审核',
    })
    wx.showLoading({
      title: "加载中",
      mask: true
    })
    var that = this;
    var batchTimes;
    //get bicycles available and locked
    var count = db.collection("bicycles").where({
      is_locked: true,
      is_available: true
    }).count();
    count.then(function (result) {
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],
        x = 0;
      if (!count) {
        that.setData({
          bicycles: [],
          bicycles_rentable: [],
          bicycles_sellable: [],
          bicycles_sellable_and_rentable: [],
          is_hide: false
        })
        wx.hideLoading({
          success(res){
            notification_helper.show_toast_without_icon("暂无待审核车辆",2000);
          }
        })
        return;
      }
      for (var i = 0; i < batchTimes; i++) {
        db.collection("bicycles").skip(i * 20).where({
          is_locked: true,
          is_available: true
        }).field({
          name: true,
          poster: true,
          owner: true,
          time_created: true,
          is_sellable: true,
          is_rentable: true,
          detail: true
        }).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
            }
            x++;
            if (x == batchTimes) {
              var bicycles_rentable = [],
                bicycles_sellable = [],
                bicycles_sellable_and_rentable = [];
              for (var k = 0; k < arrayContainer.length; k++) {
                arrayContainer[k].date_time = time_helper.format_time(arrayContainer[k].time_created).date_time;
                if (arrayContainer[k].is_rentable && arrayContainer[k].is_sellable) {
                  bicycles_sellable_and_rentable.push(arrayContainer[k]);
                  continue;
                }
                if (arrayContainer[k].is_rentable) {
                  bicycles_rentable.push(arrayContainer[k]);
                  continue;
                }
                if (arrayContainer[k].is_sellable) {
                  bicycles_sellable.push(arrayContainer[k]);
                  continue;
                }
              }
              arrayContainer.sort(compare_helper.compare("time_created")).reverse();
              that.setData({
                bicycles: arrayContainer.sort(compare_helper.compare("time_created")).reverse(),
                bicycles_rentable: bicycles_rentable.sort(compare_helper.compare("time_created")).reverse(),
                bicycles_sellable: bicycles_sellable.sort(compare_helper.compare("time_created")).reverse(),
                bicycles_sellable_and_rentable: bicycles_sellable_and_rentable.sort(compare_helper.compare("time_created")).reverse(),
                is_hide: false
              })
              wx.hideLoading({})
            }
          }
        })
      }
    })
  },

  onShow: function () {
    var that = this;
    that.setData({
      watcher: db.collection("bicycles").where({
        is_locked: true
      }).watch({
        onChange(e) {
          that.onLoad();
        },
        onError(e) {

        }
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

  show_bicycles_rentable: function (e) {
    var that = this;
    that.setData({
      is_bicycles_rentable_hide: !that.data.is_bicycles_rentable_hide
    })
  },

  show_bicycles_sellable: function (e) {
    var that = this;
    that.setData({
      is_bicycles_sellable_hide: !that.data.is_bicycles_sellable_hide
    })
  },

  show_bicycles_sellable_and_rentable: function (e) {
    var that = this;
    that.setData({
      is_bicycles_sellable_and_rentable_hide: !that.data.is_bicycles_sellable_and_rentable_hide
    })
  },

  goto_bicycle_detail_check: function (e) {
    app.globalData.my_bicycle = e.currentTarget.dataset.action;
    wx.navigateTo({
      url: '../bicycle_censorship/bicycle_detail_check/bicycle_detail_check',
    })
  }

})