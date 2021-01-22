const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../utils/helpers/compare_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");
var time_helper = require("../../../utils/helpers/time_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");
var verification_helper = require("../../../utils/helpers/verification_helper");

Page({
  data: {
    user: {},
    is_uploader_hide: true,
    is_upload_add_hide: false,
    is_email_hide: true,
    is_tel_hide: true,
    is_submission_available: true,
    files: [],
    campuses: [
      "西土城路校区",
      "沙河校区"
    ],
    campus_index: "加载中",
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
    dept_index: "加载中",
    nickname: "",
    QQ: "",
    tel: "",
    email: "",
    detail: "",
    text_counter: "",
    vcode: "",
    vcode_btn_tip: "获取验证码"
  },

  onLoad: function () {
    var that = this;
    that.setData({
      user: app.globalData.user,
      campus_index: app.globalData.user.campus,
      dept_index: app.globalData.user.dept,
      tel: app.globalData.user.tel,
      text_counter: `${app.globalData.user.detail.length}/200`,
      nickname: app.globalData.user.nickname,
      QQ: app.globalData.user.QQ,
      email: app.globalData.user.email,
      is_email_hide: app.globalData.user.email ? false : true,
      detail: app.globalData.user.detail
    })
  },

  preview: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.action],
      current: e.currentTarget.dataset.action
    })
  },

  choose_image: function () {
    var that = this;
    wx.chooseImage({
      //choose compressd image to get faster upload and save data
      sizeType: ['compressed'],
      count: 1,
      //take a snapshot or choose a photo
      sourceType: ['album', 'camera'],
      success(res) {
        //check the size of the image
        var maxsize = 1000000;
        if (res.tempFiles[0].size > maxsize) {
          var original_size = (res.tempFiles[0].size / 1000000).toFixed(2);
          wx.showToast({
            title: '图片过大(' + original_size + 'MB' + ')，请取消勾选"原图"或另行上传较小的图片',
            icon: 'none'
          })
          return;
        }
        //return file path and attach to page data filepath array
        that.setData({
          files: that.data.files.concat(res.tempFilePaths),
          is_upload_add_hide: true,
        });
      }
    })
  },

  delete_image: function () {
    var that = this;
    wx.showModal({
      title: '取消上传',
      content: '不再上传这张照片？',
      cancelColor: 'gray',
      cancelText: '取消',
      confirmColor: '#E1251B',
      confirmText: '确定',
      success(res) {
        if (res.cancel) {
          //if cancelled, continue
        } else {
          that.setData({
            files: [],
            is_upload_add_hide: false,
          })
        }
      }
    })
  },

  bind_campus_change: function (e) {
    var that = this;
    that.setData({
      campus_index: that.data.campuses[Number(e.detail.value)]
    })
  },

  bind_dept_change: function (e) {
    var that = this;
    that.setData({
      dept_index: that.data.depts[Number(e.detail.value)]
    })
  },

  input_nickname: function (e) {
    this.setData({
      nickname: e.detail.value
    })
  },

  input_QQ: function (e) {
    this.setData({
      QQ: e.detail.value
    })
  },

  bind_tel_change: function (e) {
    this.setData({
      is_tel_hide: !e.detail.value
    })
  },

  input_tel: function (e) {
    this.setData({
      tel: e.detail.value,
      is_vcode_available: verification_helper.tel_verification(e.detail.value)
    });
  },

  send_vcode: function () {
    var that = this;
    if (that.data.tel == app.globalData.user.tel) {
      notification_helper.show_toast_without_icon("手机号未更换", 2000);
      return;
    }
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
        wx.hideLoading({})
        console.log("[cloudfunction][send_vcode]: sent successfully");
        notification_helper.show_toast_without_icon("验证码已发送", 2000);

        function clear_vcode() {
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
        setTimeout(clear_vcode, 300000);
      },
      fail(res) {
        console.log("[cloudfunction][send_vcode]: failed to send");
        notification_helper.show_toast_without_icon("验证码发送失败", 2000);
      }
    })
  },

  bind_email_change: function (e) {
    this.setData({
      is_email_hide: !e.detail.value
    })
  },

  input_email: function (e) {
    this.setData({
      email: e.detail.value
    })
  },

  input_vcode: function (e) {
    this.setData({
      vcode: e.detail.value
    })
  },

  input_detail: function (e) {
    this.setData({
      detail: e.detail.value,
      text_counter: `${e.detail.value.length}/200`
    })
  },

  bind_uploader_change: function (e) {
    this.setData({
      is_uploader_hide: !e.detail.value
    })
  },

  submit: function () {
    var that = this;
    if (!that.data.nickname) {
      notification_helper.show_toast_without_icon("未填写昵称", 2000);
      return;
    } else {
      if (!verification_helper.nickname_verification(that.data.nickname)) {
        notification_helper.show_toast_without_icon("昵称过长", 2000);
        return;
      }
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
    if (!that.data.is_tel_hide) {
      if (!that.data.tel) {
        notification_helper.show_toast_without_icon("未填写手机号", 2000);
        return;
      }
      if (!verification_helper.tel_verification(that.data.tel)) {
        notification_helper.show_toast_without_icon("手机号格式有误", 2000);
        return;
      }
      if (!that.data.vcode) {
        notification_helper.show_toast_without_icon("未填写验证码", 2000);
        return;
      }
    }
    if (!that.data.email && !that.data.is_email_hide) {
      notification_helper.show_toast_without_icon("未填写邮箱", 2000);
      return;
    } else {
      if (!verification_helper.email_verification(that.data.email) && !that.data.is_email_hide) {
        notification_helper.show_toast_without_icon("邮箱格式有误", 2000);
        return;
      }
    }
    if (!that.data.is_uploader_hide && !that.data.files[0]) {
      notification_helper.show_toast_without_icon("未上传头像", 2000);
      return;
    }
    //vcode
    wx.showModal({
      title: "提示",
      content: "更新您的个人信息？",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) {
          return;
        } else {
          wx.showLoading({
            title: '校验中',
            mask: true
          })
          if (!that.data.is_tel_hide && that.data.vcode != app.globalData.vcode) {
            notification_helper.show_toast_without_icon("验证码错误", 2000);
            return;
          }
          app.globalData.user.campus = that.data.campus_index;
          app.globalData.user.nickname = that.data.nickname;
          app.globalData.user.QQ = that.data.QQ;
          app.globalData.user.tel = that.data.tel;
          app.globalData.user.detail = that.data.detail;
          app.globalData.user.email = that.data.email;
          app.globalData.user.my_last_modified = Date.now();
          that.setData({
            is_submission_available: false
          })
          if (that.data.files[0]) {
            //with a new thumbnail
            wx.showLoading({
              title: '头像上传中',
              mask: true
            })
            wx.cloud.uploadFile({
              cloudPath: versatile_helper.generate_cloudpath_for_user(that.data.user, that.data.files[0]),
              filePath: that.data.files[0],
              success(res) {
                wx.showLoading({
                  title: '相关数据上传中',
                  mask: true
                })
                app.globalData.user.avatar = res.fileID;
                wx.cloud.callFunction({
                  name: "update_user_info",
                  data: {
                    openid: that.data.user.openid,
                    my_campus: that.data.campus_index,
                    my_nickname: that.data.nickname,
                    my_QQ: that.data.QQ,
                    my_tel: that.data.is_tel_hide ? app.globalData.user.tel : that.data.tel,
                    my_detail: that.data.detail,
                    my_email: that.data.email,
                    my_avatar: res.fileID,
                    my_last_modified: app.globalData.user.last_modified
                  },
                  success(res) {
                    console.log("[cloudfunction][update_user_info]: updated successfully");
                    console.log(res);
                    wx.hideLoading({
                      success(res) {
                        wx.showToast({
                          title: '信息已更新',
                          mask: true,
                          duration: 5000
                        })

                        function refresh() {
                          wx.reLaunch({
                            url: '../../index/index',
                          })
                        }
                        setTimeout(refresh, 2000);
                      }
                    })
                  },
                  fail(res) {
                    console.log("[cloudfunction][update_user_info]: failed to update");
                    notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                  }
                })
              }
            })
          } else {
            //no upload
            wx.showLoading({
              title: '相关数据上传中',
              mask: true
            })
            app.globalData.user.my_last_modified = new Date().getTime();
            wx.cloud.callFunction({
              name: "update_user_info",
              data: {
                openid: that.data.user.openid,
                my_campus: that.data.campus_index,
                my_nickname: that.data.nickname,
                my_QQ: that.data.QQ,
                my_tel: that.data.tel,
                my_detail: that.data.detail,
                my_avatar: that.data.user.avatar,
                my_email: that.data.email,
                my_last_modified: app.globalData.user.last_modified
              },
              success(res) {
                console.log("[cloudfunction][update_user]: updated successfully");
                wx.hideLoading({
                  success(res) {
                    wx.showToast({
                      title: '信息已更新',
                      mask: true,
                      duration: 5000
                    })

                    function refresh() {
                      wx.reLaunch({
                        url: '../../index/index',
                      })
                    }
                    setTimeout(refresh, 3000);
                  }
                })
              },
              fail(res) {
                console.log("[cloudfunction][update_user]: failed to update");
                notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
              }
            })
          }
        }
      }
    })
  }
})