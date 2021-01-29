const app = getApp();
const db = wx.cloud.database();
var verification_helper = require("../../../utils/helpers/verification_helper");
var versatile_helper = require("../../../utils/helpers/versatile_helper");
var compare_helper = require("../../../utils/helpers/compare_helper");
var verification_helper = require("../../../utils/helpers/verification_helper");
var notification_helper = require("../../../utils/helpers/notification_helper");

Page({

  data: {
    brands: [
      "捷安特(GIANT)",
      "美利达(MERIDA)",
      "喜德盛(XDS)",
      "永久(FOREVER)",
      "凤凰(PHOENIX)",
      "飞鸽(PIGEON)",
      "BH(比驰)",
      "Bianchi(比安奇)",
      "BMC",
      "Cannondale",
      "CANYON",
      "cervélo",
      "COLNAGO(梅花)",
      "DAHON(大行)",
      "Decathlon(迪卡侬)",
      "FOCUS",
      "KONA",
      "KUOTA",
      "LOOK",
      "Pinarello",
      "PIVOT",
      "Santa Cruz",
      "SCOTT",
      "SPECIALIZED/S-WORKS(闪电)",
      "Time",
      "TREK(崔克)",
      "YETI",
      "其他(含自组)"
    ],
    brand_index: "请选择品牌",
    types_set: [
      [
        "铺装路面",
        "混合路面",
        "山林野道",
        "其他"
      ],
      [
        "综合公路",
        "爬坡公路",
        "耐力公路",
        "气动公路",
        "计时赛车(TT)",
        "铁人三项"
      ],
    ],
    type_index: [0, 0],
    type: "请选择类型",
    name: "",
    years: [],
    year_index: "请选择年份",
    distance: null,
    password: "",
    password_comfirm: "",
    password: "",
    is_password: true,
    is_password_confirm_hide: true,
    detail: "",
    text_counter: "0/500",
    is_rentable: false,
    is_sellable: false,
    devices: [],
    devices_name: [],
    bicycle_device: {
      name: "请选择设备"
    },
    is_bind_device_hide: true,
    files: [],
    is_upload_add_hide: false,
    is_submission_available: false
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    var batchTimes;
    var count = db.collection("devices").count();
    count.then(function (result) {
      count = result.total;
      batchTimes = Math.ceil(count / 20);
      var arrayContainer = [],
        x = 0;
      for (var i = 0; i < batchTimes; i++) {
        db.collection("devices").skip(i * 20).get({
          success: function (res) {
            for (var j = 0; j < res.data.length; j++) {
              arrayContainer.push(res.data[j]);
            }
            x++;
            if (x == batchTimes) {
              arrayContainer.sort(compare_helper.compare("_id"));
              var devices_name = [];
              for (var i = 0; i < arrayContainer.length; i++) {
                devices_name.push(arrayContainer[i].name);
              }
              var years = [1970],
                current_year = new Date().getFullYear();
              var count = 0;
              while (1) {
                years.push(1970 + ++count);
                if (years[years.length - 1] == current_year) break;
              }
              that.setData({
                devices: arrayContainer,
                devices_name: devices_name,
                years: years.reverse(),
                is_submission_available: true
              })
              wx.hideLoading({})
            }
          }
        })
      }
    })
  },

  preview: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.action],
      current: e.currentTarget.dataset.action
    })
  },

  bind_brand_change: function (e) {
    var that = this;
    that.setData({
      brand_index: that.data.brands[e.detail.value]
    })
  },

  bind_year_change: function (e) {
    var that = this;
    that.setData({
      year_index: that.data.years[e.detail.value]
    })
  },

  bind_type_change: function (e) {
    var that = this;
    that.setData({
      type_index: that.data.type_index,
      type: that.data.types_set[1][that.data.type_index[1]]
    })
  },

  bind_type_column_change: function (e) {
    var that = this;
    var full_type = [
      [
        "综合公路",
        "爬坡公路",
        "耐力公路",
        "气动公路",
        "计时赛车(TT)",
        "铁人三项"
      ],
      [
        "城市通勤",
        "城市通勤(折叠)",
        "GravelBike",
        "混合山地"
      ],
      [
        "硬尾山地(XC)",
        "林道(Trail)",
        "全地形(AM)",
        "Enduro",
        "自由骑(FR)",
        "速降(DH)",
        "Dual Slalom",
        "Dirt Jump"
      ],
      [
        "死飞",
        "电助力",
        "其他"
      ]
    ];
    that.data.type_index[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      //if ! column, column changed
      case (0):
        switch (e.detail.value) {
          case (0):
            that.data.types_set[1] = full_type[0];
            break;
          case (1):
            that.data.types_set[1] = full_type[1];
            break;
          case (2):
            that.data.types_set[1] = full_type[2];
            break;
          case (3):
            that.data.types_set[1] = full_type[3];
            break;
        }
        that.data.type_index[1] = 0;
        break;
    }!e.detail.column ? that.data.type_index[0] = e.detail.value : that.data.type_index[1] = e.detail.value;
    that.setData({
      types_set: that.data.types_set,
      type_index: that.data.type_index,
      type: that.data.types_set[1][that.data.type_index[1]]
    })
  },

  bind_rental_change: function (e) {
    this.setData({
      is_rentable: e.detail.value
    })
  },

  bind_sale_change: function (e) {
    this.setData({
      is_sellable: e.detail.value
    })
  },

  bind_device_change: function (e) {
    this.setData({
      bicycle_device: this.data.devices[e.detail.value],
    })
  },

  show_bind_device: function (e) {
    if (e.detail.value) {
      this.setData({
        is_bind_device_hide: false
      })
    } else {
      this.setData({
        is_bind_device_hide: true,
        event_device: {}
      })
    }
  },

  input_name: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  input_distance: function (e) {
    this.setData({
      distance: e.detail.value
    })
  },

  input_password: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  input_password_confirm: function (e) {
    this.setData({
      password_comfirm: e.detail.value
    })
  },

  show_password: function (e) {
    var that = this;
    if (that.data.password[0]) {
      this.setData({
        is_password: !that.data.is_password
      })
    }
  },

  input_detail: function (e) {
    this.setData({
      detail: e.detail.value,
      text_counter: `${e.detail.value.length}/500`
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

  submit: function () {
    var that = this;
    console.log(that.data)
    if (that.data.brand_index == "请选择品牌") {
      notification_helper.show_toast_without_icon("未选择车辆品牌", 2000);
      return;
    }
    if (that.data.type == "请选择类型") {
      notification_helper.show_toast_without_icon("未选择车辆类型", 2000);
      return;
    }
    if (that.data.year_index == "请选择年份") {
      notification_helper.show_toast_without_icon("未选择车辆出厂年份", 2000);
      return;
    }
    if (!that.data.name) {
      notification_helper.show_toast_without_icon("未填写车辆型号", 2000);
      return;
    }
    if (that.data.distance === null) {
      notification_helper.show_toast_without_icon("未填写车辆里程", 2000);
      return;
    }
    if (!that.data.password) {
      notification_helper.show_toast_without_icon("未填写车辆密钥", 2000);
      return;
    } else {
      if (!verification_helper.bicycle_password_verification(that.data.password)) {
        notification_helper.show_toast_without_icon(`密钥长度应在6-20之间，您的密码长度为${that.data.password.length}`, 2000);
        return;
      }
      if (!that.data.password_comfirm) {
        notification_helper.show_toast_without_icon("未确认车辆密钥", 2000);
        return;
      } else {
        if (that.data.password_comfirm !== that.data.password_comfirm) {
          notification_helper.show_toast_without_icon("密钥不一致", 2000);
          return;
        }
      }
    }
    if (!that.data.detail) {
      notification_helper.show_toast_without_icon("未填写车辆简介", 2000);
      return;
    }
    if (!that.data.is_bind_device_hide && that.data.bicycle_device === {
        name: "请选择设备"
      }) {
      notification_helper.show_toast_without_icon("未选择定位设备", 2000);
      return;
    }
    if (!that.data.files[0]) {
      notification_helper.show_toast_without_icon("未上传车辆图片", 2000);
      return;
    }
    wx.showModal({
      title: "提示",
      content: `添加车辆"${that.data.name}"？`,
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.cancel) return;
        else {
          that.setData({
            is_submission_available: false
          })
          wx.showLoading({
            title: '图片上传中',
            mask: true
          })
          var count = db.collection("bicycles").count();
          count.then(function (result) {
            count = result.total;
            var bicycle = {
              _id: "" + ++count,
              name: that.data.name,
              brand: that.data.brand_index
            }
            wx.cloud.uploadFile({
              cloudPath: versatile_helper.generate_cloudpath_for_bicycle(bicycle, that.data.files[0]),
              filePath: that.data.files[0],
              success(res) {
                var file = res.fileID;
                wx.showLoading({
                  title: "相关数据上传中",
                  mask: true
                })
                db.collection("bicycles").add({
                  data: {
                    _id: bicycle._id,
                    brand: that.data.brand_index,
                    detail: that.data.detail,
                    device: that.data.bicycle_device === {name: "请选择设备"} ? {} : that.data.bicycle_device,
                    distance: Number(that.data.distance),
                    is_available: true,
                    is_locked: that.data.is_rentable || that.data.is_sellable ? true : false,
                    is_rentable: that.data.is_rentable,
                    is_sellable: that.data.is_sellable,
                    manufacture_time: that.data.year_index,
                    name: that.data.name,
                    node: "",
                    openid: app.globalData.user.openid,
                    owner: {
                      _id: app.globalData.user._id,
                      avatar: app.globalData.user.avatar,
                      openid: app.globalData.user.openid
                    },
                    poster: file,
                    password: that.data.password,
                    renter: {},
                    status: 0,
                    time_created: new Date(),
                    type: that.data.type
                  },
                  success(res) {
                    wx.showLoading({
                      title: "数据更新中",
                      mask: true
                    })
                    app.globalData.user.my_bicycle.push({
                      _id: bicycle._id,
                      poster: file,
                      name: that.data.name,
                      detail: that.data.detail,
                      type: that.data.type,
                      distance: that.data.distance,
                      is_rentable: that.data.is_rentable,
                      is_sellable: that.data.is_sellable,
                      is_locked: that.data.is_rentable || that.data.is_sellable ? true : false,
                      password: that.data.password,
                      status: 0
                    });
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
                              title: "车辆已添加",
                              mask: true,
                              duration: 5000
                            })

                            function refresh() {
                              wx.reLaunch({
                                url: '../../../pages/index/index',
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
                    console.log("[database][bicycles]: failed to add");
                    wx.hideLoading({
                      success(res) {
                        notification_helper.show_toast_without_icon("数据上传失败，请刷新页面重试");
                      }
                    })
                  }
                })
              }
            })
          })
        }
      }
    })
  }
})