const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");

Page({

  data: {
    user: {
      nickname: "加载中",
      realname: "",
      avatar: "../../../images/loading.gif"
    },
    //dynamic counter
    text_counter: "0/200",
    //event basic info
    event_date_start: "",
    event_date_end: "",
    event_date: "发布期限为一年",
    event_time_start: "00:00",
    event_time_end: "23:59",
    event_time: "选择活动时间",
    current_date: {
      year: time_helper.format_time(new Date()).year,
      month: time_helper.format_time(new Date()).month,
      date: time_helper.format_time(new Date()).day
    },
    //event basic info
    name: "",
    distance: null,
    name_start: "点击选择地点",
    location_start: null,
    name_return: "点击选择地点",
    location_return: null,
    difficulty: "拖动选择",
    detail: "",
    //device
    is_bind_device_hide: true,
    devices: [],
    devices_name:[],
    event_device: {},
    event_device_name: "点击选择设备",
    //event additional info
    is_upload_add_hide: false,
    files: [],
    //others
    tip: '点击"+"上传图片',
    is_submission_available: false
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '活动发布',
    })
    wx.showLoading({
      title: '加载中'
    })
    var that = this;
    var batchTimes;
    var count = db.collection("devices").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("devices").skip(i * 20).get({
          success: function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
            }
            x++;
            if(x == batchTimes)
            {
              arrayContainer.sort(compare_helper.compare("_id"));
              var devices_name = [];
              for(var i = 0; i < arrayContainer.length; i++){
                devices_name.push(arrayContainer[i].name);
              }
              that.setData({
                user: app.globalData.user,
                event_date_start: that.data.current_date.year + "-" + that.data.current_date.month + "-" + (that.data.current_date.date + 1),
                event_date_end: (that.data.current_date.year + 1) + "-" + that.data.current_date.month + "-" + that.data.current_date.date,
                devices: arrayContainer,
                devices_name: devices_name,
                is_submission_available: true
              })
              wx.hideLoading({
                complete: (res) => {},
              })
            }
          }
        })
      }
    })
  },

  input_name: function(e){
    this.setData({
      name: e.detail.value
    })
  },

  //set event date
  bind_event_date_change: function(e){
    this.setData({
      event_date: e.detail.value
    })
  },

  //set event time
  bind_event_time_change: function(e){
    this.setData({
      event_time: e.detail.value
    })
  },

  //set event distance, cannot use eval()
  input_distance: function(e){
    this.setData({
      distance: Number(e.detail.value)
    })
  },

  //choose starting or returning location
  choose_location: function(e){
    var that = this;
    if(e.target.id == "start")
    {
      wx.chooseLocation({
        complete(res){
          if(!res.name)
          {
            that.setData({
              name_start: "未选中位置，点我重新选择"
            })
          }
          else
          {
            //generate geopoint and set data
            that.setData({
              name_start: res.name,
              location_start: db.Geo.Point(res.longitude,res.latitude)
            })
          }
        },
      })
    }
    else
    {
      wx.chooseLocation({
        complete(res){
          if(!res.name)
          {
            that.setData({
              name_return: "未选中位置，点我重新选择"
            })
          }
          else
          {
            //generate geopoint and set data
            that.setData({
              name_return: res.name,
              location_return: db.Geo.Point(res.longitude,res.latitude)
            })
          }
        },
      })
    }
  },

  //choose difficulty
  slide_difficulty: function(e){
    if((e.detail.value >= 1 && e.detail.value <=5))
    {

      this.setData({
        difficulty: e.detail.value
      })
    }
    else
    {
      this.setData({
        difficulty: "警告：难度未知"
      })
    }
  },

  //choose a device
  bind_event_device_change: function(e){
    this.setData({
      event_device: this.data.devices[e.detail.value],
      event_device_name: this.data.devices[e.detail.value].name
    })
  },

  show_bind_device: function(e){
    if(e.detail.value)
    {
      this.setData({
        is_bind_device_hide: false
      })
    }
    else
    {
      this.setData({
        is_bind_device_hide: true,
        event_device: {}
      })
    }
  },

  //input detail and change text counter
  input_detail: function(e){
    this.setData({
      detail : e.detail.value,
      text_counter: `${e.detail.value.length}/200`
    });
    if(e.detail.value.length == 200)
    {
      notification_helper.show_toast_without_icon("文字数量已达上限",2000);
    }
  },

  preview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  choose_image: function(){
    var that = this;
    wx.chooseImage({
      //choose compressd image to get faster upload and save data
      sizeType: ['compressed'],
      count: 1,
      //take a snapshot or choose a photo
      sourceType: ['album', 'camera'],
      success(res){
        //check the size of the image
        var maxsize = 4000000;
        if(res.tempFiles[0].size > maxsize)
        {
          var original_size = (res.tempFiles[0].size / 1000000).toFixed(2);
          wx.showToast({
            title: '图片过大(' + original_size + 'MB' +')，请取消勾选"原图"或另行上传较小的图片',
            icon: 'none'
          })
          return;
        }
        //return file path and attach to page data filepath array
        that.setData({
          files: that.data.files.concat(res.tempFilePaths),
          is_upload_add_hide: true,
        });
      }
    })
  },

  delete_image: function(){
    var that = this;
    wx.showModal({
      title:'取消上传',
      content:'不再上传这张照片？',
      cancelColor: 'gray',
      cancelText: '取消',
      confirmColor: '#E1251B',
      confirmText:'确定',
      success(res){
        if(res.cancel)
        {
          //if cancelled, continue
        }
        else
        {
          that.setData({
            files: [],
            is_upload_add_hide: false,
            tip: '点击"+"上传图片'
          })
        }
      }
    })
  },

  submit: function(){
    var that = this;
    if(!that.data.name)
    {
      notification_helper.show_toast_without_icon("未填写活动名称",2000);
      return;
    }
    else
    {
      if(that.data.name.indexOf("/") != -1)
      {
        notification_helper.show_toast_without_icon("活动名称不能含有\"/\"",2000);
        return;
      }
    }
    if(that.data.event_date == "发布期限为一年")
    {
      notification_helper.show_toast_without_icon("活动日期未选择",2000);
      return;
    }
    if(that.data.event_time == "选择活动时间")
    {
      notification_helper.show_toast_without_icon("活动时间未选择",2000);
      return;
    }
    if(!that.data.distance)
    {
      notification_helper.show_toast_without_icon("距离输入有误",2000);
      return;
    }
    if((!that.data.location_start) || (!that.data.location_return))
    {
      notification_helper.show_toast_without_icon("起点、途经地标未选择",2000);
      return;
    }
    if(that.data.name_start == "未选中位置，点我重新选择" || that.data.name_return == "未选中位置，点我重新选择")
    {
      notification_helper.show_toast_without_icon("起点、途经地标未选择",2000);
      return;
    }
    if(that.data.name_start == that.data.name_return)
    {
      notification_helper.show_toast_without_icon("起点与途经地标位置重复",2000);
      return;
    }
    if(that.data.difficulty == "拖动选择")
    {
      notification_helper.show_toast_without_icon("活动难度未选择",2000);
      return;
    }
    if(!that.data.detail)
    {
      notification_helper.show_toast_without_icon("活动简介未填写",2000);
      return;
    }
    if(!that.data.files.length)
    {
      notification_helper.show_toast_without_icon("活动海报未上传",2000);
      return;
    }
    wx.showModal({
      title: '提示',
      content: `发布活动"${that.data.name}"吗？请务必确认信息无误。`,
      success: function(res){
        if(res.cancel)
        {
          return;  
        }
        else
        {
          that.setData({
            is_submission_available: false
          })
          wx.showLoading({
            title: '图片上传中',
            mask: true
          })
          wx.cloud.uploadFile({
            cloudPath: versatile_helper.generate_cloudpath_for_event(that.data.name,app.globalData.user,that.data.files[0]),
            filePath: that.data.files[0],
            success(res){
              wx.showLoading({
                title: '相关数据上传中',
                mask: true
              })
              var file = res.fileID;
              var count = db.collection("events").count();
              count.then(function(result){
                db.collection("events").add({
                  data:{
                    _id: result.total + 1 + "",
                    detail: that.data.detail,
                    device: that.data.event_device,
                    difficulty: that.data.difficulty,
                    distance: that.data.distance,
                    is_available: true,
                    leader: app.globalData.user.realname,
                    leader_openid: app.globalData.user.openid,
                    location_return: that.data.location_return,
                    location_start: that.data.location_start,
                    name: that.data.name,
                    name_return: that.data.name_return,
                    name_start: that.data.name_start,
                    participants:[{
                      avatar: app.globalData.user.avatar,
                      nickname: app.globalData.user.nickname,
                      openid: app.globalData.user.openid,
                      realname: app.globalData.user.realname,
                      time: Date.now()
                    }],
                    participants_count: 1,
                    poster: res.fileID,
                    snapshots: [],
                    snapshots_count: 0,
                    time: time_helper.set_time_for_event(that.data.event_date,that.data.event_time),
                    view: 0
                  },
                  success(res){
                    console.log("[cloud_database][events]: add successfully");
                    wx.showLoading({
                      title: '数据更新中',
                      mask: true
                    })
                    app.globalData.user.my_event.push({
                      _id: "" + ++result.total,
                      name: that.data.name,
                      poster: file,
                      date: that.data.event_date.replace(new RegExp("-","g"),"/"),
                      distance: that.data.distance,
                      detail: that.data.detail,
                      is_signed: true
                    });
                    wx.cloud.callFunction({
                      name: "update_user_event",
                      data: {
                        openid: app.globalData.user.openid,
                        my_event: app.globalData.user.my_event
                      },
                      success(res){
                        console.log("[cloudfunction][update_user_event]: updated successfully");
                        wx.showToast({
                          title: '发布成功',
                          duration: 2000,
                          mask: true,
                          success(res){
                            function refresh(){
                              wx.reLaunch({
                                url: '../../index/index',
                              })
                            }
                            setTimeout(refresh,2000);
                          }
                        })
                      },
                      fail(res){
                        console.log("[cloudfunction][update_user_event]: failed to update");
                        notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试",2000);
                      }
                    })
                  },
                  fail(res){
                    console.log("[cloud_database][events]: failed to add");
                    notification_helper.show_toast_without_icon("上传失败，请刷新页面重试",2000);
                  }
                })
              })
            },
            fail(res){
              console.log(res);
              wx.hideLoading({
                success(res){
                  console.log("[upload_image]: cloud upload error")
                  notification_helper.show_toast_without_icon("上传失败，请刷新页面重试",2000);
                }
              })
            }
          })
        }
      }
    })
  }
})