const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../utils/helpers/compare_helper");
var time_helper = require("../../utils/helpers/time_helper");

Page({
  data: {
    articles: [],
    search_articles: [],
    show_top: true,
    isHide: true,
    is_loading_hide: false,
    total_result: "加载中...",
    loading_animation: app.globalData.cycling_animation,
    input_value: ""
  },

  onLoad: function() {
    var that = this;
    //maximum batch 5, we create a batch getter
    var batchTimes;
    var count = db.collection("articles").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count/20);
      var arrayContainer = [], x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("articles").skip(i * 20).field({
          _id: true,
          author: true,
          is_available: true,
          thumbnail: true,
          title:true,
          tag: true,
          date: true,
          view: true,
        }).get({
          success:function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
            }
            x++;
            if(x == batchTimes)
            {
              for(var i = 0; i < arrayContainer.length; i++){
                arrayContainer[i].time = time_helper.format_time(arrayContainer[i].date).date_time;
              }
              arrayContainer.sort(compare_helper.compare("date")).reverse();
              that.setData({
                articles: arrayContainer,
                search_articles: arrayContainer,
                isHide: false,
                total_result: `共${arrayContainer.length}篇资讯`
              })
            }
          }
        })
      }
    });
  },

  onShow: function(){
    this.onLoad();
    var that = this;
    //lazy load animation
    function set_loading_hide_true(){
      that.setData({
        is_loading_hide: true
      })
    }
    setTimeout(set_loading_hide_true,1000);
  },

  onPageScroll: function(e){
    if(e.scrollTop > 500)
    {
      this.setData({
        show_top: false
      })
    }
    else
    {
      //to top icon shown
      this.setData({
        show_top: true
      })
    }
  },

  onPullDownRefresh: function(){
    var that = this;
    wx.showLoading({
      title: '资讯刷新中',
      success: function(){
      }
    })
    function refresh(){
      that.onLoad();
      wx.hideLoading({
        complete: (res) => {
          wx.showToast({
            title: '刷新成功',
          })
          wx.stopPullDownRefresh({
            complete: (res) => {},
          })
        },
      })
    }
    setTimeout(refresh,2000);
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },
  
  go_top: function(){
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  input: function(e){
    var that = this;
    var str = e.detail.value;
    if(!str)
    {
      this.setData({
        search_articles: that.data.articles,
        total_result: `共${that.data.articles.length}篇资讯`
      })
    }
    else
    {
      this.setData({
        search_articles: 0
      })
      var list = [];
      var search_list = [];
      var invalid_count = 0;
      list = this.data.articles;
      for(var i = 0; i < list.length;i++){
        if(list[i].title.indexOf(str) >= 0 || list[i].tag.indexOf(str) >= 0)
        {
          search_list.push(list[i]);
        }
        if(list[i].title.indexOf(str) == -1 && list[i].tag.indexOf(str) == -1)
        {
          invalid_count++;
        }
      }
      this.setData({
        search_articles: search_list,
        input_value: e.detail.value
      })
      if(invalid_count == list.length)
      {
        this.setData({
          total_result: "未找到相关资讯"
        })
      }
      else
      {
        this.setData({
          total_result: `共${search_list.length}篇资讯`
        })
      }
    }
  },

  input_clear: function(){
    var that = this;
    if(!this.data.input_value) return;
    this.setData({
      input_value: "",
      search_articles: that.data.articles,
      total_result: `共${that.data.articles.length}篇资讯`
    })
  },

  goto_article: function(e){
    var article = e.currentTarget.dataset.action;
    if(!article.is_available)
    {
      wx.showToast({
        title: '资讯审核中',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    app.globalData.article = article;
    db.collection("articles").where({
      _id: article._id
    }).get({
      success: function(res){
        wx.navigateTo({
          url: '../articlelist/article/article',
        })
        var view = res.data[0].view + 1;
        wx.cloud.callFunction({
          name:'add_article_view',
          data:{
            taskId: app.globalData.article._id,
            view: view
           }
        })
      }
    }) 
  },
})
