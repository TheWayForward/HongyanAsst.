const format_time = (date) => {
  //basic
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  var weekday = "";
  switch(date.getDay()){
    case(0):
      weekday = "星期日";
      break;
    case(1):
      weekday = "星期一";
      break;
    case(2):
      weekday = "星期二";
      break;
    case(3):
      weekday = "星期三";
      break;
    case(4):
      weekday = "星期四";
      break;
    case(5):
      weekday = "星期五";
      break;
    case(6):
      weekday = "星期六";
      break;
    default:
      weekday = "获取日期出错";
      break;
  }
  return {
    //formated date, time, and date_time
    date: [year, month, day].map(format_number).join('/'),
    time: [hour, minute, second].map(format_number).join(':'),
    //full string with padstart
    date_time: [year, month, day].map(format_number).join('/') + ' ' + [hour, minute, second].map(format_number).join(':'),
    precise_time: date.getTime(),
    weekday: weekday
  }
}

const format_number = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

module.exports = {
  format_time: format_time
}
