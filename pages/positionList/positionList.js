// pages/positionList/positionList.js
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAddPosition: false,
    positionList: [],
    delMac: "",
    delIndex: -1,
    startX: 0, //开始坐标
    startY: 0,
    isMove: false
  },
  addPostion: function() {
    this.removeDelBtn();
    this.showPosition("");
  },
  showPosition: function (position) {
    wx.navigateTo({
      url: "/pages/setPosition/setPosition?position=" + position + "&device=''" + "&flag=false"
    })
    
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    var isMove = false;
    this.data.positionList.forEach(function (v, i) {
      if (v.isTouchMove){//只操作为true的
        v.isTouchMove = false;
        isMove = true;
      }
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      positionList: this.data.positionList,
      isMove: isMove
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var self = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = self.data.startX,//开始X坐标
      startY = self.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      isMove = self.data.isMove,
      //获取滑动角度
      angle = self.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    self.data.positionList.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30){
        return;
      } 
      if (i == index) {
        if (touchMoveX > startX){ //右滑
          v.isTouchMove = false
        } else {//左滑
          v.isTouchMove = true;
          isMove = true;
        }
      }
    })
    //更新数据
    self.setData({
      positionList: self.data.positionList,
      isMove: isMove
    })
  },
  touchend: function (event) {
    const self = this;
    var list = self.data.positionList,
      index = event.currentTarget.dataset.index,
      position = list[index];
    console.log(position.isTouchMove);
    console.log(self.data.isMove);
    if (!position.isTouchMove && !self.data.isMove) {
      self.showPosition(JSON.stringify(position));
    }
  },
  /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    const self = this;
    self.setData({
      delMac: "",
      delIndex: -1
    })
    wx.showModal({
      title: '删除',
      confirmColor: "#3ec2fc",
      content: '确定要删除配对信息吗?',
      success(res) {
        if (res.confirm) {
          var positionList = self.data.positionList,
            deviceList = wx.getStorageSync(constant.DEVICE_LIST),
            index = e.currentTarget.dataset.index,
            position = positionList[index];
          util.showLoading("");
          var isDevice = false;
          for (var i in deviceList) {
            var item = deviceList[i];
            if (item.mac == position.mac) {
              isDevice = true;
              var data = '{"request": "' + constant.SET_POSITION + '",' + '"position":""}}';
              var macs = [item.mac];
              util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, item.ip, true, self.setSuc, "删除失败", true);
              break;
            }
          }
          self.setData({
            delMac: position.mac,
            delIndex: index
          })
          if (!isDevice) {
            self.removePosition(positionList, index);
          }
        }
      }
    })
  },
  setSuc: function() {
    const self = this;
    var list = wx.getStorageSync(constant.DEVICE_LIST);
    for (var i in list) {
      var item = list[i];
      if (item.mac == self.data.delMac) {
        item.position = "";
        list.splice(i, 1, item);
        break;
      }
    }
    util.setStorage(constant.DEVICE_LIST, list);
    self.removePosition(self.data.positionList, self.data.delIndex);
  },
  removePosition: function (positionList, index) {
    positionList.splice(index, 1);
    this.setData({
      positionList: positionList
    })
    util.setStorage(constant.POSITION_LIST, positionList)
    setTimeout(function () {
      wx.hideLoading();
    }, 500)
  },
  removeDelBtn: function () {
    var positionList = this.data.positionList;
    positionList.forEach(function (v, i) {
      if (v.isTouchMove) {//只操作为true的
        v.isTouchMove = false;
      }
    })
    this.setData({
      positionList: positionList
    })
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
    var positionList = wx.getStorageSync(constant.POSITION_LIST),
      showAddPosition = false;
    if (positionList.length == 0) {
      showAddPosition = true;
    }
    for (var i in positionList) {
      var item = positionList[i];
      item.isTouchMove = false;
      item.position = item.floor + "-" + item.area + "-" +  item.code;
      positionList.splice(i, 1, item);
    }
    positionList = util.sortList(positionList);
    this.setData({
      positionList: positionList,
      showAddPosition: showAddPosition
    })
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