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
  save: function() {
    const self = this;
    var macs = [], tid = self.data.device.tid,
      ip = self.data.device.ip,
      list = self.data.deviceList,
      parentMac = self.data.device.mac;
    for (var i in list) {
      var item = list[i];
      if (item.active) {
        macs.push(item.mac);
      }
    };
    if (macs.length > 0) {
      util.showLoading("");
      if (tid >= constant.MIN_SWITCH && tid <= constant.MAX_SWITCH) {
        if (tid == constant.TOUCH_PAD_SWITCH) {
          setTimeout(function () {
            util.switchTouchDefaultEvent(parentMac, macs, ip, self.hide);
          }, 500);
        } else {
          setTimeout(function () {
            util.switchDefaultEvent(parentMac, macs, ip,self.hide);
          }, 500);

        }
      } else if (tid >= constant.MIN_SENSOR && tid <= constant.MAX_SENSOR) {
        if (tid == constant.SENSOR_24) {
          setTimeout(function () {
            util.sensor24DefaultEvent(parentMac, macs, ip, self.hide);
          }, 500);
        } else {
          setTimeout(function () {
            util.sensorDefaultEvent(parentMac, macs, ip,self.hide);
          }, 500);
        }

      } else if (tid >= constant.MIN_LIGHT && tid <= constant.MAX_LIGHT) {
        setTimeout(function () {
          util.lightSyscEvent(parentMac, macs,ip, self.hide);
        }, 500);
      }
    } else if (self.data.existEvent) {
      wx.showModal({
        title: '清除关联',
        confirmColor: "#3ec2fc",
        content: '确定要清空该设备下的事件吗?',
        success(res) {
          if (res.confirm) {
            util.showLoading("");
            var data = '{"request": "' + constant.REMOVE_EVENT + '","events":' + JSON.stringify(self.data.eventNames) + '}';
            setTimeout(function () {
              util.setRequest(constant.DEVICE_REQUEST, data, parentMac, 1, ip, true, self.hide);
            }, 1000);
          }
        }
      })

    } else {
      self.hide();
    }
  },
  hide: function() {
    wx.hideLoading();
    wx.navigateBack({
      delta: 1
    })
  },
  initData: function() {
    var data = JSON.stringify({ "request": constant.GET_EVENT}),
      macs = [this.data.device.mac];
    util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, this.data.device.ip, false, this.initEvent, "", true);
  },
  initEvent: function(res) {
    var executeMacs = [],
      deviceList = this.data.deviceList,
      selected = this.data.selected;
    if (res.status_code == 0 && !util._isEmpty(res.trigger)) {
      executeMacs = this.getEventMacs(res.trigger);
      console.log(executeMacs);
      this.setData({
        existEvent: true
      })
    };
    for (var i in deviceList) {
      var item = deviceList[i];
      if (executeMacs.indexOf(item.mac) != -1) {
        item.active = true;
        selected++;
        deviceList[i] = item;
      }
    }
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
  getDeviceList: function() {
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
    self.setData({
      device: JSON.parse(options.device),
    })
    wx.setNavigationBarTitle({
      title: self.data.device.name
    });
    util.showLoading("");
    self.getDeviceList();
    setTimeout(function(){
      self.initData();
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