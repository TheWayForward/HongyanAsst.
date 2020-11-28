const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    id: "加载中",
    name: "",
    deviceid: "",
    apikey: "",
    devices: [],
    disabled: true
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '设备列表获取中',
    })
    var that = this;
    var batchTimes;
    var count = db.collection("devices").count();
    count.then(function(result){
      count = result.total;
      batchTimes = Math.ceil(count/20);
      var arrayContainer = [], x = 0;
      for(var i = 0; i < batchTimes; i++){
        db.collection("devices").skip(i * 20).get({
          success: function(res){
            for(var j = 0; j < res.data.length; j++){
              arrayContainer.push(res.data[j]);
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
                that.setData({
                  devices: arrayContainer,
                  id: (count + 1) + "",
                  disabled: false
                })
                wx.hideLoading({
                  complete: (res) => {},
                })
              }
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

  input_name: function(e){
    this.setData({
      name: e.detail.value
    })
  },

  input_deviceid: function(e){
    this.setData({
      deviceid: e.detail.value
    })
  },

  input_apikey: function(e){
    this.setData({
      apikey: e.detail.value
    })
  },

  submit: function(){
    var id = this.data.id;
    var name = this.data.name;
    var deviceid = this.data.deviceid;
    var apikey = this.data.apikey;
    var that = this;
    //check
    if(!name)
    {
      wx.showToast({
        title: '未填写设备名称',
        icon: 'none'
      })
      return;
    }

    if(!deviceid)
    {
      wx.showToast({
        title: '未填写DeviceId',
        icon: 'none'
      })
      return;
    }

    if(!apikey)
    {
      wx.showToast({
        title: '未填写APIKey',
        icon: 'none'
      })
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定添加设备"' + name + '"吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: function(res){
        if(res.cancel)
        {
          return;
        }
        else
        {
          wx.showLoading({
            title: '设备添加中',
          })
          db.collection("devices").add({
            data: {
              _id: id,
              name: name,
              deviceid: deviceid,
              apikey: apikey,
            },
            success: function(res){
              wx.hideLoading({
                complete: (res) => {
                  wx.showToast({
                    title: '设备添加成功',
                    duration: 3000,
                    success: function(res){
                      wx.reLaunch({
                        url: '../../manager/manager',
                      })
                    }
                  })
                },
              })
            }
          })
        }
      }
    })
  }
})