const FRAME_CTRL_POSITION_ENCRYPTED = 0;
const FRAME_CTRL_POSITION_CHECKSUM = 1;
const FRAME_CTRL_POSITION_DATA_DIRECTION = 2;
const FRAME_CTRL_POSITION_REQUIRE_ACK = 3;
const FRAME_CTRL_POSITION_FRAG = 4;
const DIRECTION_OUTPUT = 0;
const DIRECTION_INPUT = 1;
const AES_BASE_IV = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const NEG_SET_SEC_TOTAL_LEN = 0x00;
const NEG_SET_SEC_ALL_DATA = 0x01;
const PACKAGE_VALUE = 0x01;
const SUBTYPE_NEG = 0x00;
const SUBTYPE_WIFI_MODEl = 0x02;
const SUBTYPE_END = 0x03;
const PACKAGE_CONTROL_VALUE = 0x00;
const SUBTYPE_WIFI_NEG = 0x09;
const SUBTYPE_SET_SSID = 0x2;
const SUBTYPE_SET_PWD = 0x3;
const SUBTYPE_WIFI_LIST_NEG = 11;
const SUBTYPE_NEGOTIATION_NEG = 0;
const SUBTYPE_CUSTOM_DATA = 0x13;
var DH_P = "cf5cf5c38419a724957ff5dd323b9c45c3cdd261eb740f69aa94b8bb1a5c96409153bd76b24222d03274e4725a5406092e9e82e9135c643cae98132b0d95f7d65347c68afc1e677da90e51bbab5f5cf429c291b4ba39c6b2dc5e8c7231e46aa7728e87664532cdf547be20c9a3fa8342be6e34371a27c06f7dc0edddd2f86373";
var DH_G = "02";

