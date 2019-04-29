const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    device: "",
    isMuch: false,
    eventType: -1,
    newEventType: -1,
    eventFlag: true,
    existEvent: false,
    deviceEvents: []
  },
  selected: function(e) {
    this.setData({
      newEventType: e.currentTarget.dataset.index
    })
  },
  next: function () {
    const self = this;
    if (self.data.newEventType > 0) {
      if (self.data.existEvent && self.data.newEventType != self.data.eventType) {
        self.delDeviceEvent(self.data.newEventType);
      } else {
        self.jump(self.data.newEventType, true);
      }
    }
  },
  delDeviceEvent: function(type) {
    const self = this;
    wx.showModal({
      title: '清除关联',
      confirmColor: "#3ec2fc",
      content: '切换事件类型将清空已存在的事件。',
      success(res) {
        if (res.confirm) {
          util.showLoading("");
          var deviceEvents = self.data.deviceEvents,
            eventNames = [];
          for (var i in deviceEvents) {
            var name = deviceEvents[i].name;
            if (eventNames.indexOf(name) == -1) {
              eventNames.push({ name: name });
            }
          }
          var data = '{"request": "' + constant.REMOVE_EVENT + '",' + '"events":' + JSON.stringify(eventNames) + '}',
            macs = [self.data.device.mac];
          setTimeout(function () {
            util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, self.data.device.ip, false, "", "");
            self.setData({
              existEvent: false,
              deviceEvents: [],
            })
            setTimeout(function () {
              self.jump(type, false);
            }, 200)
          }, 800);
        }
      }
    })
  },
  jump: function (type, flag) {
    const self = this;
    var url = "",
      isMush = false;

    if (type == constant.SINGLE_GROUP) {
      url = '/pages/automationBtnDevice/automationBtnDevice';
      isMush = false;
      
    } else {
      url = '/pages/automationBtn/automationBtn';
      isMush = true;
    }
    self.setData({
      isMuch: isMush,
      eventType: type
    })
    wx.removeStorageSync("btn_select");
    if (flag) {
      util.setStorage("btn_select", self.data.deviceEvents);
    } else {
      util.setStorage("btn_select", []);
    }
    setTimeout(function () {
      wx.navigateTo({
        url: url + '?device=' + JSON.stringify(self.data.device) + '&isMuch=' + self.data.isMuch + '&macs= "[]"'
      })
    }, 200)
  },
  getEvent: function () {
    var data = JSON.stringify({ "request": constant.GET_EVENT }),
      macs = [this.data.device.mac];
    util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, this.data.device.ip, false, this.initEvent, "", true);
  },
  initEvent: function(res) {
    const self = this;
    console.log(res);
    if (!util._isEmpty(res)) {
      if (!util._isEmpty(res.trigger)) {
        var deviceEvents = res.trigger;
        if (!util._isEmpty(deviceEvents)) {
          if (deviceEvents.length > 0) {
            var eventType = deviceEvents[0].event_class;
            self.setData({
              deviceEvents: deviceEvents,
              existEvent: true,
              eventType: eventType,
              newEventType: eventType
            })
          }
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var device = JSON.parse(options.device);
    console.log(device);
    wx.setNavigationBarTitle({
      title: device.name
    });
    this.setData({
      device: device
    })
    util.showLoading("");
    this.getEvent();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})