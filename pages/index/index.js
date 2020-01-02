//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');

var scanTimeId = "";
Page({
  data: {
    macs: "",
    num: 0,
    isSelect: false,
    isOperate: true,
    isRefresh: false,
    isLoading: true,
    deviceInfo: "",
    displacement: 0,
    deviceList: [],
    searchList: [],
    blueList: [],
    rssiValue: -100,
    deviceIndex: "",
    hiddenModal: true,
    showAddDevice: false,
    isGuide: false,
    isCommand: false,
    deviceName: "",
    searchName: "",
    showSelect: true,
    isBlueFail: false,
    isShowBlueFail: false,
    isWifiFail: false,
    isShowWifiFail: false,
    modelData: {
      title: "编辑设备名称",
      text: "输入新的设备名称",
      name: ""
    },
    guideData: {
      list: constant.GUIDE,
      title: "各类设备添加操作指南",
      isGuideContent: false,
      guide: constant.GUIDE[0]
    },
    commandData: {
      requestList: [{ key: "request", value: null }],
      commandList: [],
      textareaJson: '{"request": null}',
      isLoad: false,
      selected: 1,
      resultText: []
    }
  },
  showBlueFail: function() {
    this.setData({
      isShowBlueFail: true
    })
  },
  showWifiFail: function () {
    this.setData({
      isShowWifiFail: true
    })
  },
  //搜索
  bindViewSearch: function(e) {
    this.setData({
      searchName: e.detail.value
    })
    this.getSearchList();
  },
  //关灯
  closeDevice: function (event) {
    const self = this,
      index = event.currentTarget.dataset.index;
      self.setSatus(0, 0, index);
  },
  //开灯
  openDevice: function (event) {
    const self = this,
      index = event.currentTarget.dataset.index;
    self.setSatus(1, 1, index);
  },
  //修改名称时，监控名字变化
  editInfoName: function (event) {
    this.setData({
      deviceName: event.detail.value
    })
  },
  //修改设备时弹框
  editName: function() {
    var name = this.data.deviceInfo.name;
    this.setData({
      isOperate: true,
      hiddenModal: false,
      deviceName: name,
      ["modelData.name"]: name
    });
  },
  
  //修改名称
  saveName: function (event) {
    const self = this;
    var deviceInfo = self.data.deviceInfo,
      list = self.data.deviceList,
      name = self.data.deviceName,
      data = JSON.stringify({ "request": constant.RENAME_DEVICE, "name": name});
    deviceInfo.name = name;
    list = self.changeList(list, deviceInfo);
    var macs = [deviceInfo.mac];
    util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, deviceInfo.ip, false);
    self.setData({
      deviceList: list
    });
    self.getSearchList();
    util.setStorage(constant.DEVICE_LIST, list);
    self.hideOperate();
  },
  //重置设备
  delDevice: function() {
    const self = this;
    self.setData({
      isOperate: true,
      hiddenModal: true,
    })
    wx.showModal({
      title: '重置设备',
      confirmColor: "#3ec2fc",
      content: '确定要重置设备吗?若重置设备该设备将进入配网状态。',
      success(res) {
        if (res.confirm) {
          util.showLoading("");
          var deviceInfo = self.data.deviceInfo,
            data = JSON.stringify({ "request": constant.RESET_DEVICE, "delay": constant.DELAY_TIME });
          var macs = [deviceInfo.mac];
          setTimeout(function() {
            util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, deviceInfo.ip, false,self.delSuc, "重置失败");
          }, 800);
        }
      }
    })
  },
  //设备重置成功结果处理
  delSuc: function(res) {
    const self = this;
    var list = self.data.deviceList,
      deviceInfo = self.data.deviceInfo;
    list = self.delList(list, deviceInfo);
    console.log(list);
    self.setData({
      deviceList: list
    });
    util.setStorage(constant.DEVICE_LIST, list);
    self.getSearchList();
    if (list.length == 0) {
      self.setData({
        showAddDevice: true
      });
    }
    if (deviceInfo.mac == deviceInfo.rootMac && list.length > 0) {
      util.showToast('根节点被重置，设备重新组网!');
      setTimeout(function() {
        wx.hideLoading();
        self.setData({
          deviceList: [],
          searchList: [],
          isLoading: true
        });
        util.showLoading("设备组网中...");
        setTimeout(function() {
          self.clearScanTime();
          scanTimeId = setTimeout(function () {
            util.getBluDevice(self, false);
          }, 1000);
          util.getDeviceByMdns(self);
          util.getDeviceByUdp(self);
        }, 20000)
      }, 2000)
    } else {
      wx.hideLoading();
      self.hideScan();
    }
  },
  showVideo: function() {
    wx.navigateTo({
      url: '/pages/video/video'
    })
  },
  showCommand: function() {
    util.showCommand(this);
  },
  showLoadCommand: function() {
    util.showLoadCommand(this);
  },
  addCommand: function() {
    util.addCommand(this)
  },
  delCommand: function(e) {
    util.delCommand(e, this)
  },
  bindViewKey: function(e) {
    util.changeKey(e, this)
  },
  bindViewValue: function (e) {
    util.changeValue(e, this)
  },
  commandCancel: function() {
    util.commandCancel(this);
  },
  selectResponse: function(e) {
    util.selectResponse(e, this);
  },
  selectCommand: function(e) {
    util.selectCommand(e, this);
  },
  sendCommand: function() {
    var device = this.data.deviceInfo;
    util.sendCommand(this, device.ip, [device.mac]);
  },
  sendSuc: function(res) {
    this.setData({
      ["commandData.resultText"]: [JSON.stringify(res)]
    })
  },
  showGuide: function() {
    this.setData({
      isGuide: true,
      ["guideData.isGuideContent"]: false
    })
  },
  showGuideContent: function(e) {
    var index = e.currentTarget.dataset.index,
      guide = this.data.guideData.list[index];
    this.setData({
      ["guideData.isGuideContent"]: true,
      ["guideData.guide"]: guide,
      ["guideData.title"]: guide.name,
    })
  },
  hideGuideContent: function () {
    this.setData({
      ["guideData.isGuideContent"]: false,
      ["guideData.title"]: "各类设备添加操作指南",
    })
  },
  hideGuide: function() {
    this.setData({
      isGuide: false
    })
  },
  addDevice: function () {
    this.hideScan();
    this.hideGuide();
    wx.navigateTo({
      url: '/pages/blueDevices/blueDevices?flag=false'
    })
  },

  //关于设备，跳转到设备详情
  aboutDevice: function() {
    this.hide();
    wx.navigateTo({
      url: '/pages/aboutDevice/aboutDevice?deviceInfo=' + JSON.stringify(this.data.deviceInfo)
    })
  },
  //自动化
  automation: function() {
    const self = this;
    self.hide();
    setTimeout(function () {
      var tid = self.data.deviceInfo.tid;
      if (tid == constant.BUTTON_SWITCH) {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/automationBtnSelect/automationBtnSelect?device=' + JSON.stringify(self.data.deviceInfo)
          })
        }, 100)
        //util.showToast("暂不支持该设备关联");
      } else {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/automation/automation?device=' + JSON.stringify(self.data.deviceInfo)
          })
        }, 100)

      }
    })
  },
  showOTA: function () {
    const self = this;
    self.hide();
    wx.navigateTo({
      url: '/pages/ota/ota?macs=' + JSON.stringify([self.data.deviceInfo.mac]) + '&flag=false'
    })
  },
  showPosition: function() {
    const self = this;
    self.hide();
    wx.navigateTo({
      url: '/pages/setPosition/setPosition?device=' + JSON.stringify(self.data.deviceInfo) + "&position=''" + "&flag=true"
    })
  },
  changeList: function (list, deviceInfo) {
    for (var i in list) {
      var item = list[i];
      if (item.mac == deviceInfo.mac) {
        list.splice(i, 1, deviceInfo);
        break;
      }
    }
    return list;
  },
  delList: function (list, deviceInfo) {
    for (var i in list) {
      var item = list[i];
      if (item.mac == deviceInfo.mac) {
        list.splice(i, 1);
        break;
      }
    }
    return list;
  },
  //
  setSatus: function (deviceStatus, status, index) {
    const self = this;
    var list = self.data.searchList,
      device = list[index];
    device = util.setStatus( device, deviceStatus, status, index);
    list.splice(index, 1, device);
    self.setData({
      deviceList: list,
      deviceInfo: device
    })
    self.getSearchList();
    util.setStorage(constant.DEVICE_LIST, list);
  },
  //设备控制
  showInfo: function (event) {
    var self = this,
      index = event.currentTarget.dataset.index,
      deviceInfo = self.data.searchList[index];
    self.clearScanTime();
    util.closeBluetoothAdapter();
    
    self.setData({
      deviceInfo: deviceInfo,
      deviceIndex: index
    })
    var tid = deviceInfo.tid;
    if (tid >= constant.MIN_LIGHT && tid <= constant.MAX_LIGHT) {
      wx.navigateTo({
        url: '/pages/operateDevice1/operateDevice1?flag=false',
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptData', {
            data: self.data.deviceInfo })
        }
      })
    } else if(tid != constant.BUTTON_SWITCH) {
      wx.navigateTo({
        url: '/pages/characteristic/characteristic?device=' + JSON.stringify(self.data.deviceInfo)
      })
    }
    
  },
  //显示设备操作列表
  showOperate: function (e) {
    var self = this,
      index = e.currentTarget.dataset.index,
      deviceInfo = self.data.searchList[index];
    self.clearScanTime();
    util.closeBluetoothAdapter();
    self.setData({
      isOperate: false,
      deviceInfo: deviceInfo,
      deviceIndex: index
    })
    
  },
  //隐藏操作列表
  hideOperate: function() {
    this.setData({
      isOperate: true,
      hiddenModal: true,
    })
    this.hideScan();
  },
  hide: function() {
    this.setData({
      isOperate: true,
      hiddenModal: true,
      isShowBlueFail: false,
      isShowWifiFail: false
    })
  },
  //分享
  onShareAppMessage: function (res) {
    return {
      title: 'ESPMesh',
      path: '/pages/index/index'
    }
  },
  //处理设备列表
  getSearchList: function() {
    var searchList = [], list = this.data.deviceList;
    if (!util._isEmpty(this.data.searchName)) {
      for (var i in list) {
        var item = list[i];
        if (item.name.indexOf(this.data.searchName) != -1 || item.position.indexOf(this.data.searchName) != -1) {
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
  setGroup: function () {
    var self = this, tidList = [], meshList = [], meshMacs = [], macs = [], name = "", list = [],
      oldGroups = wx.getStorageSync(constant.GROUP_TABLE);
    for (var i in oldGroups) {
      var item = oldGroups[i];
      if (item.is_mesh) {
        item.device_macs = [];
        util.saveGroups([item]);
      }
    }
    var deviceList = self.data.deviceList;
    for (var i in deviceList) {
      macs = [];
      var item = deviceList[i];
      if (tidList.indexOf(item.tid) == -1 && !util._isEmpty(item.tid)) {
        tidList.push(item.tid);
        name = util.setName(item.tid);
        for (var j in deviceList) {
          var itemSub = deviceList[j];
          if (item.tid == itemSub.tid) {
            macs.push(itemSub.mac);
          }
        }
        list.push({
          id: item.tid, name: util.getGroupName(oldGroups, item.tid, name),
          is_user: true, is_mesh: false, device_macs: macs
        });
      }
      if (item.mesh_id) {
        if (meshList.indexOf(item.mesh_id) == -1) {
          meshList.push(item.mesh_id);
        }

      }
    }
    if (meshList.length > 1) {
      for (var i in meshList) {
        var item = meshList[i];
        meshMacs = [];
        for (var j in deviceList) {
          var itemSub = deviceList[j];
          if (item == itemSub.mesh_id) {
            meshMacs.push(itemSub.mac);
          }
        }
        var id = parseInt(item, 16),
          name = "mesh_id(" + item + ")";
        list.push({
          id: id, name: util.getGroupName(oldGroups, id, name),
          is_user: true, is_mesh: true, device_macs: meshMacs
        })
      }
    } else {
      self.showScanDevice = true;
    }
    console.log(list);
    util.saveGroups(list);
  },
  setPositions: function() {
    var self = this, position = "", 
      deviceList = self.data.deviceList,
      positions = wx.getStorageSync(constant.POSITION_LIST);
    for (var i = 0; i < deviceList.length; i++) {
      var item = deviceList[i];
      if (!util._isEmpty(item.position)) {
        position = item.position.split("-");
        util.savePosition({"mac": item.mac, "code": position[2],"floor": position[0], "area": position[1]
        });
      } else {
        for(var j = 0; j < positions.length; j++) {
          var itemSub = positions[j];
          if (itemSub.mac == item.mac) {
            item.position = itemSub.floor + "-" + itemSub.area + "-" + itemSub.code;
            deviceList.splice(i, 1, item);
            var data = JSON.stringify({ "request": constant.SET_POSITION, "position": item.position });
            var macs = [item.mac];
            util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, item.ip, true);
            break;
          }
        };
      }
    };
    self.setData({
      deviceList: util.uniqeByKeys(deviceList, ["mac"])
    })
    self.getSearchList();
    util.setStorage(constant.DEVICE_LIST, deviceList);
  },
  hideScan: function() {
    const self = this;
    self.setData({
      blueList: []
    })
    util.stopBluetoothDevicesDiscovery();
    self.clearScanTime();
    scanTimeId = setTimeout(function() {
      util.getBluDevice(self, false);
    }, 10000);
  },
  clearScanTime: function() {
    if (!util._isEmpty(scanTimeId)) {
      clearTimeout(scanTimeId);
      scanTimeId = "";
    }
  },
  selectMesh: function () {
    const self = this;
    var macs = [],
      deviceList = self.data.deviceList
    if (deviceList.length > 0) {
      var ip = "";
      for (var i in deviceList) {
        var item = deviceList[i];
        ip = item.ip;
        macs.push(item.mac);
      }
      wx.navigateTo({
        url: '/pages/blueDevices/blueDevices?flag=true&macs=' + JSON.stringify(macs) + '&ip=' + ip
      })
      self.hideScan();
    }
  },
  joinMesh: function() {
    const self = this;
    var blueMacs = [],
      macs = [];
    for (var i in self.data.blueList) {
      var mac = self.data.blueList[i].bssid;
      if (blueMacs.indexOf(mac) == -1) {
        blueMacs.push(mac);
      }
    }
    var ip = "";
    for(var i in self.data.deviceList) {
      var item = self.data.deviceList[i];
      ip = item.ip;
      macs.push(item.mac);
    }
    util.showLoading("");
    var data = JSON.stringify({"request": constant.ADD_DEVICE,"whitelist": blueMacs});
    util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, ip, true, null, null, true);
    this.hideScan();
  },
  onLoad: function () {
    util.openBluetoothAdapter(this);
    util.onNetworkStatusChange(this)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const self = this;
    wx.setNavigationBarTitle({
      title: "设备"
    });
    if (app.data.isInit == 1) {
      util.showLoading("设备加载中...");
      util.onTimeout(self, 0, "未加载到设备！", true);
      self.setData({
        isLoading: true
      })
      util.getDeviceByMdns(self);
      // util.getDeviceByUdp(self);
      app.data.isInit = 2;
    } else if (app.data.isInit == 2){
      var list = wx.getStorageSync(constant.DEVICE_LIST);
      var showAddDevice = false;
      self.setData({
        isLoading: false
      })
      if (util._isEmpty(list) || list.length == 0) {
        list = [];
        showAddDevice = true;
      }
      self.setData({
        deviceList: util.uniqeByKeys(list, ["mac"]),
        showAddDevice: showAddDevice
      })
      self.getSearchList();
    } else if(app.data.isInit == 3) {
      util.showLoading("设备组网中...");
      self.setData({
        isLoading: true
      })
      setTimeout(function(){
        util.getDeviceByMdns(self);
        // util.getDeviceByUdp(self);
      }, 5000)
      app.data.isInit = 2;
    }
    self.clearScanTime();
    scanTimeId = setTimeout(function () {
      util.getBluDevice(self, false);
      util.onBluetoothAdapterStateChange(self)
    }, 1000);
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    util.stopBluetoothDevicesDiscovery();
    this.setData({
      blueList: []
    })
    this.clearScanTime();
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    util.closeBluetoothAdapter();
    this.setData({
      blueList: []
    })
    this.clearScanTime();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const self = this;
    util.stopBluetoothDevicesDiscovery();
    self.clearScanTime();
    wx.stopPullDownRefresh();
    self.setData({
      isRefresh: true,
      deviceList: [],
      searchList: [],
      blueList: [],
      isLoading: true
    })
    util.showLoading("设备加载中...");
    util.onTimeout(self, 0, "未加载到设备！", true);
    util.getDeviceByMdns(self);
    // util.getDeviceByUdp(self);
    scanTimeId = setTimeout(function () {
      util.getBluDevice(self, false);
    }, 1000);
  },
})