const descSucList = ["Bluetooth connecting...", "Bluetooth connection successful", "Device information is successfully obtained", "Attribute information is successfully obtained", "Send configuration information...", "Configuration information sent successfully", "Connection successfully"];
const descFailList = ["Bluetooth connection failed", "Device information acquisition failed", "Attribute information acquisition failed", "Configuration information sent failed", "Distribution network failed"];
const successList = { "0": "NULL", "1": "STA", "2": "SoftAP", "3": "SoftAP & STA" };
const failList = { "0": "sequence error", "1": "checksum error", "2": "decrypt error", "3": "encrypt error", "4": "init security error", "5": "dh malloc error", "6": "dh param error", "7": "read param error", "8": "make public error" };
var CRC_TB = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
  0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
  0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
  0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823, 0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
  0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
  0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
  0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
  0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
  0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
  0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a, 0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
  0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
];
const SERVICE_TYPE = "_mesh-http._tcp.";
const MESH_INFO = "/mesh_info";
const DEVICE_REQUEST = "/device_request";
const GET_DEVICE_INFO = "get_device_info";
const SET_STATUS = "set_status";
const RENAME_DEVICE = "rename_device";
const RESET_DEVICE = "reset";
const REBOOT_DEVICE = "reboot";
const SET_EVENT = "set_event";
const GET_EVENT = "get_event";
const REMOVE_EVENT = "remove_event";
const NO_RESPONSE = "no_response";
const SET_REGULAR_CONTROL = "set_regular_control";
const SET_SLOW_SWITCH = "set_slow_switch";
const SET_POSITION = "set_position";
const ADD_DEVICE = "add_device";
const GET_OTA_PROGRESS = "get_ota_progress";
const GET_MESH = "get_mesh_config";
const OTA_URL = "/ota/url";
const OTA_STOP = "/ota/stop";
const SYSC = "sync";
const CONTROL = "linkage";
const STATUS_CID = 0;
const HUE_CID = 1;
const SATURATION_CID = 2;
const VALUE_CID = 3;
const TEMPERATURE_CID = 4;
const BRIGHTNESS_CID = 5;
const MODE_CID = 6;
const MODE_HSV = 2;
const MODE_CTB = 3;
const MIN_LIGHT = 1;
const MAX_LIGHT = 10;
const MIN_SWITCH = 11;
const MAX_SWITCH = 20;
const MIN_SENSOR = 21;
const MAX_SENSOR = 30;
const MIN_OTHER = 31;
const MAX_OTHER = 999999999;
const TOUCH_PAD_SWITCH = 12;
const BUTTON_SWITCH = 13;
const SENSOR_24 = 24;
const TOUC_PAD_BTN_0 = 0;
const TOUC_PAD_BTN_1 = 1;
const TOUC_PAD_BTN_2 = 2;
const TOUC_PAD_BTN_3 = 3;
const SYSC_RED_HUE = 0;
const SYSC_RED_SATURATION = 100;
const SYSC_GREEN_HUE = 120;
const SYSC_GREEN_SATURATION = 100;
const SYSC_BLUE_HUE = 240;
const SYSC_BLUE_SATURATION = 100;
const STATUS_ON = 1;
const STATUS_OFF = 0;
const SWITCH_CID = 0;
const SENSOR_CID = 0;
const SENSOR24_CID_3 = 3;
const SENSOR24_CID_2 = 2;
const ON_EN = "ON";
const OFF_EN = "OFF";
const WHITE_EN = "WHITE";
const RED_EN = "RED";
const GREEN_EN = "GREEN";
const BLUE_EN = "BLUE";
const YELLOW_EN = "YELLOW";
const PURPLE_EN = "PURPLE";
const TURN_OFF = "TURN_OFF";
const TURN_ON = "TURN_ON";
const OPERATOR_EQUAL = "==";
const OPERATOR_MIN = ">";
const OPERATOR_MAX = "<";
const OPERATOR_VARIETY = "~";
const OPERATOR_COMPARE = "/";
const SLOW_VALUE = 50;
const MESH_LIGHT_SYSC = { '~': 1 };
const MESH_LIGHT_SYSC_COLOR = { '==': 1 };
const MESH_LIGHT_SYSC_COLOR_0 = { '==': 0 };
const MESH_LIGHT_SYSC_COLOR_2 = { '==': 2 };
const MESH_LIGHT_SYSC_COLOR_3 = { '==': 3 };
const MESH_LIGHT_SYSC_COLOR_4 = { '==': 4 };
const MESH_LIGHT_SYSC_COLOR_5 = { '==': 5 };
const MESH_LIGHT_ON_COMPARE = { '==': 1, '~': 1 };
const MESH_LIGHT_OFF_COMPARE = { '==': 0, '~': 1 };
const MESH_SENSOR_OFF_COMPARE = { '>': 600 };
const MESH_SENSOR_ON_COMPARE = { '<': 200 };
const MESH_SENSOR_MAX = 1000;
const DEVICE_LIST = "deviceList";
const GROUP_TABLE = "groupTable";
const POSITION_LIST = "positionList";
const COMMAND_LIST = "commandList";
const SAVE_SCAN_MAC="saveScanMac";
const SINGLE_GROUP = 1;
const MULTIPLE_GROUP = 2;
const GUIDE = [{ "icon": "icon-light", "name": "灯具类", "desc": "吸顶灯，筒灯，吊灯", "step": [{ "icon": "icon-plug", "step": "第一步", "info": "确保设备上电" }, { "icon": "icon-setting", "step": "第二步", "info": "确保设备属于未入网状态，未入网状态表现为刚通电时会出现黄灯闪烁" }, { "icon": "icon-setting", "step": "第三步", "info": '通过"蓝牙搜索"添加设备' }], "problem": ["1. 给设备上电，并在1~3秒后断电；", "2. 等待1-3秒左右，重复第1步的操作；", "3. 重复上述步骤3次即可将设备复位"] }, { "icon": "icon-power", "name": "开关类", "desc": "Button，Touch", "step": [{ "icon": "icon-plug", "step": "第一步", "info": "确保设备上电" }, { "icon": "icon-setting", "step": "第二步", "info": "确保设备属于未入网状态，未入网状态表现为刚通电时会出现黄灯闪烁" }, { "icon": "icon-setting", "step": "第三步", "info": '通过"蓝牙搜索"添加设备' }], "problem": ["1. 给设备上电，并在1~3秒后断电；", "2. 等待1-3秒左右，重复第1步的操作；", "3. 重复上述步骤3次即可将设备复位"]},
  { "icon": "icon-sensor", "name": "传感器类", "desc": "人体传感器，温湿度传感器", "step": [{ "icon": "icon-plug", "step": "第一步", "info": "确保设备上电" }, { "icon": "icon-setting", "step": "第二步", "info": "确保设备属于未入网状态，未入网状态表现为刚通电时会出现黄灯闪烁" }, { "icon": "icon-setting", "step": "第三步", "info": '通过"蓝牙搜索"添加设备' }], "problem": ["1. 给设备上电，并在1~3秒后断电；", "2. 等待1-3秒左右，重复第1步的操作；", "3. 重复上述步骤3次即可将设备复位"]  }];
