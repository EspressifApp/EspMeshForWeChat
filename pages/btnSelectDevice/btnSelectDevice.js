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
    selected: 0,
    cid: "",
    btnValues: constant.BUTTON_DEVICES,
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
    if (macs.length > 0) {
      setTimeout(function () {
        var pages = getCurrentPages(),
          prevPage = pages[pages.length - 2],
          cid = self.data.cid,
          btnValues = self.data.btnValues;
        console.log(macs);
        console.log(cid);
        if (cid == btnValues.upleft) {
          prevPage.setData({
            deviceA: macs,
          })
        } else if (cid == btnValues.upright) {
          prevPage.setData({
            deviceB: macs,
          })
        } else if (cid == btnValues.downleft) {
          prevPage.setData({
            deviceC: macs,
          })
        } else if (cid == btnValues.downright) {
          prevPage.setData({
            deviceD: macs,
          })
        }
        wx.navigateBack({
          delta: 1,
        })
      }, 100)
    } else {
      util.showToast("请选择设备");
    }
  },
  getDeviceList: function () {
    var list = wx.getStorageSync(constant.DEVICE_LIST),
      deviceList = [],
      selected = 0,
      macs = this.data.macs;
    for (var i in list) {
      var item = list[i];
      if (item.tid >= constant.MIN_LIGHT && item.tid <= constant.MAX_LIGHT) {
        if (macs.indexOf(item.mac) != -1) {
          item.active = true;
          selected++;
        } else {
          item.active = false;
        }
        deviceList.push(item);
      }
    }
    deviceList = util.sortList(deviceList);
    this.setData({
      deviceList: deviceList,
      selected: selected
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    console.log("ads");
    console.log(options);
    self.setData({
      macs: JSON.parse(options.macs),
      cid: parseInt(options.cid)
    })
    wx.setNavigationBarTitle({
      title: "选择设备"
    });
    self.getDeviceList();
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
})