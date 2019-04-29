// pages/addGroup/addGroup.js
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
    searchList: [],
    isEdit: false,
    group: "",
    isDefault: false,
    selected: 0,
    groupName: "",
    searchName: ""
  },
  //搜索
  bindViewSearch: function (e) {
    this.setData({
      searchName: e.detail.value
    })
    this.getSearchList();
  },
  //处理设备列表
  getSearchList: function () {
    var searchList = [], list = this.data.deviceList,
      group = "", macs = [];
    if (this.data.isEdit) {
      group = this.data.group;
      macs = group.device_macs;
    }
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
    var count = 0;
    for (var i in searchList) {
      var item = searchList[i];
      if (macs.indexOf(item.mac) == -1) {
        item.isRadio = false;
      } else {
        item.isRadio = true;
        count++;
      }
      searchList.splice(i, 1, item);
    }
    console.log(searchList);
    this.setData({
      searchList: searchList,
      selected: count
    })
  },
  //选择所有
  selectAll: function () {
    var self = this,
      list = self.data.searchList,
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
        list[i].isRadio = flag;
      }
      self.setData({
        searchList: list,
        selected: selected
      })
    }
  },
  bindViewSelect: function (event) {
    var self = this,
      list = self.data.searchList,
      index = event.currentTarget.dataset.index,
      item = self.data.searchList[index];
    item.isRadio = !item.isRadio;
    if (item.isRadio) {
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
      searchList: list
    })
  },
  saveGroup: function() {
    var self = this, macs = [];
    if (self.data.isDefault) {
      return false;
    }
    if (self.data.searchList.length > 0) {
      for (var i in self.data.searchList) {
        var item = self.data.searchList[i];
        if (item.isRadio) {
          if (macs.indexOf(item.mac) == -1) {
            macs.push(item.mac);
          }
        }
      }
    }
    if (macs.length == 0) {
      util.showToast("请选择设备");
      return false;
    }
    var group = "";
    if (this.data.isEdit) {
      group = this.data.group;
      group.device_macs = macs;
    } else {
      group = {
        id: new Date().getTime(), name: this.data.groupName, is_user: false, is_mesh: false, device_macs: macs
      };
    }
    util.showLoading("");
    console.log(group);
    util.saveGroups([group]);
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
    var isEdit = options.flag,
      name = "";
    console.log(isEdit);
    if (isEdit === "true") {
      var group = JSON.parse(options.group);
      name = group.name;
      isEdit = true;
      this.setData({
        group: group,
        isDefault: group.is_user
      })
    } else {
      name = options.groupName;
      isEdit = false;
    }
    wx.setNavigationBarTitle({
      title: name
    });
    this.setData({
      groupName: name,
      isEdit: isEdit
    })
    var list = wx.getStorageSync(constant.DEVICE_LIST);
    if (!util._isEmpty(list) && list.length > 0) {
      this.setData({
        deviceList: list
      })
      this.getSearchList();
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