const app = getApp();
const db = wx.cloud.database();
var time_helper = require("../../../../utils/helpers/time_helper");
var notification_helper = require("../../../../utils/helpers/notification_helper");
var versatile_helper = require("../../../../utils/helpers/versatile_helper");


Page({

  data: {
    bicycle: {},
    detail: "",
    password: "",
    files: [],
    text_counter: "",
    is_uploader_hide: true,
    is_upload_add_hide: false,
    is_delete_hide: true,
    is_submission_available: false
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '编辑车辆信息',
    })
    wx.showLoading({
      title: "加载中",
      mask: true
    })
    var that = this;
    app.globalData.my_bicycle.date = time_helper.format_time(new Date(app.globalData.my_bicycle.precise_time)).date;
    that.setData({
      bicycle: app.globalData.my_bicycle,
      text_counter: `${app.globalData.my_bicycle.detail.length}/200`,
      detail: app.globalData.my_bicycle.detail,
      is_submission_available: true
    })
    wx.hideLoading({})
  },

  preview: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.action],
      current: e.currentTarget.dataset.action
    })
  },

  input_detail: function (e) {
    this.setData({
      detail: e.detail.value,
      text_counter: `${e.detail.value.length}/200`
    })
  },

  input_password: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  bind_uploader_change: function (e) {
    this.setData({
      is_uploader_hide: !e.detail.value
    })
  },

  bind_delete_change: function (e) {
    this.setData({
      is_delete_hide: !e.detail.value
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
            title: '图片过大(' + original_size + 'MB' + ')，请另行上传较小的图片',
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

  delete: function () {
    var that = this;
    wx.showModal({
      title: "警告",
      content: `确认删除车辆"${that.data.bicycle.name}"？删除后将不可恢复！`,
      confirmColor: "#FA5159",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) return;
        else {
          wx.showLoading({
            title: '数据删除中',
            mask: true
          })
          wx.cloud.callFunction({
            name: "update_bicycle_state",
            data: {
              _id: that.data.bicycle._id,
              my_availability_state: false,
              my_lock_state: true,
              my_rent_state: false
            },
            success(res) {
              console.log("[cloudfunction][update_bicycle_state]: updated successfully");
              wx.showLoading({
                title: '数据更新中',
                mask: true
              })
              for (var i = 0; i < app.globalData.user.my_bicycle.length; i++) {
                if (that.data.bicycle._id == app.globalData.user.my_bicycle[i]._id) {
                  app.globalData.user.my_bicycle.splice(i,1);
                  console.log(app.globalData.user.my_bicycle);
                  break;
                }
              }
              wx.cloud.callFunction({
                name: "update_user_bicycle",
                data: {
                  _id: app.globalData.user._id,
                  my_bicycle: app.globalData.user.my_bicycle
                },
                success(res) {
                  console.log("[cloudfunction][update_user_bicycle]: updated successfully");
                  wx.hideLoading({
                    success(res) {
                      wx.showToast({
                        title: '已删除',
                        mask: true,
                        duration: 5000
                      })

                      function refresh() {
                        wx.reLaunch({
                          url: '../../../../pages/index/index',
                        })
                      }
                      setTimeout(refresh, 2000);
                    }
                  })
                },
                fail(res) {
                  console.log("[cloudfunction][update_user_bicycle]: failed to update");
                  notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                }
              })
            },
            fail(res) {
              console.log("[cloudfunction][update_bicycle_state]: failed to update");
              notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
            }
          })
        }
      }
    })
  },

  submit: function () {
    var that = this;
    if (!that.data.detail) {
      notification_helper.show_toast_without_icon("未填写简介", 2000);
      return;
    }
    if (!that.data.is_uploader_hide && !that.data.files[0]) {
      notification_helper.show_toast_without_icon("未上传图片", 2000);
      return;
    }
    wx.showModal({
      title: "提示",
      content: "更新您的车辆信息？",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) return;
        else {
          that.setData({
            is_submission_available: false
          })
          //with a new poster
          if (that.data.files[0]) {
            wx.showLoading({
              title: '图片上传中',
              mask: true
            })
            wx.cloud.uploadFile({
              cloudPath: versatile_helper.generate_cloudpath_for_bicycle(that.data.bicycle, that.data.files[0]),
              filePath: that.data.files[0],
              success(res) {
                var file = res.fileID;
                wx.showLoading({
                  title: '相关数据上传中',
                  mask: true
                })
                wx.cloud.callFunction({
                  name: "update_user_bicycle_info",
                  data: {
                    _id: that.data.bicycle._id,
                    my_detail: that.data.detail,
                    my_poster: res.fileID
                  },
                  success(res) {
                    console.log("[cloudfunction][update_user_bicycle]: updated successfully");
                    for (var i = 0; i < app.globalData.user.my_bicycle.length; i++) {
                      if (that.data.bicycle._id == app.globalData.user.my_bicycle[i]._id) {
                        app.globalData.user.my_bicycle[i].poster = file;
                        app.globalData.user.my_bicycle[i].detail = that.data.detail;
                        wx.cloud.callFunction({
                          name: "update_user_bicycle",
                          data: {
                            _id: app.globalData.user._id,
                            my_bicycle: app.globalData.user.my_bicycle
                          },
                          success(res) {
                            console.log("[cloudfunction][update_user_bicycle]: updated successfully");
                            wx.hideLoading({
                              success(res) {
                                wx.showToast({
                                  title: '信息已更新',
                                  mask: true,
                                  duration: 5000
                                })

                                function refresh() {
                                  wx.reLaunch({
                                    url: '../../../../pages/index/index',
                                  })
                                }
                                setTimeout(refresh, 2000);
                              }
                            })
                          },
                          fail(res) {
                            console.log("[cloudfunction][update_user_bicycle]: failed to update");
                            notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                          }
                        })
                        break;
                      }
                    }
                  },
                  fail(res) {
                    console.log("[cloudfunction][update_user_bicycle]: failed to update");
                    notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                  }
                })
              }
            })
          } else {
            wx.showLoading({
              title: '相关数据上传中',
              mask: true
            })
            wx.cloud.callFunction({
              name: "update_user_bicycle_info",
              data: {
                _id: that.data.bicycle._id,
                my_detail: that.data.detail,
                my_poster: that.data.bicycle.poster
              },
              success(res) {
                console.log("[cloudfunction][update_user_bicycle]: updated successfully");
                for (var i = 0; i < app.globalData.user.my_bicycle.length; i++) {
                  if (that.data.bicycle._id == app.globalData.user.my_bicycle[i]._id) {
                    app.globalData.user.my_bicycle[i].detail = that.data.detail;
                    wx.cloud.callFunction({
                      name: "update_user_bicycle",
                      data: {
                        _id: app.globalData.user._id,
                        my_bicycle: app.globalData.user.my_bicycle
                      },
                      success(res) {
                        console.log("[cloudfunction][update_user_bicycle]: updated successfully");
                        wx.hideLoading({
                          success(res) {
                            wx.showToast({
                              title: '信息已更新',
                              mask: true,
                              duration: 5000
                            })

                            function refresh() {
                              wx.reLaunch({
                                url: '../../../../pages/index/index',
                              })
                            }
                            setTimeout(refresh, 2000);
                          }
                        })
                      },
                      fail(res) {
                        console.log("[cloudfunction][update_user_bicycle]: failed to update");
                        notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                      }
                    })
                    break;
                  }
                }
              },
              fail(res) {
                console.log("[cloudfunction][update_user_bicycle]: failed to update");
                notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
              }
            })
          }
        }
      }
    })
  }
})