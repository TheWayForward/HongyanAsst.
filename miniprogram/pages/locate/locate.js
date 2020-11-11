const devicesId = "644250210";
const api_key = "fhAS54e5X8HL5wcaB6ZW74oA3vo=";
var timer;
var app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    //from server
    //initalize as Tian'an Men
    latitude: 39.129574,
    longitude: 116.482548,
    markers: [],
    event_shots: [],
    event_id: null,
    //from user
    files: [],
    files_cloud_url: [],
    isHide: false,
    snapshots: {}
  },

  onLoad: function () {
    var that = this;
    //test version, dynamic later
    db.collection("events").where({
      _id: "1"
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
        for(var i = 0; i < snapshots.length; i++){
          var snapshot = snapshots[i];
          var marker = {};
          //geopoint need to be transformed to json
          var location = snapshot.location.toJSON().coordinates;
          console.log(location)
          marker.id = i;
          marker.longitude = location[0];
          marker.latitude = location[1];
          marker.name = snapshot.name;
          marker.avatar = snapshot.avatar;
          marker.nickname = snapshot.nickname;
          markers.push(marker);
        }
        console.log(markers);
        that.setData({
          markers: markers
        })
      }
    })

    //location data getter timer
    timer = setInterval(() => {
      this.getDatapoints().then(datapoints => {
      })
    }, 30000)

    wx.showLoading({
      title: 'loading'
    })

    this.getDatapoints().then((datapoints) => {
      wx.hideLoading()
    }).catch((err) => {
      wx.hideLoading()
      console.error(err)
      clearInterval(timer)
    })
  },

  //get gps datapoints
  getDatapoints: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.heclouds.com/devices/${devicesId}/datapoints?datastream_id=Latitude,Logitude&limit=5`,
        header: {
          'content-type': 'application/json',
          'api-key': api_key
        },
        success: (res) => {
          const status = res.statusCode
          const response = res.data
          var longitude = response.data.datastreams[0].datapoints;
          var latitude = response.data.datastreams[1].datapoints;
          var current_lo = Number(longitude[longitude.length - 1].value);
          var current_la = Number(latitude[latitude.length - 1].value);
          console.log(current_lo,current_la);
          that.setData({
            longitude: current_lo,
            latitude: current_la,
          })
          console.log(that.data.latitude);
          console.log(that.data.longitude);
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
          //succeed promise resolved
          resolve({
            longitude: response.data.datastreams[0].datapoints.reverse(),
            latitude: response.data.datastreams[1].datapoints.reverse()
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

  //refresh location data
  onPullDownRefresh: function(){
    wx.showNavigationBarLoading({
      complete: (res) => {},
    })
    if(this.getDatapoints())
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

  //using offical plugin to get the corresponded location by tapping
  choose_location: function(){
    var that = this;
    wx.chooseLocation({
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      complete: (res) => {
        this.data.snapshots.avatar = app.globalData.user.avatar;
        this.data.snapshots.openid = app.globalData.user.openid;
        this.data.snapshots.nickname = app.globalData.user.nickname;
        this.data.snapshots.name = res.name;
        this.data.snapshots.location = db.Geo.Point(res.longitude,res.latitude);
      },
    })
  },

  //the rider choose an image from snapshots just taken
  choose_image: function(){
    if(this.data.files.length >= 2)
    {
      wx.showToast({
        title: '每位用户单个地点最多上传两张图片',
        icon: "none"
      })
      return;
    }
    var that = this;
    wx.chooseImage({
      //choose compressd image to get faster upload and save data
      sizeType: ['original', 'compressed'],
      //take a snapshot or choose a photo
      sourceType: ['album', 'camera'],
      success: function (res) {
        //return file path and attach to page data filepath array
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
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
          console.log("want to delete");
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

  //pre-upload
  upload_images: function(){
    var files = this.data.files;
    var files_cloud_url = [];
    for(var i = 0; i < files.length; i++){
      const filePath = files[i];
      const cloudPath =  `events/event_name/${app.globalData.user.nickname}/${app.globalData.openid}_${Math.random()}_${Date.now()}.${filePath.match(/\.(\w+)$/)[1]}`;
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: function(res){
          files_cloud_url.push(res.fileID);
        }
      })
    }
    this.setData({
      files_cloud_url: files_cloud_url
    })
  },
  
  //final upload
  upload_images_with_location_and_userinfo: function(){
    //upload image first, then get the url from cloud base, load field url for snapshot
    var that = this;
    if(!this.data.snapshots.name)
    {
      wx.showToast({
        title: '请点击地图，选择位置',
        icon: 'none'
      })
      return;
    }
    this.upload_images();
    var snapshots = this.data.snapshots;
    //add url field
    snapshots.url = this.data.files_cloud_url;
    var e = this.data.event_shots;
    e.push(snapshots);
    this.setData({
      event_shots: e
    })
    console.log(this.data.event_shots);
    wx.cloud.callFunction({
      name:'update_snapshots',
      data:{
        taskId: that.data.event_id.toString(),
        my_snapshot: that.data.event_shots,
      }
    }).then(res => {
    })
    console.log("updated successfully");
    wx.showToast({
      title: '上传成功',
    })
    wx.navigateTo({
      url: "../../pages/index/index",
    })
  }
})