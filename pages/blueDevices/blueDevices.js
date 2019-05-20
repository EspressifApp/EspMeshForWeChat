
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
var timerId = "";
Page({
  data: {
    blueList: [],
    searchList: [],
    searchName: "",
    selected: 0,
    saveScanList: [],
    isProblem: false,
    isMesh: false,
    macs: [],
    ip: "",
    rssiValue: -80,
    isfilter: false,
    isSave: false,
    btnTitle: "下一步"
  },
  //显示过滤条件
  showFilter: function() {
    this.setData({
      isfilter: !this.data.isfilter
    })
  },
  //只显示收藏
  showSave: function() {
    this.setData({
      isSave: !this.data.isSave
    })
    if (this.data.isSave) {
      this.getSearchList();
    } else {
      util.getBluetoothDevices(this);
    }
  },
  sliderChanging: function (e) {
    this.setData({
      rssiValue: e.detail.value
    })
  },
  //滑动条变化
  sliderChange: function(e) {
    this.setData({
      rssiValue: e.detail.value
    })
    app.data.rssi = e.detail.value;
    this.getSearchList();
  },
  showProblem: function() {
    this.setData({
      isProblem: true,
    })
  },
  hideProblem: function() {
    this.setData({
      isProblem: false,
    })
  },
  //选择所有
  selectAll: function() {
    var self = this,
      blueList = self.data.blueList,
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
        var item = list[i];
        item.active = flag;
        for (var j in blueList) {
          var blueItem = blueList[j];
          if (blueItem.mac == item.mac) {
            blueList.splice(j, 1, item);
            break;
          }
        }
      }
      self.setData({
        blueList: blueList,
        searchList: list,
        selected: selected
      })
      self.setTitle();
    }
  },
  //收藏
  saveMac: function (event) {
    var mac = event.currentTarget.dataset.mac,
      list = this.data.saveScanList,
      index = list.indexOf(mac);
    this.getSaveScanMac();
    if (index == -1) {
      list.push(mac);
    } else {
      list.splice(index, 1);
    }
    this.setData({
      saveScanList: list
    })
    this.setSaveScanMac();
    util.getBluetoothDevices(this);
  },
  //搜索
  bindViewSearch: function (e) {
    this.setData({
      searchName: e.detail.value
    })
    this.getSearchList();
  },
  bindViewSelect: function (event) {
    var self = this,
      list = self.data.searchList,
      blueList = self.data.blueList,
      index = event.currentTarget.dataset.index,
      item = list[index];
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
    for (var i in blueList) {
      var blueItem = blueList[i];
      if (blueItem.mac == item.mac) {
        blueList.splice(i, 1, item);
        break;
      }
    }
    self.setData({
      blueList: blueList
    })
    this.getSearchList();
  },
  bindViewConnect: function () {
    var self = this, whitelist = [], conMacs = [];
    if (self.data.searchList.length > 0) {
      for (var i in self.data.searchList) {
        var item = self.data.searchList[i];
        if (item.active) {
          if (conMacs.indexOf(item.mac) == -1) {
            conMacs.push(item.mac);
            whitelist.push(item.bssid);
          }
        }
      }
      if (self.data.isMesh) {
        util.showLoading("");
        var macs = self.data.macs,
          data = '{"request": "' + constant.ADD_DEVICE + '","' + 'whitelist": ' + JSON.stringify(whitelist) + '}';
        util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, self.data.ip, true, self.joinSuc);
      } else {
        wx.navigateTo({
          url: '/pages/blueWifi/blueWifi?macs=' + conMacs,
        })
      }
    }
    
    
  },
  joinSuc: function() {
    wx.hideLoading();
    wx.navigateBack({
      delta: 1
    })
  },
  setSelected: function() {
    var self = this,
      selected = 0;
    for (var i in self.data.searchList) {
      var item = self.data.searchList[i];
      if (item.active) {
        selected ++;
      }
    }
    self.setData({
      selected: selected
    })
    self.setTitle();
  },
  setTitle: function() {
    var self = this;
    wx.setNavigationBarTitle({
      title: "扫描设备(" + self.data.selected + "/" + self.data.searchList.length + ")"
    });
  },
  getSaveScanMac: function() {
    const self = this;
    var list = wx.getStorageSync(constant.SAVE_SCAN_MAC);
    if (!util._isEmpty(list)) {
      self.setData({
        saveScanList: list
      })
    } else {
      self.setData({
        saveScanList: []
      })
    }
  },
  setSaveScanMac: function() {
    const self = this;
    util.setStorage(constant.SAVE_SCAN_MAC, self.data.saveScanList);
  },
  //处理设备列表
  getSearchList: function () {
    var self = this, searchList = [], list = self.data.blueList;
    if (!util._isEmpty(self.data.searchName) && self.data.isSave) {
      for (var i in list) {
        var item = list[i];
        if (item.RSSI >= self.data.rssiValue && item.name.indexOf(self.data.searchName) != -1 && item.isSave) {
          searchList.push(item);
        }
      }
    } else if (util._isEmpty(self.data.searchName) && self.data.isSave) {
      for (var i in list) {
        var item = list[i];
        if (item.RSSI >= self.data.rssiValue && item.isSave) {
          searchList.push(item);
        }
      }
    } else if (!util._isEmpty(self.data.searchName) && !self.data.isSave) {
      for (var i in list) {
        var item = list[i];
        if (item.RSSI >= self.data.rssiValue && item.name.indexOf(self.data.searchName) != -1) {
          searchList.push(item);
        }
      }
    } else {
      for (var i in list) {
        var item = list[i];
        if (item.RSSI >= self.data.rssiValue) {
          searchList.push(item);
        }
      }
    }
    this.setData({
      searchList: searchList
    })
    this.setSelected();
  },
  clearTimer: function() {
    if (!util._isEmpty(timerId)) {
      console.log(timerId);
      clearInterval(timerId);
      timerId = "";
    }
  },
  onLoad: function (options) {
    var self = this;
    self.setTitle();
    util.showLoading('设备扫描中...');
    var isMesh = options.flag,
      macs = [], btnTitle = "下一步", ip = "";
    if (isMesh == "true") {
      isMesh = true;
      btnTitle = "加入网络";
      ip = options.ip;
      macs = JSON.parse(options.macs);
    } else {
      isMesh = false;
    }
    self.setData({
      blueList: [],
      isMesh: isMesh,
      macs: macs,
      ip: ip,
      rssiValue: app.data.rssi,
      btnTitle: btnTitle,
     
    })
    setTimeout(function() {
      wx.hideLoading();
    }, 30000)
    util.getBluDevice(self, true);
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
    const self = this;
    self.clearTimer();
    timerId = setInterval(function () {
      util.getBluetoothDevices(self);
    }, 2000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.clearTimer();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.clearTimer();
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

})
