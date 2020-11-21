var app = getApp();
const db = wx.cloud.database();
var timer;
var timer_snapshotgetter;
var files_cloud_url = [];
//Tencent map uses the gcj02 coordinate offset
var latiToCanvas = function(lat) {return lat + 0.0060;};
var logiToCanvas = function(log) {return log + 0.0065;};
var wgs84togcj02 = function(lat, log) {
  //is position off China mainland
  if (log < 72.004 || log > 137.8347 || lat < 0.8293 || lat > 55.8271) {
    return {
      latitude:  lat,
      longitude: log,
    }
  } else {
    const Pi = 3.14159265358979324;
    //coordinate projection factor
    const a = 6378245.0;
    //eccentricity
    const ee = 0.00669342162296594323;
    
    var transformLat = function (x, y) {
      var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * Pi) + 20.0 * Math.sin(2.0 * x * Pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * Pi) + 40.0 * Math.sin(y / 3.0 * Pi)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * Pi) + 320 * Math.sin(y * Pi / 30.0)) * 2.0 / 3.0;
      return ret; }
    var transformLog = function (x, y) {
      var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * Pi) + 20.0 * Math.sin(2.0 * x * Pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * Pi) + 40.0 * Math.sin(x / 3.0 * Pi)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * Pi) + 300.0 * Math.sin(x / 30.0 * Pi)) * 2.0 / 3.0;
      return ret; }
    var delta = function (lat, lon) {
      var dLat = transformLat(lon - 105.0, lat - 35.0);
      var dLon = transformLog(lon - 105.0, lat - 35.0);
      var radLat = lat / 180.0 * Pi;
      var magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Pi);
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Pi);
      return {'lat': dLat, 'lon': dLon};
    }
    const d = delta(lat, log);
    return {
      latitude:  lat + d.lat,
      longitude: log + d.lon,
    }
  }
};


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
    is_all_Hide: true,
    //uploader shown or not
    is_uploader_hide: true,
    height: 0,
    latitude: 0,
    longitude: 0,
    speed: 0,
    markers: [],
    current_marker: {},
    event_shots: [],
    event_id: null,
    //from user
    tip: '点击"+"上传图片',
    tip_second: "当前活动：加载中",
    tip_footer: "加载中",
    files: [],
    files_cloud_url: [],
    snapshots: {},
    snapshots_count: null,
    detail: "",
    //dynamic text
    all_snapshots_tip: "查看该活动全部图片",
  },

  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success(res){
        that.setData({
          height: res.windowHeight * 0.5
        })
      }
    })

    //location data getter timer
    timer = setInterval(() => {
      this.get_datapoints().then(datapoints => {
      })
    }, 10000)

    //get the corresponded event
    var event = app.globalData.event;
    var participants = event.participants;
    var is_signed = false;
    for(var i = 0; i < participants.length; i++){
      if(app.globalData.user.openid == participants[i].openid) 
      {
        //matching current user
        //check whether the event is expired, -12h to 1d
        var can_upload = ((((Date.now() - event.precise_time) / 86400000) >= 1) || (((Date.now() - event.precise_time) / 86400000) <= -0.5)) ? false : true;
        //fill the basic event name info and decide whether the uploader should be shown or not
        this.setData({
          event: event,
          all_snapshots_tip: "查看" + event.name + "的全部图片",
          tip_second: "当前活动：" + event.name,
          is_uploader_hide: !can_upload,
          tip_footer: "请在活动开始前12小时到活动结束后1天内上传图片"
        })
        if(((Date.now() - event.precise_time) / 86400000) >= 1)
        {
          clearInterval(timer);
          this.setData({
            tip_footer: "活动已结束",
            is_dynamic_data_hide: true
          })
          //event expired, clear interval
        }
        is_signed = true;
        break;
      }
      //cannot upload if unsigned
      if(!is_signed)
      {
        this.setData({
          event: event,
          all_snapshots_tip: "查看" + event.name + "的全部图片",
          is_uploader_hide: true,
          tip_footer: "未报名活动，无法上传图片"
        })
      }
    }
    db.collection("events").where({
      _id: event._id
    }).field({
      _id: true,
      snapshots: true
    }).get({
      success: function(res){
        //all shots taken in the event
        var snapshots = res.data[0].snapshots
        that.setData({
          event_id: res.data[0]._id,
          event_shots: snapshots
        })
        var markers = [];
        markers[0] = {
          id: 0,
          latitude: that.data.latitude,
          longitude: that.data.longitude,
          width: 20,
          height: 20,
          iconPath: "image/star.png",
          callout: {
            content: that.data.event.device.name + "：" + that.data.event.device.deviceid,
            bgColor: "#fff",
            padding: "5px",
            borderRadius: "5px",
            borderWidth: "1px",
            borderColor: "#1296DB",
            display: "BYCLICK",
            fontSize: "10",
          },
          is_snapshot: false
        };
        for(var i = 0; i < snapshots.length; i++){
          var snapshot = snapshots[i];
          var marker = {};
          //geopoint need to be transformed to json
          var location = snapshot.location.toJSON().coordinates;
          marker.id = i + 1;
          marker.location = snapshot.location;
          marker.longitude = location[0];
          marker.latitude = location[1];
          marker.openid = snapshot.openid;
          marker.name = snapshot.name;
          marker.avatar = snapshot.avatar;
          marker.nickname = snapshot.nickname;
          marker.realname = snapshot.realname;
          marker.taker = snapshot.nickname + " (" + snapshot.realname + ")";
          marker.detail = snapshot.detail;
          marker.iconPath = "image/imagepoint.png";
          marker.url = snapshot.url;
          marker.width = 20;
          marker.height = 20;
          marker.callout = {
            content: snapshot.detail,
            bgColor: "#fff",
            padding: "5px",
            borderRadius: "5px",
            borderWidth: "1px",
            borderColor: "#1485EF",
            display: "ALWAYS",
            fontSize: "10", 
          };
          marker.is_snapshot = true;
          markers.push(marker);
          //deviation, prevent markers from overlapping
          if(i >= 1)
          {
            for(var j = 1; j < markers.length; j++){
              if(marker.location == markers[j].location)
              {
                markers[j].longitude += i * 0.0002;
                markers[j].latitude += i * 0.0002; 
              }
            }
          }
        }
        console.log(markers);
        that.setData({
          markers: markers
        })
      }
    })

    wx.showLoading({
      title: 'loading'
    })

    this.get_datapoints().then((datapoints) => {
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
      console.error(err);
      clearInterval(timer);
    })
  },

  //get gps datapoints
  get_datapoints: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.heclouds.com/devices/${that.data.event.device.deviceid}/datapoints?datastream_id=Latitude,Logitude,Speed&limit=1`,
        header: {
          'content-type': 'application/json',
          'api-key': that.data.event.device.apikey
        },
        success: (res) => {
          const status = res.statusCode;
          const response = res.data;
          var speed = response.data.datastreams[0].datapoints;
          var longitude = response.data.datastreams[1].datapoints;
          var latitude = response.data.datastreams[2].datapoints;
          var current_sp = Number(speed[speed.length - 1].value);
          var current_lo = Number(longitude[longitude.length - 1].value);
          var current_la = Number(latitude[latitude.length - 1].value);
          //encrypt to gcj to fit Tencent map
          const encrypt_res = wgs84togcj02(current_la, current_lo);
          that.setData({
            speed: current_sp,
            longitude: encrypt_res.longitude,
            latitude:  encrypt_res.latitude,
          })
          console.log("[onenet][speed]: " + that.data.speed);
          console.log("[onenet][latitude]: " + that.data.latitude);
          console.log("[onenet][longitude]: " + that.data.longitude);
          if (status !== 200) 
          {
            reject(res.data)
            return ;
          }
          if (response.errno !== 0) 
          {
            reject(response.error)
            return ;
          }
          if (response.data.datastreams.length === 0) 
          {
            reject("No data yet.")
          }
          resolve({
          })
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  onReady: function(e){
    this.mapCtx = wx.createMapContext('myMap');
  },

  //stop timer from getting data when idle
  onUnload: function(){
    clearInterval(timer);
  },

  onHide: function(){
    clearInterval(timer);
  },

  //refresh location data
  onPullDownRefresh: function(){
    wx.showNavigationBarLoading({
      complete: (res) => {},
    })
    this.onLoad();
    if(this.get_datapoints())
    {
      wx.hideNavigationBarLoading({
        complete: (res) => {},
      })
      wx.stopPullDownRefresh({
        complete: (res) => {
          wx.showToast({
            title: '位置已更新',
          })
        },
      })
    }
    else
    {
      wx.hideNavigationBarLoading({
        complete: (res) => {},
      })
      wx.stopPullDownRefresh({
        complete: (res) => {
          wx.showToast({
            title: '网络异常，请稍候重试',
          })
        },
      })
    }
  },

  //marker tapped
  show_snapshots: function(e){
    var id = e.detail.markerId;
    var markers = this.data.markers;
    if(id == 0) return;
    for(var i = 1; i < this.data.markers.length; i++){
      markers[i].iconPath = "image/imagepoint.png";
      markers[i].callout.borderColor = "#1485EF";
      //change imagepoint to red
      if(i == id)
      {
        markers[i].iconPath = "image/imagepoint_selected.png";
        markers[i].callout.borderColor = "#EF2914";
      }
    }
    var current_marker = markers[id];
    this.setData({
      markers: markers,
      current_marker: current_marker,
      is_image_previewer_hide: false
    })
  },

  //show all tab tapped
  show_all_snapshots: function(){
    //no snapshot
    var event = this.data.event;
    if(!this.data.event.snapshots_count)
    {
      this.setData({
        all_snapshots_tip: "暂无图片"
      })
      return;
    }
    //has snapshots
    if(this.data.is_all_Hide)
    {
      this.setData({
        is_all_Hide: false,
        all_snapshots_tip: "收起"
      })
    }
    else
    {
      this.setData({
        is_all_Hide: true,
        all_snapshots_tip: "查看" + this.data.event.name +"全部图片"
      })
    }
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
          files: that.data.files.concat(res.tempFilePaths)
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
              files: []
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
            that.upload_image_final();
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
      that.upload_image_final();
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
        files_cloud_url = res.fileID;
        that.setData({
          files_cloud_url: files_cloud_url
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
              wx.reLaunch({
                url: '../event',
              })
            }
          })
          })
      }
    }) 
  }
})