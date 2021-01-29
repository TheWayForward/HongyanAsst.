var oneday = 86400000;
var onehour = 0.041;

const format_time = (date) => {
  //basic
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  function day_to_ch() {
    switch (date.getDay()) {
      case (0):
        return "星期日";
        break;
      case (1):
        return "星期一";
        break;
      case (2):
        return "星期二";
        break;
      case (3):
        return "星期三";
        break;
      case (4):
        return "星期四";
        break;
      case (5):
        return "星期五";
        break;
      case (6):
        return "星期六";
        break;
      default:
        return false;
        break;
    }
  }
  return {
    //basic
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second,
    weekday: date.getDay(),
    day_to_ch: day_to_ch,
    //formated date, time, and date_time
    date: [year, month, day].map(format_number).join('-'),
    time: [hour, minute, second].map(format_number).join(':'),
    //full string with padstart
    date_time: [year, month, day].map(format_number).join('-') + ' ' + [hour, minute, second].map(format_number).join(':'),
    precise_time: date.getTime(),
  }
}

function set_time_for_event(event_date, event_time) {
  var time = new Date();
  time.setFullYear(Number(event_date.slice(0, 4)));
  time.setMonth(Number(event_date.slice(5, 7)) - 1);
  time.setDate(Number(event_date.slice(8, 10)));
  time.setHours(Number(event_time.slice(0, 2)));
  time.setMinutes(Number(event_time.slice(3, 5)));
  return time;
}

function get_time_for_picker(days) {
  var d = new Date(Date.now() + oneday * days);
  return `${d.getFullYear()}-${format_number(d.getMonth() + 1)}-${format_number(d.getDate())}`;
}

function get_time_tomorrow_for_picker(date_string) {
  var date_array = date_string.split("-");
  var d = new Date();
  d.setFullYear(Number(date_array[0]));
  d.setMonth(Number(date_array[1]) - 1);
  d.setDate(date_array[2]);
  d = d.getTime() + oneday
  d = new Date(d);
  return `${d.getFullYear()}-${format_number(d.getMonth() + 1)}-${format_number(d.getDate())}`;
}

function set_date_from_string(date_string) {
  return new Date(date_string);
}

const format_number = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

module.exports = {
  format_time: format_time,
  set_time_for_event: set_time_for_event,
  get_time_for_picker: get_time_for_picker,
  get_time_tomorrow_for_picker: get_time_tomorrow_for_picker,
  set_date_from_string: set_date_from_string
}