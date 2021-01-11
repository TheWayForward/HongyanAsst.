const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");

Page({

  data: {
    //select tag
    title: "",
    tags: [
      "车协",
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
    disabled: true,
    is_upload_add_hide: false,
    files: [],
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var batchTimes;
    var count = db.collection("events").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [], x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("events").skip(i * 20).field({
          _id: true,
          name: true,
          poster: true,
          time: true
        }).get({
          success: function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
            }
            x++;
            if(x == batchTimes)
            {
              for(var k = 0; k < arrayContainer.length; k++){
                arrayContainer[k].date = time_helper.format_time(arrayContainer[k].time).date;
                arrayContainer[k].time = arrayContainer[k].time.getTime();
                arrayContainer[k].background = "white";
              }
              arrayContainer.sort(compare_helper.compare("time"));
              arrayContainer.reverse();
              that.setData({
                events: arrayContainer,
                disabled: false
              })
              wx.hideLoading({
                complete: (res) => {},
              })
            }
          }
        })
      }
    });
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
    this.setData({
      tag: this.data.tags[Number(e.detail.value)]
    })
  },

  //author can be current manager or the org
  bind_author_change: function(e){
    this.setData({
      author: e.detail.value ? "鸿雁车协" : `${app.globalData.user.nickname}(${app.globalData.user.realname})`
    })
  },

  show_bind_event: function(e){
    var that = this;
    that.setData({
      is_bind_event_hide: e.detail.value,
      event_selected: e.detail.value ? that.data.event_selected : {}
    })
  },

  select_event: function(e){
    var events = this.data.events;
    var event_selected = e.currentTarget.dataset.action;
    for(var i = 0; i < events.length; i++){
      events[i].background = "white"
      if(event_selected._id == events[i]._id)
      {
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
          })
        }
      }
    })
  },

  submit: function(){
    var that = this;
    if(!that.data.title)
    {
      notification_helper.show_toast_without_icon("资讯名称未填写",2000);
      return;
    }
    else
    {
      if(that.data.title.indexOf("/") != -1)
      {
        notification_helper.show_toast_without_icon("资讯名称不能含有\"/\"",2000);
        return;
      }
    }
    if(that.data.tag == "请选择资讯类别标签")
    {
      notification_helper.show_toast_without_icon("资讯类别标签未选择",2000);
      return;
    }
    if(that.data.is_bind_event_hide)
    {
      if(!that.data.event_selected._id)
      {
        notification_helper.show_toast_without_icon("请选择关联活动，或关闭\"关联活动\"选项",2000);
        return;
      }
    }

    if(!that.data.files.length)
    {
      notification_helper.show_toast_without_icon("资讯封面未上传",2000);
      return;
    }
    wx.showModal({
      title: '提示',
      content: `确认发布资讯"${that.data.title}"吗？`,
      success: function(res){
        if(res.cancel)
        {
          return;
        }
        else
        {
          that.setData({
            disabled: true
          })
          wx.showLoading({
            title: '图片上传中',
            mask: true
          })
          wx.cloud.uploadFile({
            cloudPath: versatile_helper.generate_cloudpath_for_article(that.data.title,app.globalData.user,that.data.files[0]),
            filePath: that.data.files[0],
            success: function(res){
              wx.showLoading({
                title: '相关数据上传中',
                mask: true
              })
              var count = db.collection("articles").count();
              count.then(function(result){
                count = result.total;
                //upload to cloudbase
                db.collection("articles").add({
                  data:{
                    _id: count + 1 + "",
                    event__id: that.data.event_selected._id ? that.data.event_selected._id : 0,
                    author: that.data.author,
                    comment: [],
                    comment_count: 0,
                    date: new Date(),
                    is_available: false,
                    isAvailable: false,
                    node: "",
                    openid: app.globalData.user.openid,
                    thumbnail: res.fileID,
                    title: that.data.title,
                    tag: that.data.tag,
                    view: 0
                  },
                  success: function(res){
                    wx.hideLoading({
                    })
                    wx.showToast({
                      title: '发布成功',
                      mask: true,
                      duration: 3000,
                      success(res){
                        wx.reLaunch({
                          url: '../../index/index',
                        })
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