//automationDevices.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({
  data: {
    searchName: "",
    deviceList: [],
    searchList: [],
  },
  //搜索
  bindViewSearch: function (e) {
    this.setData({
      searchName: e.detail.value
    })
    this.getSearchList();
  },
  //自动化
  automation: function (e) {
    const self = this;
    var index = e.currentTarget.dataset.index,
      deviceInfo = self.data.searchList[index];
    setTimeout(function () {
      var tid = deviceInfo.tid;
      if (tid == constant.BUTTON_SWITCH) {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/automationBtnSelect/automationBtnSelect?device=' + JSON.stringify(deviceInfo)
          })
        }, 100)
      } else {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/automation/automation?device=' + JSON.stringify(deviceInfo)
          })
        }, 100)

      }
    })
  },
  //处理设备列表
  getSearchList: function () {
    var searchList = [], list = this.data.deviceList;
    if (!util._isEmpty(this.data.searchName)) {
      for (var i in list) {
        var item = list[i];
        if (item.name.indexOf(this.data.searchName) != -1) {
          searchList.push(item);
        }
      }
    } else {
      searchList = list;
    }
    searchList = util.sortList(searchList);
    this.setData({
      searchList: searchList
    })
  },
  onLoad: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const self = this;
    var list = wx.getStorageSync(constant.DEVICE_LIST);
    var showAddDevice = false;
    if (util._isEmpty(list) || list.length == 0) {
      list = [];
    }
    self.setData({
      deviceList: list,
    })
    self.getSearchList();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
   
  }
})
