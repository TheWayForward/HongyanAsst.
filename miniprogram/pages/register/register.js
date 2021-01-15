const app = getApp();
const db = wx.cloud.database();
const notification_helper = require("../../utils/helpers/notification_helper");
var verification_helper = require("../../utils/helpers/verification_helper");


Page({

  data: {
    info_holder: {},
    avatar: "http://m.qpic.cn/psc?/V10ldMks1Z5QlW/bqQfVz5yrrGYSXMvKr.cqTPtnUN7zJo2Kz37cZDcRRVc2vsiXputSKNVw*8pyqRyadlrvjrlbmkEtqNUG8hmTkJqtNAHKJgK8D*TrAEQeuk!/b&bo=9AFpAfQBaQECCS0!&rf=viewer_4",
    wechat_nickname: "昵称加载中",
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
    realname: "",
    text_counter: "0/200",
    isChecked: false,
    is_register_button_hide: false
  },

  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      complete: (res) => {
        if (res.err_code == -12006) {
          notification_helper.show_toast_without_icon("未获取到您的基本信息，请点击页面顶部按钮进行授权", 5000);
        } else {
          that.setData({
            avatar: res.userInfo.avatarUrl,
            wechat_nickname: res.userInfo.nickName,
            is_get_userinfo_hide: true
          })
        }
      },
    })
  },

  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  //get userinfo
  get_userinfo: function (e) {
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      notification_helper.show_toast_without_icon("授权失败", 2000);
    } else {
      app.globalData.user_info = JSON.parse(e.detail.rawData);
      this.setData({
        avatar: app.globalData.user_info.avatarUrl,
        wechat_nickname: app.globalData.user_info.nickName,
        is_get_userinfo_hide: true
      })
    }
  },

  //input
  input_realname: function (e) {
    this.setData({
      realname: e.detail.value
    });
  },

  input_QQ: function (e) {
    this.setData({
      QQ: e.detail.value
    });
  },

  input_tel: function (e) {
    this.setData({
      tel: e.detail.value
    });
  },

  input_email: function (e) {
    this.setData({
      email: e.detail.value
    });
  },

  input_detail: function (e) {
    this.setData({
      detail: e.detail.value,
      text_counter: `${e.detail.value.length}/200`
    });
  },

  //picker
  bind_genderChange: function (e) {
    this.setData({
      genderIndex: this.data.genders[e.detail.value]
    })
  },

  bind_campusChange: function (e) {
    this.setData({
      campusIndex: this.data.campuses[e.detail.value]
    })
  },

  bind_deptChange: function (e) {
    this.setData({
      deptIndex: this.data.depts[e.detail.value]
    })
  },

  //agreement check
  check_contract: function (e) {
    this.setData({
      isChecked: Number(e.detail.value) == 1 ? true : false
    })
  },

  submit: function () {
    var that = this;
    //assignment
    var realname = that.data.realname;
    var nickname = this.data.wechat_nickname;
    var gender = this.data.genderIndex;
    var campus = this.data.campusIndex;
    var dept = this.data.deptIndex;
    var QQ = this.data.QQ;
    var tel = this.data.tel;
    var email = this.data.email;
    var detail = this.data.detail;
    var isChecked = this.data.isChecked;

    if (that.data.wechat_nickname == "昵称加载中") {
      notification_helper.show_toast_without_icon("未获取到您的基本信息，请点击页面顶部按钮进行授权后进行注册", 2000);
      return;
    }
    if (!that.data.realname) {
      notification_helper.show_toast_without_icon("未填写姓名", 2000);
      return;
    } else {
      if (!verification_helper.nickname_verification(that.data.realname)) {
        notification_helper.show_toast_without_icon("姓名格式有误", 2000);
        return;
      }
    }
    if (that.data.genderIndex == "请选择性别") {
      notification_helper.show_toast_without_icon("未选择性别", 2000);
      return;
    }
    if (that.data.campusIndex == "请选择校区") {
      notification_helper.show_toast_without_icon("未选择校区", 2000);
      return;
    }
    if (that.data.deptIndex == "请选择学院") {
      notification_helper.show_toast_without_icon("未选择学院", 2000);
      return;
    }
    if (!that.data.QQ) {
      notification_helper.show_toast_without_icon("未填写QQ号码", 2000);
      return;
    } else {
      if (!verification_helper.QQ_verification(that.data.QQ)) {
        notification_helper.show_toast_without_icon("QQ号码格式错误", 2000);
        return;
      }
    }
    if (!that.data.tel) {
      notification_helper.show_toast_without_icon("未填写手机号", 2000);
      return;
    } else {
      if (!verification_helper.tel_verification(that.data, tel)) {
        notification_helper.show_toast_without_icon("手机号格式有误", 2000);
        return;
      }
    }
    if (!that.data.email) {
      notification_helper.show_toast_without_icon("未填写邮箱", 2000);
      return;
    } else {
      if (!verification_helper.email_verification(that.data.email)) {
        notification_helper.show_toast_without_icon("邮箱格式有误", 2000);
        return;
      }
    }
    if (!isChecked) {
      notification_helper.show_toast_without_icon("请勾选相关服务条款", 2000);
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
    user.my_bicycle = [{
      bicycle_name: "美团共享单车",
      bicycle_price: 200,
      bicycle_thumbnail: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1603649383367&di=1d75874f4e747f6d91f995be6662addd&imgtype=0&src=http%3A%2F%2Fdingyue.ws.126.net%2F2020%2F0304%2F3bcd8bf5j00q6nqwc001kd000s600ivp.jpg",
      bicycle_type: "共享单车",
      status: 0
    }];
    user.my_event = [];
    user.login = true;
    user.total_distance = 0;
    if (!this.data.detail) {
      user.detail = "这个人很懒，" + (user.gender == "男" ? "他" : (user.gender == "保密") ? "TA" : "她") + "什么也没留下。";
    } else {
      user.detail = this.data.detail;
    }
    user.openid = app.globalData.openid;
    //_id increment
    var count = db.collection("user").count();
    count.then(function (result) {
      console.log(result.total);
      count = ++result.total;
      user._id = count.toString();
      console.log(user);
      db.collection("user").where({
        openid: app.globalData.openid
      }).field({
        _id: true
      }).get({
        success: function (res) {
          if (res.data[0]) {
            wx.showToast({
              icon: "none",
              title: '不可重复注册'
            })
            return;
          } else {
            that.setData({
              is_register_button_hide: true
            })
            wx.showLoading({
              title: '注册中',
            })

            function padstart(time) {
              if (time.length == 1) {
                return ("0" + time);
              } else {
                return time;
              }
            }
            var d = new Date();
            user.birthday = d.getTime();
            app.globalData.user = user;
            db.collection("user").add({
              data: {
                _id: user._id,
                QQ: user.QQ,
                avatar: that.data.avatar,
                birthday: user.birthday,
                last_modified: new Date(),
                campus: user.campus,
                credit: 100,
                dept: user.dept,
                detail: user.detail,
                email: user.email,
                gender: user.gender,
                is_manager: false,
                my_bicycle: user.my_bicycle,
                my_event: [],
                my_snapshots: [],
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
              success: function () {
                function refresh() {
                  wx.reLaunch({
                    url: '../index/index',
                  })
                }
                setTimeout(refresh, 3000);
              }
            })
          }
        }
      })
    })
  }
})