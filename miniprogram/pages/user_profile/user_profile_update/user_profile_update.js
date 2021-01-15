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
    detail: "",
    text_counter: "",
    vcode: ""
  },

  onLoad: function () {
    var that = this;
    that.setData({
      user: app.globalData.user,
      campus_index: app.globalData.user.campus,
      dept_index: app.globalData.user.dept,
      text_counter: `${app.globalData.user.detail.length}/200`,
      nickname: app.globalData.user.nickname,
      QQ: app.globalData.user.QQ,
      tel: app.globalData.user.tel,
      detail: app.globalData.user.detail
    })
  },

  preview: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.action],
      current: e.currentTarget.dataset.action
    })
  },

  bind_uploader_change: function (e) {
    this.setData({
      is_uploader_hide: !e.detail.value
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

  input_tel: function (e) {
    this.setData({
      tel: e.detail.value
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
    if (!that.data.tel) {
      notification_helper.show_toast_without_icon("未填写手机号");
      return;
    } else {
      if (!verification_helper.tel_verification(that.data.tel)) {
        notification_helper.show_toast_without_icon("手机号格式有误", 2000);
      }
    }
    if (!that.data.is_uploader_hide && !that.data.files[0]) {
      notification_helper.show_toast_without_icon("未上传头像", 2000);
      return;
    }
    //vcode
    app.globalData.user.campus = that.data.campus_index;
    app.globalData.user.nickname = that.data.nickname;
    app.globalData.user.QQ = that.data.QQ;
    app.globalData.user.tel = that.data.tel;
    app.globalData.user.detail = that.data.detail;
    app.globalData.user.my_last_modified = Date.now();
    wx.showModal({
      title: "提示",
      content: "更新您的个人信息？",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) {
          return;
        } else {
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
                  name: "update_user",
                  data: {
                    openid: that.data.user.openid,
                    my_campus: that.data.campus_index,
                    my_nickname: that.data.nickname,
                    my_QQ: that.data.QQ,
                    my_tel: that.data.tel,
                    my_detail: that.data.detail,
                    my_avatar: res.fileID,
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
            })
          } else {
            //no upload
            wx.showLoading({
              title: '相关数据上传中',
              mask: true
            })
            app.globalData.user.my_last_modified = new Date().getTime();
            wx.cloud.callFunction({
              name: "update_user",
              data: {
                openid: that.data.user.openid,
                my_campus: that.data.campus_index,
                my_nickname: that.data.nickname,
                my_QQ: that.data.QQ,
                my_tel: that.data.tel,
                my_detail: that.data.detail,
                my_avatar: that.data.user.avatar,
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