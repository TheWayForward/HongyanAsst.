const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    //select tag
    title: "",
    tags: [
      "活动",
      "新闻",
      "产品",
      "赛事",
      "知识",
      "业界",
      "招新"
    ],
    tag: "请选择资讯类别标签",
    tag_index: 0,
    //author, org or self
    author: "鸿雁车协",
    //bind the event
    is_bind_event_hide: false,
    events: [],
    event_selected: {},
    //upload thumbnail
    tip: "上传一张图片作为资讯封面",
    is_upload_add_hide: false,
    files: [],
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    var batchTimes;
    var count = db.collection("events").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count/20);
      var arrayContainer = [], x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("events").skip(i * 20).field({
          _id: true,
          name: true,
          poster: true,
          time: true
        }).get({
          success:function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
            }
            x++;
            if(x == batchTimes)
            {
              function compare(p){
                return function(m,n){
                  var a = m[p];
                  var b = n[p];
                  return a-b;
                }
              };
              for(var k = 0; k < arrayContainer.length; k++){
                var t = arrayContainer[k].time;
                arrayContainer[k].date = t.getFullYear().toString() + "/" + (t.getMonth() + 1).toString() + "/" + t.getDate().toString();
                arrayContainer[k].time = arrayContainer[k].time.getTime();
                arrayContainer[k].background = "white";
              }
              arrayContainer.sort(compare("_id"));
              arrayContainer.reverse();
              that.setData({
                events: arrayContainer
              })
            }
          }
        })
      }
    });
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

  preview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  input_title: function(e){
    this.setData({
      title: e.detail.value
    })
  },

  //article tags
  bind_tag_change: function(e){
    var index = Number(e.detail.value);
    this.setData({
      tag: this.data.tags[index]
    })
  },

  //author can be current manager or the org
  bind_author_change: function(e){
    if(e.detail.value)
    {
      this.setData({
        author: "鸿雁车协"
      })
    }
    else
    {
      this.setData({
        author: app.globalData.user.nickname + "(" + app.globalData.user.realname + ")"
      })
    }
  },

  show_bind_event: function(e){
    this.setData({
      is_bind_event_hide: e.detail.value
    })
  },

  select_event: function(e){
    var events = this.data.events;
    var event_selected = e.currentTarget.dataset.action;
    console.log(event_selected);
    for(var i = 0; i < events.length; i++){
      events[i].background = "white"
      if(event_selected._id == events[i]._id)
      {
        console.log(i);
        events[i].background = "#F5F5F5";
      }
    }
    this.setData({
      events: events,
      event_selected: event_selected
    })
  },

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
    var that = this;
    var title = this.data.title;
    var event__id = this.data.event_selected._id;
    var date = new Date();
    var author = this.data.author;
    var tag = this.data.tag;

    //checking
    if(!title)
    {
      wx.showToast({
        title: '未填写资讯名称',
        icon: 'none'
      })
      return;
    }
    else
    {
      if(title.indexOf("/") != -1)
      {
        wx.showToast({
          title: '资讯名称不能含有"/"',
          icon: 'none'
        })
        return;
      }
      var duplicate = false;
      db.collection("articles").where({
        title: title
      }).field({
        _id: true,
        title: true
      }).get({
        success: function(res){
          if(res.data[0])
          {
            wx.showToast({
              title: '与现有资讯重名',
              icon: 'none'
            })
            duplicate = true
          }
        }
      })
      if(duplicate) return;
    }

    if(tag == "请选择资讯类别标签")
    {
      wx.showToast({
        title: '未选择资讯类别标签',
        icon: 'none'
      })
      return;
    }

    if(!this.data.files.length)
    {
      wx.showToast({
        title: '未上传资讯封面',
        icon: 'none'
      })
      return;
    }

    console.log(this.data);
    console.log(event__id);
    console.log(date);
    console.log(author);

    wx.showModal({
      title: '提示',
      content: '确认发布资讯"' + title + '"吗？',
      success: function(res){
        if(res.cancel)
        {
          return;
        }
        else
        {
          var files = that.data.files;
          //uploadfile and complete
          const filePath = files[0];
          const cloudPath =  `articles/${title}/${app.globalData.openid}_${Math.random()}_${Date.now()}.${filePath.match(/\.(\w+)$/)[1]}`;
          wx.cloud.uploadFile({
            cloudPath,
            filePath,
            success: function(res){
              var files_cloud_url = res.fileID;
              console.log(res.fileID);
              //increment
              var count = db.collection("articles").count();
              count.then(function(result){
                count = result.total;
                var _id = count + 1 + "";
                //upload to cloudbase
                db.collection("articles").add({
                  data:{
                    _id: _id,
                    event__id: event__id ? event__id : 0,
                    author: author,
                    comment: [],
                    date: new Date(),
                    isAvailable: false,
                    node: "",
                    openid: app.globalData.user.openid,
                    thumbnail: files_cloud_url,
                    title: title,
                    tag: tag,
                    view: 0
                  },
                  success: function(res){
                    wx.showToast({
                      title: '发布成功',
                      duration: 3000,
                      success: function(res){
                        wx.reLaunch({
                          url: '../../articlelist/articlelist',
                        })
                      }
                      }
                    )
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