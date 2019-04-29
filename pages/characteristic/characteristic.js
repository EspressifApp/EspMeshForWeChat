const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    device: "",
    attrList: []
  },
  bindViewChange: function(e) {
    var index = e.currentTarget.dataset.index;
    this.changeCharacters(index, parseInt(e.detail.value), true);
  },
  bindViewInput: function (e) {
    var index = e.currentTarget.dataset.index;
    this.changeCharacters(index, parseInt(e.detail.value), false);
  },
  send: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setCharacters(this.data.attrList[index]);
  },
  reset: function() {
    this.getAttrList();
  },
  changeCharacters: function (index, value, flag) {
    var attrList = this.data.attrList,
      item = attrList[index];
    item.value = value;
    attrList.splice(index, 1, item);
    this.setData({
      attrList: attrList
    });
    if (flag) {
      this.setCharacters(item);
    }
  },
  setCharacters: function (item) {
    var device = this.data.device,
      data = JSON.stringify({ "request": constant.SET_STATUS, "characteristics": [{ "cid": item.cid, "value": item.value }] });
    device.characteristics = this.data.attrList;
    var macs = [this.data.device.mac];
    util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, this.data.device.ip, true);
    this.setData({
      device: device
    })
  },
  getAttrList: function () {
    const self = this;
    var characteristics = self.data.device.characteristics,
      attrList = [];
    console.log(characteristics);
    for (var i in characteristics) {
      var item = characteristics[i],
        perms = item.perms
      if (self.isReadable(perms) || self.isWritable(perms)) {
        if (self.isShowInput(perms)) {
          item.isShow = true;
        } else {
          item.isShow = false;
        }
        attrList.push(item);
      }
    }
    console.log(attrList);
    self.setData({
      attrList: attrList
    })
  },
  isShowInput: function (perms) {
    var self = this, flag = true;
    if (self.isReadable(perms) && !self.isWritable(perms)) {
      flag = false;
    }
    return flag;
  },
  isReadable: function (perms) {
    return (perms & 1) == 1;
  },
  isWritable: function (perms) {
    return ((perms >> 1) & 1) == 1;
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
    this.getAttrList();
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