const DELAY_TIME = 3000;
const BUTTON_DEVICES = { "upleft": 0, "upright": 1, "downleft": 2, "downright": 3 };
const MESH_VIDEO = "http://demo.iot.espressif.cn:8887/app/video/mesh-light.mp4";
module.exports = {
  DH_P: DH_P,
  DH_G: DH_G,
  FRAME_CTRL_POSITION_ENCRYPTED: FRAME_CTRL_POSITION_ENCRYPTED,
  FRAME_CTRL_POSITION_CHECKSUM: FRAME_CTRL_POSITION_CHECKSUM,
  FRAME_CTRL_POSITION_DATA_DIRECTION: FRAME_CTRL_POSITION_DATA_DIRECTION,
  FRAME_CTRL_POSITION_REQUIRE_ACK: FRAME_CTRL_POSITION_REQUIRE_ACK,
  FRAME_CTRL_POSITION_FRAG: FRAME_CTRL_POSITION_FRAG,
  AES_BASE_IV: AES_BASE_IV,
  DIRECTION_OUTPUT: DIRECTION_OUTPUT,
  DIRECTION_INPUT: DIRECTION_INPUT,
  NEG_SET_SEC_TOTAL_LEN: NEG_SET_SEC_TOTAL_LEN,
  NEG_SET_SEC_ALL_DATA: NEG_SET_SEC_ALL_DATA,
  PACKAGE_VALUE: PACKAGE_VALUE,
  SUBTYPE_NEG: SUBTYPE_NEG,
  PACKAGE_CONTROL_VALUE: PACKAGE_CONTROL_VALUE,
  SUBTYPE_WIFI_NEG: SUBTYPE_WIFI_NEG,
  SUBTYPE_WIFI_LIST_NEG: SUBTYPE_WIFI_LIST_NEG,
  SUBTYPE_NEGOTIATION_NEG: SUBTYPE_NEGOTIATION_NEG,
  SUBTYPE_WIFI_MODEl: SUBTYPE_WIFI_MODEl,
  SUBTYPE_SET_SSID: SUBTYPE_SET_SSID,
  SUBTYPE_SET_PWD: SUBTYPE_SET_PWD,
  SUBTYPE_END: SUBTYPE_END,
  SUBTYPE_CUSTOM_DATA: SUBTYPE_CUSTOM_DATA,
  SERVICE_TYPE: SERVICE_TYPE,
  MESH_INFO: MESH_INFO,
  DEVICE_REQUEST: DEVICE_REQUEST,
  GET_DEVICE_INFO: GET_DEVICE_INFO,
  SET_STATUS: SET_STATUS,
  RENAME_DEVICE: RENAME_DEVICE,
  RESET_DEVICE: RESET_DEVICE,
  REBOOT_DEVICE: REBOOT_DEVICE,
  SET_EVENT: SET_EVENT,
  GET_EVENT: GET_EVENT,
  REMOVE_EVENT: REMOVE_EVENT,
  SET_REGULAR_CONTROL: SET_REGULAR_CONTROL,
  SET_SLOW_SWITCH: SET_SLOW_SWITCH,
  SET_POSITION: SET_POSITION,
  ADD_DEVICE: ADD_DEVICE,
  GET_OTA_PROGRESS: GET_OTA_PROGRESS,
  GET_MESH: GET_MESH,
  OTA_URL: OTA_URL,
  OTA_STOP: OTA_STOP,
  STATUS_CID: STATUS_CID,
  HUE_CID: HUE_CID,
  SATURATION_CID: SATURATION_CID,
  VALUE_CID: VALUE_CID,
  TEMPERATURE_CID: TEMPERATURE_CID,
  BRIGHTNESS_CID: BRIGHTNESS_CID,
  MODE_CID: MODE_CID,
  MODE_HSV: MODE_HSV,
  MODE_CTB: MODE_CTB,
  MIN_LIGHT: MIN_LIGHT,
  MAX_LIGHT: MAX_LIGHT,
  MIN_SWITCH: MIN_SWITCH,
  MAX_SWITCH: MAX_SWITCH,
  MIN_SENSOR: MIN_SENSOR,
  MAX_SENSOR: MAX_SENSOR,
  MIN_OTHER: MIN_OTHER,
  MAX_OTHER: MAX_OTHER,
  TOUCH_PAD_SWITCH: TOUCH_PAD_SWITCH,
  BUTTON_SWITCH: BUTTON_SWITCH,
  SENSOR_24: SENSOR_24,
  CRC_TB: CRC_TB,
  descSucList: descSucList,
  descFailList: descFailList,
  successList: successList,
  failList: failList,
  DEVICE_LIST: DEVICE_LIST,
  NO_RESPONSE: NO_RESPONSE,
  TOUC_PAD_BTN_0: TOUC_PAD_BTN_0,
  TOUC_PAD_BTN_1: TOUC_PAD_BTN_1,
  TOUC_PAD_BTN_2: TOUC_PAD_BTN_2,
  TOUC_PAD_BTN_3: TOUC_PAD_BTN_3,
  SYSC_RED_HUE: SYSC_RED_HUE,
  SYSC_RED_SATURATION: SYSC_RED_SATURATION,
  SYSC_GREEN_HUE: SYSC_GREEN_HUE,
  SYSC_GREEN_SATURATION: SYSC_GREEN_SATURATION,
  SYSC_BLUE_HUE: SYSC_BLUE_HUE,
  SYSC_BLUE_SATURATION: SYSC_BLUE_SATURATION,
  STATUS_ON: STATUS_ON,
  STATUS_OFF: STATUS_OFF,
  SWITCH_CID: SWITCH_CID,
  SENSOR_CID: SENSOR_CID,
  SENSOR24_CID_3: SENSOR24_CID_3,
  SENSOR24_CID_2: SENSOR24_CID_2,
  ON_EN: ON_EN,
  OFF_EN: OFF_EN,
  WHITE_EN: WHITE_EN,
  RED_EN: RED_EN,
  GREEN_EN: GREEN_EN,
  BLUE_EN: BLUE_EN,
  YELLOW_EN: YELLOW_EN,
  PURPLE_EN: PURPLE_EN,
  TURN_OFF: TURN_OFF,
  TURN_ON: TURN_ON,
  OPERATOR_EQUAL: OPERATOR_EQUAL,
  OPERATOR_MIN: OPERATOR_MIN,
  OPERATOR_MAX: OPERATOR_MAX,
  OPERATOR_VARIETY: OPERATOR_VARIETY,
  OPERATOR_COMPARE: OPERATOR_COMPARE,
  SLOW_VALUE: SLOW_VALUE,
  MESH_LIGHT_SYSC: MESH_LIGHT_SYSC,
  MESH_LIGHT_SYSC_COLOR: MESH_LIGHT_SYSC_COLOR,
  MESH_LIGHT_SYSC_COLOR_0: MESH_LIGHT_SYSC_COLOR_0,
  MESH_LIGHT_SYSC_COLOR_2: MESH_LIGHT_SYSC_COLOR_2,
  MESH_LIGHT_SYSC_COLOR_3: MESH_LIGHT_SYSC_COLOR_3,
  MESH_LIGHT_SYSC_COLOR_4: MESH_LIGHT_SYSC_COLOR_4,
  MESH_LIGHT_SYSC_COLOR_5: MESH_LIGHT_SYSC_COLOR_5,
  MESH_LIGHT_ON_COMPARE: MESH_LIGHT_ON_COMPARE,
  MESH_LIGHT_OFF_COMPARE: MESH_LIGHT_OFF_COMPARE,
  MESH_SENSOR_OFF_COMPARE: MESH_SENSOR_OFF_COMPARE,
  MESH_SENSOR_ON_COMPARE: MESH_SENSOR_ON_COMPARE,
  MESH_SENSOR_MAX: MESH_SENSOR_MAX,
  SYSC: SYSC,
  CONTROL: CONTROL,
  GROUP_TABLE: GROUP_TABLE,
  POSITION_LIST: POSITION_LIST,
  COMMAND_LIST: COMMAND_LIST,
  SINGLE_GROUP: SINGLE_GROUP,
  MULTIPLE_GROUP: MULTIPLE_GROUP,
  SAVE_SCAN_MAC: SAVE_SCAN_MAC,
  GUIDE: GUIDE,
  DELAY_TIME: DELAY_TIME,
  BUTTON_DEVICES: BUTTON_DEVICES,
  MESH_VIDEO: MESH_VIDEO
}