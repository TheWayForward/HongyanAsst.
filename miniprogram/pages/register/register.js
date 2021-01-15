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
    gender_index: "请选择性别",
    campuses: [
      "西土城路校区",
      "沙河校区"
    ],
    campus_index: "请选择校区",
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
    dept_index: "请选择学院",
    QQ: "",
    tel: "",
    vcode: "",
    realname: "",
    text_counter: "0/200",
    is_vcode_available: false,
    is_vcode_input_available: false,
    vcode_btn_tip: "获取验证码",
    is_submission_available: false
  },

  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      complete: (res) => {
        if (res.err_code == -12006) {
          that.setData({
            is_submission_available: false
          })
          notification_helper.show_toast_without_icon("未获取到您的基本信息，请点击页面顶部按钮进行授权", 5000);
        } else {
          that.setData({
            avatar: res.userInfo.avatarUrl,
            wechat_nickname: res.userInfo.nickName,
            is_get_userinfo_hide: true,
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
        is_get_userinfo_hide: true,
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
      tel: e.detail.value,
      is_vcode_available: verification_helper.tel_verification(e.detail.value)
    });
  },

  input_vcode: function (e) {
    this.setData({
      vcode: e.detail.value,
      is_submission_available: e.detail.value ? true : false
    })
  },

  //picker
  bind_gender_change: function (e) {
    this.setData({
      gender_index: this.data.genders[e.detail.value]
    })
  },

  bind_campus_change: function (e) {
    this.setData({
      campus_index: this.data.campuses[e.detail.value]
    })
  },

  bind_dept_change: function (e) {
    this.setData({
      dept_index: this.data.depts[e.detail.value]
    })
  },

  send_vcode: function () {
    var that = this;
    that.setData({
      is_vcode_input_available: true,
      is_vcode_available: false
    })
    var interval = 60;
    app.globalData.vcode = verification_helper.generate_vcode();
    wx.showLoading({
      title: '验证码发送中',
      mask: true
    })
    wx.cloud.callFunction({
      name: "send_vcode",
      data: {
        my_phonenumber: that.data.tel,
        vcode: app.globalData.vcode
      },
      success(res) {
        wx.hideLoading({
        })
        console.log("[cloudfunction][send_vcode]: sent successfully");
        notification_helper.show_toast_without_icon("验证码已发送", 2000);
        function clear_vcode(){
          console.log("vcode cleared");
          app.globalData.vcode = null;
        }
        function vcode_countdown() {
          that.setData({
            vcode_btn_tip: interval ? `重发(${interval}s)` : "发送验证码",
            is_vcode_available: interval ? false : true
          })
          interval-- ? setTimeout(vcode_countdown, 1000): 0;
        }
        vcode_countdown();
        setTimeout(clear_vcode,300000);
      },
      fail(res) {
        console.log("[cloudfunction][send_vcode]: failed to send");
        notification_helper.show_toast_without_icon("验证码发送失败", 2000);
      }
    })
  },

  submit: function () {
    var that = this;
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
    if (that.data.gender_index == "请选择性别") {
      notification_helper.show_toast_without_icon("未选择性别", 2000);
      return;
    }
    if (that.data.campus_index == "请选择校区") {
      notification_helper.show_toast_without_icon("未选择校区", 2000);
      return;
    }
    if (that.data.dept_index == "请选择学院") {
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
      if (!verification_helper.tel_verification(that.data.tel)) {
        notification_helper.show_toast_without_icon("手机号格式有误", 2000);
        return;
      }
    }
    if (!that.data.vcode) {
      notification_helper.show_toast_without_icon("未填写验证码", 2000);
      return;
    } else {
      if (!verification_helper.vcode_verification(that.data.vcode)) {
        notification_helper.show_toast_without_icon("验证码格式错误", 2000);
        return;
      }
    }
    wx.showModal({
      title: "提示",
      content: "立即注册成为鸿雁车协成员？",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) {
          return;
        } else {
          if (that.data.vcode != app.globalData.vcode) {
            notification_helper.show_toast_without_icon("验证码错误", 2000);
            return;
          }
          app.clear_vcode();
          that.setData({
            is_submission_available: false
          })
          wx.showLoading({
            title: "校验中",
            mask: true,
          })
          var user = {
            avatar: that.data.avatar,
            credit: 100,
            realname: that.data.realname,
            nickname: that.data.wechat_nickname,
            gender: that.data.gender_index,
            campus: that.data.campus_index,
            dept: that.data.dept_index,
            QQ: that.data.QQ,
            tel: that.data.tel,
            email: that.data.email,
            detail: `这个人很懒，${that.data.gender_index == "男" ? "他" : (that.data.gender_index == "保密") ? "TA" : "她"}什么也没留下。`,
            my_bicycle: [],
            my_event: [],
            total_distance: 0,
            openid: app.globalData.openid
          };
          //_id increment
          var count = db.collection("user").count();
          count.then(function (result) {
            user._id = (++result.total).toString();
            db.collection("user").where({
              openid: app.globalData.openid
            }).field({
              _id: true
            }).get({
              success(res) {
                if (res.data[0]) {
                  notification_helper.show_toast_without_icon("用户已存在", 2000);
                  that.setData({
                    is_submission_available: true
                  })
                  return;
                } else {
                  wx.showLoading({
                    title: '注册中',
                    mask: true
                  })
                  user.birthday = new Date();
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
                    },
                    success(res) {
                      console.log("[database][user]: add successfully");
                      wx.hideLoading({
                        success(res) {
                          wx.showToast({
                            title: '注册成功',
                            duration: 3000,
                            mask: true,
                            success: function () {
                              function refresh() {
                                wx.reLaunch({
                                  url: '../index/index',
                                })
                              }
                              setTimeout(refresh, 2000);
                            }
                          })
                        }
                      })
                    },
                    fail(res) {
                      console.log("[database][user]: failed to add");
                      notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试");
                    }
                  })
                }
              }
            })
          })
        }
      }
    })
  }
})