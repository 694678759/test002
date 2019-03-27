var util = require('../../utils/util.js')
var d = require('../../utils/date.js')
var CN_Date = require('../../utils/getCNDate.js');
var bmap = require('../../bmap-wx.min.js');
var app = getApp()
var t = new Date();

Page({
  data: {
    weatherData: '',
    newsList:null,
    HuangLi:null,
    // XingZuo:null,
    jinDay:null,
    monthNum: t.getMonth() + 1,
    yearNum: t.getFullYear(),
    MonthDayArray: [],
    toDate: t.getDate(),
    toMonth: t.getMonth() + 1,
    toYear: t.getFullYear(),
    fromToday: '今天',
    nongliDetail: CN_Date(t.getFullYear(), t.getMonth() + 1, t.getDate()),
  },

  onShow: function () {
    this.calcMonthDayArray();
  },

  dateClick: function (e) {
    var eId = e.currentTarget.id;
    var MonArray = this.data.MonthDayArray;
    var data = this.data;
    if (eId == "") return;
    //点击效果 ，且只能选中一个日期
    //FIX 这个遍历算法可以改进
    for (var i = 0; i < MonArray.length; i++) {
      for (var j = 0; j < MonArray[i].length; j++) {
        if (typeof (MonArray[i][j]) == 'string') {
          continue;
        }
        if (MonArray[i][j].num == eId) {
          MonArray[i][j].isShowDayInfo = !MonArray[i][j].isShowDayInfo;
        }
      }
    }

    for (var i = 0; i < MonArray.length; i++) {
      for (var j = 0; j < MonArray[i].length; j++) {
        if (typeof (MonArray[i][j]) == 'string' || MonArray[i][j].num == eId) {
          continue;
        }
        MonArray[i][j].isShowDayInfo = false;
      }
    }

    this.setData({
      MonthDayArray: MonArray,
      toYear: data.yearNum,
      toMonth: data.monthNum,
      toDate: eId,
      fromToday: d.getFromTodayDays(eId, data.monthNum - 1, data.yearNum),
      nongliDetail: CN_Date(data.yearNum, data.monthNum, eId),
    })
  },

  monthTouch: function (e) {
    var beginX = e.target.offsetLeft;
    var endX = e.changedTouches[0].clientX;
    if (beginX - endX > 125) {
      this.nextMonth_Fn();
    }
    else if (beginX - endX < -125) {
      this.lastMonth_Fn();
    }
  },

  nextMonth_Fn: function () {
    var n = this.data.monthNum;
    var y = this.data.yearNum;
    if (n == 12) {
      this.setData({
        monthNum: 1,
        yearNum: y + 1,
      });
    }
    else {
      this.setData({
        monthNum: n + 1,
      });
    }
    this.calcMonthDayArray();
  },

  lastMonth_Fn: function () {
    var n = this.data.monthNum;
    var y = this.data.yearNum;
    if (n == 1) {
      this.setData({
        monthNum: 12,
        yearNum: y - 1,
      });
    }
    else {
      this.setData({
        monthNum: n - 1,
      });
    }
    this.calcMonthDayArray();
  },

  calcMonthDayArray: function () {
    var data = this.data;
    var dateArray = d.paintCalendarArray(data.monthNum, data.yearNum);

    //如果不是当年当月，自动选中1号
    var notToday = (data.monthNum != t.getMonth() + 1 || data.yearNum != t.getFullYear());
    if (notToday) {
      for (var i = 0; i < dateArray[0].length; i++) {
        if (dateArray[0][i].num == 1) {
          dateArray[0][i].isShowDayInfo = true;
        }
      }
    }

    this.setData({
      MonthDayArray: dateArray,
      toYear: notToday ? this.data.yearNum : t.getFullYear(),
      toMonth: notToday ? this.data.monthNum : t.getMonth() + 1,
      toDate: notToday ? 1 : t.getDate(),
      fromToday: notToday ? d.getFromTodayDays(1, data.monthNum - 1, data.yearNum) : '今天',
      nongliDetail: notToday ? CN_Date(data.yearNum, data.monthNum, 1) : CN_Date(t.getFullYear(), t.getMonth() + 1, t.getDate()),
    })
  },

  onLoad: function () {
    // this.getNewsList();
    // this.getMap();
    this.getNewMap();
    this.getHuangLi();
    // this.getXingZuo();
    this.getjinDay();
  },
  //下拉刷新事件
  onPullDownRefresh() {
    // this.getNewsList();
    // this.getMap();
    this.getNewMap();
    this.getHuangLi();
    // this.getXingZuo();
    this.getjinDay();
  },
  //上滑刷新事件
  onReachBottom() {
    this.getHuangLi();
  },
  getNewMap:function(){
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'uQRyvIRMGSfGmfTqrhpBRqfHI68F20I9'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      console.log(data);
      var weatherData = data.currentWeather[0];
      weatherData = '城市：' + weatherData.currentCity + '\n' + 'PM2.5：' + weatherData.pm25 + '\n' + '日期：' + weatherData.date + '\n' + '温度：' + weatherData.temperature + '\n' + '天气：' + weatherData.weatherDesc + '\n' + '风力：' + weatherData.wind + '\n';
      that.setData({
        weatherData: weatherData
      });
    }
    // 发起weather请求 
    BMap.weather({
      fail: fail,
      success: success
    }); 
  },

  getHuangLi: function () {
    var _this = this;
    wx.showToast({
      title: "正在加载",
      icon: 'loading',
      duration: 9999999
    })
    wx.request({
      url: 'http://v.juhe.cn/laohuangli/d', 
      data: {
        key: 'ff46c8644c75f615e895f8d59c5b9175',
        date: "2019-3-17"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.hideToast();
        wx.stopPullDownRefresh();
        console.log(res.data.result);
        if (res.data.result == null) {
          wx.showToast({
            title: res.data.reason,
            icon: 'loading',
            duration: 3000
          })
        }
        _this.setData({
          HuangLi: res.data.result
        });
      }
    });
  },
  // getXingZuo:function(){
  //   var _this = this;
  //   wx.showToast({
  //     title: "正在加载",
  //     icon: 'loading',
  //     duration: 9999999
  //   })
  //   wx.request({
  //     url: 'http://web.juhe.cn:8080/constellation/getAll',
  //     data: {
  //       key: '43f5326a41ec6f8d75b2b8f3f5059516',
  //       consName:"白羊座", 
  //       type:"year"
  //     },
  //     header: {
  //       'content-type': 'application/json' // 默认值
  //     },
  //     success(res) {
  //       wx.hideToast();
  //       wx.stopPullDownRefresh();
  //       console.log(res.data);
  //       if (res.data.result == null) {
  //         wx.showToast({
  //           title: res.data.reason,
  //           icon: 'loading',
  //           duration: 3000
  //         })
  //       }
  //       _this.setData({
  //         XingZuo: res.data.result
  //       });
  //     }
  //   });
  // },
  getjinDay: function () {
    var _this = this;
    wx.showToast({
      title: "正在加载",
      icon: 'loading',
      duration: 9999999
    })
    wx.request({
      url: 'http://api.juheapi.com/japi/toh',
      data: {
        key: 'c21f78e8c561f7014413d5f9aa401972',
        v: "1.0",
        month: "3",
        day: "17"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.hideToast();
        wx.stopPullDownRefresh();
        console.log(res.data.result);
        if (res.data.result == null) {
          wx.showToast({
            title: res.data.reason,
            icon: 'loading',
            duration: 3000
          })
        }
        _this.setData({
          jinDay: res.data.result
        });
      }
    });
  }
  

})