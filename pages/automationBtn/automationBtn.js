const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    events: [],
    eventA: [],
    deviceA: [],
    eventB: [],
    deviceB: [],
    eventC: [],
    deviceC: [],
    eventD: [],
    deviceD: [],
    eventUp: [],
    eventDown: [],
    selectMacs: [],
    newMac: "",
    newEvents: [],
    isMuch: false,
    isA: false,
    isB: false,
    isC: false,
    isD: false,
    isAB: false,
    isCD: false,
    coordinate: { aleft: 0, atop: 0, abottom: 0, aright: 0, bleft: 0, btop: 0, bbottom: 0, bright: 0, cleft: 0, ctop: 0, cbottom: 0, cright: 0, dleft: 0, dtop: 0, dbottom: 0, dright: 0, abLeft: 0, abtop: 0, abbottom: 0, abright: 0, cdleft: 0, cdtop: 0, cdbottom: 0, cdright: 0},
    btnValues: constant.BUTTON_DEVICES,
    pressList: {
      "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "13": []
    },
    existEvent: false,
    isMuch: true,
    shortPress: [{ "id": "1", "name": "开/关", "x": 0, "y": 0 },
      { "id": "8", "name": "亮度", "x": 0, "y": 0 },
      { "id": "9", "name": "颜色", "x": 0, "y": 0 },
      { "id": "10", "name": "色温", "x": 0, "y": 0 },
      { "id": "2", "name": "明亮模式", "h": "60", "s": "0", "b": "100", "x": 0, "y": 0 },
      { "id": "5", "name": "阅读模式", "h": "39", "s": "14", "b": "90", "x": 0, "y": 0 },
      { "id": "6", "name": "温馨模式", "h": "60", "s": "10", "b": "100", "x": 0, "y": 0 },
      { "id": "7", "name": "自然就寝", "h": "33", "s": "100", "b": "66", "x": 0, "y": 0 }],
    longPress: [
      { "id": "11", "name": "亮度" }, { "id": "12", "name": "颜色", "x": 0, "y": 0 },
      { "id": "13", "name": "色温", "x": 0, "y": 0 }],
  },
  touchEnd: function(e) {
    const self = this;
    self.setIsActive(e, true);
  },
  touchLongEnd: function (e) {
    const self = this;
    var name = "", leftName = "", 
      rightName = "", leftValue = "", rightValue = "",
      leftCid = "", rightCid = "",
      index = e.currentTarget.dataset.index,
      longPress = self.data.longPress,
      item = longPress[index],
      id = item.id,
      btnValues = self.data.btnValues,
      eventCid = "";
    if (self.data.isAB) {
      leftCid = btnValues.upleft;
      rightCid = btnValues.upright;
    } else if (self.data.isCD) {
      leftCid = btnValues.downleft;
      rightCid = btnValues.downright;
    }
    item.x = 0;
    item.y = 0;
    if (self.data.isAB || self.data.isCD) {
      if (id == "11") {
        leftValue = 8;
        rightValue = 9;
        leftName = "BRI_IN";
        rightName = "BRI_DE";
      } else if (id == "12") {
        leftValue = 6;
        rightValue = 7;
        leftName = "WARM_IN";
        rightName = "WARM_DE";
      } else if (id == "13") {
        leftValue = 4;
        rightValue = 5;
        leftName = "HUE_IN";
        rightName = "HUE_DE";
      }
      self.setLongEvent(leftName, rightName, leftCid, rightCid, parseInt(id), leftValue, rightValue);
    }
    longPress.splice(index, 1, item)
    self.setData({
      longPress: longPress,
      isAB: false,
      isCD: false,
    })
  },
  touchMove: function(e) {
    var data = e.changedTouches[0],
      x = data.clientX,
      y = data.clientY,
      coordinate = this.data.coordinate;
    if (x > coordinate.aleft && x < coordinate.aright && y > coordinate.atop && y < coordinate.abottom) {
      this.changeIs(true, false, false, false, false, false);
    } else if (x > coordinate.bleft && x < coordinate.bright && y > coordinate.btop && y < coordinate.bbottom) {
      this.changeIs(false, true, false, false, false, false);
    } else if (x > coordinate.cleft && x < coordinate.cright && y > coordinate.ctop && y < coordinate.cbottom) {
      this.changeIs(false, false, true, false, false, false);
    } else if (x > coordinate.dleft && x < coordinate.dright && y > coordinate.dtop && y < coordinate.dbottom) {
      this.changeIs(false, false, false, true, false, false);
    }
  },
  touchLongMove: function(e) {
    var data = e.changedTouches[0],
      x = data.clientX,
      y = data.clientY,
      coordinate = this.data.coordinate;
    if (x > coordinate.ableft && x < coordinate.abright && y > coordinate.abtop && y < coordinate.abbottom) {
      this.changeIs(false, false, false, false, true, false);
    } else if (x > coordinate.cdleft && x < coordinate.cdright && y > coordinate.cdtop && y < coordinate.cdbottom) {
      this.changeIs(false, false, false, false, false, true);
    }
  },
  changeIs: function(isA, isB, isC, isD, isAB, isCD) {
    this.setData({
      isA: isA,
      isB: isB,
      isC: isC,
      isD: isD,
      isAB: isAB,
      isCD: isCD
    })
  },
  setIsActive: function(e, flag) {
    var index = e.currentTarget.dataset.index,
      shortPress = this.data.shortPress,
      item = shortPress[index],
      id = item.id,
      btnValues = this.data.btnValues,
      eventCid = "";
    item.x = 0;
    item.y = 0;
    if (this.data.isA) {
      eventCid = btnValues.upleft;
    } else if (this.data.isB) {
      eventCid = btnValues.upright;
    } else if (this.data.isC) {
      eventCid = btnValues.downleft;
    } else if (this.data.isD) {
      eventCid = btnValues.downright;
    }
    shortPress.splice(index, 1, item);
    if (this.data.isA || this.data.isB || this.data.isC || this.data.isD) {
      var flag = false, name = "", h = 0, s = 0, b = 0, subCid = 0, defaultValue = 0;
      if (id == "1") {
        flag = true;
        name = "SWITCH_" + eventCid;
        subCid = constant.STATUS_CID;
        defaultValue = 2;
      } else if (id == "8") {
        name = "BRI_" + eventCid;
        subCid = constant.STATUS_CID;
        defaultValue = 4;
      } else if (id == "9") {
        name = "WARM_" + eventCid;
        subCid = constant.STATUS_CID;
        defaultValue = 3;
      } else if (id == "10") {
        name = "HUE_" + eventCid;
        subCid = constant.STATUS_CID;
        defaultValue = 5;
      } else {
        name = "MODEL_" + eventCid;
        h = item.h;
        s = item.s;
        b = item.b;
      }
      this.setButtonEvent(name, eventCid, flag, parseInt(h), parseInt(s), parseInt(b), subCid, parseInt(id), constant.VALUE_CID, defaultValue);
    }
    this.setData({
      shortPress: shortPress,
      isA: false,
      isB: false,
      isC: false,
      isD: false,
    })
  },
  setLongEvent: function (leftName, rightName, leftCid, rightCid, id, leftValue, rightValue) {
    const self = this; 
    var event = "", eventUp = self.data.eventUp, eventDown = self.data.eventDown;
    leftCid = parseInt(leftCid);
    rightCid = parseInt(rightCid);
    event = {
      leftName: leftName, rightName: rightName, leftCid: leftCid, rightCid: rightCid,
      eventType: id, leftValue: leftValue, rightValue: rightValue
    };
    if (leftCid == self.data.btnValues.upleft && rightCid == self.data.btnValues.upright) {
      eventUp.splice(0, 1, event)
    } else if (leftCid == self.data.btnValues.downleft && rightCid == self.data.btnValues.downright) {
      eventDown.splice(0, 1, event)
    }
    self.setData({
      eventUp: eventUp,
      eventDown: eventDown
    })
    self.initBtnEvent(leftCid, id, true);
  },
  setButtonEvent: function (name, eventCid, flag, h, s, b, subCid, id, execCid, defaultValue) {
    var self = this, event = "";
    eventCid = parseInt(eventCid);
    event = {
      name: name, eventCid: eventCid, flag: flag, h: h, s: s, b: b, subCid: subCid, eventType: id,
      execCid: execCid, defaultValue: defaultValue
    };
    switch (eventCid) {
      case self.data.btnValues.upleft:
        var eventA = self.data.eventA;
        eventA.splice(0, 1, event);
        self.setData({
          eventA: eventA
        })
        break;
      case self.data.btnValues.upright:
        var eventB = self.data.eventB;
        eventB.splice(0, 1, event);
        self.setData({
          eventB: eventB
        })
        break;
      case self.data.btnValues.downleft:
        var eventC = self.data.eventC;
        eventC.splice(0, 1, event);
        self.setData({
          eventC: eventC
        })
        break;
      case self.data.btnValues.downright:
        var eventD = self.data.eventD;
        eventD.splice(0, 1, event);
        self.setData({
          eventD: eventD
        })
        break;
      default: break;
    }
    this.initBtnEvent(eventCid, id, false);
  },
  getEvent: function () {
    const self = this;
    var events = self.data.events;
    for (var i in events) {
      var item = events[i];
      console.log(JSON.stringify(item));
      self.initEvent(item);
      if (self.data.isMuch) {
        self.initDeviceMac(item);
      }
    }
    wx.hideLoading();
  },
  initEvent: function (item) {
    var type = parseInt(item.event_type);
    if (type == 1) {
      if (!this.data.isMuch) {
        this.setButtonEvent(item.name, item.trigger_cid, true, 0, 0, 0, constant.STATUS_CID,
          type, 0, 2);
      }
      this.initBtnEvent(item.trigger_cid, type, false);
    } else if (type == 11 || type == 12 || type == 13) {
      var trigger_cid = item.trigger_cid, 
        leftCid = constant.STATUS_CID, 
        rightCid = constant.HUE_CID,
        leftValue = constant.BUTTON_EVENT_5, 
        rightValue = constant.BUTTON_EVENT_4, 
        leftName = "", rightName = "";
      if (trigger_cid == this.data.btnValues.upleft || trigger_cid == this.data.btnValues.upright) {
        leftCid = this.data.btnValues.upleft;
        rightCid = this.data.btnValues.upright;
      } else {
        leftCid = this.data.btnValues.downleft;
        rightCid = this.data.btnValues.downright;
      }
      if (type == 11) {
        leftValue = constant.BUTTON_EVENT_8;
        rightValue = constant.BUTTON_EVENT_9;
        leftName = "BRI_IN";
        rightName = "BRI_DE";
      } else if (type == 12) {
        leftValue = constant.BUTTON_EVENT_6;
        rightValue = constant.BUTTON_EVENT_7;
        leftName = "WARM_IN";
        rightName = "WARM_DE";
      } else if (type == 13) {
        leftValue = constant.BUTTON_EVENT_4;
        rightValue = constant.BUTTON_EVENT_5;
        leftName = "HUE_IN";
        rightName = "HUE_DE";
      }
      this.setLongEvent(leftName, rightName, leftCid, rightCid, type, leftValue, rightValue);
    } else if (type == 8 || type == 9 || type == 10) {
      var defaultValue = 0;
      if (type == "8") {
        defaultValue = 4;
      } else if (type == "9") {
        defaultValue = 3;
      } else if (type == "10") {
        defaultValue = 5;
      }
      this.setButtonEvent(item.name, item.trigger_cid, false, h, s, b, item.execute_cid,
        type, 0, defaultValue);
    } else {
      var h = 0, s = 0, b = 0,
        characteristics = item.execute_content.characteristics
      for (var i in characteristics) {
        var obj = characteristics[i];
        if (obj.cid == constant.HUE_CID) {
          h = obj.value;
        } else if (obj.cid == constant.SATURATION_CID) {
          s = obj.value;
        } else if (obj.cid == constant.VALUE_CID) {
          b = obj.value;
        } else if (obj.cid == constant.TEMPERATURE_CID && type == 2) {
          h = obj.value;
        } else if (obj.cid == constant.BRIGHTNESS_CID && type == 2) {
          b = obj.value;
        }
      };
      this.setButtonEvent(item.name, item.trigger_cid, false, h, s, b, item.execute_cid,
        type, 0);
      this.initBtnEvent(item.trigger_cid, type, false);
    }
  },
  initDeviceMac: function (item) {
    var self = this,
      cid = item.trigger_cid;
    if (cid == this.data.btnValues.longupleft || cid == this.data.btnValues.upleft) {
      self.setData({
        deviceA: item.execute_mac
      })
    } else if (cid == this.data.btnValues.longupright || cid == this.data.btnValues.upright) {
      self.setData({
        deviceB: item.execute_mac
      })
    } else if (cid == this.data.btnValues.longdownleft || cid == this.data.btnValues.downleft) {
      self.setData({
        deviceC: item.execute_mac
      })
    } else if (cid == this.data.btnValues.longdownright || cid == this.data.btnValues.downright) {
      self.setData({
        deviceD: item.execute_mac
      })
    }
  },
  initBtnEvent: function (cid, type, flag) {
    console.log(type);
    const self = this;
    var name = "";
    switch (cid) {
      case self.data.btnValues.upleft:
        if (flag) {
          name = "AB";
        } else {
          name = "A";
        }
        break;
      case self.data.btnValues.upright:
        if (flag) {
          name = "AB";
        } else {
          name = "B";
        }
        break;
      case self.data.btnValues.downleft:
        if (flag) {
          name = "CD";
        } else {
          name = "C";
        }
        break;
      case self.data.btnValues.downright:
        if (flag) {
          name = "CD";
        } else {
          name = "D";
        }
        break;
      default: break;

    }
    self.isExistPress(name);
    var pressList = self.data.pressList;
    type += "";
    if (pressList[type].indexOf(name) == -1) {
      pressList[type].push(name);
    }
    pressList[type].sort();
    self.setData({
      pressList: pressList
    })
  },
  delExist: function (e) {
    const self = this;
    var name = e.currentTarget.dataset.name,
      type = e.currentTarget.dataset.type;
    console.log();
    switch (name) {
      case "A":
        self.setData({
          eventA: []
        })
        break;
      case "B":
        self.setData({
          eventB: []
        })
        break;
      case "C":
        self.setData({
          eventC: []
        })
        break;
      case "D":
        self.setData({
          eventD: []
        })
        break;
      case "AB":
        self.setData({
          eventUp: []
        })
        break;
      case "CD":
        self.setData({
          eventDown: []
        })
        break;
      default: break;
    }
    var pressList = self.data.pressList;
    type += "";
    var index = pressList[type].indexOf(name);
    if (index != -1) {
      pressList[type].splice(index, 1);
    }
    self.setData({
      pressList: pressList
    })
  },
  isExistPress: function (name) {
    var pressList = this.data.pressList;
    for (var i = 1; i <= 12; i++) {
      var index = pressList[(i + "")].indexOf(name)
      if (index != -1) {
        pressList[(i + "")].splice(index, 1);
      }
    }
    this.setData({
      pressList: pressList
    })
  },
  getCoordinate: function (coordinate, name, id) {
    const self = this;
    wx.createSelectorQuery().select(id).fields({
      dataset: true,
      rect: true,
      size: true
    }, function (res) {
      coordinate[name + "left"] = res.left;
      coordinate[name + "top"] = res.top;
      coordinate[name + "bottom"] = res.bottom;
      coordinate[name + "right"] = res.right;
      self.setData({
        coordinate: coordinate
      })
    }).exec();
  },
  save: function () {
    const self = this;
    var macs = [];
    if (!self.data.isMuch) {
      if (self.data.eventA.length == 0 && self.data.eventB.length == 0 && self.data.eventC.length == 0 && self.data.eventD.length == 0 && self.data.eventUp.length == 0 && self.data.eventDown.length == 0) {
        util.showToast("请选择事件");
        return false;
      }
    } else {
      if (self.data.deviceA.length == 0 && self.data.deviceB.length == 0 && self.data.deviceC.length == 0 && self.data.deviceD.length == 0) {
        util.showToast("请选择设备");
        return false;
      }
    }
    if (self.data.isMuch) {
      macs = self.data.deviceA.concat(self.data.deviceB, self.data.deviceC, self.data.deviceD)
    } else {
      macs = self.data.selectMacs;
    }
    if (macs.length > 0) {
      util.showLoading("");
      setTimeout(function () {
        self.assemblyEvent();
        wx.hideLoading();
      }, 500);
    } else {
      util.showToast("请选择设备");
    }
  },
  assemblyEvent: function () {
    var self = this,
      events = [];
    if (self.data.isMuch) {
      if (self.data.eventA.length > 0 && self.data.deviceA.length > 0) {
        var item = self.data.eventA[0];
        events.push(util.setModelEvent(item.name, self.data.deviceA, item.eventCid,item.subCid, item.h, item.s, item.b, item.flag, item.eventType,constant.MULTIPLE_GROUP,item.execCid, true, item.defaultValue, constant.MESH_LIGHT_SYSC_COLOR_2))
      }
      if (self.data.deviceA.length > 0) {
        var cid = self.data.btnValues.upleft;
        events.push(util.setModelEvent("SWITCH_" + cid, self.data.deviceA, cid, constant.STATUS_CID, 0, 0, 0, true, 1, constant.MULTIPLE_GROUP, 0, false, 2, constant.MESH_LIGHT_SYSC_COLOR))
      }
      if (self.data.eventB.length > 0 && self.data.deviceB.length > 0) {
        var item = self.data.eventB[0];
        events.push(util.setModelEvent(item.name, self.data.deviceB, item.eventCid, item.subCid, item.h, item.s, item.b, item.flag, item.eventType, constant.MULTIPLE_GROUP, item.execCid, true, item.defaultValue, constant.MESH_LIGHT_SYSC_COLOR_2))
      }
      if (self.data.deviceB.length > 0) {
        var cid = self.data.btnValues.upright;
        events.push(util.setModelEvent("SWITCH_" + cid, self.data.deviceB, cid, constant.STATUS_CID, 0, 0, 0, true, 1, constant.MULTIPLE_GROUP, 0, false, 2, constant.MESH_LIGHT_SYSC_COLOR))
      }
      if (self.data.eventC.length > 0 && self.data.deviceC.length > 0) {
        var item = self.data.eventC[0];
        events.push(util.setModelEvent(item.name, self.data.deviceC, item.eventCid, item.subCid, item.h, item.s, item.b, item.flag, item.eventType, constant.MULTIPLE_GROUP, item.execCid, true, item.defaultValue, constant.MESH_LIGHT_SYSC_COLOR_2))
      }
      if (self.data.deviceC.length > 0) {
        var cid = self.data.btnValues.downleft;
        events.push(util.setModelEvent("SWITCH_" + cid, self.data.deviceC, cid, constant.STATUS_CID, 0, 0, 0, true, 1, constant.MULTIPLE_GROUP, 0, false, 2, constant.MESH_LIGHT_SYSC_COLOR))
      }
      if (self.data.eventD.length > 0 && self.data.deviceD.length > 0) {
        var item = self.data.eventD[0];
        events.push(util.setModelEvent(item.name, self.data.deviceD, item.eventCid, item.subCid, item.h, item.s, item.b, item.flag, item.eventType, constant.MULTIPLE_GROUP, item.execCid, true, item.defaultValue, constant.MESH_LIGHT_SYSC_COLOR_2))
      }
      if (self.data.deviceD.length > 0) {
        var cid = self.btnValues.downright;
        events.push(util.setModelEvent("SWITCH_" + cid, self.data.deviceD, cid, constant.STATUS_CID, 0, 0, 0, true, 1, constant.MULTIPLE_GROUP, 0, false, 2, constant.MESH_LIGHT_SYSC_COLOR))
      }
    } else {
      var eventList = self.data.eventA.concat(self.data.eventB, self.data.eventC, self.data.eventD);
      for (var i in eventList) {
        var item = eventList[i];
        events.push(util.setModelEvent(item.name, self.data.selectMacs, item.eventCid, item.subCid, item.h, item.s, item.b, item.flag, item.eventType, constant.SINGLE_GROUP,item.execCid, false, item.defaultValue, constant.MESH_LIGHT_SYSC_COLOR))
      }
      var longEvents = self.data.eventUp.concat(self.data.eventDown);
      for (var i in longEvents) {
        var item = longEvents[i];
        events.push(util._assemblyLongEvent(item.leftName + item.leftCid, item.leftCid, self.data.selectMacs, constant.MESH_LIGHT_SYSC_COLOR_2, item.eventType, constant.SINGLE_GROUP, true, item.leftValue));
        events.push(util._assemblyLongEvent("STOP_" + item.leftCid, item.leftCid, self.data.selectMacs, constant.MESH_LIGHT_SYSC_COLOR_3, item.eventType, constant.SINGLE_GROUP, true, 0));
        events.push(util._assemblyLongEvent(item.rightName + item.rightCid, item.rightCid, self.data.selectMacs, constant.MESH_LIGHT_SYSC_COLOR_2, item.eventType, constant.SINGLE_GROUP, true, item.rightValue));
        events.push(util._assemblyLongEvent("STOP_" + item.rightCid, item.rightCid, self.data.selectMacs, constant.MESH_LIGHT_SYSC_COLOR_3, item.eventType, constant.SINGLE_GROUP, true, 0));
      };
    }
    self.delEvent(events);
  },
  delEvent: function (events) {
    const self = this;
    var eventNames = [];
    for (var i in self.data.events) {
      var name = self.data.events[i].name;
      if (eventNames.indexOf(name) == -1) {
        eventNames.push({ name: name });
      }
    };
    self.setData({
      newEvents: events
    })
    if (eventNames.length > 0) {
      var macs = [self.data.device.mac]
      var data = JSON.stringify({"request":constant.REMOVE_EVENT,"events": eventNames});
      util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, self.data.device.ip, false, self.delSuc, "");
    } else {
      util._addRequestEvent(self.data.device.mac, events, self.data.device.ip);
      self.reLaunchIndex();
    }
  },
  delSuc: function() {
    util._addRequestEvent(this.data.device.mac, this.data.newEvents, this.data.device.ip);
    this.reLaunchIndex();
  },
  selectBtn: function(e) {
    const self = this;
    if (self.data.isMuch) {
      var cid = e.currentTarget.dataset.cid,
        macs = [];
      if (cid == self.data.btnValues.upleft) {
        macs = self.data.deviceA;
      } else if (cid == self.data.btnValues.upright) {
        macs = self.data.deviceB;
      } else if (cid == self.data.btnValues.downleft) {
        macs = self.data.deviceC;
      } else if (cid == self.data.btnValues.downright) {
        macs = self.data.deviceD;
      }
      wx.navigateTo({
        url: '/pages/btnSelectDevice/btnSelectDevice?cid=' + cid + '&macs=' + JSON.stringify(macs)
      })
    }
  },
  reLaunchIndex: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var isMuch = options.isMuch,
      events = wx.getStorageSync("btn_select");
    if (isMuch == "true") {
      isMuch = true;
    } else {
      isMuch = false;
    }
    console.log(options);
    this.setData({
      events: events,
      device: JSON.parse(options.device),
      selectMacs: JSON.parse(options.macs),
      isMuch: isMuch
    })
    util.showLoading("");
    wx.setNavigationBarTitle({
      title: this.data.device.name
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const self = this;
    var coordinate = this.data.coordinate;
    this.getCoordinate(coordinate, "a", "#btn-content-A");
    this.getCoordinate(coordinate, "b", "#btn-content-B");
    this.getCoordinate(coordinate, "c", "#btn-content-C");
    this.getCoordinate(coordinate, "d", "#btn-content-D");
    this.getCoordinate(coordinate, "ab", "#btn-top-AB");
    this.getCoordinate(coordinate, "cd", "#btn-bottom-CD"); 
    setTimeout(function() {
      self.getEvent();
    }, 500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(this.data.deviceA);
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