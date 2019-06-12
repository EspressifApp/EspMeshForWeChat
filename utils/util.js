const app = getApp();
const constant = require('constant.js');
//时间格式
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const obj2key = (obj, keys) => {
  var n = keys.length,
    key = [];
  while (n--) {
    key.push(obj[keys[n]]);
  }
  return key.join('|');
}
//去重
const uniqeByKeys = (array, keys) => {
  var arr = [];
  var hash = {};
  for (var i = 0; i < array.length; i++) {
    var k = obj2key(array[i], keys);
    if (!(k in hash)) {
      hash[k] = true;
      arr.push(array[i]);
    }
  }
  return sortList(arr);
}
//转16进制
const ab2hex = buffer => {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
    return hexArr;
}
//16进制转字符串
const hexCharCodeToStr = hexCharCodeStr => {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr =
    trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    alert("Illegal Format ASCII Code!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}
//过滤名称
const filterDevice = (devices, deviceList, saveScanList, rssiValue, flag) => {
  var self = this, list = [];
  for (var i = 0; i < devices.length; i++) {
    var device = devices[i];
    var advertisData = ab2hex(device.advertisData);
    
    if (advertisData.length > 13
//    && (advertisData[0] & 0xff) == (manufactureId & 0xff)
//    && (advertisData[1] & 0xff) == ((manufactureId >> 8) & 0xff)
      && advertisData[2] == "4d"
      && advertisData[3] == "44"
      && advertisData[4] == "46" && device.RSSI >= rssiValue) {
      if (!_isEmpty(deviceList) && deviceList.length > 0) {
        for (var j in deviceList) {
          var item = deviceList[j];
          if (item.deviceId == device.deviceId) {
            device.active = item.active;
          }
        }
      } else {
        device.active = true;
      }
      device.version = advertisData[5] & 3;
      device.onlyBeacon = ((advertisData[5] >> 4) & 1) == 1;
      device.mac = advertisData[6] + ":" + advertisData[7] + ":" + advertisData[8] + ":" + advertisData[9] + ":" + advertisData[10] + ":" + advertisData[11];
      device.bssid = advertisData[6] + advertisData[7] + advertisData[8] + advertisData[9]  + advertisData[10] + advertisData[11] + "";
      device.tid = parseInt(advertisData[12], 16) | (parseInt(advertisData[13], 16) << 8);
      device.icon = getIcon(device.tid);
      
      if (flag) {
        if (saveScanList.indexOf(device.mac) != -1) {
          device.isSave = true;
        } else {
          device.isSave = false;
        }
      }
      list.push(device);
    }
  }
  return list;
}
const getLight = tid => {
  if (tid >= constant.MIN_LIGHT && tid <= constant.MAX_LIGHT) {
    return true;
  } else {
    return false;
  }
}
const getIcon = tid => {
  if (tid >= constant.MIN_LIGHT && tid <= constant.MAX_LIGHT) {
    return "icon-light";
  } else if (tid >= constant.MIN_SWITCH && tid <= constant.MAX_SWITCH) {
    return "icon-power";
  } else if (tid >= constant.MIN_SENSOR && tid <= constant.MAX_SENSOR) {
    return "icon-sensor";
  } else {
    return "icon-light";
  }
}
//获去type
const getType = (pkgType, subType) => {
  return (subType << 2) | pkgType;
}
//unit8Arry转数组
const uint8ArrayToArray = uint8Array => {
  var array = [];

  for (var i = 0; i < uint8Array.byteLength; i++) {
    array[i] = uint8Array[i];
  }

  return array;
}
//16进制转二进制数组 
const hexToBinArray = str => {
  var dec = parseInt(str, 16),
    bin = dec.toString(2),
    len = bin.length;
  if (len < 8) {
    var diff = 8 - len,
      zeros = "";
    for (var i = 0; i < diff; i++) {
      zeros += "0";
    }
    bin = zeros + bin;
  }
  return bin.split("");
}
//16进制转数组
const hexByArray = str => {
  var arr = [];
  if (str.length % 2 != 0) {
    str = "0" + str;
  }
  for (var i = 0; i < str.length; i += 2) {
    arr.push(str.substring(i, i + 2))
  }
  return arr;
}
//16进制转整形数组
const hexByInt = str => {
  var arr = [];
  if (str.length % 2 != 0) {
    str = "0" + str;
  }
  for (var i = 0; i < str.length; i += 2) {
    arr.push(parseInt(str.substring(i, i + 2), 16))
  }
  return arr;
}
//排序
const sortBy = (attr, rev) => {
  //第二个参数没有传递 默认升序排列
  if (rev == undefined) {
    rev = 1;
  } else {
    rev = (rev) ? 1 : -1;
  }
  return function (a, b) {
    a = a[attr];
    b = b[attr];
    if (a < b) {
      return rev * -1;
    } else if (a > b) {
      return rev * 1;
    }
    return 0;
  }
}
const sortBySub = (attr, rev) => {
  //第二个参数没有传递 默认升序排列
  if (rev == undefined) {
    rev = 1;
  } else {
    rev = (rev) ? 1 : -1;
  }

  return function (a, b) {
    a = a[attr];
    b = b[attr];
    var aNum = a.lastIndexOf("-"),
      bNum = b.lastIndexOf("-"),
      a0 = a.substring(0, aNum),
      b0 = b.substring(0, bNum),
      a1 = a.substring((aNum + 1), a.length),
      b1 = b.substring((bNum + 1), b.length);
    if (!isNaN(Number(a1)) && !isNaN(Number(b1))) {
      a1 = Number(a1);
      b1 = Number(b1);
    }
    if (a0 < b0) {
      return rev * -1;
    } else if (a0 > b0) {
      return rev * 1;
    } else if (a0 == b0 && a1 < b1) {
      return rev * -1;
    } else if (a0 == b0 && a1 > b1) {
      return rev * 1;
    }
    return 0;
  }
}
const sortList = list => {
  var emptyList = [], arrayList = [];
  for (var i in list) {
    var item = list[i];
    if (!_isEmpty(item.position)) {
      arrayList.push(item);
    } else {
      emptyList.push(item);
    }
  }
  arrayList.sort(sortBySub("position"));
  emptyList.sort(sortBy("name"));
  for (var i in emptyList) {
    arrayList.push(emptyList[i]);
  }
  return arrayList;
}
//判断非空
const _isEmpty = str => {
  if (str === "" || str === '""' || str === "''" ||  str === null || str === undefined || str === "null" || str === "undefined") {
    return true;
  } else {
    return false;
  }
}
//设置配网失败背景色
const setFailBg = () => {
  wx.setNavigationBarColor({
    frontColor: "#ffffff",
    backgroundColor: '#737d89',
  })
}
//设置配网成功背景色
const setSucBg = () => {
  wx.setNavigationBarColor({
    frontColor: "#ffffff",
    backgroundColor: '#4d9efb',
  })
}
//组装数据格式 
const writeData = (type, subType, frameCtl, seq, len, data) => {
  var self = this,
    value = [],
    type = getType(type, subType);
  value.push(type);
  value.push(frameCtl);
  value.push(seq);
  value.push(len);
  if (!_isEmpty(data)) {
    value = value.concat(data);
  }
  return value;
}
//是否分包
const isSubcontractor = (data, checksum, sequence, encrypt) => {
  var len = 0, lenData = [], laveData = [], flag = false;
  var total = data.length;
  if (total > 16) {
    if (checksum) {
      lenData = data.slice(0, 12);
      laveData = data.slice(12);
    } else {
      lenData = data.slice(0, 14);
      laveData = data.slice(14);
    }
    var len1 = (total >> 8) & 0xff;
    var len2 = total & 0xff;
    lenData.splice(0, 0, len1);
    lenData.splice(0, 0, len2);
    len = lenData.length;
    flag = true;
  } else {
    lenData = data;
    len = lenData.length;
  }
  if (checksum) {
    lenData = assemblyChecksum(lenData, len, sequence);
  }
  return {"len": len, "lenData": lenData, "laveData": laveData, "flag": flag}
}
const assemblyChecksum = (list, len, sequence, encrypt) => {
  var checkData = [];
  checkData.push(sequence);
  checkData.push(len);
  checkData = checkData.concat(list);
  var crc = caluCRC(0, checkData);
  var checksumByte1 = crc & 0xff;
  var checksumByte2 = (crc >> 8) & 0xff;
  list.push(checksumByte1);
  list.push(checksumByte2);
  return list;
}
//加密发送的数据
const encrypt = (aesjs, md5Key, sequence, data, checksum) => {
  var iv = generateAESIV(sequence), sumArr = [], list = [];
  if (checksum) {
    var len = data.length - 2;
    list = data.slice(0, len);
    sumArr = data.slice(len);
  } else {
    list = data;
  }
  var encryptData = uint8ArrayToArray(blueAesEncrypt(aesjs, md5Key, iv, new Uint8Array(list)));
  return encryptData.concat(sumArr);
}
//判断返回的数据是否加密
const isEncrypt = (self, fragNum, list, md5Key) => {
  var checksum = [], checkData = [];
  if (fragNum[7] == "1") {//返回数据加密
    if (fragNum[6] == "1") {
      var len = list.length - 2;
      // checkData = list.slice(2, len);
      // checksum = list.slice(len);
      // console.log(checksum);
      // var crc = caluCRC(0, checkData);
      // var checksumByte1 = crc & 0xff;
      // var checksumByte2 = (crc >> 8) & 0xff;
      list = list.slice(0, len);
    }
    var iv = this.generateAESIV(parseInt(list[2], 16));
    if (fragNum[3] == "0") {//未分包
      list = list.slice(4);
      self.setData({
        flagEnd: true
      })
    } else {//分包
      list = list.slice(6);
    }
    list = util.uint8ArrayToArray(this.blueAesDecrypt(aesjs, md5Key, iv, new Uint8Array(list)));
  } else {//返回数据未加密
    if (fragNum[6] == "1") {
      var len = list.length - 2;
      // checkData = list.slice(2, len);
      // checksum = list.slice(len);
      // var crc = caluCRC(0, checkData);
      // var checksumByte1 = crc & 0xff;
      // var checksumByte2 = (crc >> 8) & 0xff;
      list = list.slice(0, len);
    }
    if (fragNum[3] == "0") {//未分包
      list = list.slice(4);
      self.setData({
        flagEnd: true
      })
    } else {//分包
      list = list.slice(6);
    }
  }
  return list;
}
//DH加密
const blueDH = (p, g, crypto) => {
  var client = crypto.createDiffieHellman(p, "hex", g, "hex");
  var clientKey = client.generateKeys();
  //var clientSecret = client.computeSecret(server.getPublicKey());
  return client;
}
//md5加密
const blueMd5 = (md5, key) => {
  var arr = md5.array(key);
  return arr;
}
// aes加密
const blueAesEncrypt = (aesjs, mdKey, iv, bytes) => {
  var aesOfb = new aesjs.ModeOfOperation.ofb(mdKey, iv);
  var encryptedBytes = aesOfb.encrypt(bytes);
  return encryptedBytes;
}
//aes解密
const blueAesDecrypt = (aesjs, mdKey, iv, bytes) => {
  var aesOfb = new aesjs.ModeOfOperation.ofb(mdKey, iv);
  var decryptedBytes = aesOfb.decrypt(bytes);
  return decryptedBytes;
}
//获取Frame Control
const getFrameCTRLValue = (encrypted, checksum, direction, requireAck, frag) => {
  var frame = 0;
  if (encrypted) {
    frame = frame | (1 << constant.FRAME_CTRL_POSITION_ENCRYPTED);
  }
  if (checksum) {
    frame = frame | (1 << constant.FRAME_CTRL_POSITION_CHECKSUM);
  }
  if (direction == constant.DIRECTION_INPUT) {
    frame = frame | (1 << constant.FRAME_CTRL_POSITION_DATA_DIRECTION);
  }
  if (requireAck) {
    frame = frame | (1 << constant.FRAME_CTRL_POSITION_REQUIRE_ACK);
  }
  if (frag) {
    frame = frame | (1 << constant.FRAME_CTRL_POSITION_FRAG);
  }
  return frame;
}

//获取aes iv
const generateAESIV = sequence => {
  var result = [];
  for (var i = 0; i < 16; i++) {
    if (i == 0) {
      result[0] =  sequence;
    } else {
      result[i] = constant.AES_BASE_IV[i];
    }
  }
  return result;
}
//计算CRC值
const caluCRC = (crc, pByte) => {
  crc = (~crc) & 0xffff;
  for (var i in pByte) {
    crc = constant.CRC_TB[((crc & 0xffff) >> 8) ^ (pByte[i] & 0xff)] ^ ((crc & 0xffff) << 8);
  }
  return (~crc) & 0xffff;
}
const initData = (data, num, macs, ip, rootMac) => {
  var list = [];
  if (num >= 2) {
    data = data.split("Content-Type: application/json");
    data.splice(0, 1);
    for (var i in data) {
      var obj = analysis(data[i]);
      obj.rootMac = rootMac;
      obj.active = true;
      if (_isEmpty(obj.position)) {
        obj.position = "";
      }
      if (obj.mlink_trigger == 1) {
        obj.mlink_trigger = true
      } else {
        obj.mlink_trigger = false
      }
      var ch = initCharacteristics(obj.characteristics, obj.tid, false);
      obj.characteristics = ch.list;
      obj.active = ch.active;
      obj.ip = ip;
      obj.rgb = ch.rgba;
      obj.icon = getIcon(obj.tid);
      obj.isLight = getLight(obj.tid);
      list.push(obj);
    }
  } else {
    var ch = initCharacteristics(data.characteristics, data.tid, false);
    data.characteristics = ch.list;
    data.active = ch.active;
    if (_isEmpty(data.position)) {
      data.position = "";
    }
    data.mac = macs;
    data.rootMac = rootMac;
    data.ip = ip;
    data.rgb = ch.rgba;
    data.icon = getIcon(data.tid);
    data.isLight = getLight(data.tid);
    list.push(data);
  }
  return list;
}
const analysis = str => {
  var num = str.indexOf("HTTP/1.1");
  if (num != -1) {
    str = str.substring(0, str.indexOf("HTTP/1.1"));
  }
  var strs = str.split("\r\n\r\n");
  var mac = strs[0].split("\r\n")[1].split(":")[1];
  var obj = JSON.parse(strs[1]);
  obj.mac = mac.replace(/^\s+|\s+$/g, "");
  return obj;
}
const initCharacteristics = (data, tid, flag)=> {
  var list = [], active = false,
    hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b",
    mode = 0, temperature = 0, brightness = 0;
  if (tid >= constant.MIN_LIGHT && tid <= constant.MAX_LIGHT) {
    for (var i in data) {
      var item = data[i];
      list.push(item);
      if (item.cid == constant.HUE_CID) {
        hueValue = item.value;
      } else if (item.cid == constant.SATURATION_CID) {
        saturation = item.value;
      } else if (item.cid == constant.VALUE_CID) {
        luminance = item.value;
      } else if (item.cid == constant.STATUS_CID) {
        status = item.value;
      } else if (item.cid == constant.MODE_CID) {
        mode = item.value;
      } else if (item.cid == constant.TEMPERATURE_CID) {
        temperature = item.value;
      } else if (item.cid == constant.BRIGHTNESS_CID) {
        brightness = item.value;
      }
    }
  }
  if (status == constant.STATUS_ON || flag) {
    active = true;
    if (mode == constant.MODE_CTB) {
      rgb = modeFun(temperature, brightness);
    } else {
      rgb = hsb2rgb(hueValue, saturation, luminance);
    }
  } else {
    active = false;
  }
  if (tid < constant.MIN_LIGHT || tid > constant.MAX_LIGHT) {
    rgb = "#3ec2fc";
  }
  if (list.length == 0) {
    list = data;
  }
  return { "list": list, "active": active, "rgba": rgb};
}
const modeFun = (temperature, brightness) => {
  var r = 0,
    g = 0,
    b = 0,
    r1 = 248,
    g1 = 207,
    b1 = 109,
    r2 = 255,
    g2 = 255,
    b2 = 255,
    r3 = 164,
    g3 = 213,
    b3 = 255;
  if (temperature < 50) {
    var num = temperature / 50;
    r = Math.floor((r2 - r1) * num) + r1;
    g = Math.floor((g2 - g1) * num) + g1;
    b = Math.floor((b2 - b1) * num) + b1;
  } else {
    var num = (temperature - 50) / 50;
    r = r2 - Math.floor((r2 - r3) * num);
    g = g2 - Math.floor((g2 - g3) * num);
    b = b2 - Math.floor((b2 - b3) * num);
  }
  return "rgba(" + r + ", " + g + ", " + b + ", 1)";
}
const hsb2rgb = (h, s, v) => {
  s = s / 100;
　v = v / 100;
　var h1 = Math.floor(h / 60) % 6;
　var f = h / 60 - h1;
　var p = v * (1 - s);
　var q = v * (1 - f * s);
　var t = v * (1 - (1 - f) * s);
　var r, g, b;
　switch (h1) {
　　　case 0:
　　　　r = v;
　　　　g = t;
　　　　b = p;
　　　　break;
　　　case 1:
　　　　r = q;
　　　　g = v;
　　　　b = p;
　　　　break;
　　  case 2:
　　　　r = p;
　　　　g = v;
　　　　b = t;
　　　　break;
　　　case 3:
　　　　r = p;
　　　　g = q;
　　　　b = v;
　　　　break;
　　　case 4:
　　　　r = t;
　　　　g = p;
　　　　b = v;
　　　　break;
　　　case 5:
　　　　r = v;
　　　　g = p;
　　　　b = q;
　　　　break;
　}
  if (v <= 0.4) {
    v *= 1.2;
  }
  if (v <= 0.2) {
    v = 0.2;
  }
　return "rgba(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + "," + v + ")"; 
}
const showLoading = msg => {
  wx.showLoading({
    title: msg,
    mask: true
  });
}
const showLoadingMask = msg => {
  wx.showLoading({
    title: msg,
    mask: false
  });
}
const showToast = msg => {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  })
}
const setRequest = (met, data, macs, num, ip, isResponse, fun, title, flag) => {
  if (isResponse) {
    isResponse = 1;
  } else {
    isResponse = 0;
  }
  wx.request({
    method: "POST",
    url: "http://" + ip + ":80" + met,
    data: data,
    header: {
      "Content-Length": data.length,
      "content-type": "application/json", // 默认值
      "Mesh-Node-Mac": macs,
      "Mesh-Node-Num": num,
      "root-response": isResponse,
    },
    success: function (res) {
      var data = res.data;
      var type = typeof data,
        flagType = false;
      if (type.toLowerCase() == "object") {
        if (data.status_code == 0) {
          flagType = true
        }
      } else if (type.toLowerCase() == "string") {
        if (data.indexOf('"status_code":0') != -1) {
          flagType = true
        }
      }
      if (flag) {
        wx.hideLoading();
      }
      if (flagType) {
        if (!_isEmpty(fun)) {
          fun(data);
        }
      } else {
        showToast(title);
      }
      
    },
    fail: function (res) {
      showToast(title);
      if (flag) {
        wx.hideLoading();
      }
    }
  })
}

