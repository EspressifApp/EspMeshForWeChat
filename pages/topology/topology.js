// pages/topology/topology.js
import * as echarts from '../../ec-canvas/echarts';

const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
var chart = "";
var debugList = [];
function initChart(canvas, width, height) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  var option = {
    series: [{
      type: 'tree',
      initialTreeDepth: 15,
      data: [],

      top: '15%',
      left: '5%',
      bottom: '15%',
      right: '5%',

      symbolSize: 22,
      orient: 'vertical',
      itemStyle: {
        normal: {
          borderColor: "#44B2F8"
        }
      },
      label: {
        normal: {
          position: 'top',
          rotate: -90,
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 13,
        }
      },
      lineStyle: {
        normal: {

        }
      },
      leaves: {
        label: {
          normal: {
            position: 'top',
            rotate: -90,
            verticalAlign: 'middle',
            align: 'right'
          }
        }
      },
    }]
  };

  chart.setOption(option);
  var timeOutEvent = "";
  chart.on("mousedown", function (params) {
    timeOutEvent = setTimeout(function () {
      var topologyInfo = "";
      for (var i in debugList) {
        var item = debugList[i];
        if (item.mac == params.data.id) {
          topologyInfo = item;
          break;
        }
      }
      wx.navigateTo({
        url: '/pages/topologyInfo/topologyInfo?topologyInfo=' + JSON.stringify(topologyInfo)
      });
    }, 1000);
  })
  chart.on("mouseup", function (params) {
    clearTimeout(timeOutEvent);//清除定时器
    timeOutEvent = "";
  });
  return chart;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      onInit: initChart
    },
    deviceList: [],
    titleList: [],
    rootData: [],
    selected: "",
  },
  getData: function() {
    const self = this;
    var list = wx.getStorageSync(constant.DEVICE_LIST),
      macObjList = [], rootMacList = [];
    if (!util._isEmpty(list) && list.length > 0) {
      self.setData({
        deviceList: list
      })
      list.forEach(function(item) {
        var mac = item.mac,
          rootMac = item.rootMac;
        if (rootMacList.indexOf(rootMac) == -1) {
          rootMacList.push(rootMac);
          macObjList["'" + rootMac + "'"] = { "ip": item.ip, "macs": [] }
        }
        macObjList["'" + rootMac + "'"].macs.push(item.mac);
      })
      var data = JSON.stringify({ "request": constant.GET_MESH})
      for (var i in rootMacList) {
        var rootMac = rootMacList[i],
          macObj = macObjList["'" + rootMac + "'"];
        util.setRequest(constant.DEVICE_REQUEST, data, macObj.macs.join(), macObj.macs.length, macObj.ip, false, self.getDataSuc, "", true);
      }
      
    } else {
      wx.hideLoading();
    }
  },
  getDataSuc: function(res) {
    var list = [];
    if (typeof res == "object") {
      list.push(res);
    } else {
      res = res.split("Content-Type: application/json");
      res.splice(0, 1);
      for (var i in res) {
        list.push(util.analysis(res[i]));
      }
    }
    debugList = list
    this.getInitData();
  },
  getInitData: function () {
    const self = this;
    var layer = 0, rootItem = [], list = [];
    debugList.forEach(function (item) {
      if (item.layer > layer) {
        layer = item.layer;
      }
    });
    for (var i = layer; i > 0; i--) {
      var parentItem = [];
      debugList.forEach(function (item) {
        var chids = [];
        if (item.layer == i) {
          debugList.forEach(function (itemSub) {
            if (itemSub.parent_mac == item.mac) {
              var flagRes = true;
              for(var j = 0; j < list.length; j++) {
                var itemThr = list[j];
                if(itemThr.mac == itemSub.mac) {
                  chids.push(itemThr);
                  flagRes = false;
                  break;
                }
              }
              if (flagRes) {
                chids.push({
                  id: itemSub.mac, meshId: itemSub.id, name: self.getName(itemSub.mac),
                  label: { color: self.getColor(itemSub.mac) }, mac: itemSub.mac, children: []
                })
              }

            }
          })
          parentItem.push({
            id: item.mac, meshId: item.id, name: self.getName(item.mac),
            label: { color: self.getColor(item.mac) }, mac: item.mac, children: chids
          });
        }
      });

      if (i == 1) {
        rootItem = parentItem;
      } else {
        list = parentItem;
      }
    }
    var titleList = [];
    rootItem.forEach(function(item) {
      if (titleList.indexOf(item.meshId) == -1) {
        titleList.push(item.meshId);
      }
    })
    console.log(rootItem);
    if (titleList.length > 1 && util._isEmpty(self.data.selected)) {
      self.data.selected = titleList[0];
      self.getChartData(rootItem, self.data.selected);
    } else {
      self.getChartData(rootItem, "");
    }
    wx.hideLoading();
    self.setData({
      rootData: rootItem,
      selected: self.data.selected
    })
  },
  selectMeshId: function(e) {
    var id = e.currentTarget.dataset.value;
    this.setData({
      selected: id
    })
    this.getChartData(this.data.rootData, id);
  },
  getChartData: function (rootData, selected) {
    var self = this, objList = [];
    if (!util._isEmpty(selected)) {
      rootData.forEach(function (item) {
        if (item.meshId == selected) {
          objList.push(item);
        }
      })
    } else {
      objList = rootData;
    }
    
    chart.setOption({
      series: [
        {
          data: objList
        }
      ]
    })
  },
  getColor: function (mac) {
    return "#666";
  },
  getName: function (mac) {
    const self = this;
    var name = "", deviceList = self.data.deviceList;
    for (var i in deviceList) {
      var item = deviceList[i];
      if (item.mac == mac) {
        if (!util._isEmpty(item.position)) {
          name = item.position;
        } else {
          name = item.name;
        }
        break;
      }
    }
    return name;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.showLoading("");
    wx.setNavigationBarTitle({
      title: '拓扑结构'
    });
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
    if (debugList.length > 0) {
      self.getChartData(self.data.rootData, self.data.selected);
    } else {
      setTimeout(function () {
        self.getData();
      }, 1000)
    }
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
    debugList = [];
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