const app = getApp();
const db = wx.cloud.database();
var d = new Date();
var files_cloud_url = "";

Page({

  /**
   * Page initial data
   */
  data: {
    user: {},
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
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      date: d.getDate()
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
    //event additional info
    is_upload_add_hide: false,
    files: [],
    //others
    tip: '点击"+"上传图片'
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      user: app.globalData.user,
      event_date_start: this.data.current_date.year + "-" + this.data.current_date.month + "-" + (this.data.current_date.date + 1),
      event_date_end: (this.data.current_date.year + 1) + "-" + this.data.current_date.month + "-" + this.data.current_date.date
    })
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
        complete: (res) => {
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
        complete: (res) => {
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

  //input detail and change text counter
  input_detail: function(e){
    var count = e.detail.value;
    var c = count.length + "/" + 200;
    this.setData({
      detail : e.detail.value,
      text_counter: c
    });
    if(count.length == 200)
    {
      wx.showToast({
        title: '文字数量已达上限',
        icon: 'none'
      })
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
      success: function (res){
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
    var name = this.data.name;
    var distance = this.data.distance;
    var difficulty = this.data.difficulty;
    var detail = this.data.detail;
    var name_start = this.data.name_start;
    var name_return = this.data.name_return;
    var location_start = this.data.location_start;
    var location_return = this.data.location_return;
    //check

    //name, "/" excluded
    if(!name)
    {
      wx.showToast({
        title: '未填写活动名称',
        icon: 'none'
      })
      return;
    }
    else
    {
      if(name.indexOf("/") != -1)
      {
        wx.showToast({
          title: '活动名称不能含有"/"',
          icon: 'none'
        })
        return;
      }
      var duplicate = false;
      db.collection("events").where({
        name: name
      }).field({
        _id: true,
        name: true
      }).get({
        success: function(res){
          if(res.data[0])
          {
            wx.showToast({
              title: '与现有活动重名',
              icon: 'none'
            })
            duplicate = true
          }
        }
      })
      if(duplicate) return;
    }

    //date
    if(this.data.event_date == "发布期限为一年")
    {
      wx.showToast({
        title: '活动日期未选择',
        icon: 'none'
      })
      return;
    }

    //time
    if(this.data.event_time == "选择活动时间")
    {
      wx.showToast({
        title: '活动时间未选择',
        icon: 'none'
      })
      return;
    }

    //distance
    if(!distance)
    {
      wx.showToast({
        title: '距离格式不正确',
        icon: 'none'
      })
      return;
    }

    //points
    if((!this.data.location_start) || (!this.data.location_return))
    {
      wx.showToast({
        title: '请选择起点与途经地标',
        icon: 'none'
      })
      return;
    }

    //difficulty
    if(difficulty == "拖动选择")
    {
      wx.showToast({
        title: '活动难度未选择',
        icon: 'none'
      })
      return;
    }

    //detail
    if(!this.data.detail)
    {
      wx.showToast({
        title: '未填写活动简介',
        icon: 'none'
      })
      return;
    }

    if(!this.data.files)
    {
      wx.showToast({
        title: '未上传活动海报',
        icon: 'none'
      })
      return;
    }


    var files = this.data.files;
    var time = new Date();
    time.setFullYear(Number(this.data.event_date.slice(0,4)));
    //don't forget about - 1
    time.setMonth(Number(this.data.event_date.slice(5,7)) - 1);
    time.setDate(Number(this.data.event_date.slice(8,10)));
    time.setHours(Number(this.data.event_time.slice(0,2)));
    time.setMinutes(Number(this.data.event_date.slice(2,4)));
    //uploadfile and complete
    const filePath = files[0];
    const cloudPath =  `events/${name}/poster/${app.globalData.openid}_${Math.random()}_${Date.now()}.${filePath.match(/\.(\w+)$/)[1]}`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: function(res){
        files_cloud_url = res.fileID;
        //increment
        var count = db.collection("events").count();
        count.then(function(result){
          count = result.total;
          var _id = count + 1 + "";
          //upload to cloudbase
          db.collection("events").add({
            data:{
              _id: _id,
              //dynamic later
              apikey: "fhAS54e5X8HL5wcaB6ZW74oA3vo=",
              detail: detail,
              deviceid: "644250210",
              difficulty: difficulty,
              distance: distance,
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
              time: time
            }
          })
          wx.showToast({
            title: '发布成功',
            duration: 3000,
          })
          wx.reLaunch({
            url: '../../index/index',
          })
        })
      }
    })
  }
})