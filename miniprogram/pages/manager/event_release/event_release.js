const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");

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
    wx.showLoading({
      title: '加载中'
    })
    var that = this;
    var batchTimes;
    var count = db.collection("events").count();
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

  //preview image
  preview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  //choose a poster
  choose_image: function(){
    var that = this;
    wx.chooseImage({
      //choose compressd image to get faster upload and save data
      sizeType: ['original', 'compressed'],
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
          tip: "长按图片删除"
        });
      }
    })
  },

  //delete the image to be uploaded
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

  //submit event info
  submit: function(){
    var that = this;
    var name = that.data.name;
    var distance = that.data.distance;
    var difficulty = that.data.difficulty;
    var detail = that.data.detail;
    var device = that.data.event_device;
    var name_start = that.data.name_start;
    var name_return = that.data.name_return;
    var location_start = that.data.location_start;
    var location_return = that.data.location_return;

    //name, "/" excluded
    if(!name)
    {
      notification_helper.show_toast_without_icon("未填写活动名称",2000);
      return;
    }
    else
    {
      if(name.indexOf("/") != -1)
      {
        notification_helper.show_toast_without_icon("活动名称不能含有\"/\"",2000);
        return;
      }
    }

    //date
    if(that.data.event_date == "发布期限为一年")
    {
      notification_helper.show_toast_without_icon("活动日期未选择",2000);
      return;
    }

    //time
    if(that.data.event_time == "选择活动时间")
    {
      notification_helper.show_toast_without_icon("活动时间未选择",2000);
      return;
    }

    //distance
    if(!distance)
    {
      notification_helper.show_toast_without_icon("距离输入有误",2000);
      return;
    }

    //points
    if((!that.data.location_start) || (!that.data.location_return))
    {
      notification_helper.show_toast_without_icon("选择地点、途经地标未选择",2000);
      return;
    }

    //difficulty
    if(difficulty == "拖动选择")
    {
      notification_helper.show_toast_without_icon("活动难度未选择",2000);
      return;
    }

    //device
    if(!that.data.event_device.name)
    {
      notification_helper.show_toast_without_icon("定位设备未选择",2000);
      return;
      
    }

    //detail
    if(!that.data.detail)
    {
      notification_helper.show_toast_without_icon("活动简介未填写",2000);
      return;
    }

    //poster
    if(!that.data.files.length)
    {
      notification_helper.show_toast_without_icon("活动海报未上传",2000);
      return;
    }

    wx.showModal({
      title: '提示',
      content: `发布活动"${name}"吗？请务必确认信息无误。`,
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
          var time = new Date();
          time.setFullYear(Number(that.data.event_date.slice(0,4)));
          time.setMonth(Number(that.data.event_date.slice(5,7)) - 1);
          time.setDate(Number(that.data.event_date.slice(8,10)));
          time.setHours(Number(that.data.event_time.slice(0,2)));
          time.setMinutes(Number(that.data.event_time.slice(3,5)));
          //uploadfile and complete
          const filePath = that.data.files[0];
          const cloudPath = `events/${name}_${Date.now()}/poster/${app.globalData.openid}_${Math.random()}_${Date.now()}.${filePath.match(/\.(\w+)$/)[1]}`;
          wx.cloud.uploadFile({
            cloudPath,
            filePath,
            success: function(res){
              wx.showLoading({
                title: '活动发布中',
                mask: true
              })
              var files_cloud_url = res.fileID;
              //increment
              var count = db.collection("events").count();
              count.then(function(result){
                //upload to cloudbase
                db.collection("events").add({
                  data:{
                    _id: result.total + 1 + "",
                    detail: detail,
                    device: device,
                    difficulty: difficulty,
                    distance: distance,
                    device: device,
                    leader: app.globalData.user.realname,
                    leader_openid: app.globalData.user.openid,
                    location_return: location_return,
                    location_start: location_start,
                    name: name,
                    name_return: name_return,
                    name_start: name_start,
                    participants:[{
                      avatar: app.globalData.user.avatar,
                      nickname: app.globalData.user.nickname,
                      openid: app.globalData.user.openid,
                      realname: app.globalData.user.realname,
                      time: Date.now()
                    }],
                    participants_count: 1,
                    poster: files_cloud_url,
                    snapshots: [],
                    snapshots_count: 0,
                    time: time,
                    view: 0
                  }
                })
                app.globalData.user.my_event.push({
                  _id: result.total + 1 + "",
                  name: name,
                  poster: files_cloud_url,
                  date: that.data.event_date.replace(new RegExp("-","g"),"/"),
                  distance: that.data.distance,
                  is_signed: true
                });
                console.log(app.globalData.user.my_event);
                wx.cloud.callFunction(
                {
                  name: "update_user_event",
                  data: {
                    openid: app.globalData.user.openid,
                    my_event: app.globalData.user.my_event
                  },
                  success(res){
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
                  }
                }
                )
              })
            }
          })
        }
      }
    })
  }
})