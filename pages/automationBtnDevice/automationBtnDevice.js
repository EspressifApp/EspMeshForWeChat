//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceList: [],
    device: "",
    events: [],
    eventNames: [],
    executeMacs: [],
    selected: 0,
    isMuch: false,
    existEvent: false
  },
  selectAll: function () {
    var self = this,
      list = self.data.deviceList,
      flag = false, selected = 0;
    if (list.length > 0) {
      if (self.data.selected == list.length) {
        flag = false;
        selected = 0;
      } else {
        flag = true;
        selected = list.length;
      }
      for (var i in list) {
        list[i].active = flag;
      }
      self.setData({
        deviceList: list,
        selected: selected
      })
    }
  },
  bindViewSelect: function (event) {
    var self = this,
      list = self.data.deviceList,
      index = event.currentTarget.dataset.index,
      item = self.data.deviceList[index];
    item.active = !item.active;
    if (item.active) {
      self.setData({
        selected: (self.data.selected + 1)
      })
    } else {
      self.setData({
        selected: (self.data.selected - 1)
      })
    }
    list.splice(index, 1, item);
    self.setData({
      deviceList: list
    })
  },
  save: function () {
    const self = this;
    var macs = [],
      list = self.data.deviceList;
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.active && macs.indexOf(item.mac) == -1) {
        macs.push(item.mac);
      }
    };
    console.log(macs);
    if (macs.length > 0) {
      setTimeout(function () {
        wx.navigateTo({
          url: '/pages/automationBtn/automationBtn?device=' + JSON.stringify(self.data.device) + '&isMuch=' + self.data.isMuch + '&macs=' + JSON.stringify(macs)
        })
      }, 100)
    } else {
      util.showToast("请选择设备");
    }
  },
  initEvent: function () {
    var executeMacs = [],
      deviceList = this.data.deviceList,
      selected = this.data.selected;
    executeMacs = this.getEventMacs(this.data.events);
    console.log(executeMacs);
    this.setData({
      existEvent: true
    })
    for (var i in deviceList) {
      var item = deviceList[i];
      if (executeMacs.indexOf(item.mac) != -1) {
        item.active = true;
        selected++;
        deviceList[i] = item;
      }
    }
    wx.hideLoading();
    this.setData({
      deviceList: deviceList,
      selected: selected
    })
  },
  getEventMacs: function (deviceEvents) {
    const self = this;
    var executeMacs = [], eventNames = [];
    for (var i in deviceEvents) {
      var item = deviceEvents[i]
      var execute_mac = item.execute_mac;
      eventNames.push({ name: item.name });
      for (var j in execute_mac) {
        var subItem = execute_mac[j];
        if (executeMacs.indexOf(subItem) == -1) {
          executeMacs.push(subItem);
        }
      }
    }
    self.setData({
      executeMacs: executeMacs,
      eventNames: eventNames
    })
    return executeMacs;
  },
  getDeviceList: function () {
    var list = wx.getStorageSync(constant.DEVICE_LIST),
      deviceList = [];
    for (var i in list) {
      var item = list[i];
      if (item.mac != this.data.device.mac) {
        item.active = false;
        deviceList.push(item);
      }
    }
    deviceList = util.sortList(deviceList);
    this.setData({
      deviceList: deviceList
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    var isMuch = options.isMuch;
    if (isMuch == "true") {
      isMuch = true;
    } else {
      isMuch = false;
    }
    var events = wx.getStorageSync("btn_select");
    self.setData({
      device: JSON.parse(options.device),
      events: events,
      isMuch: isMuch
    })
    wx.setNavigationBarTitle({
      title: self.data.device.name
    });
    util.showLoading("");
    self.getDeviceList();
    setTimeout(function () {
      self.initEvent();
    }, 200)
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