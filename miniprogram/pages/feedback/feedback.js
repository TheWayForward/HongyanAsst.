const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    detail: '',
    disabled: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

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

  input_detail: function(e){
    this.setData({
      detail: e.detail.value
    })
  },

  submit: function(){
    var detail = this.data.detail
    var that = this;
    if(!detail)
    {
      wx.showToast({
        title: '反馈不能为空',
        icon: 'none'
      })
      return;
    }
    else
    {
      var d = new Date();
      db.collection("feedback").add({
        data: {
          time: d,
          detail: detail
        },success: function(res){
          that.setData({
            disabled: true
          })
          wx.showToast({
            title: '提交成功',
            duration: 3000,
            success: function(){
              function refresh(){
                wx.reLaunch({
                  url: '../index/index',
                })
              }
              setTimeout(refresh,3000);
            }
          })
        }
      })
    }
  }
})