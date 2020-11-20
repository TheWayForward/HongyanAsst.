const app = getApp();
const db = wx.cloud.database();
var util = require("../../utils/util");

Page({
  data: {
    articles: [],
    search_articles: [],
    showTop: true,
    isHide: true,
    is_loading_hide: false,
    loading_animation: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif",
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif" crossorigin="anonymous" data-w="1080" data-type="jpeg" data-src="https://mmbiz.qpic.cn/mmbiz_jpg/VzFuMauwoqTc6bRD4ibOr9ib60UjMDe4jLVkxsI8zYVAibUfFdEibricL0C3fwrIFJlWCIAsZ0yULMvJgZggtOniaqGA/640?wx_fmt=jpeg" data-ratio="0.3740741" _width="862px" data-fail="0">'
    },
    ],
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
          isAvailable: true,
          thumbnail: true,
          title:true,
          tag: true,
          view: true,
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
              arrayContainer.sort(compare("_id"));
              arrayContainer.reverse();
              that.setData({
                articles: arrayContainer,
                search_articles: arrayContainer,
                isHide: false,
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
    function set_loading_hide_true(){
      that.setData({
        is_loading_hide: true
      })
    }
    setTimeout(set_loading_hide_true,1500);
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onPageScroll: function(e){
    if(e.scrollTop > 500)
    {
      this.setData({
        showTop: false
      })
    }
    else
    {
      this.setData({
        showTop: true
      })
    }
  },

  onPullDownRefresh: function(){
    wx.showNavigationBarLoading({
      complete: (res) => {},
    })
    var that = this;
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
          isAvailable: true,
          thumbnail: true,
          title:true,
          tag: true,
          view: true
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
              arrayContainer.sort(compare("_id"));
              arrayContainer.reverse();
              that.setData({
                articles: arrayContainer,
                search_articles: arrayContainer,
                isHide: false
              })
            }
          }
        })
      }
    });
    if(that.data.articles)
    {
      wx.hideNavigationBarLoading({
        complete: (res) => {},
      })
      wx.stopPullDownRefresh({
        complete: (res) => {
          wx.showToast({
            title: '刷新成功',
          })
        },
      })
    }
  },

  showinfo: function(){
    console.log(this.data.articles);
  },

  preview: function (e) {
    wx.previewImage({
      current: e.target.dataset.action,
      urls: [e.target.dataset.action]
    })
  },
  
  goTop: function(){
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
        search_articles: that.data.articles
      })
    }
    else
    {
      this.setData({
        search_articles: 0
      })
      var list = [];
      var search_list = [];
      list = this.data.articles;
      for(var i = 0; i < list.length;i++){
        if(list[i].title.indexOf(str) >= 0 || list[i].type.indexOf(str) >= 0)
        {
          search_list.push(list[i]);
          this.setData({
            search_articles: search_list
          })
        }
      }
    }
  },

  //passing title and id
  goto_article: function(e){
    var article = e.currentTarget.dataset.action;
    if(!article.isAvailable)
    {
      wx.showToast({
        title: 'title',
        title: '审核中👀请耐心等待',
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
          url: '../../pages/article/article',
        })
        var view = res.data[0].view + 1;
        wx.cloud.callFunction({
          name:'add_view',
          data:{
            taskId: app.globalData.article._id,
            view: view
           }
           })
          .then(res => {
          })
      }
    })
    
  },
})
