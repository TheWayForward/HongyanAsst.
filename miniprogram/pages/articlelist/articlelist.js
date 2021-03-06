const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../utils/helpers/compare_helper");
var time_helper = require("../../utils/helpers/time_helper");
var notification_helper = require("../../utils/helpers/notification_helper");

Page({
  data: {
    articles: [],
    search_articles: [{
      thumbnail: "../../images/loading.gif"
    }],
    search_articles_1: [{
      thumbnail: "../../images/loading.gif"
    }],
    search_articles_2: [{
      thumbnail: "../../images/loading.gif"
    }],
    show_top: true,
    isHide: true,
    total_result: "加载中...",
    input_value: "",
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '资讯新闻',
    })
    if (!this.data.articles[0]) {
      wx.showLoading({
        title: '资讯加载中',
      })
    }
    var that = this;
    var batchTimes;
    var count = db.collection("articles").count();
    count.then(function (result) {
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],
        arrayContainer1 = [],
        arrayContainer2 = [],
        x = 0;
      for (var i = 0; i < batchTimes; i++) {
        db.collection("articles").skip(i * 20).field({
          _id: true,
          author: true,
          is_available: true,
          thumbnail: true,
          title: true,
          tag: true,
          date: true,
          view: true,
          comment_count: true
        }).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
            }
            x++;
            if (x == batchTimes) {
              for (var i = 0; i < arrayContainer.length; i++) {
                arrayContainer[i].time = time_helper.format_time(arrayContainer[i].date).date;
              }
              arrayContainer.sort(compare_helper.compare("date")).reverse();
              for (var i = 0; i < arrayContainer.length; i++) {
                i % 2 ? arrayContainer1.push(arrayContainer[i]) : arrayContainer2.push(arrayContainer[i]);
              }
              that.setData({
                articles: arrayContainer,
                search_articles: arrayContainer,
                search_articles_1: arrayContainer1,
                search_articles_2: arrayContainer2,
                isHide: false,
                total_result: `共${arrayContainer.length}篇资讯`,
              })
              wx.hideLoading({})
            }
          }
        })
      }
    })
  },

  onPageScroll: function (e) {
    if (e.scrollTop > 500) {
      this.setData({
        show_top: false
      })
    } else {
      //to top icon shown
      this.setData({
        show_top: true
      })
    }
  },

  onPullDownRefresh: function () {
    var that = this;
    wx.showLoading({
      title: '资讯刷新中',
      success: function () {}
    })

    function refresh() {
      that.onLoad();
      wx.hideLoading({
        complete(res) {
          wx.showToast({
            title: '刷新成功',
          })
          wx.stopPullDownRefresh({})
        },
      })
    }
    setTimeout(refresh, 2000);
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  go_top: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },

  input: function (e) {
    var that = this;
    e.detail.value = e.detail.value.replace(/\s+/g,"");
    if (!e.detail.value) {
      that.data.search_articles_1 = [];
      that.data.search_articles_2 = [];
      for (var i = 0; i < that.data.articles.length; i++) {
        i % 2 ? that.data.search_articles_1.push(that.data.articles[i]) : that.data.search_articles_2.push(that.data.articles[i]);
      }
      that.setData({
        search_articles: that.data.articles,
        search_articles_1: that.data.search_articles_1,
        search_articles_2: that.data.search_articles_2,
        total_result: `共${that.data.articles.length}篇资讯`
      })
    } else {
      var search_list_1 = [],search_list_2 = [],invalid_count = 0,count = 0;
      for (var i = 0; i < that.data.articles.length; i++) {
        if (that.data.articles[i].title.indexOf(e.detail.value) >= 0 || that.data.articles[i].tag.indexOf(e.detail.value) >= 0) {
          //found
          ++count % 2 ? search_list_2.push(that.data.articles[i]) : search_list_1.push(that.data.articles[i]);
        }
        if (that.data.articles[i].title.indexOf(e.detail.value) == -1 && that.data.articles[i].tag.indexOf(e.detail.value) == -1) {
          invalid_count++;
        }
      }
      this.setData({
        search_articles_1: search_list_1,
        search_articles_2: search_list_2,
        input_value: e.detail.value,
        total_result: invalid_count == that.data.articles.length ? "未找到相关资讯" : `共${that.data.articles.length - invalid_count}篇资讯`
      })
    }
  },

  input_clear: function () {
    var that = this;
    if (!this.data.input_value) return;
    this.setData({
      input_value: "",
      search_articles: that.data.articles,
      total_result: `共${that.data.articles.length}篇资讯`,
      image1: true,
      image2: false
    })
  },

  goto_article: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var article = e.currentTarget.dataset.action;
    if (!article.is_available) {
      wx.hideLoading({
        success: (res) => {
          wx.showToast({
            title: '资讯审核中',
            icon: 'none',
            duration: 2000
          })
        },
      })
      return;
    }
    app.globalData.article = article;
    db.collection("articles").where({
      _id: article._id
    }).get({
      success: function (res) {
        wx.cloud.callFunction({
          name: 'add_article_view',
          data: {
            taskId: app.globalData.article._id,
            view: res.data[0].view + 1
          },
          success(res) {
            console.log("[cloudfunction][add_article_view]: add successfully");
            wx.hideLoading({
              success: (res) => {
                wx.navigateTo({
                  url: '../articlelist/article/article',
                })
              },
            })
          },
          fail(res) {
            console.log("[cloudfunction][add_article_view]: failed to add");
            wx.hideLoading({
              success: (res) => {
                notification_helper.show_toast_without_icon("获取数据失败，请下拉刷新页面后访问资讯", 2000)
              },
            })
          }
        })
      }
    })
  },
})