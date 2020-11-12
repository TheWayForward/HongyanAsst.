const devicesId = "644250210";
const api_key = "fhAS54e5X8HL5wcaB6ZW74oA3vo=";
var timer;
var timer_snapshotgetter;
var files_cloud_url = [];
var app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    //from server
    event: {},
    //image previewer shown or not
    isHide: true,
    //all image previewer shown or not
    is_all_Hide: true,
    //initalize as Tian'an Men
    latitude: 39.129574,
    longitude: 116.482548,
    markers: [],
    current_marker: {},
    event_shots: [],
    event_id: null,
    //from user
    tip: "留下精彩瞬间！",
    files: [],
    files_cloud_url: [],
    snapshots: {},
    detail: "",
    //dynamic text
    all_snapshots_tip: "查看该活动全部图片"
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
          marker.id = i;
          marker.longitude = location[0];
          marker.latitude = location[1];
          marker.name = snapshot.name;
          marker.avatar = snapshot.avatar;
          marker.nickname = snapshot.nickname;
          marker.realname = snapshot.realname;
          marker.taker = snapshot.nickname + " (" + snapshot.realname + ")";
          marker.detail = snapshot.detail;
          marker.iconPath = "../../images/imagepoint.png";
          marker.url = snapshot.url;
          marker.width = 30;
          marker.height = 30;
          marker.callout = {
            content: snapshot.detail,
            bgColor: "#fff",
            padding: "5px",
            borderRadius:" 5px",
            borderWidth: "1px",
            borderColor: "#07c160"
          };
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
          that.setData({
            longitude: current_lo,
            latitude: current_la,
          })
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

  //marker tapped
  show_snapshots: function(e){
    console.log(e);
    var id = e.detail.markerId;
    var marker = this.data.markers[id];
    console.log(marker);
    this.setData({
      current_marker: marker,
      isHide: false
    })
  },

  //show all tab tapped
  show_all_snapshots: function(){
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
        all_snapshots_tip: "查看该活动全部图片"
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
      //take a snapshot or choose a photo
      sourceType: ['album', 'camera'],
      success: function (res) {
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

  //input image detail
  input: function(e){
    this.setData({
      detail: e.detail.value
    })
  },

  //upload image with location and detail
  upload_images: function(){
    if(!this.data.snapshots.name)
    {
      wx.showToast({
        icon: 'none',
        title: '未选择位置',
      })
      return;
    }
    if(!this.data.detail)
    {
      wx.showModal({
        title:'提示',
        content:'是否填写图片备注？',
        cancelColor: 'gray',
        cancelText: '否',
        confirmText: '是',
        success: function(e){
          if(e.cancel)
          {
            //cancelled, continue
          }
          else
          {
            return;
          }
        }
      })
    }
    var that = this;
    const filePath = this.data.files[0];
    //const filePath = files[i];
    const cloudPath =  `events/event_name/${app.globalData.user.nickname}/${app.globalData.openid}_${Math.random()}_${Date.now()}.${filePath.match(/\.(\w+)$/)[1]}`;
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
        if(that.data.detail != "暂无描述")
        {
          snapshots.detail = that.data.detail;
        }
        //add url field
        snapshots.url = that.data.files_cloud_url;
        var e = that.data.event_shots;
        e.push(snapshots);
        that.setData({
          event_shots: e
        })
        console.log(that.data.event_shots);
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
          duration: 3000
        })
        that.onLoad();
      }
    }) 
  },  
})