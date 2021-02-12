const app = getApp();
const db = wx.cloud.database()
var developers = [];
var compare_helper = require("../../utils/helpers/compare_helper");
var time_helper = require("../../utils/helpers/time_helper");
var notification_helper = require("../../utils/helpers/notification_helper");
var location_helper = require("../../utils/helpers/location_helper");
var versatile_helper = require("../../utils/helpers/versatile_helper");

Page({
  data: {
    //users    
    users: [],
    version: "",
    //user info container
    dialog: false,
    dialog_title: "",
    dialog_detail: "",
    progress: [],
    developers: [],
    developers_1: [],
    developers_2: [],
    isHide: true,
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '关于我们',
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    //loading developer info, rendered initially
    var batchTimes;
    var count = db.collection("developers").count();
    count.then(function (result) {
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [], x = 0;
      for (var i = 0; i < batchTimes; i++) {
        db.collection("developers").skip(i * 20).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
            }
            x++;
            if (x == batchTimes) 
            {
              arrayContainer.sort(compare_helper.compare("_id"));
              var odd = [],even = [];
              for(var k = 0; k < arrayContainer.length; k++) {
                arrayContainer[k].len = versatile_helper.get_length_for_block(arrayContainer[k].details.length);
                k % 2 ? even.push(arrayContainer[k]) : odd.push(arrayContainer[k]);
              }
              that.setData({
                developers: arrayContainer,
                developers_1: even,
                developers_2: odd,
              })
              //loading progress info
              count = db.collection("progress").count();
              count.then(function (result) {
              count = result.total;
              batchTimes = Math.ceil(count / 20);
              var arrayContainer = [], x = 0;
              for (var i = 0; i < batchTimes; i++) {
                db.collection("progress").skip(i * 20).get({
                  success(res){
                    for (var j = 0; j < res.data.length; j++) {
                      arrayContainer.push(res.data[j]);
                    }
                    x++;
                    if (x == batchTimes) 
                    {
                      arrayContainer.sort(compare_helper.compare("_id"));
                      arrayContainer.reverse();
                      //assigning image(avatar) field for corresponded progress
                      for(var i = 0; i < arrayContainer.length; i++){
                        for(var j = 0; j < that.data.developers.length; j++){
                          if(arrayContainer[i].contributor == that.data.developers[j].name)
                          {
                            arrayContainer[i].avatar = that.data.developers[j].avatar;  
                            break;
                          }
                        }
                      }
                      that.setData({
                        progress: arrayContainer,
                      })
                    }
                  }
                })
              }
            });
            }
          }
        })
      }
    });
  },

  onReady: function () {
    var that = this;
    //loading user info
    var batchTimes;
    var count = db.collection("user").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [], x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("user").skip(i * 20).field({
          avatar: true,
          detail: true,
          nickname: true
        }).get({success: function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
            }
            x++;
            if(x == batchTimes)
            {
              that.setData({
                isHide: false,
                users: arrayContainer,
                version: app.globalData.miniprogram_version
              })
              wx.hideLoading({
              }) 
            }
          }
        })
      }
    }) 
  },

  close: function() {
    this.setData({
        dialog: false,
    });
  },
  
  open: function(e) {
    this.setData({
      dialog: true,
      dialog_title: e.currentTarget.dataset.nickname,
      dialog_detail: e.currentTarget.dataset.detail
    });
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },
})