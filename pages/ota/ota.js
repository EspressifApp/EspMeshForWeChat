// pages/ota/ota.js
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
var timerId = "";
var progressTimerId = "";
var requestNum = 0;
var requestTask = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //binUrl: "https://raw.githubusercontent.com/zhanzhaocheng/test/master/1.1.2-rc.bin",
    binUrl: "",
    flag: false,
    binTime: "00:00:00",
    showProgress: false,
    progress: 0,
    fail: false,
    partialSuc: false,
    suc: false,
    macs: []
  },
  bindViewText: function(e) {
    console.log(e);
    this.setData({
      binUrl: e.detail.value
    })
  },
  bindViewUpgrade: function() {
    const self = this;
    self.assemblyData(self.setBinUrl);
  },
  setBinUrl: function(macs, num, ip) {
    const self = this;
    requestNum = 0;
    requestTask = wx.request({
      method: "POST",
      url: "http://" + ip + ":80" + constant.OTA_URL,
      header: {
        "Content-Length": 0,
        "content-type": "application/json", // 默认值
        "Mesh-Node-Mac": macs,
        "Firmware-Url": self.data.binUrl
      },
      success: function (res) {
        self.clearTimer(progressTimerId);
        self.getOtaProgress(macs, num, ip);
      },
      fail: function (res) {
        
      }
    })
    self.setData({
      showProgress: true
    })
    self.timer();
    self.setProgress(macs, num, ip, 70000);
  },
  setProgress: function (macs, num, ip, time) {
    const self = this;
    self.clearTimer(progressTimerId);
    progressTimerId = setTimeout(function () {
      self.getOtaProgress(macs, num, ip);
    }, time);
  },
  getOtaProgress: function(macs, num, ip) {
    const self = this;
    var data = JSON.stringify({ "request": constant.GET_OTA_PROGRESS });
    wx.request({
      method: "POST",
      url: "http://" + ip + ":80" + constant.DEVICE_REQUEST,
      data: data,
      header: {
        "Content-Length": data.length,
        "content-type": "application/json", // 默认值
        "Mesh-Node-Mac": macs,
        "Mesh-Node-Num": num,
      },
      success: function (res) {
        console.log(res);
        var data = res.data;
        var progress = 0;
        if (num == 1) {
          progress = data.written_size / data.total_size / 2 * 100;
        } else {
          data = data.split("Content-Type: application/json");
          data.splice(0, 1);
          var totalSize = 0, writtenSize = 0;
          for (var i in data) {
            var obj = util.analysis(data[i]);
            totalSize += obj.total_size;
            writtenSize += obj.written_size;
          }
          progress = writtenSize / totalSize / 2 * 100;
        }
        if (progress < 50) {
          self.setData({
            progress: progress + 50
          })
          setTimeout(function () {
            self.getOtaProgress(macs, num, ip)
          }, 5000)
        } else {
          self.clearTimer(timerId);
          self.setData({
            fail: false,
            partialSuc: false,
            progress: 100,
            suc: true
          })
        }
      },
      fail: function (res) {
        if (requestNum < 3) {
          requestNum++;
          self.setProgress(macs, num, ip, 10000);
        } else {
          self.setData({
            fail: true,
            partialSuc: false,
            suc: false
          })
        }
      }
    });
    
  },
  reboot: function() {
    const self = this;
    self.hideProgrees();
    self.assemblyData(self.sendReboot);
    wx.navigateBack({
      delta: 1
    })
  },
  sendReboot: function(macs, num, ip) {
    var data = JSON.stringify({ "request": constant.REBOOT_DEVICE, "delay": 3000 });
    setTimeout(function () {
      util.setRequest(constant.DEVICE_REQUEST, data, macs, num, ip, false);
      });
  },
  stop: function () {
    const self = this;
    requestTask.abort();
    self.assemblyData(self.stopBin);
    self.hideProgrees();
  },
  stopBin: function(macs, num, ip) {
    wx.request({
      method: "POST",
      url: "http://" + ip + ":80" + constant.OTA_STOP,
      header: {
        "Content-Length": 0,
        "content-type": "application/json", // 默认值
        "Mesh-Node-Mac": macs,
        "Mesh-Node-Num": num,
      },
      success: function (res) {
      },
      fail: function (res) {
      }
    });
  },
  assemblyData: function (fun) {
    const self = this;
    var deviceList = wx.getStorageSync(constant.DEVICE_LIST),
      macs = self.data.macs;
    if (self.data.flag) {
      var obj = {}, ips = [];
      for (var i in deviceList) {
        var item = deviceList[i],
          mac = item.mac;
        if (macs.indexOf(mac) != -1) {
          var ip = item.ip;
          if (ips.indexOf(ip) == -1) {
            ips.push(ip);
            obj['"' + ip + '"'] = [mac];
          } else {
            obj['"' + ip + '"'].push(mac);
          }
        }
      }
      for (var i in ips) {
        var ip = ips[i],
          objMacs = obj['"' + ip + '"'];
        fun(objMacs.join(), objMacs.length, ip);
      }
    } else {
      var ip = "";
      for (var i in deviceList) {
        var item = deviceList[i];
        if (macs.indexOf(item.mac) != -1) {
          ip = item.ip;
          fun(macs.join(), macs.length, ip);
          break;
        }
      }
    }
  },
  timer: function() {
    var self = this;
    var time = 0,
      binTime = "";
    timerId = setInterval(function () {
      time++;
      if (self.data.progress < 46) {
        if (time % 2 == 0) {
          self.data.progress += 1;
          self.setData({
            progress: self.data.progress
          })
        }
      }
      if (time < 60) {
        binTime = "00:00:" + self.getSecond(time);
      } else if (time < 3600) {
        var m = (time / 60).toFixed(0);
        var s = time % 60;
        binTime = "00:" + self.getMinute(m) + ":" + self.getSecond(s);
      } else {
        var h = (time / 3600).toFixed(0);
        var m = (time % 3600 / 60).toFixed(0);
        var s = (time % 60);
        binTime = self.getHour(h) + ":" + self.getMinute(m) + ":" + self.getSecond(s);
      }
      self.setData({
        binTime: binTime
      })
    }, 1000)
  },
  clearTimer: function(id) {
    if (!util._isEmpty(id)) {
      clearInterval(id);
      id = "";
    }
  },
  getSecond: function (time) {
    var second = 0;
    if (time < 10) {
      second = "0" + time;
    } else if (time < 60) {
      second = time;
    }
    return second;
  },
  getMinute: function (time) {
    var minute = 0;
    if (time < 10) {
      minute = "0" + time;
    } else if (time < 60) {
      minute = time;
    }
    return minute;
  },
  getHour: function (time) {
    var hour = 0;
    if (time < 10) {
      hour = "0" + time;
    } else {
      hour = time;
    }
    return hour;
  },
  hideProgrees: function() {
    this.clearTimer(timerId);
    this.setData({
      fail: false,
      partialSuc: false,
      suc: false,
      showProgress: false,
      binTime: "00:00:00",
      progress: 0,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var macs = options.macs,
      flag = options.flag;
    if (flag == 'true') {
      flag = true;
    } else {
      flag = false;
    }
    if (!util._isEmpty(macs)) {
      this.setData({
        macs: JSON.parse(macs),
        flag: flag,
        binTime: "00:00:00"
      })
    }
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
    this.clearTimer(timerId);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.clearTimer(timerId);
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