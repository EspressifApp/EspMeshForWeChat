// pages/operateDevice/operateDevice.js
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "colorPicker",
    sliderId: "colorSlider",
    colorId: "colorLPicker",
    sliderColorId: "colorLSlider",
    isColor: true,
    device: "",
    canvasW: 0,
    sliderLeft: 0,
    brightness: 0,
    coldValue: 0,
    temValue: 0,
    context: "",
    context1: "",
    context2: "",
    context3: "",
    colorIndex: -1,
    isGroup: false,
    isActive: false,
    group: [],
    list: [],
    colorList: [{ color: "#ff0200", name: "红色" }, { color: "#ff8000", name: "橙色" }, { color: "#ff0", name: "黄色" }, { color: "#00ff03", name: "绿色" }, { color: "#0ff", name: "青色" }, { color: "#0003ff", name: "蓝色" }, { color: "#f0f", name: "紫色" }],
    coldList: [{ color: "#808080", name: "10%", value: 10 }, { color: "#919191", name: "20%", value: 20 }, { color: "#9f9f9f", name: "30%", value: 30 }, { color: "#bababa", name: "40%", value: 40 }, { color: "#c3c3c3", name: "50%", value: 50 }, { color: "#d6d6d6", name: "70%", value: 70 }, { color: "#e3e3e3", name: "100%", value: 100 }],
    color: "#f00",
    rgbs: [0, 0, 0],
    
  },
  changPicker: function() {
    const self = this;
    var isColor = !self.data.isColor,
      list = [];
    if (isColor) {
      list = self.data.colorList;
    } else {
      list = self.data.coldList;
    }
    self.setData({
      isColor: isColor,
      list: list,
      colorIndex: -1,
    });
    self.initCanvas();
  },
  selectColor: function(event) {
    const self = this,
      index = event.currentTarget.dataset.index,
      color = self.data.list[index].color;
    var num = 0;
    var arr = self.hex2rgb(color.slice(1));
    if (self.data.isColor) {
      self.setData({
        rgbs: arr,
        color: "rgba(" + arr[0] + ", " + arr[1] + ", " + arr[2] + ", " + (self.data.brightness / 100) + ")"
      });
    } else {
      num = self.data.list[index].value
    }
    self.setData({
      colorIndex: index,
    })
    self.setColor(arr, num, true);
  },
  initColor: function() {
    const self = this;
    var h = 0, s = 0, v = 0, t = 0, b = 0;
    if (!self.data.isGroup) {
      var device = self.data.device,
        characteristics = device.characteristics;
      for (var i in characteristics) {
        var subItem = characteristics[i];
        if (subItem.cid == constant.HUE_CID) {
          h = subItem.value;
        } else if (subItem.cid == constant.SATURATION_CID) {
          s = subItem.value;
        } else if (subItem.cid == constant.VALUE_CID) {
          v = subItem.value;
        } else if (subItem.cid == constant.TEMPERATURE_CID) {
          t = subItem.value;
        } else if (subItem.cid == constant.BRIGHTNESS_CID) {
          b = subItem.value;
        }
      }
    } else {
      s = 100;
      v = 50;
      b = 50;
    }
    var rgb = self.hsvToRgb(h , s, 100);
    self.setColor(rgb, t, false);
    self.setLColor(v, b);
    self.setData({
      rgbs: [rgb[0], rgb[1], rgb[2]],
      brightness: v,
      temValue: t,
      coldValue: b,
      color: "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + (v / 100) + ")"
    });
  },
  setDeviceColor: function() {
    const self = this;
    setTimeout(function() {
      if(self.data.isColor) {
        var rgbs = self.data.rgbs,
          hsv = self.rgbToHsv(rgbs[0], rgbs[1], rgbs[2]);
        self.setDevice(hsv[0], hsv[1]);
      } else {
        self.setDeviceStatus([{ cid: constant.TEMPERATURE_CID, value: self.data.temValue }, { cid: constant.BRIGHTNESS_CID, value: self.data.coldValue }]);
      }
    }, 200)
    
   
  },
  setDeviceLColor: function() {
    const self = this;
    var cid = 0, value = 0,
      characteristics = [];
    setTimeout(function() {
      if (self.data.isColor) {
        characteristics = [{ cid: constant.VALUE_CID, value: self.data.brightness }];
        self.setData({
          color: "rgba(" + self.data.rgbs[0] + ", " + self.data.rgbs[1] + ", " + self.data.rgbs[2] + ", " + (self.data.brightness / 100) + ")"
        })
      } else {
        characteristics = [{ cid: constant.TEMPERATURE_CID, value: self.data.temValue }, { cid: constant.BRIGHTNESS_CID, value: self.data.coldValue }];
      }
      self.setDeviceStatus(characteristics);
    }, 200)
    
  },
  setDeviceStatus: function (characteristics) {
    if (this.data.isGroup) {
      var group = this.data.group,
        rootMacs = group.rootMacs,
        rootInfo = group.rootInfo;
      for (var i in rootMacs) {
        var rootMac = rootMacs[i],
          obj = rootInfo["'" + rootMac + "'"];
        util.setListLColor(obj.macs, characteristics, obj.ip);
      }
    } else {
      var device = util.setLColor(this.data.device, characteristics);
      this.setData({
        device: device,
      })
      this.setList(device);
    }
    
  },
  setDevice: function(h, s) {
    if (this.data.isGroup) {
      var group = this.data.group,
        rootMacs = group.rootMacs,
        rootInfo = group.rootInfo;
      for (var i in rootMacs) {
        var rootMac = rootMacs[i],
          obj = rootInfo["'" + rootMac + "'"];
        util.setListColor(obj.macs, h, s, obj.ip);
      }
    } else {
      var device = util.setColor(this.data.device, h, s);
      this.setData({
        device: device
      })
      this.setList(device);
    }
    this.setData({
      isActive: true
    })
  },
  setColor: function (arr, value, flag) {
    const self = this;
    var r = arr[0], g = arr[1], b = arr[2],
      r1 = r - 5, r2 = r + 5, g1 = g - 5,
      g2 = g + 5, b1 = b - 5, b2 = b + 5,
      color = "rgb(" + r + "," + g + "," + b + ")";
    var hsv = self.rgbToHsv(r, g, b);
    if (self.data.isColor) {
      if (flag) {
        this.setDevice(hsv[0], hsv[1]);
      }
      wx.canvasGetImageData({
        canvasId: self.data.id,
        x: 0,
        y: 10,
        width: self.data.canvasW,
        height: 1,
        success(res) {
          var data = res.data.join().split(",");
          data = self.sliceArr(data, 4);
          for (var i in data) {
            var rc = parseInt(data[i][0]),
              gc = parseInt(data[i][1]),
              bc = parseInt(data[i][2]);
            if (rc >= r1 && rc <= r2 && gc >= g1 && gc <= g2 && bc >= b1 && bc <= b2) {
              self.setCanvasBar(self.data.context1, (parseInt(i) + 13));
              return false;
            }
          }
        },
        fail: function (res) {
          console.log(res);
        }
      })
    } else {
      if (flag) {
        const self = this;
        self.setDeviceStatus([{ cid: constant.TEMPERATURE_CID, value: value }, { cid: constant.BRIGHTNESS_CID, value: self.data.coldValue }]);
      }
      value = Math.round(value * self.data.canvasW / 100);
      self.setCanvasBar(self.data.context1, (parseInt(value) + 13));
    }
    
  },
  setLColor: function (v, b) {
    const self = this;
    var value = 0;
    if (self.data.isColor) {
      value = v;
    } else {
      value = b;
    }
    value = Math.round(value * self.data.canvasW / 100);
    self.setCanvasBar(self.data.context3, (parseInt(value) + 13));
  },
  sliceArr: function (array, size) {
    var result = [];
    for(var x = 0; x < Math.ceil(array.length / size); x++){
      var start = x * size;
      var end = start + size;
      result.push(array.slice(start, end));
    }
    return result;
  },
  getColor: function (event) {
    var self = this,
      x = event.touches[0].x;
    if (x <= 13) {
      x = 13;
    } else if (x >= (self.data.canvasW + 12)) {
      x = self.data.canvasW + 12;
    }
    wx.canvasGetImageData({
      canvasId: self.data.id,
      x: x - 13,
      y: 10,
      width: 1,
      height: 1,
      success(res) {
        if (self.data.isColor) {
          var r = res.data[0],
            g = res.data[1],
            b = res.data[2],
            rgbs = [r, g, b];
          self.setData({
            color: "rgba(" + r + ", " + g + ", " + b + "," + (self.data.brightness / 100) + ")",
            rgbs: rgbs
          })
        } else {
          var temValue = Math.round((x - 13) / self.data.canvasW * 100); 
          self.setData({
            temValue: temValue
          })
        }
        self.setCanvasBar(self.data.context1, x);
      }
    })
  },
  getLColor: function (event) {
    var self = this,
      x = event.touches[0].x;
    if (x <= 13) {
      x = 13;
    } else if (x >= (self.data.canvasW + 12)) {
      x = self.data.canvasW + 12;
    }
    wx.canvasGetImageData({
      canvasId: self.data.colorId,
      x: x - 13,
      y: 10,
      width: 1,
      height: 1,
      success(res) {
        self.setCanvasBar(self.data.context3, x);
        var brightness = Math.round((x - 13) / self.data.canvasW * 100);
        console.log(brightness);
        if (brightness < 5) {
          brightness = 5;
        }
        if (self.data.isColor) {
          self.setData({
            brightness: brightness,
            color: "rgba(" + self.data.rgbs[0] + ", " + self.data.rgbs[1] + ", " + self.data.rgbs[2] + "," + (brightness / 100) + ")",
          })
        } else {
          self.setData({
            coldValue: brightness,
          })
        }
      }
    })
  },
  setCanvasBar: function (context, x) {
    context.arc(x, 14, 12, 0, 2 * Math.PI, true);
    context.shadowBlur = 0.5;
    context.shadowColor = "#000";
    context.fillStyle = "#fff";
    context.fill();
    context.draw();
  },
  closeDevice: function (event) {
    this.setSatus(0, 0);
    this.setData({
      isActive: false
    })
  },
  openDevice: function (event) {
    this.setSatus(1, 1);
    this.setData({
      isActive: true
    })
  },
  setSatus: function (deviceStatus, status) {
    const self = this;
    if (self.data.isGroup) {
      var group = self.data.group,
        rootMacs = group.rootMacs,
        rootInfo = group.rootInfo;
      for (var i in rootMacs) {
        var rootMac = rootMacs[i],
          obj = rootInfo["'" + rootMac + "'"];
        util.setListStatus(obj.macs, status, obj.ip);
      }
    } else {
      var device = util.setStatus(self.data.device, deviceStatus, status);
      self.setData({
        device: device
      })
      self.setList(device);
    }
    
  },
  setList: function(device) {
    var list = wx.getStorageSync(constant.DEVICE_LIST);
    for (var i in list) {
      var item = list[i];
      if (item.mac == device.mac) {
        list.splice(i, 1, device);
        break;
      }
    }
    util.setStorage(constant.DEVICE_LIST, list);
  },
  initCanvas: function() {
    var self = this,
      width = 0;
    var context = wx.createCanvasContext(self.data.id);
    var context1 = wx.createCanvasContext(self.data.sliderId);
    var context2 = wx.createCanvasContext(self.data.colorId);
    var context3 = wx.createCanvasContext(self.data.sliderColorId);
    context.beginPath();
    context1.beginPath();
    context2.beginPath();
    context3.beginPath();
    var query = wx.createSelectorQuery();
    //选择id
    wx.createSelectorQuery().select('#' + self.data.id).fields({
      size: true,
    }, function (res) {
      width = res.width;
      self.setData({
        canvasW: width
      })
      var gradientBar = context.createLinearGradient(0, 10, width, 10);
      if (self.data.isColor) {
        gradientBar.addColorStop(0, '#ff0000');
        gradientBar.addColorStop(1 / 6, '#ffff00');
        gradientBar.addColorStop(2 / 6, '#00ff00');
        gradientBar.addColorStop(3 / 6, '#00ffff');
        gradientBar.addColorStop(4 / 6, '#0000ff');
        gradientBar.addColorStop(5 / 6, '#ff00ff');
        gradientBar.addColorStop(1, '#f00');
      } else {
        gradientBar.addColorStop(0, '#f8cf6d');
        gradientBar.addColorStop(1 / 2, '#ffffff');
        gradientBar.addColorStop(1, '#a4d5ff');
      }
      context.fillStyle = gradientBar;
      context.fillRect(0, 10, width, 10);
      context.draw();
      self.setCanvasBar(self.data.context1, 13);
      var gradientBar = context2.createLinearGradient(0, 10, width, 10);
      gradientBar.addColorStop(0, '#000');
      gradientBar.addColorStop(1, '#fff');
      context2.fillStyle = gradientBar;
      context2.fillRect(0, 10, width, 10);
      context2.draw();
      self.setCanvasBar(self.data.context3, 13);
      self.initColor();
    }).exec()
    self.setData({
      context: context,
      context1: context1,
      context2: context2,
      context3: context3
    })
  },
  hex2rgb: function (hex) {
    if (hex.length == 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [
      parseInt(hex[0] + hex[1], 16),
      parseInt(hex[2] + hex[3], 16),
      parseInt(hex[4] + hex[5], 16),
    ];
  },
  rgbToHsv: function (r, g, b){
    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  },
  hsvToRgb: function (h, s, v){
    h = h / 360, s = s / 100, v = v / 100;
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    var flag = options.flag;
    if (flag == "true") {
      flag = true;
      var group = JSON.parse(options.group);
      this.setData({
        group: group,
        isGroup: flag,
        isActive: group.active
      })
      wx.setNavigationBarTitle({
        title: self.data.group.name
      });
    } else {
      flag = false;
      var device = JSON.parse(options.device);
      this.setData({
        device: device,
        isGroup: flag,
        isActive: device.active
      })
      wx.setNavigationBarTitle({
        title: self.data.device.name
      });
    }
    // this.createRound();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    self.setData({
      list: self.data.colorList
    })
    setTimeout(function() {
      self.initCanvas();
    }, 800)
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