const setStatus = (item, deviceStatus, status, index) => {
  item = changeDevice(item, status, "", "");
  var macs = [item.mac];
  var data = JSON.stringify({ "request": constant.SET_STATUS, "characteristics": [{ "cid": constant.STATUS_CID, "value": status }] })
  setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, item.ip, true);
  return item;
}
const setListStatus = (macs, status, ip) => {
  changeDevices(macs, status, "", "", false);
  var data = JSON.stringify({ "request": constant.SET_STATUS, "characteristics": [{ "cid": constant.STATUS_CID, "value": status }] })
  setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, ip, true);
}
const setColor = (item, h, s) => {
  item.active = true;
  item = changeDevice(item, "", h, s);
  var macs = [item.mac];
  var data = JSON.stringify({ "request": constant.SET_STATUS, "characteristics": [{ "cid": constant.HUE_CID, "value": h }, { "cid": constant.SATURATION_CID, "value": s }] });
  setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, item.ip, true);
  return item;
}
const setListColor = (macs, h, s, ip) => {
  changeDevices(macs, "", h, s, true);
  var data = JSON.stringify({ "request": constant.SET_STATUS, "characteristics": [{ "cid": constant.HUE_CID, "value": h }, { "cid": constant.SATURATION_CID, "value": s }] });
  setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, ip, true);
}
const setLColor = (item, characteristics) => {
  var chars= item.characteristics;
  for (var i in chars) {
    var subItem = chars[i];
    for (var j in characteristics) {
      var sub = characteristics[j];
      if (subItem.cid == sub.cid) {
        subItem.value = sub.value;
      }
    }
    chars[i] = subItem;
  }
  item.characteristics = chars;
  var macs = [item.mac];
  item.active = true;
  var ch = initCharacteristics(chars, item.tid, true);
  item.rgb = ch.rgba;
  var data = JSON.stringify({ "request": constant.SET_STATUS, "characteristics": characteristics});
  setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, item.ip, true);
  return item;
}
const setListLColor = (macs, characteristics, ip) => {
  var deviceList = wx.getStorageSync(constant.DEVICE_LIST);
  for (var i in deviceList) {
    var item = deviceList[i];
    if (macs.indexOf(item.mac) != -1) {
      var chars = item.characteristics;
      for (var k in chars) {
        var subItem = chars[k];
        for (var j in characteristics) {
          var sub = characteristics[j];
          if (subItem.cid == sub.cid) {
            subItem.value = sub.value;
          }
        }
        chars[k] = subItem;
      }
      item.characteristics = chars;
      item.active = true;
      var ch = initCharacteristics(chars, item.tid, true);
      item.rgb = ch.rgba;
      deviceList.splice(i, 1, item);
    }
  }
  var data = JSON.stringify({ "request": constant.SET_STATUS, "characteristics": characteristics });
  setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, ip, true);
  setStorage(constant.DEVICE_LIST, deviceList);
}
const changeDevices = (macs, status, h, s, flag) => {
  var deviceList = wx.getStorageSync(constant.DEVICE_LIST);
  for (var i in deviceList) {
    var item = deviceList[i];
    if (macs.indexOf(item.mac) != -1) {
      var characteristics = item.characteristics;
      for (var j in characteristics) {
        var subItem = characteristics[j];
        if (subItem.cid == constant.STATUS_CID && !_isEmpty(status)) {
          subItem.value = status;
          characteristics[j] = subItem;
        } else if (subItem.cid == constant.HUE_CID && !_isEmpty(h)) {
          subItem.value = h;
          characteristics[j] = subItem;
        } else if (subItem.cid == constant.SATURATION_CID && !_isEmpty(s)) {
          subItem.value = s;
          characteristics[j] = subItem;
        }
      }
      item.characteristics = characteristics;
      if (!_isEmpty(status)) {
        if (status == 0) {
          item.active = false;
        } else {
          item.active = true;
        }
      }
      if (flag) {
        item.active = true;
      }
      var ch = initCharacteristics(characteristics, item.tid);
      item.rgb = ch.rgba;
      deviceList.splice(i, 1, item);
    }
  }
  setStorage(constant.DEVICE_LIST, deviceList);
}
const changeDevice = (item, status, h, s) => {
  var characteristics = item.characteristics;
  for (var i in characteristics) {
    var subItem = characteristics[i];
    if (subItem.cid == constant.STATUS_CID && !_isEmpty(status)) {
      subItem.value = status;
      characteristics[i] = subItem;
    } else if (subItem.cid == constant.HUE_CID && !_isEmpty(h)) {
      subItem.value = h;
      characteristics[i] = subItem;
    } else if (subItem.cid == constant.SATURATION_CID && !_isEmpty(s)) {
      subItem.value = s;
      characteristics[i] = subItem;
    }
  }
  item.characteristics = characteristics;
  if (!_isEmpty(status)) {
    if (status == 0) {
      item.active = false;
    } else {
      item.active = true;
    }
  }
  var ch = initCharacteristics(characteristics, item.tid);
  item.rgb = ch.rgba;
  return item;
}
const setStorage = (key, data) => {
  
  if (key == constant.DEVICE_LIST) {
    data = uniqeByKeys(data, ["mac"]);
  }
  wx.setStorage({
    key: key,
    data: data
  })
}
const setStorageSync = (key, data) => {
  if (key == constant.DEVICE_LIST) {
    data = uniqeByKeys(data, ["mac"]);
  }
  wx.setStorageSync(key, data);
}
const getBluDevice = (self, flag) => {
  openBluetoothAdapter(flag);
  wx.onBluetoothDeviceFound(function (res) {
    console.log(res);
    var list = filterDevice(res.devices, null, self.data.saveScanList, self.data.rssiValue, false);
    if (list.length > 0 && flag) {
      wx.hideLoading();
    }
    self.setData({
      blueList: self.data.blueList.concat(list),
    });
    if (list.length > 0 && flag) {
      self.getSearchList();
    }
  })
}
const getBluetoothDevices = self => {
  wx.getBluetoothDevices({
    success: function (res) {
      console.log(res);
      var list = filterDevice(res.devices, self.data.blueList, self.data.saveScanList, self.data.rssiValue, true);
      if (list.length > 0) {
        wx.hideLoading();
      }
      self.setData({
        blueList: list
      })
      if (self.data.blueList.length > 0) {
        self.getSearchList();
      }
    },
    fail: function (res) {
      wx.hideLoading();
    }
  });
}
const openBluetoothAdapter = () => {
  wx.openBluetoothAdapter({
    success(res) {
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          console.log(res);
          //self.getBluetoothDevices();
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '请打开蓝牙',
            icon: 'none',
            duration: 2000
          });
        }
      })
    }
  })
}
const closeBluetoothAdapter = () => {
  wx.closeBluetoothAdapter({
    success(res) {
    }
  })
}
const saveGroups = list => {
  var groups = wx.getStorageSync(constant.GROUP_TABLE),
    newGroups = [];
  if (!_isEmpty(groups) && groups.length > 0) {
    for (var i in list) {
      var flag = true;
      var group = list[i];
      for (var j in groups) {
        var oldGroup = groups[j];
        if (group.id == oldGroup.id) {
          flag = false;
          groups.splice(j, 1, group);
          break;
        }
      }
      if (flag) {
        newGroups.push(group);
      }
      
    }
  } else {
    groups = list;
  }
  groups = groups.concat(newGroups);
  var result = [];
  var obj = {};
  for (var i = 0; i < groups.length; i++) {
    if (!obj[groups[i].id]) {
      result.push(groups[i]);
      obj[groups[i].id] = true;
    }
  }
  setStorageSync(constant.GROUP_TABLE, result);
}
const savePosition = obj => {
  var positions = wx.getStorageSync(constant.POSITION_LIST),
  flag = true;
  if (_isEmpty(positions)) {
    positions = [];
  }
  for (var i in positions) {
    var item = positions[i];
    if (item.mac == obj.mac) {
      positions.splice(i, 1, obj);
      flag = false;
      break;
    }
  };
  if (flag) {
    positions.push(obj);
  }
  setStorage(constant.POSITION_LIST, positions);
}
const setName = tid => {
  var name = "";
  if (tid >= constant.MIN_SWITCH && tid <= constant.MAX_SWITCH) {
    name = "Switch_" + tid;
  } else if (tid >= constant.MIN_SENSOR && tid <= constant.MAX_SENSOR) {
    name = "Sensor_" + tid;
  } else if (tid >= constant.MIN_LIGHT && tid <= constant.MAX_LIGHT) {
    name = "Light_" + tid;
  } else {
    name = "Other_" + tid;
  }
  return name;
}
const getGroupName = (groups, id, name) => {
  for (var i in groups) {
    var item = groups[i];
    if (item.id == id) {
      if (!_isEmpty(item.name)) {
        name = item.name;
      }
    }
  }
  return name;
}
const switchTouchDefaultEvent = (parentMac, childMacs, ip, fun) => {
  var splitMac = parentMac.substr((parentMac.length - 3), 3);
  var events = [];
  var eventLumiLnance = _assemblySyscEvent("SYSC" + splitMac, constant.TOUC_PAD_BTN_3, childMacs);
  events.push(eventLumiLnance);

  var eventRed = _assemblySwitchEvent("RED_" + splitMac, constant.TOUC_PAD_BTN_0,
    childMacs, constant.SYSC_RED_HUE, constant.SYSC_RED_SATURATION);
  events.push(eventRed);

  var eventGreen = _assemblySwitchEvent("GREEN_" + splitMac, constant.TOUC_PAD_BTN_1,
    childMacs, constant.SYSC_GREEN_HUE, constant.SYSC_GREEN_SATURATION);
  events.push(eventGreen);

  var eventBlue = _assemblySwitchEvent("BLUE_" + splitMac, constant.TOUC_PAD_BTN_2,
    childMacs, constant.SYSC_BLUE_HUE, constant.SYSC_BLUE_SATURATION);
  events.push(eventBlue);

  _addRequestEvent(parentMac, events, ip, fun);
}
const sensorDefaultEvent = (parentMac, childMacs, ip, fun) => {
  var splitMac = parentMac.substr((parentMac.length - 3), 3);
  var events = [];
  var eventON = _assemblyOtherEvent(ON_EN + "_" + splitMac, constant.SENSOR_CID,
    childMacs, constant.MESH_SENSOR_ON_COMPARE, constant.STATUS_ON);
  events.push(eventON);
  var eventOFF = _assemblyOtherEvent(OFF_EN + "_" + splitMac, constant.SENSOR_CID,
    childMacs, constant.MESH_SENSOR_OFF_COMPARE, constant.STATUS_OFF);
  events.push(eventOFF);
  _addRequestEvent(parentMac, events, ip, fun);
}
const sensor24DefaultEvent = (parentMac, childMacs, ip, fun) => {
  var splitMac = parentMac.substr((parentMac.length - 3), 3);
  var events = [];
  //白色
  var eventWhite = _assemblyColorEvent(constant.WHITE_EN, constant.SENSOR24_CID_3,
    childMacs, constant.MESH_LIGHT_SYSC_COLOR_0, constant.SENSOR24_COLOR["white"].h,
    constant.SENSOR24_COLOR["white"].s, constant.SENSOR24_COLOR["white"].v);
  events.push(eventWhite);
  //红色
  var eventRed = _assemblyColorEvent(constant.RED_EN, constant.SENSOR24_CID_3, childMacs, constant.MESH_LIGHT_SYSC_COLOR, constant.SENSOR24_COLOR["red"].h,
    constant.SENSOR24_COLOR["red"].s, constant.SENSOR24_COLOR["red"].v);
  events.push(eventRed);
  //绿色
  var eventGreen = _assemblyColorEvent(constant.GREEN_EN, constant.SENSOR24_CID_3, childMacs, constant.MESH_LIGHT_SYSC_COLOR_2, constant.SENSOR24_COLOR["green"].h, constant.SENSOR24_COLOR["green"].s, constant.SENSOR24_COLOR["green"].v);
  events.push(eventGreen);
  //蓝色
  var eventBlue = _assemblyColorEvent(constant.BLUE_EN, constant.SENSOR24_CID_3, childMacs, constant.MESH_LIGHT_SYSC_COLOR_3, constant.SENSOR24_COLOR["blue"].h, constant.SENSOR24_COLOR["blue"].s, constant.SENSOR24_COLOR["blue"].v);
  events.push(eventBlue)
  //黄色
  var eventYellow = _assemblyColorEvent(constant.YELLOW_EN, constant.SENSOR24_CID_3, childMacs, constant.MESH_LIGHT_SYSC_COLOR_4, constant.SENSOR24_COLOR["yellow"].h, constant.SENSOR24_COLOR["yellow"].s, constant.SENSOR24_COLOR["yellow"].v);
  events.push(eventYellow);
  //紫色
  var eventPurple = _assemblyColorEvent(constant.PURPLE_EN, constant.SENSOR24_CID_3, childMacs, constant.MESH_LIGHT_SYSC_COLOR_5, constant.SENSOR24_COLOR["purple"].h, constant.SENSOR24_COLOR["purple"].s, constant.SENSOR24_COLOR["purple"].v);
  events.push(eventPurple);
  //开
  var eventOn = _assemblyOtherEvent(constant.TURN_ON, constant.SENSOR24_CID_2, childMacs, constant.MESH_LIGHT_ON_COMPARE, constant.STATUS_ON);
  events.push(eventOn);
  //关
  var eventOFF = _assemblyOtherEvent(constant.TURN_OFF, constant.SENSOR24_CID_2, childMacs, constant.MESH_LIGHT_OFF_COMPARE, constant.STATUS_OFF);
  events.push(eventOFF);
  _addRequestEvent(parentMac, events, ip, fun);
}
const switchButtonDefaultEvent = (cid, parentMac, childMacs, ip, fun) => {
  var events = [];
  var eventON = _assemblyOtherEvent(constant.ON_EN + "_" + cid, cid, childMacs, constant.MESH_LIGHT_ON_COMPARE, constant.STATUS_ON);
  events.push(eventON);
  var eventOFF = _assemblyOtherEvent(constant.OFF_EN + "_" + cid, cid, childMacs, constant.MESH_LIGHT_OFF_COMPARE, constant.STATUS_OFF);
  events.push(eventOFF);
  _addRequestEvent(parentMac, events, ip, fun);
}
const switchDefaultEvent = (parentMac, childMacs, ip, fun) => {
  var splitMac = parentMac.substr((parentMac.length - 3), 3);
  var events = [];
  var eventON = _assemblyOtherEvent(constant.ON_EN + "_" + splitMac, constant.SWITCH_CID, childMacs, constant.MESH_LIGHT_ON_COMPARE, constant.STATUS_ON);
  events.push(eventON);
  var eventOFF = _assemblyOtherEvent(constant.OFF_EN + "_" + splitMac, constant.SWITCH_CID, childMacs, constant.MESH_LIGHT_OFF_COMPARE, constant.STATUS_OFF);
  events.push(eventOFF);

  _addRequestEvent(parentMac, events, ip, fun);

}
const lightSyscEvent = (parentMac, childMacs, ip, fun) => {
  var splitMac = parentMac.substr((parentMac.length - 3), 3);
  var events = [];

  var eventOn = _assemblySyscEvent("ON_" + splitMac, constant.STATUS_CID, childMacs);
  var eventValue = _assemblySyscEvent("VALUE_" + splitMac, constant.VALUE_CID, childMacs);
  var eventHue = _assemblySyscEvent("HUE_" + splitMac, constant.HUE_CID, childMacs);
  var eventSaturation = _assemblySyscEvent("SATURATION_" + splitMac, constant.SATURATION_CID, childMacs);
  var eventTemperature = _assemblySyscEvent("TEMPERATURE_" + splitMac, constant.TEMPERATURE_CID, childMacs);
  var eventBrightess = _assemblySyscEvent("BRIGHTNESS_" + splitMac, constant.BRIGHTNESS_CID, childMacs);

  events.push(eventOn);
  events.push(eventValue);
  events.push(eventHue);
  events.push(eventSaturation);
  events.push(eventTemperature);
  events.push(eventBrightess);
  _addRequestEvent(parentMac, events, ip, fun);
}
const setModelEvent = (name, childMacs, cid, subCid, h, s, b, flag, type, eventClass, execCid, isLong,
  defaultValue, compare) => {
  var eventModel = "";
  if (flag) {
    eventModel = _assemblyButtonEvent(name, cid, childMacs, subCid, type, eventClass, isLong, defaultValue, compare);
  } else {
    if (type == 2) {
      eventModel = _assemblyModelWarmEvent(name, cid, childMacs, h, s, b, type, eventClass, isLong);
    } else if (type == 8 || type == 9 || type == 10) {
      eventModel = _assemblyButtonEvent(name, cid, childMacs, subCid, type, eventClass, isLong, defaultValue, compare);
    } else {
      eventModel = _assemblyModelEvent(name, cid, childMacs, h, s, b, type, eventClass, isLong);
    }
  }
  return eventModel;
}
const _assemblyLongEvent = (name, cid, mac, compare, type, eventClass, isLong, defaultValue) => {
  var event = {
    "name": name,
    "trigger_cid": cid,
    "trigger_content": { "request": constant.CONTROL },
    "event_type": type,
    "event_class": eventClass,
    "isLong": isLong,
    "trigger_compare": compare,
    "execute_mac": mac,
    "execute_content": {
      "request": constant.SET_STATUS, "characteristics": [
        { "cid": constant.MODE_CID, "value": defaultValue }]
    }
  };
  return event;
}
const _assemblyColorEvent = (name, cid, mac, compare, h, s, b) => {
  var event = {
    "name": name,
    "trigger_cid": cid,
    "trigger_content": { "request": constant.CONTROL },
    "trigger_compare": compare,
    "execute_mac": mac,
    "execute_content": {
      "request": constant.SET_STATUS, "characteristics": [
        { "cid": constant.HUE_CID, "value": h },
        { "cid": constant.SATURATION_CID, "value": s },
        { "cid": constant.VALUE_CID, "value": b }
      ]
    }
  };
  return event;
}
const _assemblyModelWarmEvent = (name, cid, mac, h, s, b, type, eventClass, isLong) => {
  var compare = "";
  if (isLong) {
    compare = constant.MESH_LIGHT_SYSC_COLOR_2;
  } else {
    compare = constant.MESH_LIGHT_SYSC_COLOR
  }
  var event = {
    "name": name,
    "trigger_cid": cid,
    "trigger_content": { "request": constant.CONTROL },
    "event_type": type,
    "event_class": eventClass,
    "trigger_compare": compare,
    "execute_mac": mac,
    "execute_content": {
      "request": constant.SET_STATUS, "characteristics": [
        { "cid": constant.TEMPERATURE_CID, "value": h },
        { "cid": constant.BRIGHTNESS_CID, "value": b }
      ]
    }
  };
  return event;
}
const _assemblyModelEvent = (name, cid, mac, h, s, b, type, eventClass, isLong) => {
  var compare = "";
  if (isLong) {
    compare = constant.MESH_LIGHT_SYSC_COLOR_2;
  } else {
    compare = constant.MESH_LIGHT_SYSC_COLOR;
  }
  var event = {
    "name": name,
    "trigger_cid": cid,
    "trigger_content": { "request": constant.CONTROL },
    "event_type": type,
    "event_class": eventClass,
    "trigger_compare": compare,
    "execute_mac": mac,
    "execute_content": {
      "request": constant.SET_STATUS, "characteristics": [
        { "cid": constant.HUE_CID, "value": h },
        { "cid": constant.SATURATION_CID, "value": s },
        { "cid": constant.VALUE_CID, "value": b }
      ]
    }
  };
  return event;
}
const _assemblyButtonEvent = (name, cid, mac, subCid, type, eventClass, isLong, defaultValue, compare) => {
  var event = {
    "name": name,
    "trigger_cid": cid,
    "trigger_content": { "request": constant.CONTROL },
    "event_type": type,
    "event_class": eventClass,
    "isLong": isLong,
    "trigger_compare": compare,
    "execute_mac": mac,
    "execute_cid": subCid,
    "execute_content": {
      "request": constant.SET_STATUS, "characteristics": [
        { "cid": subCid, "value": defaultValue }
      ]
    }
  }
  return event;
}
const _assemblyOtherEvent = (name, cid, mac, compare, status) => {
  var event = {
    "name": name,
    "trigger_cid": cid,
    "trigger_content": { "request": constant.CONTROL },
    "trigger_compare": compare,
    "execute_mac": mac,
    "execute_content": {
      "request": constant.SET_STATUS, "characteristics": [
        { "cid": constant.STATUS_CID, "value": status }
      ]
    }
  };
  return event;
}
const _assemblySwitchEvent = (name, cid, mac, hue, saturation) => {
  var event = {
    "name": name,
    "trigger_cid": cid,
    "trigger_content": { "request": constant.CONTROL },
    "trigger_compare": constant.MESH_LIGHT_SYSC_COLOR,
    "execute_mac": mac,
    "execute_content": {
      "request": constant.SET_STATUS, "characteristics": [
        { "cid": constant.HUE_CID, "value": hue },
        { "cid": constant.SATURATION_CID, "value": saturation },
      ]
    }
  };
  return event;
}
const _assemblySyscEvent = (name, cid, childMacs) => {
  var event = {
    "name": name,
    "trigger_content": { "request": constant.SYSC, "execute_cid": cid },
    "trigger_cid": cid,
    "trigger_compare": constant.MESH_LIGHT_SYSC,
    "execute_mac": childMacs
  };
  return event;
}
const _addRequestEvent = (parentMac, events, ip, fun) => {
  var data = JSON.stringify({ "request": constant.SET_EVENT, "events": events });
  console.log(data);
  wx.request({
    method: "POST",
    url: "http://" + ip + ":80" + constant.DEVICE_REQUEST,
    data: data,
    header: {
      "Content-Length": data.length,
      "content-type": "application/json", // 默认值
      "Mesh-Node-Mac": parentMac,
      "Mesh-Node-Num": 1,
    },
    success: function (res) {
      if (!_isEmpty(fun)) {
        fun();
      }
    },
    fail: function (res) {
      showToast("失败");
    }
  })
}
const showCommand = self => {
  self.hide();
  var commandList = wx.getStorageSync(constant.COMMAND_LIST),
    requestList = [];
  if (!_isEmpty(commandList)) {
    var item = JSON.parse(commandList[0]);
    for (var i in item) {
      requestList.push({ key: i, value: item[i] })
    }
  } else {
    requestList = [{ key: "request", value: null }]
  }
  self.setData({
    isCommand: true,
    ["commandData.requestList"]: requestList,
    ["commandData.textareaJson"]: commandJson(self, requestList)
  })
}
const showLoadCommand = self => {
  var isLoad = !self.data.commandData.isLoad;
  if (isLoad) {
    showLoading("");
    var commandList = wx.getStorageSync(constant.COMMAND_LIST);
    if (_isEmpty(commandList)) {
      commandList = [];
    }
    self.setData({
      ["commandData.commandList"]: commandList,
    })
    wx.hideLoading();
  }
  self.setData({
    ["commandData.isLoad"]: isLoad,
  })
}
const addCommand = self => {
  var requestList = self.data.commandData.requestList;
  requestList.push({ key: "newKey", value: null });
  self.setData({
    ["commandData.requestList"]: requestList,
    ["commandData.textareaJson"]: commandJson(self, requestList)
  })
}
const delCommand = (e, self) => {
  wx.showModal({
    title: '删除',
    confirmColor: "#3ec2fc",
    content: '确定要删除该信息吗?',
    success(res) {
      if (res.confirm) {
        var index = e.currentTarget.dataset.index,
          requestList = self.data.commandData.requestList;
        requestList.splice(index, 1);
        self.setData({
          ["commandData.requestList"]: requestList,
          ["commandData.textareaJson"]: commandJson(self, requestList)
        })
      }
    }
  })
}
const selectCommand = (e, self) => {
  var index = e.currentTarget.dataset.index,
    requestList = [],
    item = JSON.parse(self.data.commandData.commandList[index]);
  for (var i in item) {
    requestList.push({ key: i, value: item[i] })
  }
  self.setData({
    ["commandData.isLoad"]: false,
    ["commandData.requestList"]: requestList,
    ["commandData.textareaJson"]: commandJson(self, requestList)
  })
}
const changeKey = (e, self) => {
  var index = e.currentTarget.dataset.index,
    requestList = self.data.commandData.requestList,
    item = requestList[index];
    item.key = e.detail.value;
  requestList.splice(index, 1, item);
  self.setData({
    ["commandData.requestList"]: requestList,
    ["commandData.textareaJson"]: commandJson(self, requestList)
  })
}
const changeValue = (e, self) => {
  var index = e.currentTarget.dataset.index,
    requestList = self.data.commandData.requestList,
    item = requestList[index];
  item.value = e.detail.value;
  requestList.splice(index, 1, item);
  self.setData({
    ["commandData.requestList"]: requestList,
    ["commandData.textareaJson"]: commandJson(self, requestList)
  })
}
const commandCancel = self => {
  self.setData({
    isCommand: false,
    ["commandData.requestList"]: [{ key: "request", value: null }],
    ["commandData.commandList"]: [],
    ["commandData.textareaJson"]: '{"request": null}',
    ["commandData.isLoad"]: false,
    ["commandData.selected"]: 1,
    ["commandData.resultText"]: []
  })
}
const selectResponse = (e,self) => {
  self.setData({
    ["commandData.selected"]: parseInt(e.currentTarget.dataset.value),
  })
}
const saveCommand = json => {
  var commandList = wx.getStorageSync(constant.COMMAND_LIST);
  if (!_isEmpty(commandList)) {
    if (commandList.indexOf(json) == -1) {
      commandList.splice(0, 0,json);
    }
  } else {
    commandList = [json];
  }
  console.log(commandList);
  setStorage(constant.COMMAND_LIST, commandList);
}
const commandJson = (self, requestList) => {
  var json = "{";
  for (var i in requestList) {
    var item = requestList[i];
    json += '"' + item.key + '":' + checkRate(item.value);
    if (i < (requestList.length - 1)) {
      json += ',';
    }
  }
  json += "}";
  return json;
}
const sendCommand = (self, ip, macs) => {
  var data = '{', json = "", list = [], requestList = self.data.commandData.requestList, flag = false;
  if (self.data.commandData.selected == 2) {
    flag = true;
  }
  for (var i in requestList) {
    var item = requestList[i];
    if (!_isEmpty(item.value)) {
      json += '"' + item.key + '":' + checkRate(item.value) + ',';
      list.push(item);
    }
  }
  if (list.length > 0) {
    requestList = list;
  } else {
    requestList = [{ key: "request", value: null }];
  }
  var len = json.length;
  if (len > 2) {
    json = json.substr(0, len - 1);
  }
  if (!_isEmpty(json)) {
    data += json + '}';
    console.log(flag);
    if (isJSON(data)) {
      showLoading("");
      setTimeout(function () {
        setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, ip, flag, self.sendSuc, "发送失败", true);
        saveCommand(data);
      }, 1000)
    } else {
      showToast("命令格式有误");
    }
  } else {
    showToast("命令格式有误");
  }
}
const checkRate = (str) => {
  var re = /^[0-9]+.?[0-9]*$/; 
  if (!_isEmpty(str)) {
    if (!re.test(str)) {
      if (str.indexOf('"') == -1) {
        str = '"' + str + '"'
      }
  　}
  }
  return str
}
const isJSON = str => {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
module.exports = {
  formatTime: formatTime,
  uniqeByKeys: uniqeByKeys,
  ab2hex: ab2hex,
  hexCharCodeToStr: hexCharCodeToStr,
  filterDevice: filterDevice,
  getType: getType,
  hexToBinArray: hexToBinArray,
  hexByArray: hexByArray,
  hexByInt: hexByInt,
  sortBy: sortBy,
  _isEmpty: _isEmpty,
  setFailBg: setFailBg,
  setSucBg: setSucBg,
  writeData: writeData,
  isSubcontractor: isSubcontractor,
  getFrameCTRLValue: getFrameCTRLValue,
  blueDH: blueDH,
  blueMd5: blueMd5,
  blueAesEncrypt: blueAesEncrypt,
  blueAesDecrypt: blueAesDecrypt,
  uint8ArrayToArray: uint8ArrayToArray,
  generateAESIV: generateAESIV,
  isEncrypt: isEncrypt,
  caluCRC: caluCRC,
  encrypt: encrypt,
  initData: initData,
  showToast: showToast,
  showLoading: showLoading,
  showLoadingMask: showLoadingMask,
  setRequest: setRequest,
  setStatus: setStatus,
  setListStatus: setListStatus,
  setColor: setColor,
  setListColor: setListColor,
  setLColor: setLColor,
  setListLColor: setListLColor,
  setStorage: setStorage,
  setStorageSync: setStorageSync,
  switchTouchDefaultEvent: switchTouchDefaultEvent,
  sensorDefaultEvent: sensorDefaultEvent,
  sensor24DefaultEvent: sensor24DefaultEvent,
  switchButtonDefaultEvent: switchButtonDefaultEvent,
  switchDefaultEvent: switchDefaultEvent,
  lightSyscEvent: lightSyscEvent,
  setModelEvent: setModelEvent,
  _assemblyLongEvent: _assemblyLongEvent,
  _addRequestEvent: _addRequestEvent,
  getIcon: getIcon,
  sortList: sortList,
  saveGroups: saveGroups,
  savePosition: savePosition,
  setName: setName,
  getGroupName: getGroupName,
  getBluDevice: getBluDevice,
  getBluetoothDevices: getBluetoothDevices,
  openBluetoothAdapter: openBluetoothAdapter,
  closeBluetoothAdapter: closeBluetoothAdapter,
  analysis: analysis,
  showCommand: showCommand,
  showLoadCommand: showLoadCommand,
  selectCommand: selectCommand,
  addCommand: addCommand,
  delCommand: delCommand,
  changeKey: changeKey,
  changeValue: changeValue,
  commandCancel: commandCancel,
  selectResponse: selectResponse,
  sendCommand: sendCommand,
  commandJson: commandJson
  }