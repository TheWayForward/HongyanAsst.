const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../../utils/helpers/compare_helper");
var time_helper = require("../../../../utils/helpers/time_helper");
var notification_helper = require("../../../../utils/helpers/notification_helper");
var location_helper = require("../../../../utils/helpers/location_helper");
var versatile_helper = require("../../../../utils/helpers/versatile_helper");
var location_timer;

Page({
  data: {
    //from server
    event: {},
    //gps device
    //image previewer shown or not
    is_image_previewer_hide: true,
    //dynamic data hide or not
    is_dynamic_data_hide: false,
    //all image previewer shown or not
    is_snapshots_hide: true,
    //uploader shown or not
    is_uploader_hide: true,
    //add shown or not
    is_upload_add_hide: false,
    height: 300,
    timer: 0,
    location_delta_count: 0,
    latitude: 0,
    longitude: 0,
    speed: 0,
    markers: [],
    current_marker: {},
    event_id: null,
    //from user
    tip: '点击"+"上传图片',
    tip_second: '',
    tip_footer: "加载中",
    files: [],
    files_cloud_url: [],
    snapshots: {},
    snapshots_count: null,
    detail: "",
    input_value: "",
    //dynamic text
    all_snapshots_tip: "查看该活动全部图片",
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.event.name,
    })
    if(!this.data.event)
    {
      wx.showLoading({
        title: '加载中',
      })
    }
    var that = this;
    var event = app.globalData.event;
    that.setData({
      event: event,
      is_uploader_hide: app.globalData.user.openid ? (compare_helper.compare_time_for_event_locate_uploader(event.time,new Date()) ? false : true) : true,
      all_snapshots_tip: event.snapshots[0] ? `查看活动"${event.name}"全部图片(${event.snapshots_count})` : `暂无图片`
    })
    if(!event.device._id || !compare_helper.compare_time_for_event_locate_timer(event.time,new Date()))
    {
      //event without device or previous event, set map focus as the starting point
      //get data for once at least, then decide by the time of event and now
      that.setData({
        longitude: event.location_start.longitude,
        latitude: event.location_start.latitude,
        markers: versatile_helper.delete_location_info_for_markers(versatile_helper.generate_markers(event.snapshots,"image/imagepoint.png")),
        is_dynamic_data_hide: true
      })
    }
    else
    {
      //event with device, set map focus as device location
      location_helper.get_datapoints_from_onenet(event.device).then((location_info) => {
        //get data for once at least, then decide by the time of event and now
        that.setData({
          longitude: location_info.longitude,
          latitude: location_info.latitude,
          markers: versatile_helper.attach_location_info_to_markers(location_info,event.device,versatile_helper.generate_markers(event.snapshots),"image/star.png"),
          is_dynamic_data_hide: true
        })
        if(compare_helper.compare_time_for_event_locate_timer(event.time,new Date()))
        {
          function get_datapoints(){
            var location_info_past = {};
            if(that.data.latitude)
            {
              location_info_past = {
                speed: that.data.speed,
                longitude: that.data.longitude,
                latitude: that.data.latitude,
                timestamp: new Date()
              }
            }
            location_helper.get_datapoints_from_onenet(event.device).then((location_info) => {
              if(compare_helper.compare_location_info(location_info,location_info_past))
              {
                //frozen once
                that.setData({
                  location_delta_count: ++that.data.location_delta_count
                })
                console.log(that.data.location_delta_count);
                if(that.data.location_delta_count == 10)
                {
                  //frozen for 20 seconds
                  clearInterval(that.data.timer);
                  that.data.timer = setInterval(get_datapoints,15000);
                }
              }
              else
              {
                //moving
                clearInterval(that.data.timer);
                that.data.timer = setInterval(get_datapoints,2000);
              }
              that.setData({
                longitude: location_info.longitude,
                latitude: location_info.latitude,
                is_dynamic_data_hide: true
              })
            })
          }
          that.data.timer = setInterval(get_datapoints,2000);
        }
      });
    }
    wx.hideLoading({
      success(){ 
      }
    })
  },

  onShow: function(){
    var that = this;
    db.collection("events").where({
      _id: app.globalData.event._id
    }).watch({
      onChange(e){
        that.onLoad();
      },
      onError(e){
      }
    })
  },

  //stop timer from getting data when idle
  onUnload: function(){
    clearInterval(this.data.timer);
  },

  //marker tapped
  show_snapshot_from_map: function(e){
    var id = e.detail.markerId;
    var markers = this.data.markers;
    if(markers[0].is_snapshot)
    {
      //markers without location
      this.setData({
        is_image_previewer_hide: false,
        markers: versatile_helper.hilight_marker(markers,id,"image/imagepoint.png","image/imagepoint_selected.png"),
        current_marker: markers[id]
      })
    }
  },

  show_snapshot_from_list: function(e){
    var that = this;
    that.setData({
      latitude: e.currentTarget.dataset.action.latitude,
      longitude: e.currentTarget.dataset.action.longitude,
      markers: versatile_helper.hilight_marker(that.data.markers,e.currentTarget.dataset.action.id,"image/imagepoint.png","image/imagepoint_selected.png"),
      current_marker: e.currentTarget.dataset.action
    })
  },

  show_all_snapshots: function(){
    var that = this;
    this.setData({
      is_snapshots_hide: !that.data.is_snapshots_hide,
      all_snapshots_tip: that.data.event.snapshots_count ? (that.data.is_snapshots_hide ? "收起" : `查看活动"${that.data.event.name}"全部图片(${that.data.event.snapshots_count})`) : "暂无图片"
    })
  },

  //using offical plugin to get the corresponded location by tapping
  choose_location: function(){
    var that = this;
    wx.chooseLocation({
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      complete: (res) => {
        if(!res.name)
        {
          this.setData({
            tip: "未选中位置，点我重新选择"
          })
        }
        else
        {
          this.setData({
            tip: res.name
          })
        }
        this.data.snapshots.avatar = app.globalData.user.avatar;
        this.data.snapshots.openid = app.globalData.user.openid;
        this.data.snapshots.nickname = app.globalData.user.nickname;
        this.data.snapshots.realname = app.globalData.user.realname;
        this.data.snapshots.name = res.name;
        this.data.snapshots.location = db.Geo.Point(res.longitude,res.latitude);
        var d = new Date();
        this.data.snapshots.time = d.getTime();
        if(this.data.detail)
        {
          this.data.snapshots.detail = this.data.detail;
        }
        else
        {
          this.data.snapshots.detail = "暂无描述";
        }
      },
    })
  },

  //the rider choose an image from snapshots just taken
  choose_image: function(){
    if(this.data.files.length >= 1)
    {
      wx.showToast({
        title: '每位用户单个地点最多上传一张图片',
        icon: "none"
      })
      return;
    }
    var that = this;
    wx.chooseImage({
      //choose compressd image to get faster upload and save data
      sizeType: ['original', 'compressed'],
      count: 1,
      //take a snapshot or choose a photo
      sourceType: ['album', 'camera'],
      success: function (res) {
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
          tip_second: "长按图片删除"
        });
      }
    })
    this.choose_location();
  },

  //preview image in this page
  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  //long press to delete image
  delete_image: function(e){
    var that = this;
    console.log(that.data.files);
    var to_delete = e.currentTarget.dataset.action;
    wx.showModal({
      title:'取消上传',
      content:'不再上传这张照片？',
      cancelColor: 'gray',
      cancelText: '取消',
      confirmColor: '#E1251B',
      confirmText:'确定',
      success: function (res){
        if(res.cancel) 
        {
          //cancel tapped
        } 
        else 
        {
          //confirm tapped
          console.log(that.data.files.indexOf(to_delete));
          var index = that.data.files.indexOf(to_delete);
          if(index)
          {
            that.setData({
              files: that.data.files.splice(index - 1,1)
            })
          }
          else
          {
            that.setData({
              files: [],
              tip: '点击"+"选择位置，上传图片',
              tip_second: "",
              is_upload_add_hide: false
            })
          }
        }
      },
    })
  },

  //input image detail
  input: function(e){
    this.setData({
      detail: e.detail.value
    })
  },

  //upload image with location and detail
  upload_images: function(){
    var that = this;
    //check if the user is uploading another snapshot to the same point
    for(var i = 0; i < this.data.markers.length; i++){
      var marker = this.data.markers[i];
      if(marker.openid == app.globalData.openid && marker.name == this.data.snapshots.name)
      {
        wx.showToast({
          icon: 'none',
          title: '每位用户单个地点最多上传一张图片',
        })
        return;
      }
    }
    //check if the location is specified
    if(!this.data.snapshots.name)
    {
      wx.showToast({
        icon: 'none',
        title: '未选择位置',
      })
      return;
    }
    //check if the detail of snapshot is provided
    if(!this.data.detail)
    {
      wx.showModal({
        title:'提示',
        content:'是否填写图片备注？',
        cancelColor: 'gray',
        cancelText: '否',
        confirmText: '是',
        complete: function(e){
          if(e.cancel)
          {
            wx.showModal({
              title: '提示',
              content: '确认上传该照片到'+ that.data.snapshots.name +"？",
              cancelText: '取消',
              confirmText: '确认',
              success: function(res){
                if(res.cancel)
                {
                  return;
                }
                else
                {
                  that.upload_image_final();
                }
              }
            })
          }
          else
          {
            return;
          }
        }
      })
    }
    else
    {
      wx.showModal({
        title: '提示',
        content: '确认上传该照片到'+ that.data.snapshots.name +"？",
        cancelText: '取消',
        confirmText: '确认',
        success: function(res){
          if(res.cancel)
          {
            return;
          }
          else
          {
            that.upload_image_final();
          }
        }
      })
    }
  },
  
  //sealing, or a bug jump from locate page to event page before the modal is shown
  upload_image_final: function(){
    wx.showNavigationBarLoading({
      complete: (res) => {},
    })
    wx.showToast({
      title: '图片上传中',
      icon: 'loading',
      duration: 5000
    })
    var that = this;
    const filePath = that.data.files[0];
    //const filePath = files[i];
    //use this when uploading mutiple details
    const cloudPath =  `events/${that.data.event.name}/${app.globalData.user.nickname}/${app.globalData.openid}_${Math.random()}_${Date.now()}.${filePath.match(/\.(\w+)$/)[1]}`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: function(res){
        that.setData({
          files_cloud_url: res.fileID
        })
        var snapshots = that.data.snapshots;
        //regenerate detail
        if(that.data.detail != "暂无描述" && that.data.detail != "")
        {
          snapshots.detail = that.data.detail;
        }
        else
        {
          snapshots.detail = "暂无描述";
        }
        console.log(snapshots);
        //add url field
        snapshots.url = that.data.files_cloud_url;
        var e = that.data.event_shots;
        e.push(snapshots);
        var snapshots_count = e.length;
        that.setData({
          event_shots: e
        })
        console.log(that.data.event_shots);
        wx.cloud.callFunction({
          name: 'update_snapshots_count',
          data: {
            taskId: that.data.event_id.toString(),
            my_snapshot_count: snapshots_count
          }
        })
        wx.cloud.callFunction({
          name: 'update_snapshots',
          data: {
            taskId: that.data.event_id.toString(),
            my_snapshot: that.data.event_shots,
          }
        }).then(res => {
          wx.hideNavigationBarLoading({
            complete: (res) => {},
          })
          wx.showToast({
            title: '上传成功',
            duration: 3000,
            success(res){
              wx.pageScrollTo({
                scrollTop: 0,
              })
              setTimeout(that.onLoad,1000);
            }
          })
        })
      }
    }) 
  }
})