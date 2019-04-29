// pages/aboutDevice/aboutDevice.js
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: "",
    deviceType: "",
    deviceStatus: "内网",
    ip: ""
  },
  getType: function () {
    var tid = this.data.deviceInfo.tid,
      type = "", status = "";
    if (tid >= constant.MIN_LIGHT && tid <= constant.MAX_LIGHT) {
      type = "灯";
    } else if (tid >= constant.MIN_SWITCH && tid <= constant.MAX_SWITCH) {
      type = "开关";
    } else if (tid >= constant.MIN_SENSOR && tid <= constant.MAX_SENSOR) {
      type = "传感器";
    }
    this.setData({
      deviceType: type,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      deviceInfo: JSON.parse(options.deviceInfo),
      ip: app.data.ip
    })
    this.getType();
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