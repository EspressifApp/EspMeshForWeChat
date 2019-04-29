// pages/group/group.js
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupList: [],
    searchList: [],
    groupInfo: "",
    groupIndex: "",
    searchName: "",
    isAddGroup: true,
    isOperate: true,
    isEditGroup: true,
    isCommand: false,
    groupName: "",
    addData: {
      title: "添加一个新群组",
      text: "请输入群组名称",
      name: ""
    },
    editData: {
      title: "修改群组名称",
      text: "请输入群组名称",
      name: ""
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

  //监控搜索输入
  bindViewSearch: function (e) {
    this.setData({
      searchName: e.detail.value
    })
    this.getSearchList();
  },
  showInfo: function (event) {
    var self = this,
      index = event.currentTarget.dataset.index,
      groupInfo = self.data.searchList[index];
    self.setData({
      groupInfo: groupInfo,
      groupIndex: index
    })
    if (groupInfo.isLight) {
      wx.navigateTo({
        url: '/pages/operateDevice/operateDevice?group=' + JSON.stringify(self.data.groupInfo) + '&flag=true'
      })
    }
  },
  openGroup: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setGroupStatus(1, index, true);
  },
  closeGroup: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setGroupStatus(0, index, false);
  },
  setGroupStatus: function (status, index, flag) {
    var groupList = this.data.searchList,
      group = groupList[index],
      rootMacs = group.rootMacs,
      rootInfo = group.rootInfo;
    for (var i in rootMacs) {
      var rootMac = rootMacs[i],
        obj = rootInfo["'" + rootMac + "'"];
      console.log(obj.macs);
      util.setListStatus(obj.macs, status, obj.ip);
    }
    group.active = flag;
    groupList.splice(index, 1, group);
    this.setData({
      groupInfo: group,
      searchList: groupList
    })
  },
  //监控添加群组名称
  editInfoName: function (e) {
    this.setData({
      groupName: e.detail.value
    })
  },
  showAddGroup: function() {
    this.setData({
      isAddGroup: false,
      groupName: "",
      ["addData.name"]: ""
    })
  },
  showEditName: function() {
    const self = this;
    var group = self.data.groupInfo,
      name = group.name;
    if (group.is_user) {
      util.showToast("默认组禁止修改");
      return false;
    }
    self.setData({
      isEditGroup: false,
      isOperate: true,
      groupName: name,
      ["editData.name"]: name
    })
  },
  showCommand: function () {
    util.showCommand(this);
  },
  showLoadCommand: function () {
    util.showLoadCommand(this);
  },
  addCommand: function () {
    util.addCommand(this)
  },
  delCommand: function (e) {
    util.delCommand(e, this)
  },
  bindViewKey: function (e) {
    util.changeKey(e, this)
  },
  bindViewValue: function (e) {
    util.changeValue(e, this)
  },
  commandCancel: function () {
    util.commandCancel(this);
  },
  selectResponse: function (e) {
    util.selectResponse(e, this);
  },
  selectCommand: function (e) {
    util.selectCommand(e, this);
  },
  sendCommand: function () {
    const self = this;
    var group = self.data.groupInfo,
      rootMacs = group.rootMacs,
      rootInfo = group.rootInfo;
    for (var i in rootMacs) {
      var rootMac = rootMacs[i],
        obj = rootInfo["'" + rootMac + "'"],
        macs = obj.macs;
      setTimeout(function () {
        util.sendCommand(self, obj.ip, macs);
      });
    }
    
  },
  sendSuc: function (res) {
    console.log(typeof res);
    var list = [];
    if (typeof res == "object") {
      list.push(JSON.stringify(res));
    } else {
      res = res.split("Content-Type: application/json");
      res.splice(0, 1);
      for (var i in res) {
        list.push(JSON.stringify(util.analysis(res[i])));
      }
    }
    this.setData({
      ["commandData.resultText"]: list
    })
  },
  delGroup: function() {
    const self = this;
    var group = self.data.groupInfo;
    if (group.is_user) {
      util.showToast("默认组禁止解散");
      return false;
    }
    var groups = wx.getStorageSync(constant.GROUP_TABLE);
    for (var i in groups) {
      var item = groups[i];
      if (group.id == item.id) {
        groups.splice(i, 1);
        break;
      }
    }
    util.setStorage(constant.GROUP_TABLE, groups);
    this.getGroupList();
    this.hideOperate();
  },
  //重置设备
  delDevice: function () {
    const self = this;
    self.setData({
      isOperate: true,
      isAddGroup: true,
      isEditGroup: true,
    });
    wx.showModal({
      title: '重置设备',
      confirmColor: "#3ec2fc",
      content: '确定要重置设备吗?若重置设备该群组下的设备将进入配网状态。',
      success(res) {
        if (res.confirm) {
          util.showLoading("");
          var group = self.data.groupInfo,
            rootMacs = group.rootMacs,
            rootInfo = group.rootInfo,
            data = JSON.stringify({ "request": constant.RESET_DEVICE, "delay": constant.DELAY_TIME });
          console.log(group);
          for (var i in rootMacs) {
            var rootMac = rootMacs[i],
              obj = rootInfo["'" + rootMac + "'"],
              macs = obj.macs;
            console.log(macs);
            setTimeout(function () {
              util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, obj.ip, false, self.delSuc, "重置失败");
            }, 800);
          }
        }
      }
    })
  },
  //设备重置成功结果处理
  delSuc: function (res) {
    const self = this;
    var deviceList = wx.getStorageSync(constant.DEVICE_LIST),
      list = [],
      macs = self.data.groupInfo.device_macs;
    for (var i in deviceList) {
      var item = deviceList[i];
      if (macs.indexOf(item.mac) == -1) {
        list.push(item);
      }
    }
    util.setStorage(constant.DEVICE_LIST, list);
    self.getGroupList();
    wx.hideLoading();
    self.hideOperate();
  },
  editGroup: function () {
    const self = this;
    self.setData({
      isOperate: true,
    })
    setTimeout(function() {
      wx.navigateTo({
        url: '/pages/addGroup/addGroup?group=' + JSON.stringify(self.data.groupInfo) + '&flag=true'
      })
    }, 100)
  },
  joinMesh: function() {
    const self = this;
    var macs = self.data.groupInfo.device_macs,
      deviceList = wx.getStorageSync(constant.DEVICE_LIST);
    if (deviceList.length > 0) {
      var ip = "";
      for (var i in deviceList) {
        var item = deviceList[i];
        if (macs.indexOf(item.mac) != -1) {
          ip = item.ip;
          break;
        }
      }
      wx.navigateTo({
        url: '/pages/blueDevices/blueDevices?flag=true&macs=' + JSON.stringify(macs) + '&ip=' + ip
      })
      self.hideOperate();
    }
    
  },
  showOTA: function () {
    const self = this;
    wx.navigateTo({
      url: '/pages/ota/ota?macs=' + JSON.stringify(self.data.groupInfo.device_macs) + '&flag=true'
    })
    self.hideOperate();
  },
  showOperate: function(e) {
    var self = this,
      index = e.currentTarget.dataset.index,
      groupInfo = self.data.searchList[index];
    self.setData({
      isOperate: false,
      groupInfo: groupInfo,
      groupIndex: index
    })
  },
  hideOperate: function() {
    this.setData({
      isOperate: true,
      isAddGroup: true,
      isEditGroup: true,
      groupInfo: "",
      groupIndex: -1
    })
  },
  hide: function () {
    this.setData({
      isOperate: true,
      isAddGroup: true,
    })
  },
  getStatusByGroup: function (macs) {
    var self = this, statusFlag = false;
    if (macs.length > 0) {
      var deviceList = wx.getStorageSync(constant.DEVICE_LIST);
      for (var i in deviceList) {
        var item = deviceList[i];
        if (macs.indexOf(item.mac) > -1) {
          var characteristics = item.characteristics;
          for (var j in characteristics) {
            var itemSub = characteristics[j];
            if (itemSub.cid == constant.STATUS_CID) {
              if (itemSub.value == constant.STATUS_ON) {
                statusFlag = true;
                break;
              }

            }
          };
          if (statusFlag) {
            break;
          }
        }
      };
    }
    return statusFlag;
  },
  saveName: function() {
    const self = this;
    if (util._isEmpty(self.data.groupName)) {
      util.showToast("请输入群组名称！");
      return false;
    }
    
    if (!self.data.isEditGroup && self.data.isAddGroup) {
      var group = self.data.groupInfo;
      group.name = self.data.groupName;
      util.saveGroups([group]);
      self.getGroupList();
    } else {
      wx.navigateTo({
        url: '/pages/addGroup/addGroup?groupName=' + self.data.groupName + '&flag=false'
      })
    }
    self.hideAdd();
    
  },
  hideAdd: function() {
    this.setData({
      isAddGroup: true,
      isEditGroup: true
    })
  },
  
  //处理设备列表
  getSearchList: function () {
    var searchList = [], list = this.data.groupList,
      deviceList = wx.getStorageSync(constant.DEVICE_LIST)
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
    for (var i = 0; i < searchList.length; i++) {
      var item = searchList[i],
        macs = item.device_macs,
        flag = false,
        count = 0;
        var rootMacList = [],
          ipObj = {};
      for (var j = 0; j < deviceList.length; j++) {
        var itemSub = deviceList[j];
        if (macs.indexOf(itemSub.mac) != -1) {
          if (itemSub.tid >= constant.MIN_LIGHT && itemSub.tid <= constant.MAX_LIGHT) {
            flag = true;
          }
          count++;
          var rootMac = itemSub.rootMac;
          var ip = itemSub.ip;
          if (rootMacList.indexOf(rootMac) == -1) {
            rootMacList.push(rootMac);
            ipObj["'" + rootMac + "'"] = { "ip": ip, "macs": []}
          }
          ipObj["'" + rootMac + "'"].macs.push(itemSub.mac);
        }
      }
      item.active = this.getStatusByGroup(macs);
      item.isLight = flag;
      item.count = count;
      item.rootMacs = rootMacList;
      item.rootInfo = ipObj;
      console.log(item);
      searchList.splice(i, 1, item);
    }
    searchList = util.sortList(searchList);
    this.setData({
      searchList: searchList
    })
  },
  //修改群组名称弹框
  editName: function () {
    this.setData({
      isOperate: true,
      hiddenModal: false,
    })
  },
  getGroupList: function() {
    var groupList = wx.getStorageSync(constant.GROUP_TABLE);
    if (!util._isEmpty(groupList) && groupList.length > 0) {
      this.setData({
        groupList: groupList
      })
      this.getSearchList();
    }
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
    util.closeBluetoothAdapter();
    wx.setNavigationBarTitle({
      title: "群组"
    });
    this.getGroupList();
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