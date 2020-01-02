const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
var context = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 0,
    width: 0,
    platform: "ios",
    isOne: false,
    group: [],
    device: "",
    isGroup: false,
    pixelRatio: 1,
    color: "rgba(255, 255, 255, 1)",
    pickerShow: true,
    currentHue: 360,
    currentSaturation: 100,
    currentLuminance: 100,
    currentTemperature: 50,
    currentBrightness: 70,
    currentSaturationText: 100,
    currentLuminanceText: 100,
    currentTemperatureText: 50,
    currentBrightnessText: 70,
    boxShadow: "none",
    borderColor: "",
    currentStatus: false
  },
  initColor: function () {
    const self = this;
    var h = 0, s = 100, v = 100, t = 0, b = 100;
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

    }
    var rgb = self.hsvToRgb(h / 360, s / 100, 1);
    self.setData({
      currentHue: h,
      currentSaturation: s,
      currentLuminance: v,
      currentTemperature: t,
      currentBrightness: b,
      currentSaturationText: s,
      currentLuminanceText: v,
      currentTemperatureText: t,
      currentBrightnessText: b,
      color: "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + (v / 100) + ")"
    });
  },
  getColor: function (event) {
    console.log(event);
    var self = this,
      x = event.touches[0].x,
      y = event.touches[0].y;
    wx.canvasGetImageData({
      canvasId: "firstCanvas",
      x: x,
      y: y,
      width: 1,
      height: 1,
      success(res) {
        var r = res.data[0],
          g = res.data[1],
          b = res.data[2];
        console.log(r, g, b);
        if ((r == 0 && g == 0 && b == 0) || (r == 18 && g == 21 && b == 30)) {
          return false;
        } else {
          self.setData({
            color: "rgba(" + r + ", " + g + ", " + b + ", "+ self.data.currentLuminanceText / 100+")",
            currentSaturationText: 100,
            currentSaturation: 100,
            currentHue: self.rgbToHsv(r, g, b)
          })
          self.setDeviceStatus([{ cid: constant.HUE_CID, value: self.data.currentHue }, { cid: constant.SATURATION_CID, value: 100}]);
        }

      }
    })
  },
  closeDevice: function() {
    const self= this;
    var status = 0;
    if (!self.data.currentStatus) {
      status = 1;
    }
    self.setData({
      currentStatus: !self.data.currentStatus
    })
    console.log(self.data.currentStatus);
    self.setSatus(status, status);
    if (!self.data.isOne) {
      self.initColor();
      self.setData({
        isOne: true
      })
    }
    
  },
  showPicker: function () {
    const self = this;
    if (self.data.currentStatus && !self.data.pickerShow) {
      self.setData({
        pickerShow: true,
        currentSaturation: self.data.currentSaturationText,
        currentLuminance: self.data.currentLuminanceText
      })
      self.setBgColor(self.data.currentHue, self.data.currentSaturationText, 100, self.data.currentLuminanceText);
    }
  },
  hidePicker: function () {
    const self = this;
    if (self.data.currentStatus && self.data.pickerShow) {
      self.setData({
        pickerShow: false
      })
      self.initWarmCold(self.data.currentTemperature, this.data.currentBrightness);
    }
  },
  editDeviceL: function(e) {
    const slef = this;
    setTimeout(function() {
      slef.changeDeviceL(e);
      slef.setDeviceStatus([{ cid: constant.VALUE_CID, value: e.detail.value }]);
    }, 200)
    
  },
  changeDeviceL: function (e) {
    this.setData({
      currentLuminanceText: e.detail.value
    })
    this.setBgColor(this.data.currentHue, this.data.currentSaturationText, 100, e.detail.value);
  },
  editDeviceS: function (e) {
    const slef = this;
    setTimeout(function () {
      slef.changeDeviceS(e);
      slef.setDeviceStatus([{ cid: constant.SATURATION_CID, value: e.detail.value }]);
    }, 200)
  },
  changeDeviceS: function (e) {
    this.setData({
      currentSaturationText: e.detail.value
    })
    this.setBgColor(this.data.currentHue, e.detail.value, 100, this.data.currentLuminanceText);
  },
  editDeviceB: function (e) {
    const slef = this;
    setTimeout(function () {
      slef.changeDeviceB(e);
      slef.setDeviceStatus([{ cid: constant.BRIGHTNESS_CID, value: e.detail.value }]);
    }, 200)
  },
  changeDeviceB: function (e) {
    this.setData({
      currentBrightnessText: e.detail.value
    })
    this.initWarmCold(this.data.currentTemperatureText, e.detail.value);

  },
  editDeviceT: function (e) {
    const slef = this;
    setTimeout(function () {
      slef.changeDeviceT(e);
      slef.setDeviceStatus([{ cid: constant.TEMPERATURE_CID, value: e.detail.value }]);
    }, 200)
  },
  changeDeviceT: function (e) {
    this.setData({
      currentTemperatureText: e.detail.value
    })
    this.initWarmCold(e.detail.value, this.data.currentBrightnessText);
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
  setList: function (device) {
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
  setBgColor: function (h, s, b, p) {
    h = h / 360;
    s = s / 100;
    b = b / 100;
    console.log(h, s, b, p);
    var rgb = this.hsvToRgb(h, s, b);
    console.log(rgb);
    this.setData({
      color: "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + p / 100 + ")",
      boxShadow: "none"
    })
  },
  initWarmCold: function (currentTemperature, currentBrightness) {
    var r1 = 248,
      g1 = 207,
      b1 = 109,
      r2 = 255,
      g2 = 255,
      b2 = 255,
      r3 = 164,
      g3 = 213,
      b3 = 255,
      r = 0,
      g = 0,
      b = 0;
    if (currentTemperature <= 50) {
      var percentage = currentTemperature / 100 * 2;
      r = Math.floor((r2 - r1) * percentage) + r1;
      g = Math.floor((g2 - g1) * percentage) + g1;
      b = Math.floor((b2 - b1) * percentage) + b1;
    } else {
      var percentage = (currentTemperature - 50) / 100 * 2;
      r = r2 - Math.floor((r2 - r3) * percentage);
      g = g2 - Math.floor((g2 - g3) * percentage);
      b = b2 - Math.floor((b2 - b3) * percentage);
    }
    var rgba = "rgba(" + r + "," + g + "," + b + "," + (currentBrightness / 100) + ")";
    console.log(rgba);
    this.setData({
      color: rgba,
      boxShadow: "0px 0px " + Math.floor((currentBrightness * 1.1)) + "px " + rgba
    })
    console.log(this.data.boxShadow);
  },
  hsvToRgb: function (h, s, v) {
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
  rgbToHsv: function (r, g, b) {
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

    return Math.round(h * 360);
  },
  createCanvas: function () {
    const self = this;
    var width = Math.floor(self.data.width * 0.7),
      height = width,
      cx = width / 2,
        cy = height / 2,
        radius = width / 2.3,
        imageData,
        pixels,
        hue, sat, value,
        i = 0, x, y, rx, ry, d,
      f, g, p, u, v, w, rgb;
    wx.canvasGetImageData({
      canvasId: 'firstCanvas',
      x: 0,
      y: 0,
      width: width,
      height: height,
      success(res) {
        var pixels = res.data;
        for (y = 0; y < height; y++) {
          for (x = 0; x < width; x++ , i = i + 4) {
            rx = x - cx;
            ry = y - cy;
            d = rx * rx + ry * ry;
            if (d < radius * radius) {
              hue = 6 * (Math.atan2(ry, rx) + Math.PI) / (2 * Math.PI);
              sat = Math.sqrt(d) / radius;
              g = Math.floor(hue);
              f = hue - g;
              u = 255 * (1 - sat);
              v = 255 * (1 - sat * f);
              w = 255 * (1 - sat * (1 - f));
              pixels[i] = [255, v, u, u, w, 255, 255][g];
              pixels[i + 1] = [w, 255, 255, v, u, u, w][g];
              pixels[i + 2] = [u, u, w, 255, 255, v, u][g];
              pixels[i + 3] = 255;
            }
          }
        }
        wx.canvasPutImageData({
          canvasId: 'firstCanvas',
          x: 0,
          y: 0,
          width: width,
          height: height,
          data: pixels,
          success(res) {
            setTimeout(function() {
              context.beginPath();
              context.arc(cx, cy, radius * 0.6, 0, 2 * Math.PI);
              context.fillStyle = "#12151e";
              context.fill();
              context.stroke();
              context.draw(true);
              context.beginPath();
              context.arc(cx, cy, radius, 0, 2 * Math.PI);
              context.strokeStyle = "#12151e";
              context.lineWidth = 5;
              context.stroke();
              context.draw(true);
            })
            
          },
          fail(res) {
          }
        }, self)
      }
    })
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        self.setData({
          width: res.windowWidth,
          height: res.windowHeight,
          pixelRatio: res.pixelRatio,
          platform: res.platform,
        })
      },
    })
    const eventChannel = self.getOpenerEventChannel()
    var flag = options.flag;
    if (flag == "true") {
      flag = true;
      eventChannel.on('acceptData', function (data) {
        var group = data.data;
        self.setData({
          group: group,
          isGroup: flag,
          currentStatus: group.active,
          isOne: group.active,
        })
        wx.setNavigationBarTitle({
          title: self.data.group.name
        });
      })
      
    } else {
      flag = false;
      eventChannel.on('acceptData', function (data) {
        var device = data.data;
        console.log(device)
        self.setData({
          device: device,
          isGroup: flag,
          currentStatus: device.active,
          isOne: device.active,
        })
        wx.setNavigationBarTitle({
          title: self.data.device.name
        });
      })
      
    }
    self.initColor();
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
    setTimeout(function () {
      context = wx.createCanvasContext('firstCanvas', self);
      self.createCanvas();
    }, 800)
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