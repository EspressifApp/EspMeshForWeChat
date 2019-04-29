// pages/user/user.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wifiName: "",
    userInfo: { nickName: "游客", avatarUrl: "/images/default_avatar.png"},
    isAuthorization: true
  },
  initWifi: function() {
    const self = this;
    wx.startWifi();
    wx.getConnectedWifi({
      success: function (res) {
        self.setData({
          wifiName: res.wifi.SSID
        });
      },
      fail: function (res) {
        self.setData({
          wifiName: ""
        });
      }
    });
    wx.onWifiConnected(function (res) {
      self.setData({
        wifiInfo: res.wifi.SSID
      });
    })
  },
  showProblem: function() {
    if (this.data.isAuthorization) {
      wx.navigateTo({
        url: "/pages/problem/problem"
      })
    }
    
  },
  showAutimation: function() {
    wx.navigateTo({
      url: "/pages/automationDevices/automationDevices"
    })
  },
  showPosition: function() {
    wx.navigateTo({
      url: "/pages/positionList/positionList"
    })
  },
  showTopology: function () {
    wx.navigateTo({
      url: "/pages/topology/topology"
    })
  },
  bindGetUserInfo: function(e) {
    const self = this;
    if (e.detail.userInfo) {
      self.getUserInfo();
    } else {
      console.log("拒绝了");
    }
  },
  getUserInfo: function () {
    const self = this;
    wx.getUserInfo({
      success(res) {
        app.globalData.userInfo = res.userInfo;
        self.setData({
          userInfo: res.userInfo,
          isAuthorization: true,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    wx.setNavigationBarTitle({
      title: '我的'
    });
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          self.setData({
            isAuthorization: false,
          })
        } else {
          self.setData({
            isAuthorization: true,
            userInfo: app.globalData.userInfo
          })
        }
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
    util.closeBluetoothAdapter();
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