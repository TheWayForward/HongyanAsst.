const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    user: [],
    isHide: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    if(!app.globalData.user)
    {
      console.log("user_profile: Do not exist");
      this.setData({
        isHide: true
      })
      wx.showModal({
        title: '提示',
        content: '非注册用户。',
        cancelColor: 'gray',
        cancelText: '取消',
        confirmText: '立即注册',
        success: function(res){
          if(res.cancel)
          {
            wx.navigateTo({
              url: '../../pages/index/index',
            })
          }
          else
          {
            wx.navigateTo({
              url: '../../pages/register/register',
            })
          }
        }

      })
    }
    else
    {
      that.setData({
        user: app.globalData.user
      })
      console.log(that.data.user);
    }
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
    //if the user came back from the register page
    if(app.globalData.last_page_holder == "register")
    {
      app.globalData.last_page_holder = "";
      // jump to index
      wx.navigateTo({
        url: '../../pages/index/index',
      })
    }
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
      current: e.target.dataset.action,
      urls: [e.target.dataset.action]
    })
  }
})