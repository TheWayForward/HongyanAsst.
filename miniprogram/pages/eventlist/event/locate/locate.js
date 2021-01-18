const app = getApp();
const db = wx.cloud.database();
var compare_helper = require("../../../../utils/helpers/compare_helper");
var time_helper = require("../../../../utils/helpers/time_helper");
var notification_helper = require("../../../../utils/helpers/notification_helper");
var location_helper = require("../../../../utils/helpers/location_helper");
var versatile_helper = require("../../../../utils/helpers/versatile_helper");

Page({
  data: {
    //from server
    event: {},
    is_image_list_hide: true,
    is_image_previewer_hide: true,
    is_dynamic_data_hide: false,
    is_snapshots_hide: true,
    is_uploader_hide: true,
    is_upload_add_hide: false,
    is_upload_available: true,
    height: 300,
    map_scale: 16,
    timer: 0,
    watcher: 0,
    location_delta_count: 0,
    latitude: 0,
    longitude: 0,
    speed: 0,
    accuracy: 0,
    is_down: false,
    markers: [],
    current_marker: {},
    event_id: null,
    //from user
    tip_footer: "加载中",
    files: [],
    snapshot: {},
    choose_location_image: "../../../../images/point.png",
    detail: "",
    input_value: "",
    all_snapshots_tip: "查看该活动全部图片",
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.event.name,
    })
    if (!this.data.event) {
      wx.showLoading({
        title: '加载中',
      })
    }
    var that = this;
    var event = app.globalData.event;
    that.setData({
      event: event,
      is_uploader_hide: app.globalData.user.openid ? (compare_helper.compare_time_for_event_locate_uploader(event.time, new Date()) ? false : true) : true,
      tip_footer: compare_helper.compare_time_for_event_locate_uploader(event.time, new Date()) ? (app.globalData.user.openid ? "请在活动开始前一小时至活动开始后一日内上传图片" : "请注册后上传图片") : "非活动时间，不能上传图片",
      all_snapshots_tip: event.snapshots[0] ? `查看活动"${event.name}"全部图片(${event.snapshots_count})` : `暂无图片`,
      is_image_list_hide: event.snapshots[0] ? false : true,
      height: wx.getSystemInfoSync().windowHeight * 0.5
    })
    wx.hideLoading({})
  },

  onShow: function () {
    var that = this;
    var event = app.globalData.event;
    if (!event.device._id || !compare_helper.compare_time_for_event_locate_timer(event.time, new Date())) {
      //event without device or previous event, set map focus as the starting point
      //get data for once at least, then decide by the time of event and now
      that.setData({
        longitude: event.location_start.longitude,
        latitude: event.location_start.latitude,
        markers: versatile_helper.delete_location_info_for_markers(versatile_helper.generate_markers(event.snapshots, "image/imagepoint.png")),
        is_dynamic_data_hide: true
      })
    } else {
      //event with device, set map focus as device location
      location_helper.get_datapoints_from_onenet(event.device).then((location_info) => {
        //get data for once at least, then decide by the time of event and now
        that.setData({
          longitude: location_info.longitude,
          latitude: location_info.latitude,
          speed: location_info.speed,
          accuracy: location_info.accuracy,
          is_down: location_info.is_down,
          markers: versatile_helper.attach_location_info_to_markers(location_info, event.device, versatile_helper.generate_markers(event.snapshots), "image/star.png"),
          is_dynamic_data_hide: false
        })
        if (compare_helper.compare_time_for_event_locate_timer(event.time, new Date())) {
          function get_datapoints() {
            var location_info_past = {};
            if (that.data.latitude) {
              location_info_past = {
                speed: that.data.speed,
                longitude: that.data.longitude,
                latitude: that.data.latitude,
                accuracy: location_info.accuracy,
                is_down: location_info.is_down,
                timestamp: new Date()
              }
            }
            location_helper.get_datapoints_from_onenet(event.device).then((location_info) => {
              if (compare_helper.compare_location_info(location_info, location_info_past)) {
                //frozen once
                that.setData({
                  location_delta_count: ++that.data.location_delta_count
                })
                if (that.data.location_delta_count >= 10) {
                  //frozen for 20 seconds
                  that.setData({
                    speed: "--"
                  })
                  clearInterval(that.data.timer);
                  that.data.timer = setInterval(get_datapoints, 15000);
                }
              } else {
                //moving
                that.setData({
                  location_delta_count: 0,
                  speed: location_info.speed,
                  accuracy: location_info.accuracy,
                  is_down: location_info.is_down
                })
                clearInterval(that.data.timer);
                that.data.timer = setInterval(get_datapoints, 2000);
              }
              that.setData({
                longitude: location_info.longitude,
                latitude: location_info.latitude,
                accuracy: location_info.accuracy,
                is_down: location_info.is_down,
                is_dynamic_data_hide: false
              })
            })
          }
          that.data.timer = setInterval(get_datapoints, 2000);
        }
      });
    }
    that.setData({
      watcher: db.collection("events").where({
        _id: app.globalData.event._id
      }).watch({
        onChange(e) {
          db.collection("events").where({
            _id: app.globalData.event._id
          }).field({
            snapshots: true
          }).get({
            success(res) {
              var event = that.data.event;
              event.snapshots_count = res.data[0].snapshots.length;
              event.snapshots = res.data[0].snapshots;
              var location_info = {
                speed: that.data.speed,
                longitude: that.data.longitude,
                latitude: that.data.latitude,
                timestamp: new Date()
              }
              that.setData({
                event: event,
                markers: (!event.device._id || !compare_helper.compare_time_for_event_locate_timer(event.time, new Date())) ? versatile_helper.delete_location_info_for_markers(versatile_helper.generate_markers(event.snapshots, "image/imagepoint.png")) : versatile_helper.attach_location_info_to_markers(location_info, event.device, versatile_helper.generate_markers(event.snapshots), "image/star.png"),
                is_image_list_hide: event.snapshots[0] ? false : true
              })
            }
          })
        },
        onError(e) {}
      })
    })
  },

  onHide: function () {
    clearInterval(this.data.timer);
    this.data.watcher.close();
  },

  onUnload: function () {
    clearInterval(this.data.timer);
    this.data.watcher.close();
  },

  //preview image in this page
  preview: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.action,
      urls: [e.currentTarget.dataset.action]
    })
  },

  get_map_info: function (e) {
    if (e.causedBy == "scale") {
      this.setData({
        map_scale: e.detail.scale
      })
    }
  },

  map_zoom_in: function () {
    var that = this;
    this.setData({
      map_scale: that.data.map_scale < 20 ? ++that.data.map_scale : that.data.map_scale
    })
    if (that.data.map_scale == 20) {
      notification_helper.show_toast_without_icon("已放大至最高级别", 2000);
    }
  },

  map_zoom_out: function () {
    var that = this;
    this.setData({
      map_scale: that.data.map_scale > 8 ? --that.data.map_scale : that.data.map_scale
    })
    if (that.data.map_scale == 8) {
      notification_helper.show_toast_without_icon("已缩小至最高级别", 2000);
    }
  },

  //marker tapped
  show_snapshot_from_map: function (e) {
    var markers = this.data.markers;
    if (markers[0].is_snapshot) {
      //markers without location
      this.setData({
        is_image_previewer_hide: false,
        markers: versatile_helper.hilight_marker(markers, e.detail.markerId, "image/imagepoint.png", "image/imagepoint_selected.png"),
        current_marker: markers[e.detail.markerId]
      })
    }
  },

  //list tapped
  show_snapshot_from_list: function (e) {
    var that = this;
    that.setData({
      latitude: e.currentTarget.dataset.action.latitude,
      longitude: e.currentTarget.dataset.action.longitude,
      markers: versatile_helper.hilight_marker(that.data.markers, e.currentTarget.dataset.action.id, "image/imagepoint.png", "image/imagepoint_selected.png"),
      current_marker: e.currentTarget.dataset.action,
      is_image_previewer_hide: false
    })
  },

  location_focus: function (e) {
    this.setData({
      latitude: e.currentTarget.dataset.action.latitude,
      longitude: e.currentTarget.dataset.action.longitude
    })
  },

  show_all_snapshots: function () {
    var that = this;
    this.setData({
      is_snapshots_hide: !that.data.is_snapshots_hide,
      all_snapshots_tip: that.data.event.snapshots_count ? (that.data.is_snapshots_hide ? "收起" : `查看活动"${that.data.event.name}"全部图片(${that.data.event.snapshots_count})`) : "暂无图片"
    })
  },

  choose_image: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        if (res.tempFiles[0].size > 4000000) {
          notification_helper.show_toast_without_icon(`图片大小不得超过4MB，该图片过大(${(res.tempFiles[0].size / 1000000).toFixed(2)})。`, 2000);
          return;
        }
        that.setData({
          files: [res.tempFilePaths[0]],
          is_upload_add_hide: true
        })
      }
    })
  },

  delete_image: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除这张照片？',
      cancelColor: 'gray',
      cancelText: '取消',
      confirmColor: '#FA5159',
      confirmText: '确定',
      success(res) {
        if (res.cancel) {
          return;
        } else {
          that.setData({
            files: [],
            is_upload_add_hide: false
          })
        }
      }
    })
  },

  input: function (e) {
    this.setData({
      detail: e.detail.value
    })
  },

  choose_location: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        wx.chooseLocation({
          latitude: res.latitude,
          longitude: res.longitude,
          complete(res) {
            console.log(res);
            if (res.errMsg == "chooseLocation:fail") {
              notification_helper.show_toast_without_icon("未选中位置，请重新选择", 2000);
              that.setData({
                choose_location_image: "../../../../images/point.png"
              })
            } else if (res.errMsg == "chooseLocation:ok") {
              that.setData({
                choose_location_image: "../../../../images/point_selected.png",
                snapshot: {
                  location: db.Geo.Point(res.longitude, res.latitude),
                  name: res.name ? res.name : "当前位置",
                  avatar: app.globalData.user.avatar,
                  openid: app.globalData.user.openid,
                  nickname: app.globalData.user.nickname,
                  realname: app.globalData.user.realname,
                  time: new Date().getTime()
                }
              })
            }
          }
        })
      },
      fail(res) {
        if (res.errMsg == "getLocation:fail auth deny") {
          wx.showModal({
            title: "提示",
            content: "未授权小程序使用您的位置信息，现在授权？",
            cancelText: "取消",
            confirmText: "确定",
            success(res) {
              if (res.cancel) {
                notification_helper.show_toast_without_icon("授权失败", 2000);
              } else {
                wx.openSetting({
                  withSubscriptions: true,
                  success(res) {
                    if (!res.authSetting["scope.userLocation"]) {
                      notification_helper.show_toast_without_icon("授权失败", 2000);
                    }
                  }
                })
              }
            }
          })
        } else if (res.errMsg == "getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF") {
          notification_helper.show_toast_without_icon("请打开定位开关", 2000)
        }
      }
    })
  },

  upload_image: function () {
    var that = this;
    if (!that.data.files[0]) {
      notification_helper.show_toast_without_icon("未选择图片", 2000);
      return;
    }
    if (!that.data.detail) {
      notification_helper.show_toast_without_icon("未填写图片备注", 2000);
      return;
    }
    if (!that.data.snapshot.hasOwnProperty("location")) {
      notification_helper.show_toast_without_icon("未选择位置", 2000);
      return;
    }
    wx.showModal({
      title: "提示",
      content: "确定上传这张图片？",
      success(res) {
        if (res.cancel) {
          return;
        } else {
          that.setData({
            is_upload_available: false
          })
          wx.showLoading({
            title: '图片上传中',
            mask: true
          })
          var snapshot = that.data.snapshot;
          snapshot.detail = that.data.detail;
          wx.cloud.uploadFile({
            cloudPath: versatile_helper.generate_cloudpath_for_snapshots(that.data.event, app.globalData.user, that.data.files[0]),
            filePath: that.data.files[0],
            success(res) {
              snapshot.url = res.fileID;
              that.data.event.snapshots.push(snapshot);
              wx.showLoading({
                title: '相关数据上传中',
                mask: true
              })
              wx.cloud.callFunction({
                name: "update_snapshots",
                data: {
                  taskId: that.data.event._id,
                  my_snapshot: that.data.event.snapshots,
                  my_snapshot_count: that.data.event.snapshots.length
                },
                success(res) {
                  console.log("[cloudfunction][update_snapshots]: updated successfully");
                  wx.showLoading({
                    title: '数据更新中',
                    mask: true
                  })
                  app.globalData.user.my_snapshots.push(snapshot);
                  wx.cloud.callFunction({
                    name: "update_user_snapshots",
                    data: {
                      openid: app.globalData.user.openid,
                      my_snapshots: app.globalData.user.my_snapshots
                    },
                    success(res) {
                      console.log("[cloudfunction][update_user_snapshots]: updated successfully");
                      wx.hideLoading({
                        success(res) {
                          wx.showToast({
                            title: '上传成功',
                            mask: true
                          })
                          wx.pageScrollTo({
                            scrollTop: 0
                          })
                          that.setData({
                            is_upload_available: true,
                            files: [],
                            is_upload_add_hide: false,
                            input_value: "",
                            snapshot: {},
                            choose_location_image: "../../../../images/point.png"
                          })
                          that.onLoad();
                        }
                      })
                    },
                    fail(res) {
                      console.log("[cloudfunction][update_user_snapshots]: failed to update");
                      notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                    }
                  })
                },
                fail(res) {
                  console.log("[cloudfunction][update_snapshots]: failed to update");
                  notification_helper.show_toast_without_icon("获取数据失败，请刷新页面重试", 2000);
                }
              })
            },
            fail(res) {
              console.log(res);
              wx.hideLoading({
                success(res) {
                  console.log("[upload_image]: cloud upload error")
                  notification_helper.show_toast_without_icon("上传失败，请刷新页面重试", 2000);
                }
              })
            }
          })
        }
      }
    })
  }
})