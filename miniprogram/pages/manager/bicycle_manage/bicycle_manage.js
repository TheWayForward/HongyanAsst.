const app = getApp();
const db = wx.cloud.database();
var request_helper = require("../../../utils/helpers/request_helper");
var compare_helper = require("../../../utils/helpers/compare_helper");

Page({

  /**
   * Page initial data
   */
  data: {
    bicycles: [],
    search_bicycles: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '获取车辆中',
    })
    var that = this;
    var id = "1";
    request_helper.select_bicycle_by_id(id).then((result) => {
      console.log(result.result.data.split("\n"));
      wx.hideLoading({})
    })
    /*
    var batchTimes;
    var count = db.collection("bicycles").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count/20);
      var arrayContainer = [], x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("bicycles").skip(i * 20).field({
          _id: true,
          brand: true,
          poster: true,
          owner: true,
          status: true,
          time_created: true
        }).get({
          success: function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
            }
            x++;
            if(x == batchTimes)
            {
              arrayContainer.sort(compare_helper.compare("_id"));
              that.setData({
                bicycles: arrayContainer,
                search_bicycles: arrayContainer
              })
              wx.hideLoading({
                complete: (res) => {},
              })
            }
          }
        })
      }
    })
    */
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})