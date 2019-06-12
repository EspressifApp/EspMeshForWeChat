// pages/blueWifi/blueWifi.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wifiInfo: "",
    macs: [],
    ssid: "",
    bssid: "",
    uuid: "",
    macRssi: "",
    password: "",
  },
  initWifi: function() {
    var self = this;
    self.setData({
      password: ""
    })
    wx.startWifi();
    wx.getConnectedWifi({
      success: function(res) {
        if(res.wifi.SSID.indexOf("5G") != -1) {
          self.wifiPrompt();
        }
        self.setData({
          wifiInfo: res.wifi         
        });
        console.log("get");
        self.getStorage();
      },
      fail: function(res) {
        console.log(res);
        self.setData({
          wifiInfo: {SSID: "null"}
        })
      }
    });
    wx.onWifiConnected(function(res) {
      self.setData({
        password: ""
      })
      if (res.wifi.SSID == "") {
        self.setData({
          wifiInfo: {SSID: "null"}
        })
      } else {
        if (res.wifi.SSID.indexOf("5G") != -1) {
          self.wifiPrompt();
        }
        self.setData({
          wifiInfo: res.wifi
        });
        console.log("on");
        self.getStorage();
      }
      
    })
  },
  getStorage: function() {
    var self = this;
    var data = wx.getStorageSync('WIFIINFO');
    if (!util._isEmpty(data)) {
      for (var i in data) {
        console.log(self.data.wifiInfo.SSID);
        if (data[i].name == self.data.wifiInfo.SSID) {
          self.setData({
            password: data[i].password
          })
          return false;
        }
      }
    }
  },
  wifiPrompt: function() {
    wx.showToast({
      title: '当前为5G网络',
      icon: 'none',
      duration: 3000
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  bindViewConnect: function() {
    var self = this;
    if (self.data.wifiInfo) {
      wx.navigateTo({
        url: '/pages/blueConnect/blueConnect?macs=' + self.data.macs + "&ssid=" + self.data.wifiInfo.SSID + "&password=" + self.data.password + "&meshId=" + self.data.wifiInfo.BSSID + "&macRssi=" + self.data.macRssi,
      })
    } else {
      wx.showToast({
        title: '请链接网络',
        icon: 'none',
        duration: 3000
      })
    }
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    wx.setNavigationBarTitle({
      title: "确认WiFi"
    });
    self.setData({
      macs: options.macs.split(","),
      macRssi: options.macRssi
    })
    console.log(self.data.macs)
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
      }
    })
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
    this.initWifi();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.stopWifi();
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