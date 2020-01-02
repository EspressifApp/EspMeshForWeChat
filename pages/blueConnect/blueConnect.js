//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
const crypto = require('../../crypto/crypto-dh.js');
const md5 = require('../../crypto/md5.min.js');
const aesjs = require('../../crypto/aes.js');
const timeOut = 30;//超时时间
var timeId = "";
var sequenceControl = 0;
var sequenceNumber = -1;
var client = "";
Page({
  data: {
    blueConnectNum: 0,
    wifiConnectNum: 0,
    isClose: false,
    failure: false,
    value: 0,
    desc: "Device connecting...",
    frameControl: 0,
    flagEnd: false,
    defaultData: 1,
    isEncrypt: true,
    isChecksum: true,
    ssidType: 1,
    passwordType: 2,
    bssidType: 3,
    meshIdType: 4,
    meshType: 6,
    whiteListType: 64,
    whiteListLen: 252,
    macs: [],
    deviceId: "",
    ssid: "",
    bssid: "",
    uuid: "",
    serviceId: "",
    password: "",
    meshId: "",
    mesh: 0,
    processList: [],
    result: [],
  },
  getBestDevice: function () {
    var self = this;
    wx.getBluetoothDevices({
      success: function (res) {
        var deviceId = "",
          rssi = -1200;
        var list = util.filterDevice(res.devices, null, [], rssi, false);
        console.log(list);
        for (var i in list) {
          var item = list[i];
          if (self.data.macs.indexOf(item.mac) != -1) {
            if (item.RSSI >= rssi) {
              rssi = item.RSSI;
              deviceId = item.deviceId;
            }
          }
        }
        if (util._isEmpty(deviceId)) {
          self.setData({
            failure: true,
            desc: "距离设备太远"
          })
          self.setFailBg();
        } else {
          self.setData({
            deviceId: deviceId
          })
          self.blueConnect();
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
    
  },
  blueConnect: function (event) {
    var self = this;
    sequenceControl = 0;
    sequenceNumber = -1;
    self.setData({
      result: [],
      flagEnd: false,
      serviceId: "",
      uuid: "",
    });
    console.log(self.data.deviceId);
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: self.data.deviceId,
      timeout: 10000,
      success: function (res) {
        self.getDeviceServices(self.data.deviceId);
        wx.onBLEConnectionStateChange(function (res) {
          if (!res.connected && !self.data.isClose) {
            self.setFailProcess(true, "蓝牙连接断开");
            }
        })
      },
      fail: function (res) {
        console.log(res);
        var num = self.data.blueConnectNum;
        if (num < 3) {
          self.blueConnect();
          num++;
          self.setData({
            blueConnectNum: num
          })
        } else {
          self.setFailProcess(true, constant.descFailList[0]);
        }
      }
    })
  },
  getDeviceServices: function (deviceId) {
    var self = this;
    self.setProcess(10, constant.descSucList[1]);
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: deviceId,
      success: function (res) {
        var services = res.services;
        if (services.length > 0) {
          for (var i = 0; i < services.length; i++) {
            var uuid = services[i].uuid;
            if (uuid == app.data.service_uuid) {
              self.getDeviceCharacteristics(deviceId, uuid);
            }
          }
        }

      },
      fail: function (res) {
        self.setFailProcess(true, constant.descFailList[1]);
      }
    })
  },
  getDeviceCharacteristics: function (deviceId, serviceId) {
    var self = this;
    self.setProcess(20, constant.descSucList[2]);
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: deviceId,
      serviceId: serviceId,
      success: function (res) {
        var list = res.characteristics;
        if (list.length > 0) {
          for (var i = 0; i < list.length; i++) {
            var uuid = list[i].uuid;
            if (uuid == app.data.characteristic_write_uuid) {
              self.openNotify(deviceId, serviceId, uuid);
              self.setData({
                serviceId: serviceId,
                uuid: uuid,
              })
            }
          }
        }
      },
      fail: function (res) {
        self.setFailProcess(true, constant.descFailList[2]);
      }
    })
  },
  //通知设备交互方式（是否加密）
  notifyDevice: function (deviceId, serviceId, characteristicId) {
    var self = this;
    self.setProcess(35, constant.descSucList[3]);
    client = util.blueDH(constant.DH_P, constant.DH_G, crypto);
    var kBytes = util.uint8ArrayToArray(client.getPublicKey());
    var pBytes = util.hexByInt(constant.DH_P);
    var gBytes = util.hexByInt(constant.DH_G);
    var pgkLength = pBytes.length + gBytes.length + kBytes.length + 6;
    console.log(pgkLength);
    var pgkLen1 = (pgkLength >> 8) & 0xff;
    var pgkLen2 = pgkLength & 0xff;
    var data = [];
    data.push(constant.NEG_SET_SEC_TOTAL_LEN);
    data.push(pgkLen1);
    data.push(pgkLen2);
    var frameControl = util.getFrameCTRLValue(false, false, constant.DIRECTION_OUTPUT, false, false);
    var value = util.writeData(constant.PACKAGE_VALUE, constant.SUBTYPE_NEG, frameControl, sequenceControl, data.length, data);
    var typedArray = new Uint8Array(value);
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: typedArray.buffer,
      success: function (res) {
        self.getSecret(deviceId, serviceId, characteristicId, kBytes, pBytes, gBytes, null);
      },
      fail: function (res) {
        self.setFailProcess(true, constant.descFailList[3]);
      }
    })
  },
  getSecret: function (deviceId, serviceId, characteristicId, kBytes, pBytes, gBytes, data) {
    var self = this, obj = [], frameControl = 0;
    sequenceControl = parseInt(sequenceControl) + 1;
    if (!util._isEmpty(data)) {
      obj = util.isSubcontractor(data, self.data.isChecksum, sequenceControl);
      frameControl = util.getFrameCTRLValue(false, self.data.isChecksum, constant.DIRECTION_OUTPUT, false, obj.flag);
    } else {
      data = [];
      data.push(constant.NEG_SET_SEC_ALL_DATA);
      var pLength = pBytes.length;
      var pLen1 = (pLength >> 8) & 0xff;
      var pLen2 = pLength & 0xff;
      data.push(pLen1);
      data.push(pLen2);
      data = data.concat(pBytes);
      var gLength = gBytes.length;
      var gLen1 = (gLength >> 8) & 0xff;
      var gLen2 = gLength & 0xff;
      data.push(gLen1);
      data.push(gLen2);
      data = data.concat(gBytes);
      var kLength = kBytes.length;
      var kLen1 = (kLength >> 8) & 0xff;
      var kLen2 = kLength & 0xff;
      data.push(kLen1);
      data.push(kLen2);
      data = data.concat(kBytes);
      obj = util.isSubcontractor(data, self.data.isChecksum, sequenceControl);
      frameControl = util.getFrameCTRLValue(false, self.data.isChecksum, constant.DIRECTION_OUTPUT, false, obj.flag);
    }
    var value = util.writeData(constant.PACKAGE_VALUE, constant.SUBTYPE_NEG, frameControl, sequenceControl, obj.len, obj.lenData);
    var typedArray = new Uint8Array(value);
    console.log(typedArray);
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: typedArray.buffer,
      success: function (res) {
        if (obj.flag) {
          self.getSecret(deviceId, serviceId, characteristicId, kBytes, pBytes, gBytes, obj.laveData);
        }
      },
      fail: function (res) {
        self.setFailProcess(true, constant.descFailList[3]);
      }
    })
  },
  // 告知设备数据开始写入
  writeDeviceStart: function (deviceId, serviceId, characteristicId, data) {
    var self = this, obj = {}, frameControl = 0;
    self.setProcess(40, constant.descSucList[4]);
    sequenceControl = parseInt(sequenceControl) + 1;
    if (!util._isEmpty(data)) {
      obj = util.isSubcontractor(data, self.data.isChecksum, sequenceControl, self.data.isEncrypt);
      frameControl = util.getFrameCTRLValue(self.data.isEncrypt, self.data.isChecksum, constant.DIRECTION_OUTPUT, false, obj.flag);
    } else {
      obj = util.isSubcontractor([self.data.defaultData], self.data.isChecksum, sequenceControl, self.data.isEncrypt);
      frameControl = util.getFrameCTRLValue(self.data.isEncrypt, self.data.isChecksum, constant.DIRECTION_OUTPUT, false, obj.flag);
    }
    var defaultData = util.encrypt(aesjs, app.data.md5Key, sequenceControl, obj.lenData, self.data.isChecksum);
    var value = util.writeData(constant.PACKAGE_CONTROL_VALUE, constant.SUBTYPE_WIFI_MODEl, frameControl, sequenceControl, obj.len, defaultData);
    var typedArray = new Uint8Array(value)
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: typedArray.buffer,
      success: function (res) {
        self.setProcess(60, constant.descSucList[5]);
        if (obj.flag) {
          self.writeDeviceStart(deviceId, serviceId, characteristicId, obj.laveData);
        } else {
          self.writeRouterSsid(deviceId, serviceId, characteristicId, null);
        }
      },
      fail: function (res) {
        self.setFailProcess(true, constant.descFailList[3]);
      }
    })
  },
  //写入路由ssid
  writeRouterSsid: function (deviceId, serviceId, characteristicId, data) {
    var self = this, obj = {}, frameControl = 0;
    sequenceControl = parseInt(sequenceControl) + 1;
    if (!util._isEmpty(data)) {
      obj = util.isSubcontractor(data, self.data.isChecksum, sequenceControl, self.data.isEncrypt);
      frameControl = util.getFrameCTRLValue(self.data.isEncrypt, self.data.isChecksum, constant.DIRECTION_OUTPUT, false, obj.flag);
    } else {
      var ssidData = self.getCharCodeat(self.data.ssid);
      ssidData.unshift(ssidData.length);
      ssidData.unshift(self.data.ssidType);
      var pwdData = self.getCharCodeat(self.data.password);
      pwdData.unshift(pwdData.length);
      pwdData.unshift(self.data.passwordType);
      var bssidData = self.getSsids(self.data.meshId, false);
      bssidData.unshift(bssidData.length);
      bssidData.unshift(self.data.bssidType);
      var meshIdData = self.getSsids(self.data.meshId, false);
      meshIdData.unshift(meshIdData.length);
      meshIdData.unshift(self.data.meshIdType);
      var meshData = [self.data.mesh];
      meshData.unshift(meshData.length);
      meshData.unshift(self.data.meshType);
      var whiteList = self.getWhiteList();
      ssidData = ssidData.concat(pwdData, bssidData, meshIdData, meshData, whiteList)
      obj = util.isSubcontractor(ssidData, self.data.isChecksum, sequenceControl, self.data.isEncrypt);
      frameControl = util.getFrameCTRLValue(self.data.isEncrypt, self.data.isChecksum, constant.DIRECTION_OUTPUT, false, obj.flag);
    }
    var defaultData = util.encrypt(aesjs, app.data.md5Key, sequenceControl, obj.lenData, self.data.isChecksum);
    var value = util.writeData(constant.PACKAGE_VALUE, constant.SUBTYPE_CUSTOM_DATA, frameControl, sequenceControl, obj.len, defaultData);
    console.log(value);
    var typedArray = new Uint8Array(value)
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: typedArray.buffer,
      success: function (res) {
        if (obj.flag) {
          self.writeRouterSsid(deviceId, serviceId, characteristicId, obj.laveData);
        } else {
          self.writeDeviceEnd(deviceId, serviceId, characteristicId, null);
        }
      },
      fail: function (res) {
        self.setFailProcess(true, constant.descFailList[4]);
      }
    })
  },
  //告知设备写入结束
  writeDeviceEnd: function (deviceId, serviceId, characteristicId) {
    var self = this;
    sequenceControl = parseInt(sequenceControl) + 1;
    var frameControl = util.getFrameCTRLValue(self.data.isEncrypt, false, constant.DIRECTION_OUTPUT, false, false);
    var value = util.writeData(constant.PACKAGE_CONTROL_VALUE, constant.SUBTYPE_END, frameControl, sequenceControl, 0, null);
    var typedArray = new Uint8Array(value)
    console.log(typedArray);
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: typedArray.buffer,
      success: function (res) {
        self.onTimeout(0);
      },
      fail: function (res) {
        self.setFailProcess(true, constant.descFailList[4]);
      }
    })
  },
  //连接超时
  onTimeout: function (num) {
    const self = this;
    timeId = setInterval(function () {
      if (num < timeOut) {
        num++;
      } else {
        clearInterval(timeId);
        self.setFailProcess(true, constant.descFailList[4]);
      }
    }, 1000)
  },
  //监听通知
  onNotify: function () {
    var self = this;
    wx.onBLECharacteristicValueChange(function (res) {
      self.getResultType(util.ab2hex(res.value));
      console.log(util.ab2hex(res.value));
    })
  },
  //启用通知
  openNotify: function (deviceId, serviceId, characteristicId) {
    var self = this;
    console.log(deviceId, serviceId, characteristicId);
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: app.data.characteristic_read_uuid,
      success: function (res) {
        self.notifyDevice(deviceId, serviceId, characteristicId);
        self.onNotify();
      },
      fail: function (res) {
      }
    })
  },
  getWhiteList: function () {
    var list = [];
    for (var i in this.data.macs) {
      var mac = this.getSsids(this.data.macs[i], false);
      list = list.concat(mac);
    }
    console.log(this.data.macs);
    console.log(list);
    var len = Math.ceil(list.length / this.data.whiteListLen);
    var totalLen = list.length,
      listLen = 0;
    for (var i = 0; i < len; i++) {
      var index = i * this.data.whiteListLen + i * 2;
      if (i == 0 && len == 1) {
        listLen = list.length;
      } else if (len > 1 && i != (len - 1)) {
        listLen = this.data.whiteListLen;
      } else if (i == (len - 1)) {
        listLen = totalLen - index + i * 2;
      }
      list.splice(index, 0, listLen);
      list.splice(index, 0, this.data.whiteListType);
    }
    console.log(list);
    return list;
  },
  saveWifi: function () {
    var self = this;
    wx.getStorage({
      key: 'WIFIINFO',
      success(res) {
        var data = res.data;
        console.log(data);
        if (!util._isEmpty(data)) {
          var flag = false;
          for (var i in data) {
            if (data[i].name == self.data.ssid) {
              data[i].password = self.data.password;
              flag = true;
              return false;
            }
          }
          if (!flag) {
            data.push({ name: self.data.ssid, password: self.data.password })
          }

        } else {
          data = [];
          data.push({ name: self.data.ssid, password: self.data.password })
        }
        wx.setStorage({
          key: "WIFIINFO",
          data: data
        })
      },
      fail: function (res) {
        var data = [];
        data.push({ name: self.data.ssid, password: self.data.password });
        wx.setStorage({
          key: "WIFIINFO",
          data: data
        })
      }
    })

  },
  getSsids: function (str, flag) {
    var list = [],
      strs = str.split(":"),
      len = strs.length;
    for (var i = 0; i < len; i++) {
      var num = parseInt(strs[i], 16);
      if (flag && i == (len - 1)) {
        num = num - 2;
      }
      list.push(num);
    }
    return list;
  },
  getCharCodeat: function (str) {
    var list = [];
    for (var i = 0; i < str.length; i++) {
      list.push(str.charCodeAt(i));
    }
    return list;
  },
  setProcess: function (value, desc) {
    var self = this, list = [];
    list = self.data.processList;
    list.push(desc);
    self.setData({
      value: value,
      processList: list
    });
    if (value == 100) {
      self.closeConnect(true);
      self.setData({
        desc: constant.descSucList[6]
      });
      clearInterval(timeId);
      sequenceControl = 0;
      self.saveWifi();
      wx.showToast({
        title: '配网成功',
        icon: 'none',
        duration: 2000
      })
      app.data.isInit = 3;
      setTimeout(function () {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }, 3000)
    }
  },
  setFailProcess: function (flag, desc) {
    var self = this, list = [];
    list = self.data.processList;
    list.push(desc);
    self.setFailBg();
    self.setData({
      failure: flag,
      processList: list,
      desc: desc
    });
  },
  getResultType: function (list) {
    var self = this;
    var result = self.data.result;
    if (list.length < 4) {
      self.setFailProcess(true, constant.descFailList[4]);
      return false;
    }
    var val = parseInt(list[0], 16),
      type = val & 3,
      subType = val >> 2;
    console.log(type, subType);
    // var sequenceNum = parseInt(list[2], 16);
    // if (sequenceNum - sequenceNumber != 1) {
    //   console.log("fail");
    //   return false;
    // }
    // sequenceNumber = sequenceNum;
    var dataLength = parseInt(list[3], 16);
    if (dataLength == 0) {
      return false;
    }
    var fragNum = util.hexToBinArray(list[1]);
    list = util.isEncrypt(self, fragNum, list, app.data.md5Key);
    result = result.concat(list);
    self.setData({
      result: result,
    })
    if (self.data.flagEnd) {
      self.setData({
        flagEnd: false,
      })
      if (type == 1) {
        if (subType == 15) {
          console.log(result);
          for (var i = 0; i <= result.length; i++) {
            var num = parseInt(result[i], 16) + "";
            console.log(num);
            if (i == 0) {
              self.setProcess(85, "Connected: " + constant.successList[num]);
            } else if (i == 1) {
              if (num == 0) {
                self.setProcess(100, constant.descSucList[6]);
              }
            }
          }
        } else if (subType == 18) {
          for (var i = 0; i <= result.length; i++) {
            var num = parseInt(result[i], 16) + "";
            if (i == 0) {
              self.setProcess(85, constant.successList[num]);
            } else if (i == 1) {
              self.setFailProcess(true, constant.failList[num]);
            }
          }
        } else if (subType == constant.SUBTYPE_NEGOTIATION_NEG) {
          var arr = util.hexByInt(result.join(""));
          var clientSecret = client.computeSecret(new Uint8Array(arr));
          var md5Key = md5.array(clientSecret);
          app.data.md5Key = md5Key;
          self.setData({
            result: [],
          })
          console.log("ssss");
          self.writeDeviceStart(self.data.deviceId, self.data.serviceId, self.data.uuid, null);
        } else {
          self.setFailProcess(true, constant.descFailList[4])
        }
      } else {
        self.setFailProcess(true, constant.descFailList[4])
      }
    }
  },
  closeConnect: function (flag) {
    var self = this;
    self.setData({
      isClose: true
    })
    wx.closeBLEConnection({
      deviceId: self.data.deviceId,
      success: function (res) {
        console.log(res)
      }
    })
    if (flag) {
      wx.closeBluetoothAdapter({
        success: function () {
        }
      });
    }
  },
  //设置配网失败背景色
  setFailBg: function () {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: '#737d89',
    })
  },
  //设置配网成功背景色
  setSucBg: function () {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: '#3ec2fc',
    })
  },
  onLoad: function (options) {
    var self = this;
    wx.setNavigationBarTitle({
      title: "配网"
    });
    self.setSucBg();
    wx.openBluetoothAdapter();
    console.log(options);
    var macs = options.macs.split(",")
    self.setData({
      blueConnectNum: 0,
      wifiConnectNum: 0,
      macs: macs,
      ssid: options.ssid,
      password: options.password,
      meshId: options.meshId,
      deviceId: options.macRssi
    })
    //self.getBestDevice();
    self.blueConnect();
    self.setProcess(0, constant.descSucList[0]);
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
    this.closeConnect(true);
    clearInterval(timeId);
    sequenceControl = 0;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.closeConnect(true);
    clearInterval(timeId);
    sequenceControl = 0;
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
