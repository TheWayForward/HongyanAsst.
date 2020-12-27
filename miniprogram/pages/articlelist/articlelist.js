const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    articles: [],
    search_articles: [],
    showTop: true,
    isHide: true,
    is_loading_hide: false,
    total_result: "加载中...",
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
              function compare(p){
                return function(m,n){
                  var a = m[p];
                  var b = n[p];
                  return a-b;
                }
              };
              function padstart(time){
                if(time.length == 1)
                {
                  return ("0" + time);
                }
                else
                {
                  return time;
                }
              }
              for(var i = 0; i < arrayContainer.length; i++){
                var t = arrayContainer[i].date;
                arrayContainer[i].time = t.getFullYear().toString() + "/" + (t.getMonth() + 1).toString() + "/" + t.getDate().toString() + " " + padstart(t.getHours().toString()) + ":" + padstart(t.getMinutes().toString());
              }
              arrayContainer.sort(compare("date"));
              arrayContainer.reverse();
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
        search_articles: search_list
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
  //passing title and id
  goto_article: function(e){
    var article = e.currentTarget.dataset.action;
    if(!article.isAvailable)
    {
      wx.showToast({
        title: 'title',
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
          .then(res => {
          })
      }
    })
    
  },
})
