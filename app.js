//app.js
App({
  data: {
    service_uuid: "0000FFFF-0000-1000-8000-00805F9B34FB",
    characteristic_write_uuid: "0000FF01-0000-1000-8000-00805F9B34FB",
    characteristic_read_uuid: "0000FF02-0000-1000-8000-00805F9B34FB",
    name: "BLUFI",
    md5Key: "",
    isInit: 1,
    rssi: -100,
    ip: "",
    port: "",
  },
  onLaunch: function () {
    wx.removeStorageSync('deviceList');
    this.getUserInfo();
  },
  getUserInfo: function () {
    const self = this;
    wx.getUserInfo({
      success(res) {
        console.log(res);
        self.globalData.userInfo = res.userInfo;
      }
    })
  },
  globalData: {
    userInfo: null
  }
})