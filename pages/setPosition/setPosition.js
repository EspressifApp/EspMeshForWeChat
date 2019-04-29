// pages/setPosition/setPosition.js
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    device: "",
    floorArray: ["1F", "2F", "3F", "4F", "5F", "6F", "7F", "8F", "9F", "10F", "11F", "12F",
      "13F", "14F", "15F", "16F"],
    floorIndex: 6,
    floor: "",
    areaArray: ["A", "B", "C", "D", "E", "F", "G"],
    areaIndex: 0,
    area: "",
    code: "001",
    oldFloor: "",
    oldArea: "",
    oldCode: "",
    mac: "",
    flag: true,
    isEdit: false,
    btnTitle: "下一个"
  },
  bindViewFloor: function(e) {
    const self = this;
    var floor = e.detail.value;
    self.setData({
      floor: floor,
      floorIndex: self.data.floorArray.indexOf(floor)
    })

  },
  bindFloorChange: function(e) {
    const self = this;
    var index = e.detail.value;
    this.setData({
      floorIndex: index,
      floor: self.data.floorArray[index]
    })
  },
  bindViewArea: function() {
    const self = this;
    var area = e.detail.value;
    self.setData({
      area: area,
      areaIndex: self.data.areaArray.indexOf(area)
    })
  },
  bindAreaChange: function (e) {
    const self = this;
    var index = e.detail.value;
    this.setData({
      areaIndex: index,
      area: self.data.areaArray[index]
    })
  },
  bindViewCode: function(e) {
    this.setData({
      code: e.detail.value
    })
  },
  bindViewMac: function(e) {
    this.setData({
      mac: e.detail.value.toLowerCase()
    })
  },
  qrCode: function() {
    const self = this;
    wx.scanCode({
      success(res) {
        var qr = res.result,
          lastNum = qr.lastIndexOf(":");
        if (lastNum > -1) {
          qr = qr.substr((lastNum + 1));
        }
        if (!util._isEmpty(qr)) {
          self.setData({
            mac: qr.toLowerCase()
          })
        };
      }
    })
  },
  savePosition: function() {
    const self = this;
    if (util._isEmpty(self.data.floor)) {
      util.showToast("请选择楼层");
      return false;
    }
    if (util._isEmpty(self.data.area)) {
      util.showToast("请选择区域");
      return false;
    }
    if (util._isEmpty(self.data.code)) {
      util.showToast("请输入编号");
      return false;
    }
    if (util._isEmpty(self.data.mac)) {
      util.showToast("请输入MAC地址");
      return false;
    }
    util.showToast("验证通过");
    if (self.data.isEdit) {
      if (self._isEditExist(self.data.code) && self._isCodeExist(self.data.code)) {
        util.showToast("输入的编号在选中的楼层区域中已存在"); 
        return false;
      }
    } else {
      if (self._isCodeExist(self.data.code)) {
        util.showToast("输入的编号在选中的楼层区域中已存在"); 
        return false;
      }
    }
    var isDevice = false;
    if (!self.data.flag) {
      if (self._isExist(self.data.mac)) {
        util.showToast("输入的MAC已存在"); 
        return false;
      }
      var list = wx.getStorageSync(constant.DEVICE_LIST);
      for(var i in list) {
        var item = list[i];
        if (item.mac == self.data.mac) {
          isDevice = true;
          self.setData({
            device: item
          })
          break;
        }
      }
    }
    
    if (self.data.flag || isDevice) {
      var position = self.data.floor + "-" + self.data.area + "-" + self.data.code,
        device = self.data.device,
        macs = [device.mac];
      device.position = position;
      self.setData({
        device: device
      })
      var data = data = '{"request": "' + constant.SET_POSITION + '",' + '"position":"' + position + '"}}';
      util.showLoading("");
      util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, device.ip, true, self.setSuc, "设置失败");
    } else {
      util.showLoading("");
      self.setPosition();
    }
  },
  setSuc: function() {
    const self = this;
    var list = wx.getStorageSync(constant.DEVICE_LIST);
    for (var i in list) {
      var item = list[i];
      if (item.mac == self.data.mac) {
        list.splice(i, 1, self.data.device);
        break;
      }
    }
    this.setPosition();
    util.setStorage(constant.DEVICE_LIST, list);
  },
  setPosition: function() {
    const self = this;
    var data = {
      "mac": self.data.mac, "code": self.data.code, "floor": self.data.floor, "area": self.data.area
    };
    util.savePosition(data);
    setTimeout(function () {
      wx.hideLoading();
      if (self.data.flag || self.data.isEdit) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        self.setData({
          mac: "",
          code: self.getNum()
        })
      }
    }, 1000)
  },
  getNum: function () {
    var self = this,
      len = self.data.code.length,
      num = parseInt(self.data.code);
    num++;
    if (num <= 9) {
      var str = "";
      if (len > 1) {
        for (var i = 0; i < (len - 1); i++) {
          str += "0";
        }
      }
      num = str + num;
    } else if (num <= 99) {
      var str = "";
      if (len > 2) {
        for (var i = 0; i < (len - 2); i++) {
          str += "0";
        }
      }
      num = str + num;
    }
    return num;
  },
  initData: function (options) {
    var device = options.device,
      positionInfo = options.position,
      floorIndex = 0, floor = "1F", areaIndex = 0, area = "A", code = "001", mac = "", oldFloor = "", oldArea = "", oldCode = "", isEdit = false, flag = true;
    console.log(device);
    console.log(positionInfo);
    if (!util._isEmpty(device)) {
      device = JSON.parse(device);
      mac = device.mac;
      var position = device.position;
      if (!util._isEmpty(position)) {
        position = position.split("-");
        floor = oldFloor = position[0];
        area = oldArea = position[1];
        code = oldCode = position[2];
        floorIndex = this.data.floorArray.indexOf(floor);
        areaIndex = this.data.areaArray.indexOf(area);
        isEdit = true;
      }
    } else if (!util._isEmpty(positionInfo)) {
      
      positionInfo = JSON.parse(positionInfo);
      mac = positionInfo.mac;
      floor = oldFloor = positionInfo.floor;
      area = oldArea = positionInfo.area;
      code = oldCode = positionInfo.code;
      floorIndex = this.data.floorArray.indexOf(floor);
      areaIndex = this.data.areaArray.indexOf(area);
      isEdit = true;
    }
    var btnTitle = "下一个";
    if (options.flag == "true" || isEdit) {
      btnTitle = "确定";
    } else {
      flag = false;
    }
    this.setData({
      flag: flag,
      device: device,
      isEdit: isEdit,
      mac: mac,
      floorIndex: floorIndex,
      floor: floor,
      areaIndex: areaIndex,
      area: area,
      code: code,
      oldFloor: oldFloor,
      oldArea: oldArea,
      oldCode: oldCode,
      btnTitle: btnTitle
    })
  },
  _isExist: function (mac) {
    const self = this;
    var flag = false,
      positionList = wx.getStorageSync(constant.POSITION_LIST);
    for (var i in positionList) {
      var item = positionList[i];
      if (item.mac == mac) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  _isCodeExist: function (code) {
    const self = this;
    var flag = false,
      positionList = wx.getStorageSync(constant.POSITION_LIST)
    for (var i in positionList) {
      var item = positionList[i];
      if (item.floor == self.data.floor && item.area == self.data.area && item.code == code) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  _isEditExist: function (code) {
    const self = this;
    var flag = false;
    if (self.data.floor != self.data.oldFloor || self.data.area != self.data.oldArea || code != self.data.oldCode) {
      flag = true;
    }
    return flag;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData(options);
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