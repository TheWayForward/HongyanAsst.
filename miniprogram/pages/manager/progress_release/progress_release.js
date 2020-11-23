const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    current_version: "加载中…",
    developers: [],
    developers_name: [],
    current_developer_name: "加载中…",
    current_developer: {},
    detail: "",
    //can't choose until the developer info's been got
    is_developers_got: false,
    //dynamic counter
    text_counter: "0/50",
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '获取开发者名单',
    })
    var that = this;
    db.collection("progress").where({
      _id: "version"
    }).get({
      success: function(res){
        that.setData({
          current_version: res.data[0].version
        })
      }
    })
    var count = db.collection("developers").count();
    var batchTimes;
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [], x = 0;
      var nameContainer = [];
      for (var i = 0; i < batchTimes; i++) {
        db.collection("developers").skip(i * 20).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
              nameContainer.push(res.data[j].name);
            }
            x++;
            if (x == batchTimes) 
            {
              that.setData({
                developers: arrayContainer,
                developers_name: nameContainer,
                current_developer_name: "选择作出贡献的开发者",
                is_developers_got: true
              })
              wx.hideLoading({
                complete: (res) => {},
              })
            }
          }
        })
      }
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

  bind_developer_change: function(e){
    this.setData({
      current_developer: this.data.developers[e.detail.value],
      current_developer_name: this.data.developers_name[e.detail.value]
    })
  },

  //input detail and change text counter
  input_detail: function(e){
    var count = e.detail.value;
    var c = count.length + "/" + 50;
    this.setData({
      detail : e.detail.value,
      text_counter: c
    });
    if(count.length == 50)
    {
      wx.showToast({
        title: '文字数量已达上限',
        icon: 'none'
      })
    }
  },

  submit: function(){
    if(this.data.current_developer_name == "选择作出贡献的开发者")
    {
      wx.showToast({
        title: '未选择开发者',
        icon: 'none'
      })
      return;
    }
    if(!this.data.detail)
    {
      wx.showToast({
        title: '未填写日志内容',
        icon: 'none'
      })
      return;
    }
    var version = this.data.current_version;
    var contributor = this.data.current_developer_name;
    var detail = this.data.detail;
    var d = new Date();
    var year = d.getFullYear() + "";
    var date = (d.getMonth() + 1) + "/" + d.getDate();
    wx.showModal({
      title: "提示",
      content: "确认发布开发日志？",
      confirmText: "确定",
      cancelText: "取消",
      success(res){
        if(res.cancel)
        {
          return;
        }
        else
        {
          var count = db.collection("progress").count();
          count.then(function(result){
            count = result.total + "";
            console.log(count,contributor,year,date,version,detail);
            db.collection("progress").add({
              data:{
                _id: count,
                contributor: contributor,
                year: year,
                date: date,
                version: version,
                details: detail
              },
              success: function(res){
                wx.showToast({
                  title: '发布成功',
                  duration: 3000,
                  success: function(res){
                    wx.reLaunch({
                      url: '../../official/official',
                    })
                  }
                  }
                )
              }
            },
            )
          })
        }
      }
    })
  }
})