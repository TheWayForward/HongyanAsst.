const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    //catch info from app.js
    info_holder: {},
    avatar: "http://m.qpic.cn/psc?/V10ldMks1Z5QlW/bqQfVz5yrrGYSXMvKr.cqTPtnUN7zJo2Kz37cZDcRRVc2vsiXputSKNVw*8pyqRyadlrvjrlbmkEtqNUG8hmTkJqtNAHKJgK8D*TrAEQeuk!/b&bo=9AFpAfQBaQECCS0!&rf=viewer_4",
    wechat_nickname: "昵称加载中",
    //user info verification and hidden
    is_get_userinfo_hide: false,
    genders: [
      "男",
      "女",
      "保密"
    ],
    genderIndex: "请选择性别",
    campuses: [
      "西土城路校区",
      "沙河校区"
    ],
    campusIndex: "请选择校区",
    depts: [
      "信息与通信工程学院",
      "计算机学院（国家示范性软件学院）",
      "电子工程学院",
      "现代邮政学院",
      "人工智能学院",
      "数字媒体与艺术设计学院",
      "网络空间安全学院",
      "经济管理学院",
      "人文学院",
      "理学院",
      "国际学院",
      "其他"
    ],
    deptIndex: "请选择学院",
    QQ: "",
    tel: "",
    email: "",
    detail: "",
    text_counter:"0/200",
    isChecked: false,
    is_register_button_hide: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      complete: (res) => {
        if(res.err_code == -12006)
        {
          wx.showToast({
            title: '未获取到您的基本信息，请点击页面顶部按钮进行授权',
            icon: 'none',
            duration: 5000
          })
        }
        else
        {
          var userinfo = res.userInfo;
          that.setData({
            avatar: userinfo.avatarUrl,
            wechat_nickname: userinfo.nickName,
            is_get_userinfo_hide: true
          })
        }
      },
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

  preview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  //get userinfo
  get_userinfo: function(e){
    console.log(e);
    if(e.detail.errMsg == "getUserInfo:fail auth deny")
    {
      wx.showToast({
        title: '请点击弹框右侧绿色按钮完成授权',
        icon: 'none',
        duration: 5000
      })
    }
    else
    {
      var userinfo = JSON.parse(e.detail.rawData);
      app.globalData.userInfo = userinfo;
      console.log(userinfo);
      this.setData({
        avatar: userinfo.avatarUrl,
        wechat_nickname: userinfo.nickName,
        is_get_userinfo_hide: true
      })
    }
  },

  //input
  input_realname: function(e){
    this.setData({
      realname : e.detail.value
    });
  },

  input_QQ: function(e){
    this.setData({
      QQ : e.detail.value
    });
  },

  input_tel: function(e){
    this.setData({
      tel : e.detail.value
    });
  },

  input_email: function(e){
    this.setData({
      email : e.detail.value
    });
  },

  input_detail: function(e){
    var count = e.detail.value;
    var c = count.length + "/" + 200;
    this.setData({
      detail : e.detail.value,
      text_counter: c
    });
  },

  //picker
  bind_genderChange: function(e){
    this.setData({
      genderIndex: this.data.genders[e.detail.value]
    })
  },

  bind_campusChange: function(e){
    this.setData({
      campusIndex: this.data.campuses[e.detail.value]
    })
  },

  bind_deptChange: function(e){
    this.setData({
      deptIndex: this.data.depts[e.detail.value]
    })
  },

  //agreement check
  check_contract: function(e){
    var c = Number(e.detail.value);
    if(c == 1)
    {
      this.setData({
        isChecked: true
      })
    }
    else
    {
      this.setData({
        isChecked: false
      })
    }
  },

  submit: function(){
    var that = this;
    //assignment
    var realname = this.data.realname;
    var nickname = this.data.wechat_nickname;
    var gender = this.data.genderIndex;
    var campus = this.data.campusIndex;
    var dept = this.data.deptIndex;
    var QQ = this.data.QQ;
    var tel = this.data.tel;
    var email = this.data.email;
    var detail = this.data.detail;
    var isChecked = this.data.isChecked;

    if(nickname == "昵称加载中")
    {
      wx.showToast({
        title: '未获取到您的基本信息，请点击页面顶部按钮进行授权后进行注册',
        icon: 'none',
        duration: 3000
      })
      return;
    }

    //realname: must be Chinese
    if(!realname)
    {
      wx.showToast({
        icon: 'none',
        title: '请输入您的真实姓名'
      })
      return;
    }
    else
    {
      //regexp of realname
      var realname_reg = /^[\u4E00-\u9FA5A-Za-z]+$/;
      if(!realname_reg.test(realname))
      {
        wx.showToast({
          icon: 'none',
          title: '姓名格式有误'
        })
        return;
      }
    }

    //gender
    if(gender == "请选择性别")  
    {
      wx.showToast({
        icon: 'none',
        title: '您还未选择性别'
      })
      return;
    }

    //campus
    if(campus == "请选择校区")  
    {
      wx.showToast({
        icon: 'none',
        title: '您还未选择校区'
      })
      return;
    }

    //dept
    if(dept == "请选择学院")  
    {
      wx.showToast({
        icon: 'none',
        title: '您还未选择学院'
      })
      return;
    }

    //QQ
    if(!QQ)
    {
      wx.showToast({
        icon: 'none',
        title: '您还未输入QQ号码'
      })
      return;
    }
    else
    {
      var QQ_reg = /[1-9][0-9]{4,}/;
      if(!QQ_reg.test(QQ))
      {
        wx.showToast({
          icon: 'none',
          title: 'QQ号码格式错误'
        })
        return;
      }
    }

    //tel
    if(!tel)  
    {
      wx.showToast({
        icon: 'none',
        title: '您还未输入电话'
      })
      return;
    }
    else
    {
      //regexp of tel
      var tel_reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
      if(!tel_reg.test(tel))
      {
        wx.showToast({
          icon: 'none',
          title: '电话号码格式有误'
        })
        return;
      }
    }

    //email
    if(!email)
    {
      wx.showToast({
        icon: 'none',
        title: '您还未输入邮箱'
      })
      return;
    }
    else
    {
      //regexp of email
      var email_reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
      if(!email_reg.test(email))
      {
        wx.showToast({
          icon: 'none',
          title: '邮箱格式有误'
        })
        return;
      }
    }
    
    //agreement check
    if(!isChecked)
    {
      wx.showToast({
        icon: 'none',
        title: '请勾选相关服务条款',
      })
      return;
    }

    //initializing a new user object
    var _id = 0;
    _id = _id.toString();
    var user = new Object();
    user.avatar = that.data.avatar;
    user.credit = 100;
    user.realname = realname;
    user.nickname = this.data.wechat_nickname;
    user.gender = gender;
    user.campus = campus;
    user.dept = dept;
    user.QQ = QQ;
    user.tel = tel;
    user.email = email;
    user.detail = detail;
    user._id = _id;
    user.my_bicycle = [
      {
        bicycle_name: "美团共享单车",
        bicycle_price: 200,
        bicycle_thumbnail: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1603649383367&di=1d75874f4e747f6d91f995be6662addd&imgtype=0&src=http%3A%2F%2Fdingyue.ws.126.net%2F2020%2F0304%2F3bcd8bf5j00q6nqwc001kd000s600ivp.jpg",
        bicycle_type: "共享单车",
        status: 0
      }
    ];
    user.my_event = [];
    user.login = true;
    user.total_distance = 0;
    if(!this.data.detail)
    {
      user.detail = "这个人很懒，" + (user.gender == "男" ? "他" : (user.gender == "保密") ? "TA" : "她") + "什么也没留下。";
    }
    else
    {
      user.detail = this.data.detail;
    }
    user.openid = app.globalData.openid;
    //_id increment
    var count = db.collection("user").count();
    count.then(function(result){
      console.log(result.total);
      count = ++result.total;
      user._id = count.toString();
      console.log(user);
      db.collection("user").where({
        openid: app.globalData.openid
      }).field({
        _id: true
      }).get({
        success: function(res){
          if(res.data[0])
          {
            wx.showToast({
              icon: "none",
              title: '不可重复注册'
            })
            return;
          }
          else
          {
            that.setData({
              is_register_button_hide: true
            })
            wx.showLoading({
              title: '注册中',
            })
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
            var d = new Date();
            user.birthday = d.getTime();
            app.globalData.user = user;
            db.collection("user").add({
              data:{
                _id: user._id,
                QQ: user.QQ,
                avatar: that.data.avatar,
                birthday: user.birthday,
                campus: user.campus,
                credit: 100,
                dept: user.dept,
                detail: user.detail,
                email: user.email,
                gender: user.gender,
                is_manager: false,
                my_bicycle: user.my_bicycle,
                my_event: [],
                nickname: user.nickname,
                openid: app.globalData.openid,
                realname: user.realname,
                tel: user.tel,
                total_distance: 0
              }
            })
            wx.hideLoading({
              complete: (res) => {},
            })
            wx.showToast({
              title: '注册成功',
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
        }
      })
    })
  } 
})