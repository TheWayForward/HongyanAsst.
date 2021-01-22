const app = getApp();
const db = wx.cloud.database();
var request_helper = require("../../../utils/helpers/request_helper");
var compare_helper = require("../../../utils/helpers/compare_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");

Page({

  data: {
    is_add_bicycle_hide: true,
    add_bicycle_name: "",
    add_bicycle_id: "",
    add_bicycle_brand: "",
    add_bicycle_type: "",
    add_bicycle_price: "",
    add_bicycle_manufacture_time: ""
  },

  onLoad: function (options) {

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

  show_add_bicycle: function (e) {
    this.setData({
      is_add_bicycle_hide: !e.detail.value
    })
  },

  input_add_bicycle_name: function (e) {
    this.setData({
      add_bicycle_name: e.detail.value
    })
  },

  input_add_bicycle_id: function (e) {
    this.setData({
      add_bicycle_id: e.detail.value
    })
  },

  input_add_bicycle_brand: function (e) {
    this.setData({
      add_bicycle_brand: e.detail.value
    })
  },

  input_add_bicycle_type: function (e) {
    this.setData({
      add_bicycle_type: e.detail.value
    })
  },

  input_add_bicycle_price: function (e) {
    this.setData({
      add_bicycle_price: e.detail.value
    })
  },

  input_add_bicycle_manufacture_time: function (e) {
    this.setData({
      add_bicycle_manufacture_time: e.detail.value
    })
  },

  submit_add_bicycle: function () {
    var that = this;
    if (!that.data.add_bicycle_name) {
      notification_helper.show_toast_without_icon("未填写自行车名称", 2000);
      return;
    }
    if (!that.data.add_bicycle_id) {
      notification_helper.show_toast_without_icon("未填写自行车编号", 2000);
      return;
    }
    if (!that.data.add_bicycle_brand) {
      notification_helper.show_toast_without_icon("未填写自行车品牌",2000);
      return;
    }
    if (!that.data.add_bicycle_type) {
      notification_helper.show_toast_without_icon("未填写自行车类型",2000);
      return;
    }
    if (!that.data.add_bicycle_price) {
      notification_helper.show_toast_without_icon("未填写自行车价格",2000);
      return;
    }
    if(!that.data.add_bicycle_manufacture_time) {
      notification_helper.show_toast_without_icon("未填写自行车出厂时间",2000);
      return;
    }
    var bicycle = {
      bicycle_name: that.data.add_bicycle_name,
      bicycle_id: that.data.add_bicycle_id,
      seller_name: app.globalData.user.realname,
      seller_id: app.globalData.user.openid,
      status: 0,
      brand: that.data.add_bicycle_brand,
      type: that.data.add_bicycle_type,
      price: that.data.add_bicycle_price,
      manufacture_time: that.data.add_bicycle_manufacture_time
    }
    console.log(bicycle);
    request_helper.add_bicycle(bicycle).then((res) => {
      console.log(res);
    })
  }
})