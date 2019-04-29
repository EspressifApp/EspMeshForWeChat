// pages/problem/problem.js
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    problemType: "设备问题",
    problemDesc: "",
    problemEmail: ""
  },
  selectType: function(e) {
    this.setData({
      problemType: e.currentTarget.dataset.type
    })
  },
  bindViewText: function(e) {
    this.setData({
      problemDesc: e.detail.value
    })
  },
  bindViewEmail: function(e) {
    this.setData({
      problemEmail: e.detail.value
    })
  },
  sendProblem: function() {
    const self = this;
    if (util._isEmpty(self.data.problemDesc)) {
      util.showToast("请输入您的意见描述");
      return false;
    }
    util.showLoading("");
    wx.request({
      url: 'https://demo.iot.espressif.cn/feedback',
      method: "POST",
      data: {
        opinionType: self.data.problemType,
        opinionDesc: self.data.problemDesc,
        email: self.data.problemEmail
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
       
      }
    })
    setTimeout(function() {
      wx.hideLoading();
      wx.navigateBack({
        delta: 1
      })
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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