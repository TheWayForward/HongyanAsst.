const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    en: "loading...",
    ch: "加载中...",
    articles: [],
    search_articles: [],
    showTop: true,
    isHide: true,
    hnode: [{
      _id: "1",
      index_id: "1",
      node: '<img style="border-radius:15px; width: 862px !important; height: auto !important; vertical-align: middle; visibility: visible !important; max-width: 100%; " src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587724074005&di=b3800cdcb75980d4dadda205e2db7329&imgtype=0&src=http%3A%2F%2F3580.wangid.com%2Ftemplate_xin%2Fmingxingbao%2Fimg%2Fmxb.gif" crossorigin="anonymous" data-w="1080" data-type="jpeg" data-src="https://mmbiz.qpic.cn/mmbiz_jpg/VzFuMauwoqTc6bRD4ibOr9ib60UjMDe4jLVkxsI8zYVAibUfFdEibricL0C3fwrIFJlWCIAsZ0yULMvJgZggtOniaqGA/640?wx_fmt=jpeg" data-ratio="0.3740741" _width="862px" data-fail="0">'
    },
    ],
    //version check
    wechat_version: "",
    wechat_version_min: "",
    update_required: false
  },

  onLoad: function() {
    var that = this;
    wx.getUserInfo({
      complete: (res) => {
        app.globalData.userInfo = res.userInfo;
      },
    })
    db.collection("basic").where({
      _id: "wechat_version_min"
    }).get({
      success: function(res){
        var wechat_version = wx.getSystemInfoSync().version;
        var wechat_version_min = res.data[0].version;
        that.setData({
          wechat_version: wechat_version,
          wechat_version_min: wechat_version_min
        })
        //compare version
        function compare_version(ver1,ver2){
          ver1 = ver1.split(".");
          ver2 = ver2.split(".");
          for(var i = 0; i < 3; i++){
            ver1[i] = Number(ver1[i]);
            ver2[i] = Number(ver2[i]);
          }
          var ver1_weight = ver1[0] * 1000 + ver1[1] * 100 + ver1[2];
          var ver2_weight = ver2[0] * 1000 + ver2[1] * 100 + ver2[2];
          return ver1_weight > ver2_weight ? false : true;
        }
        if(!compare_version(wechat_version_min,wechat_version))
        {
          that.setData({
            update_required: true
          })
        }
      }
    })
    this.setData({
      wechat_version: wx.getSystemInfoSync().version,
      wechat_version_min: app.globalData.wechat_version_min
    })
  },

  onShow: function(){
    var that = this;
    function refresh(){
      if(app.globalData.user)
      {
        that.setData({
        ch: "欢迎使用测试版。",
        en: "Welcome."
        })
      }
      else
      {
        that.setData({
          ch: '点击"我的车协"进行注册，方可使用。',
          en: "Sign up before using."
        })
      }
    }
    setTimeout(refresh,5000);
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

  showinfo: function(){
    console.log(this.data.articles);
  },

  preview: function (e) {
    wx.previewImage({
      current: e.target.dataset.action,
      urls: [e.target.dataset.action]
    })
  },

  getUserInfo: function () {
    var that = this;
    wx.login({
      success: res => {
      }
    })
    wx.getSetting({
      success:function(res){
        if (res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success: res => {
            }
          })
        }
        else{
          
          wx.showToast({
            title: '⊗您拒绝了授权',
            icon:'none'
          })
        }
      }
    }),

    function _getUserInfo() {
    wx.getUserInfo({
      success: function (res) {
        console.log(res.data);
      }
    })
    }
  },
  
  goTop: function(){
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  goto_articlelist: function(){
    wx.navigateTo({
      url: '../../pages/articlelist/articlelist',
    })
  },

  goto_gallery: function(){
    wx.showToast({
      title: '页面建设中！',
      icon: 'none'
    })
  },

  goto_user_profile: function(){
    if(!app.globalData.data_status)
    {
      wx.showToast({
        title: '暂未获取到用户信息',
        icon: "none"
      })
    }
    else
    {
      if(!app.globalData.user)
      {
        wx.navigateTo({
          url: '../register/register',
        })
      }
      else
      {
        wx.navigateTo({
          url: '../user_profile/user_profile',
        })
      }
    }
  },

  goto_eventlist: function(){
    if(!app.globalData.user)
    {
      wx.showToast({
        title: '暂未获取到用户信息',
        icon: "none"
      })
    }
    else
    {
      wx.navigateTo({
        url: '../../pages/eventlist/eventlist',
      })
    }
  },

  goto_manager: function(){
    if(!app.globalData.user)
    {
      wx.showToast({
        title: '暂未获取到用户信息',
        icon: "none"
      })
    }
    else
    {
      if(!app.globalData.user.is_manager)
      {
        wx.showToast({
          title: '未授权管理员',
          icon: 'none'
        })
      }
      else
      {
        wx.navigateTo({
          url: '../manager/manager',
        })
      }
    }
  },

  goto_event_test: function(){
    if(!app.globalData.user)
    {
      wx.showToast({
        title: '暂未获取到用户信息',
        icon: "none"
      })
      return;
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 3000
    })
    db.collection("events").where({
      _id: "7"
    }).get({
      success: function(res){
        app.globalData.event = res.data[0];
        //test valid forever
        app.globalData.event.precise_time = Date.now();
        wx.reLaunch({
          url: '../eventlist/event/locate/locate',
        })
      }
    })
  },

  goto_feedback: function(){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  }
})
